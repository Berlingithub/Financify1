const dns = require('dns');
const https = require('https');
const mongoose = require('mongoose');

const LOCAL_MONGO_URI =
  process.env.DATABASE_KEY_LOCAL || 'mongodb://127.0.0.1:27017/financify';

// Prefer IPv4 for DNS lookups (avoids some Windows/ISP SRV failures)
dns.setDefaultResultOrder('ipv4first');

// Some Windows/ISP resolvers refuse MongoDB SRV (_mongodb._tcp) queries in Node.
// Prepend reliable DNS servers unless the user opts into system DNS only.
if (process.env.MONGODB_USE_SYSTEM_DNS !== 'true') {
  const extra =
    process.env.MONGODB_DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean) ||
    ['8.8.8.8', '1.1.1.1'];
  dns.setServers([...extra, ...dns.getServers()]);
}

/**
 * URL-encode credentials so Node 22+ and the driver accept the connection string.
 */
function normalizeMongoUri(uri) {
  if (!uri) return uri;

  const match = uri.match(
    /^(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@(.+)$/i
  );
  if (!match) return uri;

  const [, prefix, user, pass, rest] = match;
  const encodedUser = encodeURIComponent(decodeURIComponent(user));
  const encodedPass = encodeURIComponent(decodeURIComponent(pass));

  if (user === encodedUser && pass === encodedPass) return uri;
  return `${prefix}${encodedUser}:${encodedPass}@${rest}`;
}

function isSrvDnsError(err) {
  const msg = err && (err.message || String(err));
  return (
    /querySrv|queryTxt|ETIMEOUT|EREFUSED|ENOTFOUND/i.test(msg) ||
    err.code === 'ECONNREFUSED'
  );
}

function isLocalRuntime() {
  return (
    process.env.LOCAL_DEV === 'true' ||
    !(
      process.env.RENDER ||
      process.env.RENDER_EXTERNAL_URL ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.FLY_APP_NAME ||
      process.env.HEROKU_APP_NAME
    )
  );
}

function shouldUseLocalMongo() {
  return (
    process.env.USE_LOCAL_MONGODB === 'true' &&
    isLocalRuntime()
  );
}

/**
 * Resolve SRV via DNS-over-HTTPS when the OS resolver fails (common on Windows).
 */
function resolveSrvViaDoh(srvHost) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(srvHost)}&type=SRV`;
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const answers = data.Answer || [];
            const records = answers
              .filter((a) => a.type === 33)
              .map((a) => {
                const parts = a.data.trim().split(/\s+/);
                const priority = Number(parts[0]);
                const weight = Number(parts[1]);
                const port = Number(parts[2]);
                const name = parts[3].replace(/\.$/, '');
                return { priority, weight, port, name };
              });
            if (!records.length) {
              reject(new Error(`No SRV records found for ${srvHost}`));
              return;
            }
            resolve(records);
          } catch (parseErr) {
            reject(parseErr);
          }
        });
      })
      .on('error', reject);
  });
}

function resolveTxtViaDoh(srvHost) {
  return new Promise((resolve) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(srvHost)}&type=TXT`;
    https
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const answers = data.Answer || [];
            resolve(
              answers
                .filter((a) => a.type === 16)
                .map((a) => a.data.replace(/^"|"$/g, ''))
            );
          } catch {
            resolve([]);
          }
        });
      })
      .on('error', () => resolve([]));
  });
}

/**
 * Resolve mongodb+srv hostnames via system DNS and build a standard replica-set URI.
 * Used when the driver's built-in SRV lookup fails on some networks.
 */
async function srvUriToStandardUri(srvUri) {
  const match = srvUri.match(
    /^mongodb\+srv:\/\/([^:@/]+):([^@/]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/i
  );
  if (!match) {
    throw new Error('Invalid mongodb+srv connection string');
  }

  const [, user, pass, host, dbPath = '', query = ''] = match;
  const srvHost = `_mongodb._tcp.${host}`;

  let srvRecords;
  let txtRecords;

  try {
    [srvRecords, txtRecords] = await Promise.all([
      dns.promises.resolveSrv(srvHost),
      dns.promises.resolveTxt(srvHost).catch(() => []),
    ]);
  } catch (dnsErr) {
    if (!isSrvDnsError(dnsErr)) throw dnsErr;
    console.log('⚠️  System DNS failed; trying DNS-over-HTTPS...');
    [srvRecords, txtRecords] = await Promise.all([
      resolveSrvViaDoh(srvHost),
      resolveTxtViaDoh(srvHost),
    ]);
    txtRecords = txtRecords.map((entry) => [entry]);
  }

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${host}`);
  }

  const hosts = srvRecords
    .map((r) => `${r.name.replace(/\.$/, '')}:${r.port}`)
    .join(',');

  const txtParams = txtRecords.flat().join('&');
  const db = dbPath || '/financify';
  const encodedUser = encodeURIComponent(decodeURIComponent(user));
  const encodedPass = encodeURIComponent(decodeURIComponent(pass));

  const params = new URLSearchParams(txtParams);
  const existing = new URLSearchParams(query.replace(/^\?/, ''));
  existing.forEach((value, key) => params.set(key, value));
  if (!params.has('ssl') && !params.has('tls')) {
    params.set('ssl', 'true');
  }

  const qs = params.toString();
  return `mongodb://${encodedUser}:${encodedPass}@${hosts}${db}${qs ? `?${qs}` : ''}`;
}

async function connectLocalDatabase() {
  console.log(`⚠️  Using local MongoDB at ${LOCAL_MONGO_URI}`);
  await mongoose.connect(LOCAL_MONGO_URI);
  return LOCAL_MONGO_URI;
}

async function connectDatabase(uri) {
  const directUri = process.env.DATABASE_KEY_DIRECT;
  const isLocalUri =
    uri.startsWith('mongodb://127.0.0.1') ||
    uri.startsWith('mongodb://localhost');

  // Explicit local-only mode (never used on Render/production hosts)
  if (shouldUseLocalMongo() || (isLocalUri && isLocalRuntime())) {
    console.log('Using local MongoDB');
    return connectLocalDatabase();
  }

  let connectionUri = normalizeMongoUri(directUri || uri);

  if (directUri) {
    console.log('Using DATABASE_KEY_DIRECT (non-SRV connection)');
  }

  const tryConnect = async (targetUri) => {
    await mongoose.connect(targetUri);
    return normalizeMongoUri(targetUri);
  };

  try {
    return await tryConnect(connectionUri);
  } catch (err) {
    const canSrvFallback =
      !directUri &&
      uri.startsWith('mongodb+srv://') &&
      isSrvDnsError(err);

    if (!canSrvFallback) throw err;

    console.log(
      '⚠️  SRV DNS lookup failed; connecting via resolved hostnames instead...'
    );
    connectionUri = await srvUriToStandardUri(uri);
    return await tryConnect(connectionUri);
  }
}

module.exports = {
  connectDatabase,
  normalizeMongoUri,
};

const dns = require('dns');
const https = require('https');
const mongoose = require('mongoose');

const LOCAL_MONGO_URI =
  process.env.DATABASE_KEY_LOCAL || 'mongodb://127.0.0.1:27017/financify';

const CONNECT_OPTIONS = {
  family: 4,
  serverSelectionTimeoutMS: 20000,
};

dns.setDefaultResultOrder('ipv4first');

if (process.env.MONGODB_USE_SYSTEM_DNS !== 'true') {
  const extra =
    process.env.MONGODB_DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean) ||
    ['8.8.8.8', '1.1.1.1'];
  try {
    dns.setServers([...extra, ...dns.getServers()]);
  } catch {
    dns.setServers(extra);
  }
}

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
    /querySrv|queryTxt|ETIMEOUT|EREFUSED|ENOTFOUND|No SRV records|ENODATA|EAI_AGAIN/i.test(msg) ||
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND' ||
    err.code === 'EAI_AGAIN'
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
  return process.env.USE_LOCAL_MONGODB === 'true' && isLocalRuntime();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dohGet(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: 'GET',
        headers: { Accept: 'application/dns-json' },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => resolve(body));
      }
    );
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`DoH timeout from ${hostname}`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchDnsJson(name, type) {
  const encoded = encodeURIComponent(name);
  const providers = [
    ['dns.google', `/resolve?name=${encoded}&type=${type}`],
    ['cloudflare-dns.com', `/dns-query?name=${encoded}&type=${type}`],
  ];

  let lastErr;
  for (const [host, path] of providers) {
    try {
      const body = await dohGet(host, path);
      const data = JSON.parse(body);
      if (Array.isArray(data.Answer) && data.Answer.length) {
        return data.Answer;
      }
      lastErr = new Error(`Empty ${type} answer from ${host} for ${name}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error(`DoH lookup failed for ${name}`);
}

function parseSrvAnswers(answers, srvHost) {
  const records = answers
    .filter((a) => a.type === 33)
    .map((a) => {
      const parts = String(a.data).trim().split(/\s+/);
      if (parts.length < 4) return null;
      return {
        priority: Number(parts[0]),
        weight: Number(parts[1]),
        port: Number(parts[2]),
        name: parts[3].replace(/\.$/, ''),
      };
    })
    .filter(Boolean);

  if (!records.length) {
    throw new Error(`No SRV records found for ${srvHost}`);
  }
  return records;
}

async function resolveSrvViaDoh(srvHost) {
  const answers = await fetchDnsJson(srvHost, 'SRV');
  return parseSrvAnswers(answers, srvHost);
}

async function resolveTxtViaDoh(host) {
  try {
    const answers = await fetchDnsJson(host, 'TXT');
    return answers
      .filter((a) => a.type === 16)
      .map((a) => String(a.data).replace(/^"|"$/g, '').replace(/"/g, ''));
  } catch {
    return [];
  }
}

/**
 * mongodb+srv TXT records live on the cluster hostname, not _mongodb._tcp.*
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
  let txtRecords = [];

  try {
    srvRecords = await dns.promises.resolveSrv(srvHost);
    txtRecords = await dns.promises.resolveTxt(host).catch(() => []);
  } catch (dnsErr) {
    if (!isSrvDnsError(dnsErr)) throw dnsErr;
    console.log('⚠️  System DNS failed; trying DNS-over-HTTPS (Google/Cloudflare)...');
    srvRecords = await resolveSrvViaDoh(srvHost);
    const txt = await resolveTxtViaDoh(host);
    txtRecords = txt.map((entry) => [entry]);
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
    params.set('tls', 'true');
  }
  if (!params.has('retryWrites')) {
    params.set('retryWrites', 'true');
  }
  if (!params.has('authSource')) {
    params.set('authSource', 'admin');
  }

  const qs = params.toString();
  return `mongodb://${encodedUser}:${encodedPass}@${hosts}${db}${qs ? `?${qs}` : ''}`;
}

async function connectWithRetry(targetUri, attempts = 3) {
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await mongoose.connect(targetUri, CONNECT_OPTIONS);
      return normalizeMongoUri(targetUri);
    } catch (err) {
      lastErr = err;
      if (i < attempts) {
        console.log(`⚠️  MongoDB attempt ${i}/${attempts} failed (${err.message}). Retrying...`);
        await sleep(2000 * i);
      }
    }
  }
  throw lastErr;
}

async function connectLocalDatabase() {
  console.log(`⚠️  Using local MongoDB at ${LOCAL_MONGO_URI}`);
  await mongoose.connect(LOCAL_MONGO_URI, CONNECT_OPTIONS);
  return LOCAL_MONGO_URI;
}

async function connectDatabase(uri) {
  const directUri = process.env.DATABASE_KEY_DIRECT;
  const isLocalUri =
    uri.startsWith('mongodb://127.0.0.1') ||
    uri.startsWith('mongodb://localhost');

  if (shouldUseLocalMongo() || (isLocalUri && isLocalRuntime())) {
    console.log('Using local MongoDB');
    return connectLocalDatabase();
  }

  if (directUri) {
    console.log('Using DATABASE_KEY_DIRECT (non-SRV connection)');
    return connectWithRetry(normalizeMongoUri(directUri));
  }

  const srvUri = normalizeMongoUri(uri);

  try {
    return await connectWithRetry(srvUri);
  } catch (err) {
    if (!uri.startsWith('mongodb+srv://')) throw err;

    console.log(
      '⚠️  SRV DNS lookup failed; connecting via resolved hostnames instead...'
    );
    const standardUri = await srvUriToStandardUri(uri);
    return connectWithRetry(standardUri);
  }
}

function printMongoHelp(err) {
  console.error('❌ MongoDB connection error:', err.message);
  console.log(`
💡 This is a common Windows/ISP issue with mongodb+srv DNS. Try in order:

  1. Restart: stop npm start (Ctrl+C) and run it again.
  2. Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) for local dev.
  3. Atlas → Database → Connect → Drivers → copy the "standard connection string"
     (starts with mongodb:// not mongodb+srv://) into .env as:

     DATABASE_KEY_DIRECT=mongodb://USER:PASS@host1:27017,host2:27017,host3:27017/financify?tls=true&replicaSet=...&authSource=admin

  4. Confirm the Atlas cluster is not paused (free clusters pause after inactivity).
`);
}

module.exports = {
  connectDatabase,
  normalizeMongoUri,
  printMongoHelp,
};

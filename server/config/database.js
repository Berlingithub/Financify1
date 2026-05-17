const dns = require('dns');
const mongoose = require('mongoose');

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

  const [srvRecords, txtRecords] = await Promise.all([
    dns.promises.resolveSrv(srvHost),
    dns.promises.resolveTxt(srvHost).catch(() => []),
  ]);

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

async function connectDatabase(uri) {
  const directUri = process.env.DATABASE_KEY_DIRECT;
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
    const canFallback =
      !directUri &&
      uri.startsWith('mongodb+srv://') &&
      isSrvDnsError(err);

    if (!canFallback) throw err;

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

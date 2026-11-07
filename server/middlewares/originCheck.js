const { IS_DEPLOYED, allowedOrigins } = require('../config/env');

const API_HEADER = 'x-requested-with';
const API_HEADER_VALUE = 'xmlhttprequest';

function originAllowed(originOrReferer) {
  if (!originOrReferer) return false;
  const value = originOrReferer.trim();
  return allowedOrigins.some((allowed) => value.startsWith(allowed));
}

function isMutation(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

/** Origin/Referer + custom header (blocks classic cross-site form CSRF). */
function verifyMutationOrigin(req, res, next) {
  if (!IS_DEPLOYED) return next();
  if (!isMutation(req.method)) return next();

  const xhr = (req.get('X-Requested-With') || '').toLowerCase();
  if (xhr !== API_HEADER_VALUE) {
    return res.status(403).json({ message: 'Invalid request' });
  }

  const origin = req.get('Origin');
  if (origin) {
    if (originAllowed(origin)) return next();
    return res.status(403).json({ message: 'Request origin not allowed' });
  }

  const referer = req.get('Referer');
  if (referer && originAllowed(referer)) return next();

  if (!origin && !referer) return next();

  return res.status(403).json({ message: 'Request origin not allowed' });
}

module.exports = { verifyMutationOrigin };

/**
 * Cookie/CORS settings must match WHERE the server runs, not just NODE_ENV in .env.
 *
 * - `npm start` on your PC  → HTTP localhost → non-secure cookies
 * - Render / Railway / etc. → HTTPS          → secure + SameSite=None cookies
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Cloud hosts set these automatically — NOT set when you run `npm start` locally
const IS_DEPLOYED = Boolean(
  process.env.RENDER ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.RAILWAY_ENVIRONMENT_NAME ||
  process.env.FLY_APP_NAME ||
  process.env.HEROKU_APP_NAME
);

const FORCE_LOCAL = process.env.LOCAL_DEV === 'true';

// Running API on your machine (even if .env says NODE_ENV=production)
const IS_LOCAL_RUNTIME = FORCE_LOCAL || !IS_DEPLOYED;

// Secure cookies only on deployed HTTPS (Vercel → Render). Never on local HTTP.
const SECURE_COOKIES =
  IS_DEPLOYED &&
  !FORCE_LOCAL &&
  process.env.COOKIE_SECURE !== 'false';

const COOKIE_SAME_SITE = SECURE_COOKIES ? 'none' : 'lax';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3002'];

module.exports = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEPLOYED,
  IS_LOCAL_RUNTIME,
  SECURE_COOKIES,
  COOKIE_SAME_SITE,
  allowedOrigins,
};


// 1️.  Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });  // reads .env from root
// Validate database connection string exists (don't log the actual value for security)
if (!process.env.DATABASE_KEY) {
  console.error('⚠️ WARNING: DATABASE_KEY is undefined! Check your .env file');
  process.exit(1);  // Exit if no database connection
} else {
  console.log('✅ Database configuration loaded');
}
// 2️.  Core & third‑party modules
const express       = require('express');
const morgan        = require('morgan');
const mongoose = require('mongoose');
const { connectDatabase } = require('./config/database');
const session       = require('express-session');
const MongoStore    = require('connect-mongo');
const passport      = require('passport');
const LocalStrategy = require('passport-local');
const cors          = require('cors');
const cookieParser = require("cookie-parser");

// 3️.  Local files
const User          = require('./Models/User');
const basicRoutes   = require('./Routes/Basic');
const authRoutes    = require('./Routes/authRoutes');
const transactions  = require('./Routes/transactions');
const goals         = require('./Routes/goals');
const profile       = require('./Routes/profile');
const overview      = require('./Routes/overview');
const incomeSource  = require('./Routes/incomeSources');
const recurring     = require('./Routes/recurringPayments');
const { isLoggedIn } = require('./middlewares');
const {
  IS_PRODUCTION,
  IS_DEPLOYED,
  IS_LOCAL_RUNTIME,
  SECURE_COOKIES,
  COOKIE_SAME_SITE,
  allowedOrigins,
} = require('./config/env');

// 4.  Environment‑driven constants
const PORT           = process.env.PORT || 3001;
const DATABASE_KEY   = process.env.DATABASE_KEY;
const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-fallback';

// 6️.  App instance & global middleware
const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (!IS_PRODUCTION && origin.startsWith('http://localhost:')) ||
      origin.includes('.vercel.app') ||
      origin.includes('.netlify.app') ||
      origin.includes('.onrender.com')
    ) {
      return callback(null, true);
    }
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add request timing middleware for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⏱️  ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

if (IS_DEPLOYED) {
  app.set('trust proxy', 1); // required for secure cookies behind Render HTTPS proxy
}

// 8️.  Passport (strategy only; session wired in start())
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function setupSessionAndRoutes() {
  // Reuse Mongoose's client — avoids a second connection and DEP0170 from connect-mongo's legacy driver
  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: mongoose.connection.db.databaseName,
    collectionName: 'sessions',
    touchAfter: 24 * 3600,
    crypto: { secret: SESSION_SECRET },
    ttl: 60 * 60 * 24 * 14,
    autoRemove: 'native',
  });
  store.on('error', e => console.log('Session store error', e));

  app.use(cookieParser());
  app.use(
    session({
      store,
      name: 'session',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: SECURE_COOKIES,
        sameSite: COOKIE_SAME_SITE,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/',            basicRoutes);
  app.use('/auth',        authRoutes);
  app.use('/transaction', isLoggedIn, transactions);
  app.use('/goals',       isLoggedIn, goals);
  app.use('/income',      isLoggedIn, incomeSource);
  app.use('/recurring',   isLoggedIn, recurring);
  app.use('/overview',    isLoggedIn, overview);
  app.use('/profile',     isLoggedIn, profile);

  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        details: err.message,
      });
    }

    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        message: 'Unauthorized - Please log in',
      });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      ...(!IS_PRODUCTION && { stack: err.stack }),
    });
  });
}

// 1️1️.  Connect DB, then start server
async function start() {
  try {
    await connectDatabase(DATABASE_KEY);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (/querySrv|queryTxt/i.test(err.message)) {
      console.log(
        '💡 Tip: Check internet/DNS, Atlas IP whitelist, or set DATABASE_KEY_DIRECT in .env'
      );
    }
    process.exit(1);
  }

  setupSessionAndRoutes();
  app.listen(PORT, () => {
    const mode = IS_DEPLOYED ? 'deployed (HTTPS)' : 'local (HTTP)';
    console.log(`🚀  Server running on port ${PORT} — ${mode}`);
    console.log(
      SECURE_COOKIES
        ? '🔒 Session cookies: Secure + SameSite=None (Vercel → Render)'
        : '🍪 Session cookies: non-secure (http://localhost — browser can store session)'
    );
    if (IS_LOCAL_RUNTIME && IS_PRODUCTION) {
      console.log(
        'ℹ️  NODE_ENV=production in .env is fine locally; cookies stay non-secure until deployed on Render.'
      );
    }
    console.log('🌐 Allowed origins:', allowedOrigins.join(', ') || '(none set)');
  });
}

start();

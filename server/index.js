
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
const mongoose      = require('mongoose');
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

// 4.  Environment‑driven constants
const PORT           = process.env.PORT || 3001;
const DATABASE_KEY   = process.env.DATABASE_KEY;          // your Atlas URI
const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret-fallback';

// 5️.  Connect to MongoDB (Mongoose 6+ doesn't need deprecated options)
mongoose.connect(DATABASE_KEY);
mongoose.connection
  .on('error', err => console.error('❌ MongoDB error:', err))
  .once('open', () => console.log('✅ MongoDB connected'));

// 6️.  App instance & global middleware
const app = express();

// CORS configuration - allow frontend in development and production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  // origin: function(origin, callback) {
  //   // Allow requests with no origin (like mobile apps or curl requests)
  //   if (!origin) return callback(null, true);
    
  //   if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app') || origin.includes('.netlify.app')) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: "https://financify-frontend-navy.vercel.app",
  credentials: true
}));

app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 7️.  Session store (connect‑mongo v4+ API) with TTL cleanup
const store = MongoStore.create({
  mongoUrl: DATABASE_KEY,
  collectionName: 'sessions',
  touchAfter: 24 * 3600,  // Only update session once per day to reduce DB writes
  crypto: { secret: SESSION_SECRET },
  ttl: 60 * 60 * 24 * 14, // Automatically delete old sessions after 14 days (TTL)
  autoRemove: 'native',   // Use MongoDB's native TTL mechanism for cleanup
});
store.on('error', e => console.log('Session store error', e));

app.set("trust proxy", 1); // 🔥 VERY IMPORTANT for Render

app.use(
  session({
    store,
    name: 'session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Only use secure cookies in production (HTTPS)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // allow cross-site cookies in production
      maxAge: 1000 * 60 * 60 * 24 * 7,  // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// 8️.  Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// 9️.  Routes
app.use('/',            basicRoutes);
app.use('/auth',        authRoutes);
app.use('/transaction', isLoggedIn, transactions);
app.use('/goals',       isLoggedIn, goals);
app.use('/income',      isLoggedIn, incomeSource);
app.use('/recurring',   isLoggedIn, recurring);
app.use('/overview',    isLoggedIn, overview);
app.use('/profile',     isLoggedIn, profile);

// 10.  Global Error Handler Middleware (MUST be after all routes)
app.use((err, req, res, next) => {
  // Log error for debugging (but don't expose to client)
  console.error('❌ Error:', err.message);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      message: 'Unauthorized - Please log in' 
    });
  }
  
  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 1️1️.  Start server
app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));

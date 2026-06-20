const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const User = require("../Models/User");
const Wallet = require("../Models/Wallet");
const passport = require('passport');
const { isLoggedIn } = require('../middlewares');
const { IS_PRODUCTION, SECURE_COOKIES, COOKIE_SAME_SITE } = require('../config/env');
const { sanitizeUser } = require('../utils/sanitizeUser');

// Rate limiting for authentication endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_PRODUCTION ? 5 : 50,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("❌ Authentication error:", err);
            return res.status(500).json({ message: "Authentication error" });
        }
        if (!user) {
            console.log("⚠️ Invalid credentials for:", req.body.email);
            return res.status(400).json({ message: "Invalid email or password" });
        }
        console.log('✅ User authenticated, creating session...');
        req.logIn(user, (err) => {
            if (err) {
                console.error("❌ Login error:", err);
                return res.status(500).json({ message: "Login failed" });
            }
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("❌ Session save error:", saveErr);
                    return res.status(500).json({ message: "Login failed" });
                }
                res.status(200).json({
                    message: "Login successful",
                    user: sanitizeUser(req.user),
                });
            });
        });
    })(req, res, next);
})


router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const { email, name, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const user = new User({ email, name });

        const registeredUser = await User.register(user, password);
        
        // Create wallet for the user
        const newWallet = new Wallet();
        await newWallet.save();
        
        registeredUser.wallet = newWallet._id;
        await registeredUser.save();
        
        console.log("✅ User registered successfully");  // Don't log sensitive user data

        // Log in the user
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).json({ message: "Registration successful but login failed" });
            }
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("Session save error:", saveErr);
                    return res.status(500).json({ message: "Registration successful but login failed" });
                }
                res.status(201).json({
                    message: "User registered successfully",
                    user: sanitizeUser(req.user),
                });
            });
        });

    } catch (error) {
        console.error("Registration error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation error: " + error.message });
        }
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
});

router.get('/me', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user ? { id: req.user._id, email: req.user.email, name: req.user.name } : null,
  });
});

router.get('/logout', (req, res) => {
  const finishLogout = () => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Session destruction failed' });
      }
      res.clearCookie('session', {
        httpOnly: true,
        secure: SECURE_COOKIES,
        sameSite: COOKIE_SAME_SITE,
      });
      res.json({ message: 'Successfully Logged out', redirectUrl: '/home' });
    });
  };

  // Passport 0.4.x: req.logout() is synchronous (no callback)
  // Passport 0.6+: req.logout(callback) is required
  if (req.logout.length >= 1) {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      finishLogout();
    });
  } else {
    req.logout();
    finishLogout();
  }
});


module.exports = router;
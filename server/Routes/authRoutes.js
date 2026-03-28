const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const User = require("../Models/User");
const Wallet = require("../Models/Wallet");
const passport = require('passport');
const { isLoggedIn } = require('../middlewares');

// Rate limiting for authentication endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err);
            return res.status(500).json({ message: "Authentication error" });
        }
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.status(500).json({ message: "Login failed" });
            }
            res.status(200).json({ 
                message: "Login successful",
                user: req.user 
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
        req.login(registeredUser, err => {
            if (err) { 
                console.error("Login error:", err);
                return res.status(500).json({ message: "Registration successful but login failed" });
            }
            res.status(201).json({ 
                message: "User registered successfully",
                user: req.user 
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

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                return res.status(500).json({ message: "Session destruction failed" });
            }
            res.clearCookie('session'); // Clear the session cookie
            res.json({ "message": "Successfully Logged out", "redirectUrl": "/" });
        });
    });
});


module.exports = router;
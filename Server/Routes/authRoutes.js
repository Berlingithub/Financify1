const express = require('express');
const router = express.Router();
const User = require("../Models/User");
const Wallet = require("../Models/Wallet");
const passport = require('passport');
const { isLoggedIn } = require('../middlewares');

router.post('/login', (req, res, next) => {
    console.log('Login attempt - Request body:', req.body);
    console.log('Login attempt for email:', req.body.email);
    
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log('Passport error:', err);
            return res.status(500).json({ message: "Authentication error", error: err.message });
        }
        
        if (!user) {
            console.log('No user found for email:', req.body.email);
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                console.log('Login error:', err);
                return res.status(500).json({ message: "Login error", error: err.message });
            }
            
            console.log('User logged in successfully:', user.email);
            res.status(200).json({
                message: "Login successful",
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        });
    })(req, res, next);
})


router.post('/register', async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        console.log('Registration attempt for:', email);

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Registration failed: Email already exists:', email);
            return res.status(400).json({ message: "Email already exists. Please use a different email or try signing in." });
        }

        const user = new User({ email, name });
        const registeredUser = await User.register(user, password);
        
        const newWallet = new Wallet();
        registeredUser.wallet = newWallet;
        await newWallet.save();
        await registeredUser.save();
        
        console.log('User registered successfully:', registeredUser.email);
        
        req.login(registeredUser, err => {
            if (err) { 
                console.log('Auto-login error:', err);
                return next(err); 
            }
        });
        
        res.status(201).json({
            message: "Registration successful",
            user: {
                id: registeredUser._id,
                email: registeredUser.email,
                name: registeredUser.name
            }
        });
        
    } catch (error) {
        console.log('Registration error:', error);
        
        // Handle specific passport-local-mongoose errors
        if (error.name === 'UserExistsError') {
            return res.status(400).json({ message: "Email already exists. Please use a different email or try signing in." });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists. Please use a different email or try signing in." });
        }
        
        res.status(500).json({ message: "Registration failed. Please try again.", error: error.message });
    }
});

router.get('/logout', async (req, res) => {
    try {
        req.logout();
        res.json({ "message": "Succesfully Logged out", "redirectUrl": "/" })
    } catch (e) {
        res.status(400).json({ "error": e.message })
    }

})


module.exports = router;
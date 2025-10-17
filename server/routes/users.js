// server/routes/users.js

const router = require('express').Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Helper to generate a token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token will be valid for 30 days
    });
};

// POST /api/users/register (To create your first admin user)
// ⚠️ WARNING: This endpoint should be DISABLED in production!
// Use the Admin Panel or createFirstAdmin.js script instead
router.post('/register', async (req, res) => {
    // Security check: Disable in production
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            message: 'Registration is disabled. Please contact your administrator.'
        });
    }

    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ username, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
// server/routes/admin.js
// SECURE ADMIN ROUTES - ONLY FOR CREATING NEW ADMIN USERS
// This route requires an existing admin to be logged in

const router = require('express').Router();
const User = require('../models/user.model');
const { protect } = require('../middleware/authMiddleware');

// POST /api/admin/create-user
// Protected route - only authenticated admins can create new users
router.post('/create-user', protect, async (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ username: username.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            username: username.toLowerCase(),
            password
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                _id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/admin/users
// Protected route - get all users (without passwords)
router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/admin/users/:id
// Protected route - delete a user
router.delete('/users/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/admin/users/:id/change-password
// Protected route - change user password
router.put('/users/:id/change-password', protect, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

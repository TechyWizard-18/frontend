// server/createUser.js
// Run this script to create a new admin user
// Usage: node createUser.js <username> <password>

const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

const createUser = async () => {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('❌ Usage: node createUser.js <username> <password>');
        console.error('Example: node createUser.js admin admin123');
        process.exit(1);
    }

    if (password.length < 6) {
        console.error('❌ Password must be at least 6 characters long');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check if user already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            console.error(`❌ User '${username}' already exists!`);
            process.exit(1);
        }

        // Create new user
        const user = await User.create({
            username: username.toLowerCase(),
            password: password
        });

        console.log('✅ User created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Username: ${user.username}`);
        console.log(`🔑 Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✨ You can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating user:', error.message);
        process.exit(1);
    }
};

createUser();


// server/createFirstAdmin.js
// ONE-TIME SCRIPT TO CREATE THE VERY FIRST ADMIN USER
// Use this ONLY when you don't have any admin users yet
// After creating the first admin, use the admin panel to create more users

const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createFirstAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Check if any users exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('⚠️  WARNING: Users already exist in the database!');
            console.log(`   Found ${userCount} user(s).`);
            console.log('   This script is only for creating the FIRST admin user.\n');

            const proceed = await question('Do you want to create another user anyway? (yes/no): ');
            if (proceed.toLowerCase() !== 'yes') {
                console.log('❌ Cancelled.');
                process.exit(0);
            }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  🔐 FIRST ADMIN USER CREATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const username = await question('Enter admin username: ');
        const password = await question('Enter admin password (min 6 chars): ');
        const confirmPassword = await question('Confirm password: ');

        // Validation
        if (!username || !password) {
            console.error('\n❌ Username and password are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('\n❌ Password must be at least 6 characters long!');
            process.exit(1);
        }

        if (password !== confirmPassword) {
            console.error('\n❌ Passwords do not match!');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            console.error(`\n❌ User '${username}' already exists!`);
            process.exit(1);
        }

        // Create new user
        const user = await User.create({
            username: username.toLowerCase(),
            password: password
        });

        console.log('\n✅ FIRST ADMIN USER CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Username: ${user.username}`);
        console.log(`🔑 Password: ${password}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📝 NEXT STEPS:');
        console.log('1. Login with these credentials');
        console.log('2. Use the Admin Panel to create more users');
        console.log('3. Keep these credentials SECURE!\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating user:', error.message);
        process.exit(1);
    }
};

createFirstAdmin();


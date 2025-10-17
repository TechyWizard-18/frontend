// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- START: Environment Variable Validation ---
if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is not set in environment variables!');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

console.log('Environment variables validated successfully');
console.log('MongoDB URI:', process.env.MONGO_URI.substring(0, 20) + '...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
// --- END: Environment Variable Validation ---

// --- START: Robust CORS Configuration ---

// 1. Define the list of trusted websites (origins)
const allowedOrigins = [
    'https://frontend-mx20.onrender.com', // Your deployed frontend URL
    'http://localhost:5173',               // Your common local development URL for Vite
    'http://localhost:3000'                // A common local development URL for Create React App
];

// 2. Configure CORS with this direct list. This is a more standard and reliable way
//    to handle preflight (OPTIONS) requests.
const corsOptions = {
    origin: allowedOrigins
};

// 3. Use the configured CORS options
//    This MUST be one of the first middleware functions used.
app.use(cors(corsOptions));

// --- END: Robust CORS Configuration ---


// Middleware
// This must come AFTER the cors middleware.
app.use(express.json());

// Database Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// API Routes
const customersRouter = require('./routes/customers');
const pposRouter = require('./routes/ppos');
const analyticsRouter = require('./routes/analytics');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
app.use('/api/users', usersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/ppos', pposRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin', adminRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

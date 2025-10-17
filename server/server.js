// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- START: Dynamic CORS Configuration ---

// 1. Define the list of trusted websites (origins)
const allowedOrigins = [
    'https://frontend-mx20.onrender.com', // Your deployed frontend URL
    'https://frontend-mx20.onrender.com/',// ADDED: Handle trailing slash
    'http://localhost:5173',               // Your common local development URL for Vite
    'http://localhost:3000'                // A common local development URL for Create React App
];

const corsOptions = {
    origin: function (origin, callback) {
        // ADDED: Log the incoming origin for debugging
        console.log('CORS Check - Incoming Origin:', origin);

        // 2. Check if the incoming request's origin is in our whitelist
        //    'origin' is undefined for server-to-server requests or tools like Postman
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Block the request
        }
    },
    optionsSuccessStatus: 200
};

// 3. Use the configured CORS options
app.use(cors(corsOptions));

// --- END: Dynamic CORS Configuration ---


// Middleware
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


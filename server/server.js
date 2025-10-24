// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- START: Robust CORS Configuration ---

// 1. Define the list of trusted websites (origins)
const allowedOrigins = [

    "https://frontend-5fgqb6b65-kartiks-projects-ab4da1d4.vercel.app",
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-mx20.onrender.com'
];

// 2. Configure CORS with this direct list. This is a more standard and reliable way
//    to handle preflight (OPTIONS) requests.
const corsOptions = {
    origin: allowedOrigins
};
app.get('/health', cors(), (req, res) => {
    res.send('OK');
});
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


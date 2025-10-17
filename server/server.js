// server/server.js
// SIMPLIFIED AND UNLOCKED

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware first
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// API Routes (now completely open)
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
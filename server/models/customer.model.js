const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// server/models/customer.model.js

const customerSchema = new Schema({
    name: { type: String, required: true, trim: true, index: true }, // Add index
    phone: { type: String, required: true, trim: true, index: true, unique: true }, // Add index and make phone unique
    address: { type: String, required: true },
    otherInfo: { type: Map, of: String }
}, {
    timestamps: true,
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
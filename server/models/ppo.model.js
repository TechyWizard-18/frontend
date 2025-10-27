const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ppoSchema = new Schema({
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    ppoValue: { type: Number, required: true, min: [0, 'PPO Value cannot be negative'] },
    ppoType: { type: String, required: true },
    ppoDescription: { type: String, required: true }, // The third field
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Dispatched', 'Paid & Dispatched'],
        default: 'Pending'
    },
    pendingRemark: { type: String, default: '' }, // Remarks for pending POs
    // ===== NEW FEATURE: Salesman field =====
    salesmanName: { type: String, default: 'N/A' },
    // ===== END NEW FEATURE =====
    // ===== NEW FEATURE: Payment due date fields (UPDATED - Manual days entry) =====
    paymentDaysRemaining: { type: Number, min: 0 }, // Days remaining until payment due (manually entered, decrements daily)
    paymentDueDate: { type: Date }, // Calculated based on initial days entered
    initialPaymentDays: { type: Number, min: 1 }, // Original days entered (for reference)
    // ===== END NEW FEATURE =====
    // ===== NEW FEATURE: Priority field =====
    // Added to support High/Low priority filtering and display
    priority: { type: String, enum: ['High', 'Low'], default: 'Low' },
    // ===== END NEW FEATURE =====
}, {
    timestamps: true,
});

const PPO = mongoose.model('PPO', ppoSchema);
module.exports = PPO;
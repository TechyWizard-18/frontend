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
        enum: ['Pending', 'Dispatched'],
        default: 'Pending'
    },
    pendingReason: { type: String, default: '' } // Reason for pending status
}, {
    timestamps: true,
});

const PPO = mongoose.model('PPO', ppoSchema);
module.exports = PPO;
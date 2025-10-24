// server/routes/customers.js
// THE SINGLE, CORRECTED, AND FINAL VERSION

const router = require('express').Router();
const Customer = require('../models/customer.model');
const PPO = require('../models/ppo.model');
const { body, validationResult } = require('express-validator');

// GET: Get all customers (with pagination, search, sort, and filter)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const { searchTerm, sortBy, filterPending } = req.query;

        let query = {};
        if (searchTerm) {
            query = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { phone: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sortBy === 'name') {
            sortOption = { name: 1 };
        }

        const totalCustomers = await Customer.countDocuments(query);

        let aggregationPipeline = [
            { $match: query },
            { $sort: sortOption },
            {
                $lookup: {
                    from: 'ppos',
                    localField: '_id',
                    foreignField: 'customerId',
                    as: 'ppos'
                }
            },
            {
                $addFields: {
                    pendingPpoCount: {
                        $size: {
                            $filter: {
                                input: '$ppos',
                                as: 'ppo',
                                cond: { $eq: ['$$ppo.status', 'Pending'] }
                            }
                        }
                    }
                }
            }
        ];

        // Apply pending filter
        if (filterPending === 'pending') {
            aggregationPipeline.push({ $match: { pendingPpoCount: { $gt: 0 } } });
        } else if (filterPending === 'noPending') {
            aggregationPipeline.push({ $match: { pendingPpoCount: 0 } });
        }

        // Add pagination
        aggregationPipeline.push(
            { $skip: skip },
            { $limit: limit },
            { $project: { ppos: 0 } }
        );

        const customers = await Customer.aggregate(aggregationPipeline);

        res.json({
            customers,
            totalPages: Math.ceil(totalCustomers / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});

// GET: Get a single customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
});

// POST: Create a new customer (with validation)
router.post(
    '/',
    body('name').trim().notEmpty().withMessage('Name is required.').escape(),
    body('phone').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits.').escape(),
    body('address').trim().notEmpty().withMessage('Address is required.').escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, phone, address } = req.body;
            const existingCustomer = await Customer.findOne({ phone: phone });
            if (existingCustomer) {
                return res.status(409).json({ message: 'Customer with this phone number already exists.', customer: existingCustomer });
            }

            const newCustomer = new Customer({ name, phone, address });
            await newCustomer.save();
            res.status(201).json({ message: 'Customer added!', customer: newCustomer });
        } catch (error) {
            res.status(500).json({ message: 'Error creating customer', error: error.message });
        }
    }
);

// GET: Get all PPOs for a specific customer
router.get('/:customerId/ppos', async (req, res) => {
    try {
        const ppos = await PPO.find({ customerId: req.params.customerId });
        res.json(ppos);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching PPOs', error: error.message });
    }
});

// PATCH: Update an existing customer's details (with validation)
router.patch(
    '/:id',
    body('name').trim().notEmpty().withMessage('Name is required.').escape(),
    body('phone').isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits.').escape(),
    body('address').trim().notEmpty().withMessage('Address is required.').escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedCustomer = await Customer.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedCustomer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            res.json({ message: 'Customer updated successfully!', customer: updatedCustomer });
        } catch (error) {
            res.status(500).json({ message: 'Error updating customer', error: error.message });
        }
    }
);

// DELETE: Delete a customer and all their associated PPOs
router.delete('/:id', async (req, res) => {
    try {
        const customerId = req.params.id;
        await PPO.deleteMany({ customerId: customerId });
        const customer = await Customer.findByIdAndDelete(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.json('Customer and all associated PPOs deleted successfully.');
    } catch (error) {
        res.status(400).json({ message: 'Error deleting customer', error: error.message });
    }
});

// ===== NEW FEATURE: Bulk import customers with POs from Excel =====
router.post('/bulk-import', async (req, res) => {
    try {
        const { customers } = req.body; // Expected: array of customer objects with POs

        if (!Array.isArray(customers) || customers.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of customers.' });
        }

        const results = {
            success: [],
            failed: [],
            skipped: []
        };

        for (const customerData of customers) {
            try {
                // Validate required fields
                if (!customerData.name || !customerData.phone) {
                    results.failed.push({
                        data: customerData,
                        error: 'Name and phone are required fields'
                    });
                    continue;
                }

                // Check if customer already exists
                let customer = await Customer.findOne({ phone: customerData.phone });

                if (!customer) {
                    // Create new customer
                    customer = new Customer({
                        name: customerData.name,
                        phone: customerData.phone,
                        address: customerData.address || ''
                    });
                    await customer.save();
                }

                // If PO data is provided, create PO
                if (customerData.poValue && customerData.poType) {
                    const newPO = new PPO({
                        customerId: customer._id,
                        ppoValue: customerData.poValue,
                        ppoType: customerData.poType,
                        ppoDescription: customerData.poDescription || '',
                        status: customerData.status || 'Pending'
                    });
                    await newPO.save();
                }

                results.success.push({
                    name: customer.name,
                    phone: customer.phone
                });
            } catch (error) {
                results.failed.push({
                    data: customerData,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Import completed',
            successCount: results.success.length,
            failedCount: results.failed.length,
            success: results.success,
            failed: results.failed
        });
    } catch (error) {
        res.status(500).json({ message: 'Error importing data', error: error.message });
    }
});
// ===== END NEW FEATURE =====

module.exports = router;
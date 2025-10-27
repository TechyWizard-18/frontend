const router = require('express').Router();
const PPO = require('../models/ppo.model');

// GET: Get all PPOs with filtering, sorting, and search
router.get('/', async (req, res) => {
    try {
        const { search, status, sortBy, startDate, endDate, priority } = req.query;

        // Build query
        let query = {};

        // Status filter
        if (status) {
            query.status = status;
        }

        // Priority filter
        if (priority) {
            query.priority = priority;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDateTime;
            }
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sortBy === 'value') {
            sortOption = { ppoValue: -1 };
        }

        // Fetch PPOs with customer details
        let ppos = await PPO.find(query)
            .populate('customerId', 'name phone')
            .sort(sortOption);

        // Apply search filter (after population)
        if (search) {
            const searchLower = search.toLowerCase();
            ppos = ppos.filter(ppo =>
                (ppo.customerId && ppo.customerId.name.toLowerCase().includes(searchLower)) ||
                ppo.ppoType.toLowerCase().includes(searchLower) ||
                ppo.ppoDescription.toLowerCase().includes(searchLower)
            );
        }

        res.json(ppos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PPOs', error: error.message });
    }
});

// POST: Create a new PPO for a customer
router.post('/', async (req, res) => {
    try {
        const { customerId, ppoValue, ppoType, ppoDescription, salesmanName, paymentTerms, priority } = req.body;

        // ===== NEW FEATURE: Calculate payment due date =====
        let paymentDueDate = null;
        if (paymentTerms) {
            paymentDueDate = new Date();
            paymentDueDate.setDate(paymentDueDate.getDate() + paymentTerms);
        }
        // ===== END NEW FEATURE =====

        const newPPO = new PPO({
            customerId,
            ppoValue,
            ppoType,
            ppoDescription,
            salesmanName: salesmanName || 'N/A',
            paymentTerms: paymentTerms || 30,
            paymentDueDate: paymentDueDate,
            priority: priority || 'Low'
        });
        await newPPO.save();
        res.status(201).json('PPO added!');
    } catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

// PATCH: Update the status of a PPO
router.patch('/:id', async (req, res) => {
    try {
        const ppo = await PPO.findById(req.params.id);
        if (!ppo) {
            return res.status(404).json('PPO not found');
        }
        // ===== NEW FEATURE: Update status only if provided =====
        if (req.body.status !== undefined) {
            ppo.status = req.body.status;
        }
        // ===== END NEW FEATURE =====
        // ===== NEW FEATURE: Update pending remark =====
        if (req.body.pendingRemark !== undefined) {
            ppo.pendingRemark = req.body.pendingRemark;
        }
        // ===== END NEW FEATURE =====
        // ===== NEW FEATURE: Update PO details for editing =====
        if (req.body.ppoValue !== undefined) {
            ppo.ppoValue = req.body.ppoValue;
        }
        if (req.body.ppoType !== undefined) {
            ppo.ppoType = req.body.ppoType;
        }
        if (req.body.ppoDescription !== undefined) {
            ppo.ppoDescription = req.body.ppoDescription;
        }
        if (req.body.salesmanName !== undefined) {
            ppo.salesmanName = req.body.salesmanName;
        }
        if (req.body.paymentTerms !== undefined) {
            ppo.paymentTerms = req.body.paymentTerms;
            // Recalculate payment due date based on created date
            const dueDate = new Date(ppo.createdAt);
            dueDate.setDate(dueDate.getDate() + req.body.paymentTerms);
            ppo.paymentDueDate = dueDate;
        }
        // ===== NEW FEATURE: Update priority =====
        if (req.body.priority !== undefined) {
            ppo.priority = req.body.priority;
        }
        // ===== END NEW FEATURE =====
        await ppo.save();
        res.json('PPO updated!');
    } catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

// ===== NEW FEATURE: Bulk import customers from Excel =====
router.post('/bulk-import', async (req, res) => {
    try {
        const { customers } = req.body; // Expected: array of customer objects

        if (!Array.isArray(customers) || customers.length === 0) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array of customers.' });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const customerData of customers) {
            try {
                const newPPO = new PPO({
                    customerId: customerData.customerId,
                    ppoValue: customerData.ppoValue,
                    ppoType: customerData.ppoType,
                    ppoDescription: customerData.ppoDescription || '',
                    status: customerData.status || 'Pending',
                    priority: customerData.priority || 'Low'
                });
                await newPPO.save();
                results.success.push(customerData);
            } catch (error) {
                results.failed.push({ data: customerData, error: error.message });
            }
        }

        res.json({
            message: 'Import completed',
            successCount: results.success.length,
            failedCount: results.failed.length,
            failed: results.failed
        });
    } catch (error) {
        res.status(500).json({ message: 'Error importing data', error: error.message });
    }
});
// ===== END NEW FEATURE =====

module.exports = router;
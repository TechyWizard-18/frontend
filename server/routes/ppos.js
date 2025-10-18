const router = require('express').Router();
const PPO = require('../models/ppo.model');

// GET: Get all PPOs with filtering, sorting, and search
router.get('/', async (req, res) => {
    try {
        const { search, status, sortBy, startDate, endDate } = req.query;

        // Build query
        let query = {};

        // Status filter
        if (status) {
            query.status = status;
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
        const { customerId, ppoValue, ppoType, ppoDescription } = req.body;
        const newPPO = new PPO({ customerId, ppoValue, ppoType, ppoDescription });
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
        ppo.status = req.body.status;
        await ppo.save();
        res.json('PPO status updated!');
    } catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

module.exports = router;
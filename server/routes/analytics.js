// server/routes/analytics.js
// FULLY UPGRADED

const router = require('express').Router();
const PPO = require('../models/ppo.model');
const Customer = require('../models/customer.model');

// --- EXISTING ENDPOINT (MODIFIED FOR ACCURACY) ---
router.get('/ppo-summary', async (req, res) => {
    // ... (This endpoint remains the same as our last version, it's already correct)
    try {
        const summary = await PPO.aggregate([ { $addFields: { unifiedStatus: { $cond: { if: { $in: ['$status', ['Dispatched', 'Fulfilled']] }, then: 'Dispatched', else: 'Pending' } } } }, { $group: { _id: '$unifiedStatus', totalValue: { $sum: '$ppoValue' } } } ]);
        const result = { pendingTotal: 0, dispatchedTotal: 0 };
        summary.forEach(item => { if (item._id === 'Pending') { result.pendingTotal = item.totalValue; } else if (item._id === 'Dispatched') { result.dispatchedTotal = item.totalValue; } });
        res.json(result);
    } catch (error) { res.status(500).json('Error: ' + error); }
});


// --- NEW ENDPOINT 1: CUSTOMER GROWTH OVER TIME ---
router.get('/customer-growth', async (req, res) => {
    try {
        const growthData = await Customer.aggregate([
            {
                // Group documents by month and year of creation
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    newCustomers: { $sum: 1 } // Count customers in each group
                }
            },
            {
                // Sort the results chronologically
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                // Reshape the output for easier use in charts
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    newCustomers: '$newCustomers'
                }
            }
        ]);
        res.json(growthData);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 2: PPO FINANCIALS BY MONTH ---
router.get('/ppo-monthly-summary', async (req, res) => {
    try {
        const { year, month } = req.query; // e.g., year=2025, month=10

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month are required.' });
        }

        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 1);

        const monthlySummary = await PPO.aggregate([
            {
                // Filter PPOs for the selected month and year
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $addFields: {
                    unifiedStatus: { $cond: { if: { $in: ['$status', ['Dispatched', 'Fulfilled']] }, then: 'Dispatched', else: 'Pending' } }
                }
            },
            {
                $group: {
                    _id: '$unifiedStatus',
                    totalValue: { $sum: '$ppoValue' }
                }
            }
        ]);

        const result = { pending: 0, dispatched: 0 };
        monthlySummary.forEach(item => {
            if (item._id === 'Pending') result.pending = item.totalValue;
            if (item._id === 'Dispatched') result.dispatched = item.totalValue;
        });

        res.json([{ name: 'Financials', ...result }]); // Format for Recharts Bar Chart
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 3: CUSTOMERS SERVED PER MONTH ---
router.get('/customers-served', async (req, res) => {
    try {
        const servedData = await PPO.aggregate([
            {
                // Find only dispatched/fulfilled PPOs
                $match: {
                    status: { $in: ['Dispatched', 'Fulfilled'] }
                }
            },
            {
                // Group by month/year and the unique customer ID
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        customerId: '$customerId'
                    }
                }
            },
            {
                // Now group again just by month/year to count the unique customers
                $group: {
                    _id: {
                        year: '$_id.year',
                        month: '$_id.month'
                    },
                    uniqueCustomersServed: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    count: '$uniqueCustomersServed'
                }
            }
        ]);
        res.json(servedData);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 4: REVENUE TREND OVER TIME ---
router.get('/revenue-trend', async (req, res) => {
    try {
        const revenueData = await PPO.aggregate([
            {
                // Consider only dispatched or fulfilled PPOs for revenue calculation
                $match: {
                    status: { $in: ['Dispatched', 'Fulfilled'] }
                }
            },
            {
                // Group by month and year, calculating total revenue, order count, and average order value
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$ppoValue' },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: '$ppoValue' }
                }
            },
            {
                // Sort the results chronologically
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                // Reshape the output for easier use in charts
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    totalRevenue: '$totalRevenue',
                    orderCount: '$orderCount',
                    avgOrderValue: '$avgOrderValue'
                }
            }
        ]);
        res.json(revenueData);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 5: TOP CUSTOMERS BY REVENUE ---
router.get('/top-customers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Limit the number of top customers returned, default is 10

        const topCustomers = await PPO.aggregate([
            {
                // Consider only dispatched or fulfilled PPOs
                $match: {
                    status: { $in: ['Dispatched', 'Fulfilled'] }
                }
            },
            {
                // Group by customer ID, calculating total revenue and order count
                $group: {
                    _id: '$customerId',
                    totalRevenue: { $sum: '$ppoValue' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                // Lookup customer information from the customers collection
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            { $unwind: '$customerInfo' }, // Unwind the customerInfo array
            {
                // Project the desired fields for the response
                $project: {
                    _id: 0,
                    customerId: '$_id',
                    customerName: '$customerInfo.name',
                    totalRevenue: '$totalRevenue',
                    orderCount: '$orderCount'
                }
            },
            {
                // Sort by total revenue in descending order
                $sort: { totalRevenue: -1 }
            },
            {
                // Limit the number of results returned
                $limit: limit
            }
        ]);

        res.json(topCustomers);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 6: PPO STATUS DISTRIBUTION ---
router.get('/ppo-status-distribution', async (req, res) => {
    try {
        const distribution = await PPO.aggregate([
            {
                // Group by PPO status, calculating count and total value for each status
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$ppoValue' }
                }
            }
        ]);

        res.json(distribution);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});


// --- NEW ENDPOINT 7: PPO COMPLETION RATE OVER TIME ---
router.get('/completion-rate', async (req, res) => {
    try {
        const completionData = await PPO.aggregate([
            {
                // Group by month and year, calculating total count and completed count
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['Dispatched', 'Fulfilled']] }, 1, 0]
                        }
                    }
                }
            },
            {
                // Sort the results chronologically
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            {
                // Reshape the output to include completion rate
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    total: '$total',
                    completed: '$completed',
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completed', '$total'] },
                            100
                        ]
                    }
                }
            }
        ]);

        res.json(completionData);
    } catch (error) {
        res.status(500).json('Error: ' + error);
    }
});

module.exports = router;


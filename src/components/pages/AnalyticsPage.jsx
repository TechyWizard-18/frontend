// client/src/pages/AnalyticsPage.js
// FULLY UPGRADED WITH COMPREHENSIVE CHARTS

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AnimatedPage from '../../components/AnimatedPage';

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
    title: { color: 'white', marginBottom: '20px', fontSize: '2em', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' },
    singleGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '30px' },
    chartCard: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '15px' },
    chartTitle: { color: 'white', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', paddingBottom: '10px', fontSize: '1.2em' },
    filterContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
    select: { padding: '8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', cursor: 'pointer' },
    statsCard: { background: 'linear-gradient(135deg, rgba(130, 202, 157, 0.2), rgba(136, 132, 216, 0.2))', padding: '20px', borderRadius: '10px', textAlign: 'center' },
    statsValue: { fontSize: '2.5em', fontWeight: 'bold', color: '#82ca9d', margin: '10px 0' },
    statsLabel: { color: '#ccc', fontSize: '1em' }
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AnalyticsPage = () => {
    const [growthData, setGrowthData] = useState([]);
    const [servedData, setServedData] = useState([]);
    const [monthlyFinancials, setMonthlyFinancials] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [completionRate, setCompletionRate] = useState([]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    // Fetch all analytics data on load
    useEffect(() => {
        // Customer Growth
        axios.get(`${API_URL}/api/analytics/customer-growth`)
            .then(res => {
                const formattedData = res.data.map(d => ({
                    ...d,
                    monthName: `${monthNames[d.month-1]} ${d.year}`
                }));
                setGrowthData(formattedData);
            })
            .catch(err => console.error('Error fetching customer growth:', err));

        // Customers Served
        axios.get(`${API_URL}/api/analytics/customers-served`)
            .then(res => {
                const formattedData = res.data.map(d => ({
                    ...d,
                    monthName: `${monthNames[d.month-1]} ${d.year}`
                }));
                setServedData(formattedData);
            })
            .catch(err => console.error('Error fetching customers served:', err));

        // Revenue Trend
        axios.get(`${API_URL}/api/analytics/revenue-trend`)
            .then(res => {
                const formattedData = res.data.map(d => ({
                    ...d,
                    monthName: `${monthNames[d.month-1]} ${d.year}`,
                    avgOrderValue: Math.round(d.avgOrderValue)
                }));
                setRevenueData(formattedData);
            })
            .catch(err => console.error('Error fetching revenue trend:', err));

        // Top Customers
        axios.get(`${API_URL}/api/analytics/top-customers?limit=8`)
            .then(res => setTopCustomers(res.data))
            .catch(err => console.error('Error fetching top customers:', err));

        // Status Distribution
        axios.get(`${API_URL}/api/analytics/ppo-status-distribution`)
            .then(res => {
                const formatted = res.data.map(item => ({
                    name: item._id,
                    value: item.count,
                    revenue: item.totalValue
                }));
                setStatusDistribution(formatted);
            })
            .catch(err => console.error('Error fetching status distribution:', err));

        // Completion Rate
        axios.get(`${API_URL}/api/analytics/completion-rate`)
            .then(res => {
                const formattedData = res.data.map(d => ({
                    ...d,
                    monthName: `${monthNames[d.month-1]} ${d.year}`,
                    completionRate: Math.round(d.completionRate * 10) / 10
                }));
                setCompletionRate(formattedData);
            })
            .catch(err => console.error('Error fetching completion rate:', err));
    }, []);

    // Fetch monthly financials when filters change
    useEffect(() => {
        axios.get(`${API_URL}/api/analytics/ppo-monthly-summary?year=${selectedYear}&month=${selectedMonth}`)
            .then(res => setMonthlyFinancials(res.data))
            .catch(err => console.error('Error fetching monthly financials:', err));
    }, [selectedYear, selectedMonth]);

    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(value);

    // Enhanced Custom Tooltip with better visibility
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(20, 20, 40, 0.95)',
                    padding: '12px 15px',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                }}>
                    <p style={{ color: 'white', margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1em' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, margin: '4px 0', fontSize: '0.95em', fontWeight: '600' }}>
                            {entry.name}: {typeof entry.value === 'number' && (entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('value'))
                                ? formatCurrency(entry.value)
                                : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom Pie Chart Tooltip
    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(20, 20, 40, 0.95)',
                    padding: '12px 15px',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                }}>
                    <p style={{ color: 'white', margin: '0 0 5px 0', fontWeight: 'bold' }}>{payload[0].name}</p>
                    <p style={{ color: payload[0].payload.fill, margin: '0', fontWeight: '600' }}>
                        Count: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <AnimatedPage>
            <h1 style={styles.title}>📊 Business Intelligence Dashboard</h1>

            {/* Revenue Trend - Full Width */}
            <div style={styles.singleGrid}>
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>💰 Revenue Trend & Average Order Value</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="monthName" stroke="white" />
                            <YAxis stroke="white" tickFormatter={formatCurrency} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 2 }} />
                            <Legend />
                            <Area type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorRevenue)" />
                            <Line type="monotone" dataKey="avgOrderValue" name="Avg Order Value" stroke="#ffc658" strokeWidth={3} dot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Grid */}
            <div style={styles.grid}>
                {/* Customer Growth */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📈 New Customer Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="monthName" stroke="white" />
                            <YAxis stroke="white" />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 2 }} />
                            <Legend />
                            <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* PPO Completion Rate */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>✅ Order Completion Rate (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={completionRate}>
                            <defs>
                                <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="monthName" stroke="white" />
                            <YAxis stroke="white" domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 2 }} />
                            <Legend />
                            <Area type="monotone" dataKey="completionRate" name="Completion Rate" stroke="#00C49F" fillOpacity={1} fill="url(#colorCompletion)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Grid */}
            <div style={styles.grid}>
                {/* Top Customers */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>🏆 Top 8 Customers by Revenue</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={topCustomers} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis type="number" stroke="white" tickFormatter={formatCurrency} />
                            <YAxis type="category" dataKey="customerName" stroke="white" width={100} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="totalRevenue" name="Total Revenue" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* PPO Status Distribution */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📊 Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two Column Grid */}
            <div style={styles.grid}>
                {/* Customers Served */}
                <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>👥 Unique Customers Served</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={servedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="monthName" stroke="white" />
                            <YAxis stroke="white" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="count" name="Customers Served" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Financials */}
                <div style={styles.chartCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                        <h3 style={{...styles.chartTitle, marginBottom: 0, borderBottom: 'none'}}>💵 Monthly PPO Financials</h3>
                        <div style={styles.filterContainer}>
                            <select style={styles.select} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                                {monthNames.map((name, index) => <option key={name} value={index+1}>{name}</option>)}
                            </select>
                            <select style={styles.select} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                                {[2025, 2024, 2023].map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyFinancials}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="name" stroke="white" />
                            <YAxis stroke="white" tickFormatter={formatCurrency} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="dispatched" name="Dispatched Value" fill="#17a2b8" />
                            <Bar dataKey="pending" name="Pending Value" fill="#ffc107" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default AnalyticsPage;


// client/src/pages/PPOManagementPage.jsx
// PPO MANAGEMENT PAGE WITH FILTERING

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnimatedPage from '../AnimatedPage';
import { useAnalytics } from '../../context/AnalyticsContext';

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
    container: { color: 'white', minHeight: '80vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { color: 'white', margin: 0, fontSize: '2em' },
    controlsContainer: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    filtersRow: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: { flex: '1 1 250px', padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em' },
    select: { padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', cursor: 'pointer' },
    dateInput: { padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em' },
    clearButton: { padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '15px', borderRadius: '8px', textAlign: 'center' },
    statValue: { fontSize: '2em', fontWeight: 'bold', margin: '10px 0' },
    statLabel: { color: '#ccc', fontSize: '0.9em' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '10px', overflow: 'hidden' },
    th: { backgroundColor: 'rgba(0, 123, 255, 0.8)', color: 'white', padding: '15px', textAlign: 'left', fontWeight: 'bold' },
    td: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f0f0' },
    customerLink: { color: '#17a2b8', textDecoration: 'none', fontWeight: 'bold' },
    statusSelect: { padding: '8px 12px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', cursor: 'pointer', fontSize: '1em' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'white', fontSize: '1.5em' },
    noPPOsMessage: { textAlign: 'center', padding: '40px', color: '#ccc', fontSize: '1.2em', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
    getStatusBadge: (status) => {
        const baseStyle = { padding: '8px 15px', borderRadius: '20px', color: 'white', fontWeight: 'bold', textAlign: 'center', display: 'inline-block' };
        if (status === 'Pending') return { ...baseStyle, backgroundColor: '#ffc107' };
        return baseStyle;
    }
};

const PPOManagementPage = () => {
    const [ppos, setPPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, dispatched: 0});
    const { fetchSummary } = useAnalytics();

    useEffect(() => {
        fetchPPOs();
    }, [searchTerm, statusFilter, sortBy, startDate, endDate]);

    const fetchPPOs = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (sortBy) params.append('sortBy', sortBy);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        axios.get(`${API_URL}/api/ppos?${params.toString()}`)
            .then(response => {
                setPPOs(response.data);
                calculateStats(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching PPOs:', err);
                toast.error('Failed to load PPOs');
                setLoading(false);
            });
    };

    const calculateStats = (ppoList) => {
        const stats = {
            total: ppoList.length,
            pending: ppoList.filter(p => p.status === 'Pending').length,
            dispatched: ppoList.filter(p => p.status === 'Dispatched').length,
        };
        setStats(stats);
    };

    const handleStatusChange = (ppoId, newStatus) => {
        axios.patch(`${API_URL}/api/ppos/${ppoId}`, { status: newStatus })
            .then(res => {
                toast.success('PPO status updated successfully!');
                fetchPPOs();
                fetchSummary();
            })
            .catch(err => {
                console.error('Error updating PPO status:', err);
                toast.error('Failed to update PPO status');
            });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortBy('newest');
        setStartDate('');
        setEndDate('');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div style={styles.loadingContainer}>
                    <div>⏳ Loading PPOs...</div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>📦 PPO Management</h1>
                </div>

                {/* Stats Cards */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statValue, color: '#17a2b8'}}>{stats.total}</div>
                        <div style={styles.statLabel}>Total PPOs</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statValue, color: '#ffc107'}}>{stats.pending}</div>
                        <div style={styles.statLabel}>Pending</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{...styles.statValue, color: '#17a2b8'}}>{stats.dispatched}</div>
                        <div style={styles.statLabel}>Dispatched</div>
                    </div>

                </div>

                {/* Filters */}
                <div style={styles.controlsContainer}>
                    <div style={styles.filtersRow}>
                        <input
                            type="text"
                            placeholder="🔍 Search by customer name or PPO type..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            style={styles.select}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending Only</option>
                            <option value="Dispatched">Dispatched Only</option>
                        </select>
                        <select
                            style={styles.select}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="value">Highest Value</option>
                        </select>
                        <input
                            type="date"
                            placeholder="Start Date"
                            style={styles.dateInput}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            placeholder="End Date"
                            style={styles.dateInput}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <button onClick={handleClearFilters} style={styles.clearButton}>Clear All</button>
                    </div>
                </div>

                {/* PPO Table */}
                {ppos.length === 0 ? (
                    <div style={styles.noPPOsMessage}>
                        <p>No PPOs found matching your filters.</p>
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Customer</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Value</th>
                                <th style={styles.th}>Description</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Change Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ppos.map(ppo => (
                                <tr key={ppo._id}>
                                    <td style={styles.td}>{formatDate(ppo.createdAt)}</td>
                                    <td style={styles.td}>
                                        <Link to={`/customer/${ppo.customerId._id}`} style={styles.customerLink}>
                                            {ppo.customerId.name}
                                        </Link>
                                    </td>
                                    <td style={styles.td}>{ppo.ppoType}</td>
                                    <td style={styles.td}>{formatCurrency(ppo.ppoValue)}</td>
                                    <td style={styles.td}>{ppo.ppoDescription}</td>
                                    <td style={styles.td}>
                                        <span style={styles.getStatusBadge(ppo.status)}>{ppo.status}</span>
                                    </td>
                                    <td style={styles.td}>
                                        <select
                                            value={ppo.status}
                                            onChange={(e) => handleStatusChange(ppo._id, e.target.value)}
                                            style={styles.statusSelect}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Dispatched">Dispatched</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AnimatedPage>
    );
};

export default PPOManagementPage;

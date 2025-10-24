// client/src/pages/POManagementPage.jsx
// PO MANAGEMENT PAGE WITH FILTERING

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnimatedPage from '../AnimatedPage';
import { useAnalytics } from '../../context/AnalyticsContext';

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
    // ===== NEW: Pending 5+ days highlight =====
    tdOverdue: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f0f0', backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    // ===== END NEW =====
    customerLink: { color: '#17a2b8', textDecoration: 'none', fontWeight: 'bold' },
    statusSelect: { padding: '8px 12px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', cursor: 'pointer', fontSize: '1em' },
    // ===== NEW: Remark input =====
    remarkInput: { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', fontSize: '0.9em' },
    remarkButton: { padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', marginTop: '5px' },
    remarkDisplay: { fontSize: '0.85em', color: '#ffc107', fontStyle: 'italic', marginTop: '5px' },
    // ===== END NEW =====
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'white', fontSize: '1.5em' },
    noPOsMessage: { textAlign: 'center', padding: '40px', color: '#ccc', fontSize: '1.2em', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' },
    getStatusBadge: (status) => {
        const baseStyle = { padding: '8px 15px', borderRadius: '20px', color: 'white', fontWeight: 'bold', textAlign: 'center', display: 'inline-block' };
        if (status === 'Pending') return { ...baseStyle, backgroundColor: '#ffc107' };
        return baseStyle;
    }
};

const POManagementPage = () => {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, dispatched: 0});
    // ===== NEW: Remarks state =====
    const [editingRemark, setEditingRemark] = useState(null);
    const [remarkText, setRemarkText] = useState('');
    // ===== END NEW =====
    const { fetchSummary } = useAnalytics();

    useEffect(() => {
        fetchPOs();
    }, [searchTerm, statusFilter, sortBy, startDate, endDate]);

    const fetchPOs = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (sortBy) params.append('sortBy', sortBy);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        axios.get(`/api/ppos?${params.toString()}`)
            .then(response => {
                setPOs(response.data);
                calculateStats(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching POs:', err);
                toast.error('Failed to load POs');
                setLoading(false);
            });
    };

    const calculateStats = (poList) => {
        const stats = {
            total: poList.length,
            pending: poList.filter(p => p.status === 'Pending').length,
            dispatched: poList.filter(p => p.status === 'Dispatched').length,
        };
        setStats(stats);
    };

    const handleStatusChange = (poId, newStatus) => {
        axios.patch(`/api/ppos/${poId}`, { status: newStatus })
            .then(() => {
                toast.success('PO status updated successfully!');
                fetchPOs();
                fetchSummary();
            })
            .catch(err => {
                console.error('Error updating PO status:', err);
                toast.error('Failed to update PO status');
            });
    };

    // ===== NEW: Handle remark update =====
    const handleRemarkUpdate = (poId) => {
        axios.patch(`/api/ppos/${poId}`, { pendingRemark: remarkText })
            .then(() => {
                toast.success('Remark updated successfully!');
                setEditingRemark(null);
                setRemarkText('');
                fetchPOs();
            })
            .catch(err => {
                console.error('Error updating remark:', err);
                toast.error('Failed to update remark');
            });
    };

    const startEditingRemark = (poId, currentRemark) => {
        setEditingRemark(poId);
        setRemarkText(currentRemark || '');
    };
    // ===== END NEW =====

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSortBy('newest');
        setStartDate('');
        setEndDate('');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // ===== NEW: Check if PO is overdue (pending for 5+ days) =====
    const isPOOverdue = (po) => {
        if (po.status !== 'Pending') return false;
        const daysPending = (new Date() - new Date(po.createdAt)) / (1000 * 60 * 60 * 24);
        return daysPending >= 5;
    };
    // ===== END NEW =====

    if (loading) {
        return (
            <AnimatedPage>
                <div style={styles.loadingContainer}>
                    <div>⏳ Loading POs...</div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>📦 PO Management</h1>
                </div>

                {/* Stats Cards */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={{...styles.statValue, color: '#17a2b8'}}>{stats.total}</div>
                        <div style={styles.statLabel}>Total POs</div>
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
                            placeholder="🔍 Search by customer name or PO type..."
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

                {/* PO Table */}
                {pos.length === 0 ? (
                    <div style={styles.noPOsMessage}>
                        <p>No POs found matching your filters.</p>
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
                                {/* ===== NEW: Remarks column ===== */}
                                <th style={styles.th}>Remarks (Pending Only)</th>
                                {/* ===== END NEW ===== */}
                            </tr>
                        </thead>
                        <tbody>
                            {pos.map(po => {
                                const isOverdue = isPOOverdue(po);
                                const tdStyle = isOverdue ? styles.tdOverdue : styles.td;
                                return (
                                    <tr key={po._id}>
                                        <td style={tdStyle}>{formatDate(po.createdAt)}</td>
                                        <td style={tdStyle}>
                                            {po.customerId ? (
                                                <Link to={`/customer/${po.customerId._id}`} style={styles.customerLink}>
                                                    {po.customerId.name}
                                                </Link>
                                            ) : (
                                                <span style={{ color: '#888' }}>Unknown Customer</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>{po.ppoType}</td>
                                        <td style={tdStyle}>{formatCurrency(po.ppoValue)}</td>
                                        <td style={tdStyle}>{po.ppoDescription}</td>
                                        <td style={tdStyle}>
                                            <span style={styles.getStatusBadge(po.status)}>{po.status}</span>
                                            {/* ===== NEW: Show overdue warning ===== */}
                                            {isOverdue && <div style={{ color: '#ff6b6b', fontSize: '0.8em', marginTop: '5px' }}>⚠️ Overdue 5+ days</div>}
                                            {/* ===== END NEW ===== */}
                                        </td>
                                        <td style={tdStyle}>
                                            <select
                                                value={po.status}
                                                onChange={(e) => handleStatusChange(po._id, e.target.value)}
                                                style={styles.statusSelect}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Dispatched">Dispatched</option>
                                            </select>
                                        </td>
                                        {/* ===== NEW: Remarks cell ===== */}
                                        <td style={tdStyle}>
                                            {po.status === 'Pending' ? (
                                                editingRemark === po._id ? (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={remarkText}
                                                            onChange={(e) => setRemarkText(e.target.value)}
                                                            placeholder="Enter remark..."
                                                            style={styles.remarkInput}
                                                        />
                                                        <button onClick={() => handleRemarkUpdate(po._id)} style={styles.remarkButton}>
                                                            💾 Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRemark(null)}
                                                            style={{...styles.remarkButton, background: '#6c757d', marginLeft: '5px'}}
                                                        >
                                                            ✖ Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {po.pendingRemark ? (
                                                            <div style={styles.remarkDisplay}>
                                                                📝 {po.pendingRemark}
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: '#888', fontSize: '0.85em' }}>No remark</div>
                                                        )}
                                                        <button
                                                            onClick={() => startEditingRemark(po._id, po.pendingRemark)}
                                                            style={{...styles.remarkButton, background: '#007bff'}}
                                                        >
                                                            ✏️ {po.pendingRemark ? 'Edit' : 'Add'} Remark
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <div style={{ color: '#888', fontSize: '0.85em' }}>N/A (Dispatched)</div>
                                            )}
                                        </td>
                                        {/* ===== END NEW ===== */}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </AnimatedPage>
    );
};

export default POManagementPage;

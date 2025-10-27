// client/src/pages/POManagementPage.jsx
// PO MANAGEMENT PAGE WITH FILTERING

import React, { useState, useEffect, useCallback } from 'react';
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
    tdOverdue: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f0f0', backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    customerLink: { color: '#17a2b8', textDecoration: 'none', fontWeight: 'bold' },
    statusSelect: { padding: '8px 12px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', cursor: 'pointer', fontSize: '1em' },
    remarkInput: { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', fontSize: '0.9em' },
    remarkButton: { padding: '5px 10px', borderRadius: '5px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em', marginTop: '5px' },
    remarkDisplay: { fontSize: '0.85em', color: '#ffc107', fontStyle: 'italic', marginTop: '5px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '15px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', border: '2px solid rgba(255, 255, 255, 0.3)' },
    modalTitle: { color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.5em' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', color: '#ccc', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', minHeight: '80px', boxSizing: 'border-box', resize: 'vertical' },
    modalButtons: { display: 'flex', gap: '10px', marginTop: '20px' },
    saveButton: { flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' },
    cancelButton: { flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' },
    editButton: { padding: '6px 12px', borderRadius: '5px', border: 'none', background: '#17a2b8', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' },
    paymentAlert: { fontSize: '0.8em', marginTop: '5px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
    paymentOverdue: { backgroundColor: 'rgba(255, 0, 0, 0.3)', color: '#ff6b6b' },
    paymentDueSoon: { backgroundColor: 'rgba(255, 193, 7, 0.3)', color: '#ffc107' },
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
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, dispatched: 0});
    const [editingRemark, setEditingRemark] = useState(null);
    const [remarkText, setRemarkText] = useState('');
    const [editingPO, setEditingPO] = useState(null);
    const [editForm, setEditForm] = useState({
        ppoValue: '',
        ppoType: '',
        ppoDescription: '',
        salesmanName: '',
        paymentTerms: 30,
        priority: 'Low'
    });
    const { fetchSummary } = useAnalytics();

    const fetchPOs = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (priorityFilter !== 'all') params.append('priority', priorityFilter);
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
    }, [searchTerm, statusFilter, priorityFilter, sortBy, startDate, endDate]);

    useEffect(() => {
        fetchPOs();
    }, [fetchPOs]);

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

    const startEditingPO = (po) => {
        setEditingPO(po._id);
        setEditForm({
            ppoValue: po.ppoValue,
            ppoType: po.ppoType,
            ppoDescription: po.ppoDescription,
            salesmanName: po.salesmanName || '',
            paymentTerms: po.paymentTerms || 30,
            priority: po.priority || 'Low'
        });
    };

    const handlePOUpdate = (poId) => {
        axios.patch(`/api/ppos/${poId}`, editForm)
            .then(() => {
                toast.success('PO updated successfully!');
                setEditingPO(null);
                fetchPOs();
                fetchSummary();
            })
            .catch(err => {
                console.error('Error updating PO:', err);
                toast.error('Failed to update PO');
            });
    };

    const cancelEditPO = () => {
        setEditingPO(null);
        setEditForm({
            ppoValue: '',
            ppoType: '',
            ppoDescription: '',
            salesmanName: '',
            paymentTerms: 30,
            priority: 'Low'
        });
    };

    const getPaymentStatus = (po) => {
        if (!po.paymentDueDate || po.status === 'Dispatched') return null;

        const today = new Date();
        const dueDate = new Date(po.paymentDueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
            return { type: 'overdue', days: Math.abs(daysUntilDue), message: `⚠️ Payment overdue by ${Math.abs(daysUntilDue)} days!` };
        } else if (daysUntilDue <= 5) {
            return { type: 'due-soon', days: daysUntilDue, message: `⏰ Payment due in ${daysUntilDue} days` };
        }
        return { type: 'ok', days: daysUntilDue, message: `Due in ${daysUntilDue} days` };
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPriorityFilter('all');
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

    const isPOOverdue = (po) => {
        if (po.status !== 'Pending') return false;
        const daysPending = (new Date() - new Date(po.createdAt)) / (1000 * 60 * 60 * 24);
        return daysPending >= 5;
    };

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
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">All Priority</option>
                            <option value="High">High Only</option>
                            <option value="Low">Low Only</option>
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
                                <th style={styles.th}>Salesman</th>
                                <th style={styles.th}>Payment Terms</th>
                                <th style={styles.th}>Priority</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Change Status</th>
                                <th style={styles.th}>Remarks</th>
                                <th style={styles.th}>Actions</th>
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
                                        <td style={tdStyle}>{po.salesmanName || 'N/A'}</td>
                                        <td style={tdStyle}>
                                            {po.paymentTerms ? `${po.paymentTerms} Days` : 'N/A'}
                                            {po.paymentDueDate && (() => {
                                                const paymentStatus = getPaymentStatus(po);
                                                if (paymentStatus) {
                                                    const alertStyle = paymentStatus.type === 'overdue' ? styles.paymentOverdue :
                                                                      paymentStatus.type === 'due-soon' ? styles.paymentDueSoon : {};
                                                    return (
                                                        <div style={{...styles.paymentAlert, ...alertStyle}}>
                                                            {paymentStatus.message}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </td>
                                        <td style={tdStyle}>{po.priority || 'Low'}</td>
                                        <td style={tdStyle}>
                                            <span style={styles.getStatusBadge(po.status)}>{po.status}</span>
                                            {isOverdue && <div style={{ color: '#ff6b6b', fontSize: '0.8em', marginTop: '5px' }}>⚠️ Overdue 5+ days</div>}
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
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => startEditingPO(po)}
                                                style={styles.editButton}
                                            >
                                                ✏️ Edit PO
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {editingPO && (
                    <div style={styles.modalOverlay} onClick={cancelEditPO}>
                        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <h2 style={styles.modalTitle}>✏️ Edit PO Information</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>PO Value (AED):</label>
                                <input
                                    type="number"
                                    value={editForm.ppoValue}
                                    onChange={(e) => setEditForm({...editForm, ppoValue: e.target.value})}
                                    style={styles.input}
                                    min="0"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>PO Type:</label>
                                <input
                                    type="text"
                                    value={editForm.ppoType}
                                    onChange={(e) => setEditForm({...editForm, ppoType: e.target.value})}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>PO Description:</label>
                                <textarea
                                    value={editForm.ppoDescription}
                                    onChange={(e) => setEditForm({...editForm, ppoDescription: e.target.value})}
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Salesman Name:</label>
                                <input
                                    type="text"
                                    value={editForm.salesmanName}
                                    onChange={(e) => setEditForm({...editForm, salesmanName: e.target.value})}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Payment Terms:</label>
                                <select
                                    value={editForm.paymentTerms}
                                    onChange={(e) => setEditForm({...editForm, paymentTerms: Number(e.target.value)})}
                                    style={styles.input}
                                >
                                    <option value="30">30 Days</option>
                                    <option value="60">60 Days</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Priority:</label>
                                <select
                                    value={editForm.priority}
                                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                    style={styles.input}
                                >
                                    <option value="Low">Low</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div style={styles.modalButtons}>
                                <button onClick={() => handlePOUpdate(editingPO)} style={styles.saveButton}>
                                    💾 Save Changes
                                </button>
                                <button onClick={cancelEditPO} style={styles.cancelButton}>
                                    ✖ Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default POManagementPage;


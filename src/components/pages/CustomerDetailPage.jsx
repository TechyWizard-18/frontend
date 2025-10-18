// client/src/pages/CustomerDetailPage.js
// REVISED FILE

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import AddPOForm from './AddPPOForm';
import { useAnalytics } from '../../context/AnalyticsContext.jsx';

const styles = {
    container: { color: 'white', minHeight: '80vh' },
    backButton: { display: 'inline-block', marginBottom: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' },
    header: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '10px', marginBottom: '30px' },
    customerName: { margin: '0 0 15px 0', fontSize: '2em', color: 'white' },
    detailText: { color: '#ccc', fontSize: '1.1em', margin: '8px 0' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '10px', overflow: 'hidden' },
    th: { backgroundColor: 'rgba(0, 123, 255, 0.8)', color: 'white', padding: '15px', textAlign: 'left', fontWeight: 'bold' },
    td: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f0f0' },
    select: { padding: '8px 12px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.3)', color: 'white', cursor: 'pointer', fontSize: '1em' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'white', fontSize: '1.5em' },
    noPOsMessage: { textAlign: 'center', padding: '40px', color: '#ccc', fontSize: '1.2em', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', marginTop: '20px' },
    sectionTitle: { color: 'white', marginTop: '30px', marginBottom: '20px', fontSize: '1.5em' },
    getStatusBadge: (status) => {
        const baseStyle = { padding: '8px 15px', borderRadius: '20px', color: 'white', fontWeight: 'bold', textAlign: 'center', display: 'inline-block' };
        if (status === 'Pending') return { ...baseStyle, backgroundColor: '#ffc107' };
        if (status === 'Fulfilled' || status === 'Dispatched') return { ...baseStyle, backgroundColor: '#17a2b8' };
        return baseStyle;
    }
};

const CustomerDetailPage = () => {
    const [customer, setCustomer] = useState(null);
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { fetchSummary } = useAnalytics();

    const fetchPOs = () => {
        axios.get(`/api/customers/${id}/ppos`)
            .then(response => setPOs(response.data))
            .catch(error => console.log('Error fetching POs:', error));
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Fetch customer details
        axios.get(`/api/customers/${id}`)
            .then(response => {
                setCustomer(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching customer:', error);
                setError('Failed to load customer details. Please try again.');
                setLoading(false);
            });

        // Fetch POs
        fetchPOs();
    }, [id]);

    const handleStatusChange = (poId, newStatus) => {
        axios.patch(`/api/ppos/${poId}`, { status: newStatus })
            .then(res => {
                console.log('PO status updated:', res.data);
                fetchPOs();
                fetchSummary();
            })
            .catch(err => console.error('Error updating PO status:', err));
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div>⏳ Loading customer details...</div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div style={styles.container}>
                <Link to="/" style={styles.backButton}>← Back to Dashboard</Link>
                <div style={styles.noPOsMessage}>
                    <p>❌ {error || 'Customer not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Link to="/" style={styles.backButton}>← Back to Dashboard</Link>

            <div style={styles.header}>
                <h2 style={styles.customerName}>{customer.name}</h2>
                <p style={styles.detailText}><strong>📞 Phone:</strong> {customer.phone}</p>
                <p style={styles.detailText}><strong>📍 Address:</strong> {customer.address}</p>
            </div>

            <AddPOForm customerId={id} onPOAdded={fetchPOs} />

            <h3 style={styles.sectionTitle}>📋 PO History</h3>

            {pos.length === 0 ? (
                <div style={styles.noPOsMessage}>
                    <p>No POs found for this customer. Add one above! 👆</p>
                </div>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Value</th>
                            <th style={styles.th}>Description</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => (
                            <tr key={po._id}>
                                <td style={styles.td}>{po.ppoType}</td>
                                <td style={styles.td}>{formatCurrency(po.ppoValue)}</td>
                                <td style={styles.td}>{po.ppoDescription}</td>
                                <td style={styles.td}>
                                    <span style={styles.getStatusBadge(po.status)}>{po.status}</span>
                                </td>
                                <td style={styles.td}>
                                    <select
                                        value={po.status}
                                        onChange={(e) => handleStatusChange(po._id, e.target.value)}
                                        style={styles.select}
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
    );
};

export default CustomerDetailPage;

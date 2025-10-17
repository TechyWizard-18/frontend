// client/src/components/pages/DashboardPage.jsx
// SIMPLIFIED - IT JUST WORKS

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditCustomerModal from '../EditCustomerModal';
import AnimatedPage from '../AnimatedPage';

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { color: 'white', margin: 0 },
    addButton: { textDecoration: 'none', backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold' },
    controlsContainer: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
    searchRow: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' },
    searchInput: { flex: '1 1 300px', padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em' },
    select: { padding: '10px', borderRadius: '5px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', cursor: 'pointer' },
    filterButton: { padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#17a2b8', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    clearButton: { padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6c757d', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    customerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    customerCard: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f0f0f0' },
    customerName: { margin: 0, color: 'white', textDecoration: 'none', fontSize: '1.2em', fontWeight: 'bold' },
    customerPhone: { margin: '5px 0 0', color: '#ccc' },
    customerDate: { margin: '8px 0 0', color: '#aaa', fontSize: '0.85em', fontStyle: 'italic' },
    pendingPpoText: { fontWeight: 'bold', color: '#ffc107' },
    cardFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    editButton: { border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#ffc107', color: '#333' },
    deleteButton: { border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#dc3545', color: 'white' },
    messageContainer: { color: 'white', textAlign: 'center', padding: '40px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
    showMoreContainer: { display: 'flex', justifyContent: 'center', padding: '20px' },
    showMoreButton: { background: '#28a745', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }
};

const DashboardPage = () => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterPending, setFilterPending] = useState('all');
    const [editingCustomer, setEditingCustomer] = useState(null);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        const formattedDate = date.toLocaleDateString('en-US', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
        return `${formattedDate} at ${formattedTime}`;
    };

    const fetchCustomers = useCallback((currentPage, currentSearchTerm, currentSortBy, currentFilterPending) => {
        const params = new URLSearchParams({ page: currentPage, limit: 20 });
        if (currentSearchTerm) { params.append('searchTerm', currentSearchTerm); }
        if (currentSortBy) { params.append('sortBy', currentSortBy); }
        if (currentFilterPending !== 'all') { params.append('filterPending', currentFilterPending); }

        axios.get(`${API_URL}/api/customers?${params.toString()}`)
            .then(response => {
                const { customers: newCustomers, totalPages: newTotalPages } = response.data;
                setCustomers(prev => currentPage === 1 ? newCustomers : [...prev, ...newCustomers]);
                setTotalPages(newTotalPages);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                toast.error("Could not load customer data. The API might be down.");
            });
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1);
            fetchCustomers(1, searchTerm, sortBy, filterPending);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, sortBy, filterPending, fetchCustomers]);

    const handleDeleteCustomer = (customerId, customerName) => {
        if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
            axios.delete(`${API_URL}/api/customers/${customerId}`)
                .then(() => { toast.success(`${customerName} was deleted.`); setPage(1); fetchCustomers(1, searchTerm, sortBy, filterPending); })
                .catch(err => toast.error(`Failed to delete ${customerName}.`));
        }
    };

    const handleCustomerUpdated = (updatedCustomer) => {
        setCustomers(prev => prev.map(c => (c._id === updatedCustomer._id ? updatedCustomer : c)));
        toast.success(`${updatedCustomer.name}'s details were updated.`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortBy('newest');
        setFilterPending('all');
    };

    const renderContent = () => {
        if (customers.length === 0) {
            return <div style={styles.messageContainer}><p>No customers found.</p></div>;
        }
        return (
            <div style={styles.customerGrid}>
                {customers.map(customer => (
                    <div key={customer._id} style={styles.customerCard}>
                        <div>
                            <div>
                                <Link to={`/customer/${customer._id}`} style={styles.customerName}>{customer.name}</Link>
                                <p style={styles.customerPhone}>{customer.phone}</p>
                                <p style={styles.customerDate}>📅 Added: {formatDateTime(customer.createdAt)}</p>
                            </div>
                            <div>
                                {customer.pendingPpoCount > 0 ? <p style={styles.pendingPpoText}>{customer.pendingPpoCount} PPO(s) Pending</p> : <p style={{color: '#28a745'}}>No Pending PPOs</p>}
                            </div>
                        </div>
                        <div style={styles.cardFooter}>
                            <button onClick={() => setEditingCustomer(customer)} style={styles.editButton}>✏️ Edit</button>
                            <button onClick={() => handleDeleteCustomer(customer._id, customer.name)} style={styles.deleteButton}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AnimatedPage>
            {editingCustomer && <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onCustomerUpdated={handleCustomerUpdated} />}
            <div style={styles.header}>
                <h1 style={styles.title}>Customer Database</h1>
                <Link to="/add-customer" style={styles.addButton}>+ Add New Customer</Link>
            </div>
            <div style={styles.controlsContainer}>
                <div style={styles.searchRow}>
                    <input
                        type="text"
                        placeholder="🔍 Search by name or phone number..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        style={styles.select}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                    <select
                        style={styles.select}
                        value={filterPending}
                        onChange={(e) => setFilterPending(e.target.value)}
                    >
                        <option value="all">All Customers</option>
                        <option value="pending">Has Pending PPOs</option>
                        <option value="noPending">No Pending PPOs</option>
                    </select>
                    <button onClick={handleClearFilters} style={styles.clearButton}>Clear Filters</button>
                </div>
            </div>
            {renderContent()}
            {page < totalPages && (
                <div style={styles.showMoreContainer}>
                    <button onClick={() => { setPage(p => p + 1); fetchCustomers(page + 1, searchTerm, sortBy, filterPending); }} style={styles.showMoreButton}>Show More</button>
                </div>
            )}
        </AnimatedPage>
    );
};

export default DashboardPage;


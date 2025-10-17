// client/src/components/EditCustomerModal.js
// NEW FILE

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
    // ... (Styles for the modal popup)
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
    modalTitle: { marginTop: 0 },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    saveButton: { backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    cancelButton: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

const EditCustomerModal = ({ customer, onClose, onCustomerUpdated }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
            });
        }
    }, [customer]);

    if (!customer) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.patch(`${API_URL}/api/customers/${customer._id}`, formData)
            .then(res => {
                onCustomerUpdated(res.data.customer); // Pass updated customer back to parent
                onClose(); // Close the modal
            })
            .catch(err => console.error("Failed to update customer:", err));
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Edit Customer Details</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} style={{...styles.input, height: '80px'}} required />
                    </div>
                    <div style={styles.buttonContainer}>
                        <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
                        <button type="submit" style={styles.saveButton}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerModal;
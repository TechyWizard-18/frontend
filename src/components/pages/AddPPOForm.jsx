// client/src/components/AddPPOForm.js
// REVISED FILE

import React, { useState } from 'react';
import axios from 'axios';
import { useAnalytics } from '../../context/AnalyticsContext';

const API_URL = import.meta.env.VITE_API_URL;

const styles = {
    form: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '25px',
        borderRadius: '10px',
        marginBottom: '30px'
    },
    formTitle: {
        marginTop: '0',
        marginBottom: '20px',
        color: 'white',
        fontSize: '1.3em'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#ccc',
        fontWeight: 'bold'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        boxSizing: 'border-box',
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'white',
        fontSize: '1em'
    },
    button: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '12px 30px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        width: '100%',
        transition: 'opacity 0.3s'
    },
    buttonHover: {
        opacity: 0.9
    }
};

const AddPPOForm = ({ customerId, onPPOAdded }) => {
    const [ppoValue, setPpoValue] = useState('');
    const [ppoType, setPpoType] = useState('');
    const [ppoDescription, setPpoDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { fetchSummary } = useAnalytics();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const newPPO = {
            customerId,
            ppoValue: Number(ppoValue),
            ppoType,
            ppoDescription
        };

        axios.post(`${API_URL}/api/ppos`, newPPO)
            .then(res => {
                console.log('PPO added successfully:', res.data);
                setPpoValue('');
                setPpoType('');
                setPpoDescription('');
                setLoading(false);
                onPPOAdded();
                fetchSummary();
            })
            .catch(err => {
                console.error('Error adding PPO:', err);
                setLoading(false);
                alert('Failed to add PPO. Please try again.');
            });
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>➕ Add New PPO</h3>

            <div style={styles.formGroup}>
                <label style={styles.label}>PPO Value (INR):</label>
                <input
                    type="number"
                    value={ppoValue}
                    onChange={(e) => setPpoValue(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="Enter amount in ₹"
                    disabled={loading}
                    min="0"
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>PPO Type:</label>
                <input
                    type="text"
                    value={ppoType}
                    onChange={(e) => setPpoType(e.target.value)}
                    required
                    style={styles.input}
                    placeholder="e.g., Product, Service, License"
                    disabled={loading}
                />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>PPO Description:</label>
                <textarea
                    value={ppoDescription}
                    onChange={(e) => setPpoDescription(e.target.value)}
                    required
                    style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                    placeholder="Enter detailed description..."
                    disabled={loading}
                />
            </div>

            <button
                type="submit"
                style={{...styles.button, opacity: loading ? 0.6 : 1}}
                disabled={loading}
            >
                {loading ? '⏳ Adding PPO...' : '✅ Add PPO'}
            </button>
        </form>
    );
};

export default AddPPOForm;
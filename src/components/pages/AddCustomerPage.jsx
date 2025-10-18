// client/src/pages/AddCustomerPage.js
// REDESIGNED

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
    formCard: { width: '450px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '30px', borderRadius: '15px', color: 'white' },
    title: { textAlign: 'center', marginBottom: '30px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: '#ccc' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', boxSizing: 'border-box' },
    button: { width: '100%', backgroundColor: '#007bff', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold', transition: 'opacity 0.3s' },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    messageBox: { padding: '15px', marginBottom: '20px', borderRadius: '8px', border: '1px solid', backgroundColor: 'rgba(220, 53, 69, 0.3)', color: '#f8d7da', borderColor: '#dc3545' },
    helpText: { fontSize: '0.85em', color: '#aaa', marginTop: '5px' },
    phoneContainer: { display: 'flex', gap: '10px' },
    countryCode: { width: '100px', flexShrink: 0 },
};

const AddCustomerPage = () => {
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const navigate = useNavigate();

    const validatePhone = (value) => {
        // Remove any non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length === 0) {
            setPhoneError('');
            return true;
        }

        if (digitsOnly.length !== 10) {
            setPhoneError('Phone number must be exactly 10 digits');
            return false;
        }

        setPhoneError('');
        return true;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only digits
        const digitsOnly = value.replace(/\D/g, '');

        // Limit to 10 digits
        if (digitsOnly.length <= 10) {
            setPhone(digitsOnly);
            validatePhone(digitsOnly);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate phone before submission
        if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (phone.length !== 10) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setLoading(true);

        // Combine country code with phone number
        const fullPhone = `${countryCode}${phone}`;

        try {
            const res = await axios.post('/api/customers', {
                name,
                phone: fullPhone,
                address
            });

            // Only navigate on success
            navigate(`/customer/${res.data.customer._id}`);
        } catch (err) {
            setLoading(false);

            if (err.response && err.response.status === 409) {
                const { customer, message } = err.response.data;
                setError(
                    <span>
                        {message} <Link to={`/customer/${customer._id}`} style={{ color: 'white', fontWeight: 'bold' }}>Click here to view.</Link>
                    </span>
                );
            } else if (err.response && err.response.data && err.response.data.errors) {
                // Handle validation errors from backend
                const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
                setError(errorMessages);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h2 style={styles.title}>Register New Customer</h2>
                {error && <div style={styles.messageBox}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name:</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            disabled={loading}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone Number:</label>
                        <div style={styles.phoneContainer}>
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                style={{...styles.input, ...styles.countryCode}}
                                disabled={loading}
                            >
                                <option value="+91">+91 (IN)</option>
                                <option value="+1">+1 (US)</option>
                                <option value="+44">+44 (UK)</option>
                                <option value="+61">+61 (AU)</option>
                                <option value="+971">+971 (UAE)</option>
                            </select>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                style={{...styles.input, borderColor: phoneError ? '#dc3545' : 'rgba(255, 255, 255, 0.3)'}}
                                placeholder="Enter 10 digits"
                                disabled={loading}
                            />
                        </div>
                        {phoneError && <div style={{...styles.helpText, color: '#dc3545'}}>{phoneError}</div>}
                        <div style={styles.helpText}>Enter exactly 10 digits (without country code)</div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Address:</label>
                        <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{...styles.input, height: '100px', resize: 'vertical'}}
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
                        disabled={loading || phoneError !== ''}
                    >
                        {loading ? 'Adding Customer...' : 'Add Customer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerPage;

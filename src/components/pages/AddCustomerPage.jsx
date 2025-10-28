// client/src/pages/AddCustomerPage.js
// ENHANCED REDESIGN WITH UAE DEFAULT

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '20px'
    },
    formCard: {
        width: '100%',
        maxWidth: '550px',
        background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.15) 0%, rgba(81, 45, 168, 0.15) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        padding: '40px',
        borderRadius: '20px',
        color: 'white',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    title: {
        textAlign: 'center',
        marginBottom: '10px',
        fontSize: '2em',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#b8b8b8',
        fontSize: '0.95em'
    },
    formGroup: {
        marginBottom: '25px',
        position: 'relative'
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        color: '#e0e0e0',
        fontWeight: '500',
        fontSize: '0.95em'
    },
    labelIcon: {
        fontSize: '1.2em'
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        fontSize: '1em',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        outline: 'none'
    },
    inputFocus: {
        border: '2px solid rgba(103, 58, 183, 0.6)',
        background: 'rgba(0, 0, 0, 0.4)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)'
    },
    button: {
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 20px',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        marginTop: '10px',
        boxShadow: '0 4px 15px rgba(103, 58, 183, 0.4)'
    },
    buttonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(103, 58, 183, 0.6)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none'
    },
    messageBox: {
        padding: '15px 18px',
        marginBottom: '20px',
        borderRadius: '10px',
        border: '2px solid',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        color: '#ffb3ba',
        borderColor: '#dc3545',
        fontSize: '0.95em',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    helpText: {
        fontSize: '0.85em',
        color: '#b8b8b8',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
    },
    phoneContainer: {
        display: 'flex',
        gap: '12px',
        alignItems: 'stretch'
    },
    countryCode: {
        width: '180px',
        flexShrink: 0,
        fontWeight: '500',
        fontSize: '0.9em'
    },
    successIcon: {
        fontSize: '1.2em',
        color: '#4CAF50'
    },
    errorIcon: {
        fontSize: '1.2em'
    }
};

const AddCustomerPage = () => {
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+971'); // UAE as default
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const validatePhone = (value) => {
        // Remove any non-digit characters for validation
        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length === 0) {
            setPhoneError('');
            return true;
        }

        // Allow up to 10 digits maximum (can be less than 10, but not more)
        if (digitsOnly.length > 10) {
            setPhoneError('Phone number cannot exceed 10 digits');
            return false;
        }

        setPhoneError('');
        return true;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only digits
        const digitsOnly = value.replace(/\D/g, '');

        // Allow maximum 10 digits
        if (digitsOnly.length <= 10) {
            setPhone(digitsOnly);
            validatePhone(digitsOnly);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate phone before submission (allow up to 10 digits)
        if (!validatePhone(phone)) {
            setError('Please enter a valid phone number (max 10 digits)');
            return;
        }

        if (phone.length === 0) {
            setError('Phone number is required');
            return;
        }

        if (phone.length > 10) {
            setError('Phone number cannot exceed 10 digits');
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
            <div
                style={styles.formCard}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(103, 58, 183, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
                }}
            >
                <h2 style={styles.title}>✨ Register New Customer</h2>
                <p style={styles.subtitle}>Add customer details to get started</p>

                {error && (
                    <div style={styles.messageBox}>
                        <span style={styles.errorIcon}>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <span style={styles.labelIcon}>👤</span>
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            style={{
                                ...styles.input,
                                ...(focusedField === 'name' ? styles.inputFocus : {})
                            }}
                            placeholder="Enter customer's full name"
                            disabled={loading}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <span style={styles.labelIcon}>📱</span>
                            Phone Number
                        </label>
                        <div style={styles.phoneContainer}>
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                onFocus={() => setFocusedField('countryCode')}
                                onBlur={() => setFocusedField(null)}
                                style={{
                                    ...styles.input,
                                    ...styles.countryCode,
                                    ...(focusedField === 'countryCode' ? styles.inputFocus : {})
                                }}
                                disabled={loading}
                            >
                                <option value="+971">🇦🇪 +971 (UAE)</option>
                                <option value="+91">🇮🇳 +91 (India)</option>
                                <option value="+1">🇺🇸 +1 (USA)</option>
                                <option value="+44">🇬🇧 +44 (UK)</option>
                                <option value="+61">🇦🇺 +61 (Australia)</option>
                                <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
                                <option value="+965">🇰🇼 +965 (Kuwait)</option>
                                <option value="+974">🇶🇦 +974 (Qatar)</option>
                                <option value="+968">🇴🇲 +968 (Oman)</option>
                                <option value="+973">🇧🇭 +973 (Bahrain)</option>
                            </select>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                style={{
                                    ...styles.input,
                                    border: phoneError
                                        ? '2px solid #dc3545'
                                        : focusedField === 'phone'
                                            ? '2px solid rgba(103, 58, 183, 0.6)'
                                            : '2px solid rgba(255, 255, 255, 0.2)',
                                    ...(focusedField === 'phone' && !phoneError ? styles.inputFocus : {})
                                }}
                                placeholder="Enter up to 10 digits"
                                disabled={loading}
                            />
                        </div>
                        {phoneError ? (
                            <div style={{...styles.helpText, color: '#ff6b6b'}}>
                                <span>❌</span>
                                <span>{phoneError}</span>
                            </div>
                        ) : (phone.length > 0 && phone.length <= 10) ? (
                            <div style={{...styles.helpText, color: '#4CAF50'}}>
                                <span>✓</span>
                                <span>Valid phone number</span>
                            </div>
                        ) : (
                            <div style={styles.helpText}>
                                <span>ℹ️</span>
                                <span>Enter up to 10 digits (without country code)</span>
                            </div>
                        )}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <span style={styles.labelIcon}>📍</span>
                            Address
                        </label>
                        <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onFocus={() => setFocusedField('address')}
                            onBlur={() => setFocusedField(null)}
                            style={{
                                ...styles.input,
                                height: '120px',
                                resize: 'vertical',
                                ...(focusedField === 'address' ? styles.inputFocus : {})
                            }}
                            placeholder="Enter complete address with area, city, and postal code"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading || phoneError !== '' ? styles.buttonDisabled : {})
                        }}
                        disabled={loading || phoneError !== ''}
                        onMouseEnter={(e) => {
                            if (!loading && phoneError === '') {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(103, 58, 183, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(103, 58, 183, 0.4)';
                        }}
                    >
                        {loading ? '⏳ Adding Customer...' : '✅ Add Customer'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerPage;

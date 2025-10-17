// client/src/components/Navbar.js
// REVISED WITH AUTHENTICATION CONTROLS

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import the AuthContext

const styles = {
    navbar: { backgroundColor: '#003366', padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px 8px 0 0' },
    logo: { textDecoration: 'none', color: 'white', fontSize: '1.5em', fontWeight: 'bold' },
    navLinks: { display: 'flex', gap: '20px', alignItems: 'center' }, // Added alignItems
    link: { textDecoration: 'none', color: 'white', fontSize: '1em', padding: '5px 10px', borderRadius: '4px' },
    // New styles for the user info and logout button
    userInfo: { color: '#ccc', fontSize: '0.9em' },
    logoutButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9em',
    },
};

const Navbar = () => {
    // 1. Get the authentication state and functions from our global context
    const { token, user, logout } = useContext(AuthContext);

    return (
        <nav style={styles.navbar}>
            <Link to="/" style={styles.logo}>
                CustomerDash
            </Link>
            <div style={styles.navLinks}>
                {/* 2. Conditionally render the links and logout button based on whether a token exists */}
                {token ? (
                    <>
                        {/* Links for logged-in users */}
                        <Link to="/" style={styles.link}>Dashboard</Link>
                        <Link to="/po-management" style={styles.link}>📦 PO Management</Link>
                        <Link to="/analytics" style={styles.link}>Analytics</Link>
                        <Link to="/admin-panel" style={styles.link}>👨‍💼 Admin Panel</Link>
                        <Link to="/add-customer" style={styles.link}>Add Customer</Link>

                        {/* User Info and Logout Button */}
                        {user && <span style={styles.userInfo}>Welcome, {user.username}</span>}
                        <button onClick={logout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {/* You could add links for non-logged-in users here if you had a public homepage */}
                        <Link to="/login" style={styles.link}>Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
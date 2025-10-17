// client/src/pages/LoginPage.js
// The complete, working login form

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AnimatedPage from '../../components/AnimatedPage';

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
    formCard: { width: '400px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '30px', borderRadius: '15px', color: 'white' },
    title: { textAlign: 'center', marginBottom: '30px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', color: '#ccc' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em', boxSizing: 'border-box' },
    button: { width: '100%', backgroundColor: '#007bff', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', fontWeight: 'bold' }
};

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, token } = useContext(AuthContext);
    const navigate = useNavigate();

    // If the user is already logged in, redirect them away from the login page
    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            // We can use toast here for better feedback later
            alert('Please enter username and password');
            return;
        }
        await login(username, password);
    };

    return (
        <AnimatedPage>
            <div style={styles.container}>
                <div style={styles.formCard}>
                    <h2 style={styles.title}>Admin Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Username</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                style={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default LoginPage;
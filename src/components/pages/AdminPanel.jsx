// src/components/pages/AdminPanel.jsx
// ADMIN PANEL - For creating and managing users
// Only accessible to logged-in admins

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AnimatedPage from '../AnimatedPage';

const styles = {
    container: { color: 'white', minHeight: '80vh' },
    header: { marginBottom: '30px' },
    title: { color: 'white', margin: 0, fontSize: '2em' },
    section: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '25px', borderRadius: '10px', marginBottom: '30px' },
    sectionTitle: { color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.3em' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '8px', color: '#ccc', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', boxSizing: 'border-box', background: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '1em' },
    button: { backgroundColor: '#28a745', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: 'rgba(0, 123, 255, 0.8)', color: 'white', padding: '15px', textAlign: 'left', fontWeight: 'bold' },
    td: { padding: '15px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#f0f0f0' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
    changePasswordButton: { backgroundColor: '#ffc107', color: '#333', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' },
    loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: 'white', fontSize: '1.5em' }
};

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPasswordFor, setChangingPasswordFor] = useState(null);
    const [newPasswordForUser, setNewPasswordForUser] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/admin/users');
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long!');
            return;
        }

        try {
            await axios.post('/api/admin/create-user', {
                username: newUsername,
                password: newPassword
            });

            toast.success(`User '${newUsername}' created successfully!`);
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user '${username}'?`)) {
            return;
        }

        try {
            await axios.delete(`/api/admin/users/${userId}`);
            toast.success(`User '${username}' deleted successfully!`);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleChangePassword = async (userId) => {
        if (!newPasswordForUser || newPasswordForUser.length < 6) {
            toast.error('Password must be at least 6 characters long!');
            return;
        }

        try {
            await axios.put(`/api/admin/users/${userId}/change-password`, {
                newPassword: newPasswordForUser
            });
            toast.success('Password changed successfully!');
            setChangingPasswordFor(null);
            setNewPasswordForUser('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div style={styles.loadingContainer}>
                    <div>⏳ Loading admin panel...</div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>👨‍💼 Admin Panel</h1>
                </div>

                {/* Create New User Section */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>➕ Create New Admin User</h2>
                    <form onSubmit={handleCreateUser}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Username:</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    style={styles.input}
                                    required
                                    placeholder="Enter username"
                                />
                            </div>
                            <div></div>
                        </div>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password (min 6 chars):</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={styles.input}
                                    required
                                    placeholder="Enter password"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Confirm Password:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={styles.input}
                                    required
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>
                        <button type="submit" style={styles.button}>
                            ✅ Create User
                        </button>
                    </form>
                </div>

                {/* Existing Users Section */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>👥 Existing Admin Users ({users.length})</h2>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Username</th>
                                <th style={styles.th}>Created At</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td style={styles.td}>{user.username}</td>
                                    <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={styles.td}>
                                        {changingPasswordFor === user._id ? (
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="password"
                                                    placeholder="New password"
                                                    value={newPasswordForUser}
                                                    onChange={(e) => setNewPasswordForUser(e.target.value)}
                                                    style={{ ...styles.input, width: '200px', marginBottom: 0 }}
                                                />
                                                <button
                                                    onClick={() => handleChangePassword(user._id)}
                                                    style={styles.button}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setChangingPasswordFor(null);
                                                        setNewPasswordForUser('');
                                                    }}
                                                    style={styles.deleteButton}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setChangingPasswordFor(user._id)}
                                                    style={styles.changePasswordButton}
                                                >
                                                    🔑 Change Password
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.username)}
                                                    style={styles.deleteButton}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default AdminPanel;

// client/src/context/AuthContext.jsx
// A MUCH SIMPLER, MORE DIRECT VERSION

import React, { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// Validation: Check if API_URL is set
if (!API_URL) {
    console.error('VITE_API_URL is not set! Please check your .env file.');
    throw new Error('API URL is not configured. Please set VITE_API_URL in your .env file.');
}

console.log('API URL configured as:', API_URL);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // If a token was found in storage, set the header immediately on app load
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const login = async (username, password) => {
        try {
            console.log('Attempting login to:', `${API_URL}/api/users/login`);
            const { data } = await axios.post(`${API_URL}/api/users/login`, { username, password });

            // 1. Save token to localStorage
            localStorage.setItem('token', data.token);
            // 2. Set the axios header DIRECTLY
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            // 3. Update the state
            setToken(data.token);
            setUser({ username: data.username, _id: data._id });

            toast.success('Login successful!');
            navigate('/'); // Navigate to dashboard
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                // Server responded with error
                console.error('Error response:', error.response.data);
                toast.error(error.response.data?.message || 'Login failed. Please try again.');
            } else if (error.request) {
                // Request was made but no response
                console.error('No response received:', error.request);
                toast.error('Cannot connect to server. Please check your connection.');
            } else {
                // Something else happened
                console.error('Error message:', error.message);
                toast.error('An unexpected error occurred.');
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        navigate('/login');
        toast.info('You have been logged out.');
    };

    const value = { token, user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
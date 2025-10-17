// client/src/context/AnalyticsContext.js
// NEW FILE

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// 1. Create the context
const AnalyticsContext = createContext();

// 2. Create a custom hook for easy access to the context
export const useAnalytics = () => {
    return useContext(AnalyticsContext);
};

// 3. Create the Provider component
export const AnalyticsProvider = ({ children }) => {
    const [summary, setSummary] = useState({ pendingTotal: 0, fulfilledTotal: 0, dispatchedTotal: 0 });

    // We use useCallback to prevent this function from being recreated on every render
    const fetchSummary = useCallback(() => {
        axios.get(`${API_URL}/api/analytics/ppo-summary`)
            .then(response => setSummary(response.data))
            .catch(error => console.error('Error fetching analytics:', error));
    }, []);

    // Fetch the summary when the provider first mounts
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // The value that will be available to all children components
    const value = {
        summary,
        fetchSummary, // We provide the function so other components can trigger a refresh
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};
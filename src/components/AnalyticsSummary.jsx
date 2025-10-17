// client/src/components/AnalyticsSummary.js
// REVISED

import React from 'react';
import { useAnalytics } from '../context/AnalyticsContext';

const styles = {
    summaryBox: { display: 'flex', justifyContent: 'space-around', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' },
    stat: { textAlign: 'center' },
    statValue: { fontSize: '2em', fontWeight: 'bold', margin: '0' },
    statLabel: { fontSize: '1em', color: '#555', margin: '0' }
};

const AnalyticsSummary = () => {
    const { summary } = useAnalytics();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value || 0);
    };

    return (
        <div style={styles.summaryBox}>
            <div style={styles.stat}>
                <p style={{...styles.statValue, color: '#17a2b8'}}>{formatCurrency(summary.dispatchedTotal)}</p>
                <p style={styles.statLabel}>Total Dispatched Value</p>
            </div>
            <div style={styles.stat}>
                <p style={{...styles.statValue, color: '#ffc107'}}>{formatCurrency(summary.pendingTotal)}</p>
                <p style={styles.statLabel}>Total Pending Value</p>
            </div>
        </div>
    );
};

export default AnalyticsSummary;
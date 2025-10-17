// client/src/App.jsx
// SIMPLIFIED ROUTING

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Layout from './components/pages/Layout';
import DashboardPage from './components/pages/DashboardPage';
import AddCustomerPage from './components/pages/AddCustomerPage';
import CustomerDetailPage from './components/pages/CustomerDetailPage';
import AnalyticsPage from './components/pages/AnalyticsPage';
import POManagementPage from './components/pages/POManagementPage';
import LoginPage from "./components/pages/LoginPage.jsx";
import AdminPanel from "./components/pages/AdminPanel.jsx";

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }
};

const AnimatedBackground = () => (
    <div className="background-container">
        {[...Array(6)].map((_, i) => <div key={i} className="background-span"></div>)}
    </div>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <AnalyticsProvider>
                    <AnimatedBackground />
                    <ToastContainer position="top-right" theme="dark" />
                    <div style={styles.container}>
                        <Routes>
                            {/* All routes are now nested under the Layout for a consistent Navbar */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<DashboardPage />} />
                                <Route path="analytics" element={<AnalyticsPage />} />
                                <Route path="po-management" element={<POManagementPage />} />
                                <Route path="admin-panel" element={<AdminPanel />} />
                                <Route path="add-customer" element={<AddCustomerPage />} />
                                <Route path="customer/:id" element={<CustomerDetailPage />} />
                                <Route path="login" element={<LoginPage />} />
                            </Route>
                        </Routes>
                    </div>
                </AnalyticsProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
// client/src/components/PrivateRoute.jsx
// SIMPLIFIED VERSION - REMOVED LOADING LOGIC

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const PrivateRoute = () => {
    // We only need the token now. The 'loading' state is gone.
    const { token } = useContext(AuthContext);

    // The logic is now direct:
    // If a token exists, show the requested page (the Outlet).
    // If not, redirect to the login page.
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
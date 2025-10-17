import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Adjust path if needed

const Layout = () => {
    return (
        <div>
            <Navbar />
            <main style={{ paddingTop: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
};
export default Layout;
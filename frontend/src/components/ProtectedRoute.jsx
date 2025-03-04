import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user')); // Check user in localStorage

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    // Render the protected content if authenticated
    return children;
};

export default ProtectedRoute;

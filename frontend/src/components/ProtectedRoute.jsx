import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => { 
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/admin/check');
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        setIsAuthenticated(false); // Not authenticated
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Loader or waiting for authentication check
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

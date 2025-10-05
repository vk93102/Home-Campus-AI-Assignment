import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import Auth from '../components/Auth';
import Dashboard from '../components/Dashboard';
import { getAuthToken } from '../lib/api';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate initial loading and check authentication
    const timer = setTimeout(() => {
      const token = getAuthToken();
      setIsAuthenticated(!!token);
      setLoading(false);
    }, 2500); // Show loader for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default Index;

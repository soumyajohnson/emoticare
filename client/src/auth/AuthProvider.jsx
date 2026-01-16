import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for global 401 events from api interceptor
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      // Store token in session storage (clears on tab close)
      sessionStorage.setItem('access_token', access_token);
      
      // Fetch user details immediately to populate state
      // We could decode the JWT, but fetching /me is robust
      // For now, let's just set isAuthenticated true and maybe fetch /me next or assume success
      // Let's fetch /me to be sure
      setIsAuthenticated(true);
      
      // Optimistic user set if backend doesn't return full user on login
      // but usually we want to call /me
      const meRes = await api.get('/auth/me');
      setUser(meRes.data);
      
      return { success: true };
    } catch (error) {
      console.error("Login error", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Login failed. Please check your credentials." 
      };
    }
  };

  const register = async (email, password) => {
    try {
      await api.post('/auth/register', { email, password });
      return { success: true };
    } catch (error) {
      console.error("Register error", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Registration failed. Please try again." 
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    // Optional: Call backend logout if needed
    // api.post('/auth/logout').catch(() => {});
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

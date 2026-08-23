import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recover session from localStorage on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem('aura_token');
    const savedUser = localStorage.getItem('aura_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const setSession = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    localStorage.setItem('aura_token', userToken);
    localStorage.setItem('aura_user', JSON.stringify(userData));
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: userToken, ...userData } = res.data;
      
      setSession(userData, userToken);
      return { success: true };
    } catch (error) {
      if (error.response?.data?.requireOtp) {
        return {
          success: false,
          requireOtp: true,
          email: error.response.data.email,
          message: error.response.data.message
        };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please verify credentials.' 
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/admin/login`, { email, password });
      const { token: adminToken, ...adminData } = res.data;
      
      setSession(adminData, adminToken);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Admin access denied. Non-admin credentials.' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
      if (res.data.requireOtp) {
        return {
          success: true,
          requireOtp: true,
          email: res.data.email,
          message: res.data.message
        };
      }
      const { token: userToken, ...userData } = res.data;
      setSession(userData, userToken);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        adminLogin,
        register,
        setSession,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

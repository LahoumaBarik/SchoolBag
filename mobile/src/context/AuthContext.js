import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use laptop's IP address on hotspot network
  const API_BASE_URL = 'http://172.20.10.2:5000/api';

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
        setToken(savedToken);
        // Verify token with backend
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          timeout: 10000, // 10 second timeout
        });
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      // Clear invalid token
      try {
        await AsyncStorage.removeItem('token');
      } catch (storageError) {
        console.log('Storage cleanup error:', storageError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      const { token: newToken, user: userData } = response.data.data;
      
      // Validate token before storing
      if (newToken && typeof newToken === 'string') {
        await AsyncStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.log('Login error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      console.log('Attempting registration to:', API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: `${firstName} ${lastName}`,
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      const { token: newToken, user: userData } = response.data.data;
      
      // Validate token before storing
      if (newToken && typeof newToken === 'string') {
        await AsyncStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true };
      } else {
        throw new Error('Invalid token received from server');
      }
    } catch (error) {
      console.log('Registration error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.log('Logout storage error:', error.message);
    }
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    API_BASE_URL,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
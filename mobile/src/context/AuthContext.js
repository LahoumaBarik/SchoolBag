import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // *******************************************************************
  // IMPORTANT: Replace this with your ngrok URL when using tunnel mode
  // When testing on physical device, use your network IP or ngrok URL
  // Example: const API_BASE_URL = 'https://random-string.ngrok-free.app/api';
  const API_BASE_URL = 'https://5986edb92d84.ngrok-free.app/api';

  useEffect(() => {
    // Check for a saved token when the app starts
    loadTokenFromStorage();
  }, []);

  const loadTokenFromStorage = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('userToken');
      if (savedToken) {
        setToken(savedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        // Optionally, you can validate the token with the backend here
        // For now, we'll just set isAuthenticated to true
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load token from storage', error);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      }, {
        timeout: 10000, // 10 second timeout
      });

      const { token, user } = response.data.data;

      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Save the token securely
      await SecureStore.setItemAsync('userToken', token);

      return { success: true, user };
    } catch (error) {
      console.log('Login error:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  // Logout user
  const logout = async () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    
    // Remove the token from secure storage
    await SecureStore.deleteItemAsync('userToken');
  };

  // Biometric Login
  const loginWithBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return { success: false, error: 'Biometrics not available on this device.' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with Face ID',
      });

      if (result.success) {
        setLoading(true);
        const savedToken = await SecureStore.getItemAsync('userToken');

        if (savedToken) {
          // Token exists, now verify it and get user data
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          const userData = response.data.data.user;
          setUser(userData);
          setToken(savedToken);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, error: 'No saved credentials found. Please log in normally first.' };
        }
      }
      return { success: false, error: 'Biometric authentication failed or was canceled.' };
    } catch (error) {
      setLoading(false);
      console.log('Biometric login error:', error);
      return { success: false, error: 'An error occurred during biometric login.' };
    }
  };


  const register = async (firstName, lastName, email, password) => {
    try {
      console.log('Attempting registration to:', API_BASE_URL);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: `${firstName} ${lastName}`,
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data.data;
      
      if (newToken && typeof newToken === 'string') {
        await SecureStore.setItemAsync('userToken', newToken);
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
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


  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    loginWithBiometrics, // Expose the new function
    API_BASE_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
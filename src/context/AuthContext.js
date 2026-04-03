import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/login/', { username, password });
      setUserToken(response.data.access);
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
    } catch (e) {
      console.error('Login error', e);
      throw e;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('auth/register/', userData);
      // Automatically log in after registration
      await login(userData.username, userData.password);
    } catch (e) {
      console.error('Registration error', e);
      throw e;
    }
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  };

  const isLoggedIn = async () => {
    try {
      let token = await AsyncStorage.getItem('access_token');
      setUserToken(token);
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

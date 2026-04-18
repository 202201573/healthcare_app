import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setLogoutHandler } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username, password) => {
    try {
      // 1. Fetch user database from device storage
      const usersStr = await AsyncStorage.getItem('app_users_db');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // 2. Find a user matching both username and password
      const validUser = users.find(u => u.username === username && u.password === password);
      
      if (!validUser) {
        throw new Error('Invalid username or password.');
      }

      // 3. Issue pseudo token
      const dummyToken = 'mock_access_token_' + new Date().getTime();
      setUserToken(dummyToken);
      await AsyncStorage.setItem('access_token', dummyToken);
      await AsyncStorage.setItem('refresh_token', 'mock_refresh_token_123');
      await AsyncStorage.setItem('current_username', username);
    } catch (e) {
      console.error('Login error', e.message);
      throw e;
    }
  };

  const register = async (userData) => {
    try {
      // 1. Fetch user database
      const usersStr = await AsyncStorage.getItem('app_users_db');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // 2. Prevent duplicate usernames
      const exists = users.find(u => u.username === userData.username);
      if (exists) {
        throw new Error('This username is already taken!');
      }
      
      // 3. Add to database
      users.push(userData);
      await AsyncStorage.setItem('app_users_db', JSON.stringify(users));
      
      // 4. Log them in automatically
      await login(userData.username, userData.password);
    } catch (e) {
      console.error('Registration error', e.message);
      throw e;
    }
  };

  const logout = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('current_username');
  };

  const isLoggedIn = async () => {
    try {
      let token = await AsyncStorage.getItem('access_token');
      let currentUsername = await AsyncStorage.getItem('current_username');
      
      // Strict rule: if they have a token but no username mapping, their session is corrupted from an older version of the app. Break it.
      if (token && currentUsername) {
        setUserToken(token);
      } else {
        setUserToken(null);
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('current_username');
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    }
  };

  useEffect(() => {
    isLoggedIn();
    setLogoutHandler(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost is fine
const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8001/api/'
  : Platform.OS === 'web' ? 'http://localhost:8001/api/' : 'http://192.168.1.10:8001/api/';
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000/api/'
  : Platform.OS === 'web' ? 'http://localhost:8000/api/' : 'http://192.168.1.10:8000/api/';
const api = axios.create({
  baseURL: API_URL,
});

let logoutHandler = () => { };

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default api;

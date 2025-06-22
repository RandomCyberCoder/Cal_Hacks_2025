import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.40.54.244:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('authToken');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (userName: string, password: string) => {
    const response = await api.post('/auth/login', { userName, password });
    return response.data;
  },
  
  register: async (userName: string, password: string) => {
    const response = await api.post('/auth/register', { userName, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const contactsAPI = {
  getContacts: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },
  
  addContact: async (contact: { name: string; phoneNumber: string; email?: string; avatar?: string }) => {
    const response = await api.post('/contacts', contact);
    return response.data;
  },
  
  updateContact: async (contactId: string, contact: { name: string; phoneNumber: string; email?: string; avatar?: string }) => {
    const response = await api.put(`/contacts/${contactId}`, contact);
    return response.data;
  },
  
  deleteContact: async (contactId: string) => {
    const response = await api.delete(`/contacts/${contactId}`);
    return response.data;
  },
};

export default api; 
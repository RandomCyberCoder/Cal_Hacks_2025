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

export const vapiAPI = {
  makeCall: async (
    phoneNumber?: string, 
    callType: 'general' | 'contact' | 'emergency' = 'general',
    location?: { latitude: number; longitude: number; address?: string },
    contactName?: string
  ) => {
    const requestData: any = {};
    
    if (phoneNumber) requestData.phoneNumber = phoneNumber;
    if (callType) requestData.callType = callType;
    if (location) requestData.location = location;
    if (contactName) requestData.contactName = contactName;
    
    console.log('=== FRONTEND API CALL ===');
    console.log('Parameters received:', { phoneNumber, callType, location, contactName });
    console.log('Request data being sent:', requestData);
    
    const response = await api.post('/make-call', requestData);
    
    console.log('=== FRONTEND API RESPONSE ===');
    console.log('Response received:', response.data);
    
    return response.data;
  },
};

export const logsAPI = {
  getLogs: async () => {
    const response = await api.get('/logs');
    return response.data;
  },
  
  addLog: async (log: { timestamp: string; Note: string; location: { coordinates: [number, number] } }) => {
    const response = await api.post('/logs/new', log);
    return response.data;
  },
};

export default api; 
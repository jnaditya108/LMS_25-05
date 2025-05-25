// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5121/api', // Change if your backend URL is different
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
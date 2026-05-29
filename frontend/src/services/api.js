import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (can be extended for JWT token storage/session headers if needed)
api.interceptors.request.use(
  (config) => {
    // If you ever need to pass a token:
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data;
  },
};

export const bookingService = {
  getBookings: async () => {
    const response = await api.get('/api/admin/bookings');
    return response.data;
  },
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.put(`/api/admin/bookings/${bookingId}`, { status });
    return response.data;
  },
};

export const stylistService = {
  getStylists: async () => {
    const response = await api.get('/api/stylists');
    return response.data;
  },
};

export default api;

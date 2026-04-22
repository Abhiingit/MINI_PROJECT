import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mini-project-bru3.onrender.com',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Notice the space after Bearer
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

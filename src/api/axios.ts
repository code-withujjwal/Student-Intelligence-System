import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

// Base Axios instance configuration
const axiosInstance = axios.create({
  baseURL: window.location.hostname !== 'localhost' ? 'https://student-intelligence-system.onrender.com/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8082/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Global Errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Phase 9: Support standard ApiResponse wrapper { success, message, data, errorCode }
    // We seamlessly extract the `data` if it exists and success is true
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (!response.data.success) {
        toast.error(response.data.message || 'Action failed');
        return Promise.reject(new Error(response.data.message));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Refresh Token Flow
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh?refreshToken=${refreshToken}`);
          const newToken = res.data.data.token;
          const newRefresh = res.data.data.refreshToken;
          
          localStorage.setItem('jwt_token', newToken);
          localStorage.setItem('refresh_token', newRefresh);
          
          axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers.Authorization = 'Bearer ' + newToken;
          
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().logout();
          toast.error('Session expired. Please log in again.');
          window.location.href = '/auth';
        } finally {
          isRefreshing = false;
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/auth';
      }
    }

    // Global Error Toasts for 400, 403, 500, etc. (not 401 which is handled above)
    if (error.response && error.response.status !== 401) {
      const serverMessage = error.response.data?.message || error.message;
      // Don't show toast for 403 on auth pages
      if (error.response.status !== 403 || !window.location.pathname.includes('/auth')) {
        toast.error(serverMessage);
      }
    } else if (error.request && !error.response) {
      toast.error('Network error. Backend might be offline.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

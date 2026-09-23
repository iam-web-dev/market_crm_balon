import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://apibcrm.nsdcorporation.uz';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get tokens
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// Add a request interceptor to include the access token in headers
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Show success message for mutations (POST, PUT, PATCH, DELETE) if needed
    // Usually handled at the component/hook level for more control
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    // If the error is 401 and not already retried (skip auth endpoints to avoid loops)
    const isAuthEndpoint = originalRequest.url.includes('/api/auth/login/') || originalRequest.url.includes('/api/auth/logout/') || originalRequest.url.includes('/api/auth/refresh/');
    if (response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();
        if (!refresh) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh/`, {
          refresh: refresh,
        });

        const { access, refresh: newRefresh } = refreshResponse.data;
        localStorage.setItem('access_token', access);
        if (newRefresh) {
          localStorage.setItem('refresh_token', newRefresh);
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Only redirect if not already on login page to avoid loops
        if (!window.location.pathname.includes('/login')) {
          toast.error('Seans muddati tugadi. Iltimos, qaytadan kiring.');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Professional Error Handling
    const errorMessage = response?.data?.detail ||
      response?.data?.message ||
      (response?.data && typeof response.data === 'object' ? Object.values(response.data).flat()[0] : null) ||
      'Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';

    // Don't show toast for 401/403 (handled above) or 5xx on reports (backend issue, shown in UI)
    const isReportEndpoint = originalRequest?.url?.includes('/api/reports/');
    if (response?.status !== 401 && response?.status !== 403 && !(response?.status >= 500 && isReportEndpoint)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;

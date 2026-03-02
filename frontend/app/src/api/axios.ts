import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // send cookies (refresh token) to backend when present
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      try {
        console.debug('[api] Request', (config.method || '').toUpperCase(), config.url, {
          headers: config.headers,
          params: config.params,
          data: config.data,
        });
      } catch (e) {
        /* ignore */
      }
    }
    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) console.error('[api] Request error', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (import.meta.env.DEV && error.response) {
      try {
        console.debug('[api] Response error', error.response.status, error.config?.url, error.response.data);
      } catch (e) { }
    }
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string };

      switch (status) {
        case 401: {
          // Skip redirect for auth endpoints – the caller handles these errors.
          // Without this guard, a 401 from /login/refresh triggers
          // window.location.href = '/login' which full-reloads the page,
          // which calls checkAuth() again → infinite loop.
          const requestUrl = error.config?.url || '';
          const isAuthEndpoint =
            requestUrl.includes('/login/refresh') ||
            requestUrl.includes('/login/logout');

          if (!isAuthEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;
        }
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error(data?.message || 'Resource not found.');
          break;
        case 422:
          toast.error(data?.message || 'Validation failed. Please check your input.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      if (import.meta.env.DEV) console.warn('[api] Network error', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      if (import.meta.env.DEV) console.error('[api] Unexpected error', error.message);
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

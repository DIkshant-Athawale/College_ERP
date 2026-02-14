import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { LoginResponse, RefreshTokenResponse } from '@/types';

// Base URL for API - change this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending/receiving cookies (refresh token)
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Get access token from localStorage
const getAccessToken = (): string | null => {
  const stored = localStorage.getItem('erp_auth_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.accessToken || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Update access token in localStorage
const updateAccessToken = (token: string) => {
  const stored = localStorage.getItem('erp_auth_data');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      parsed.accessToken = token;
      localStorage.setItem('erp_auth_data', JSON.stringify(parsed));
    } catch {
      console.error('Failed to update access token');
    }
  }
};

// Request interceptor - add Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    // Start refreshing
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh token endpoint
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/login/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken } = response.data;
      updateAccessToken(accessToken);
      onTokenRefreshed(accessToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear auth data and redirect to login
      localStorage.removeItem('erp_auth_data');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Auth API functions
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/login/logout');
  },

  refreshToken: async (): Promise<string> => {
    const response = await api.post<RefreshTokenResponse>('/login/refresh');
    return response.data.accessToken;
  },
};

// Student API functions
export const studentApi = {
  getDashboard: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },
};

// Admin API functions
export const adminApi = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

// Teacher API functions
export const teacherApi = {
  getDashboard: async () => {
    const response = await api.get('/teacher/dashboard');
    return response.data;
  },
};

export default api;

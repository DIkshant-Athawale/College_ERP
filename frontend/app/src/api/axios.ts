import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

// ─── Silent Refresh State ───────────────────────────────────────────
// When multiple requests 401 at once, we only want ONE refresh call.
// All others queue up and retry once the single refresh resolves.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ────────────────────────────────────────────
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

// ─── Response Interceptor with Silent Refresh ───────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (import.meta.env.DEV && error.response) {
      try {
        console.debug('[api] Response error', error.response.status, error.config?.url, error.response.data);
      } catch (e) { }
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string };
      const requestUrl = originalRequest?.url || '';

      // ── 401 Handling with Silent Refresh ──
      if (status === 401) {
        // Skip refresh for auth endpoints to avoid infinite loops
        const isAuthEndpoint =
          requestUrl.includes('/login/refresh') ||
          requestUrl.includes('/login/logout') ||
          requestUrl.includes('/login');

        // If it's an auth endpoint or we already retried, just reject.
        // The caller (e.g. authApi.getCurrentUser) handles this gracefully.
        if (isAuthEndpoint || originalRequest._retry) {
          return Promise.reject(error);
        }

        // If another request is already refreshing, queue this one
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(apiClient(originalRequest));
              },
              reject: (err: unknown) => {
                reject(err);
              },
            });
          });
        }

        // Mark that we're refreshing
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt silent refresh using the httpOnly cookie
          const refreshResponse = await axios.post(
            `/login/refresh`,
            {},
            { withCredentials: true }
          );

          const newToken: string = refreshResponse.data.accessToken || refreshResponse.data.token;

          if (!newToken) {
            throw new Error('No token in refresh response');
          }

          // Store the new token
          localStorage.setItem('token', newToken);

          if (import.meta.env.DEV) {
            console.debug('[api] Token silently refreshed');
          }

          // Process queued requests with the new token
          processQueue(null, newToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);

        } catch (refreshError) {
          // Refresh failed — token is truly expired or revoked
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          return Promise.reject(refreshError);

        } finally {
          isRefreshing = false;
        }
      }

      // ── Other error codes (non-401) ──
      switch (status) {
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

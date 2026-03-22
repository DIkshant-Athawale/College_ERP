import apiClient from './axios';
import type { LoginCredentials } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/login', credentials);
    // backend returns { accessToken, role, userType } and sets a refresh cookie
    const data = response.data;
    if (import.meta.env.DEV) console.debug('[auth] login response', data);
    const accessToken: string = data.accessToken || data.token;

    return {
      token: accessToken,
      role: data.role,
      userType: data.userType,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/login/logout');
  },

  // Fetch the real user profile using the access token
  fetchProfile: async () => {
    try {
      const resp = await apiClient.get('/login/me');
      if (import.meta.env.DEV) console.debug('[auth] profile response', resp.data);
      return resp.data.user || null;
    } catch (error) {
      if (import.meta.env.DEV) console.debug('[auth] fetchProfile failed', error);
      return null;
    }
  },

  // Refresh access token using the httpOnly cookie
  refreshToken: async (): Promise<{ token: string | null }> => {
    try {
      const resp = await apiClient.post('/login/refresh');
      if (import.meta.env.DEV) console.debug('[auth] refresh response', resp.data);
      const accessToken: string = resp.data.accessToken || resp.data.token;
      return { token: accessToken || null };
    } catch (error) {
      if (import.meta.env.DEV) console.debug('[auth] refresh failed', error);
      return { token: null };
    }
  },

  // Combined: try to refresh token + fetch profile (used on page load)
  getCurrentUser: async () => {
    try {
      // Step 1: Refresh the access token via cookie
      const refreshResp = await apiClient.post('/login/refresh');
      const accessToken: string = refreshResp.data.accessToken || refreshResp.data.token;

      if (!accessToken) {
        return { token: null, user: null };
      }

      // Store new token so the next request uses it
      localStorage.setItem('token', accessToken);

      // Step 2: Fetch real profile from /login/me
      const profileResp = await apiClient.get('/login/me');
      const user = profileResp.data.user || null;

      return { token: accessToken, user };
    } catch (error) {
      if (import.meta.env.DEV) console.debug('[auth] getCurrentUser failed', error);
      return { token: null, user: null };
    }
  },
};

import apiClient from './axios';
import type { LoginCredentials } from '@/types';

// Decode JWT payload without extra dependency
function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decodeURIComponent(escape(json)));
    if (import.meta.env.DEV) console.debug('[auth] decoded JWT payload', parsed);
    return parsed;
  } catch (e) {
    console.error('[auth] Failed to decode JWT', e);
    return null;
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/login', credentials);
    // backend returns { accessToken, role, userType } and sets a refresh cookie
    const data = response.data;
    if (import.meta.env.DEV) console.debug('[auth] login response', data);
    const accessToken: string = data.accessToken || data.token;
    const payload = accessToken ? decodeJwt(accessToken) : null;

    const result = {
      token: accessToken,
      role: data.role || payload?.role || payload?.userType,
      user: payload
        ? {
          id: payload.userId || payload.user_id || null,
          role: payload.role || data.role,
          userType: payload.userType || data.userType,
          email: data.user?.email || payload.email || payload.sub || '',
          first_name: data.user?.first_name || payload.first_name || 'User',
          last_name: data.user?.last_name || payload.last_name || '',
        }
        : null,
    };
    if (import.meta.env.DEV) console.debug('[auth] login parsed result', result);
    return result;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/login/logout');
  },

  // Try to refresh access token using cookie; return decoded payload
  getCurrentUser: async () => {
    try {
      // The backend /refresh endpoint returns { accessToken: string }
      // It relies on the httpOnly cookie 'refreshToken'
      const resp = await apiClient.post('/login/refresh');
      if (import.meta.env.DEV) console.debug('[auth] refresh response', resp.data);

      const accessToken: string = resp.data.accessToken || resp.data.token;
      const payload = accessToken ? decodeJwt(accessToken) : null;

      const result = {
        token: accessToken,
        user: payload
          ? {
            id: payload.userId || payload.user_id || 0,
            first_name: payload.first_name || 'User',
            last_name: payload.last_name || '',
            email: payload.email || payload.sub || '',
            role: payload.role || payload.userType,
          }
          : null,
      };
      if (import.meta.env.DEV) console.debug('[auth] getCurrentUser parsed result', result);
      return result;
    } catch (error) {
      if (import.meta.env.DEV) console.debug('[auth] refresh failed', error);
      return { token: null, user: null };
    }
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/login/refresh');
    return { token: response.data.accessToken || response.data.token };
  },
};

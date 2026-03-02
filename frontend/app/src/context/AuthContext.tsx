import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import type { User, LoginCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (import.meta.env.DEV) console.debug('[authContext] checkAuth start');
    const token = localStorage.getItem('token');
    if (!token) {
      // try refresh via cookie
      try {
        const resp = await authApi.getCurrentUser();
        if (import.meta.env.DEV) console.debug('[authContext] refresh resp', resp);
        if (resp?.token) {
          localStorage.setItem('token', resp.token);
          setUser(resp.user);
          setIsLoading(false);
          return true;
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[authContext] refresh failed', e);
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return false;
    }

    // token exists locally; decode server-side by attempting refresh to validate
    try {
      const resp = await authApi.getCurrentUser();
      if (import.meta.env.DEV) console.debug('[authContext] getCurrentUser resp', resp);
      if (resp?.token) {
        localStorage.setItem('token', resp.token);
        setUser(resp.user);
        return true;
      }
      // fallback: keep existing token but minimal user
      setUser({ role: null } as any);
      return !!token;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[authContext] validate token failed', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      if (import.meta.env.DEV) console.debug('[authContext] login response', response);

      // store access token and minimal user info
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      const userObj = response.user || null;
      if (userObj) {
        // ensure we persist a minimal shape
        const persisted = { ...userObj, role: (userObj as any).role || response.role || null } as any;
        localStorage.setItem('user', JSON.stringify(persisted));
        setUser(persisted as any);
      } else {
        setUser(null);
      }

      toast.success('Login successful!');

      // Redirect is handled by the Login component to avoid race conditions
      if (import.meta.env.DEV) {
        const resolvedRole = (response.user && (response.user as any).role) || response.role || (response.user && (response.user as any).userType) || null;
        console.debug('[authContext] login success, role:', resolvedRole);
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    role: user?.role || null,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole, LoginCredentials, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (data: LoginResponse) => void;
  clearAuthData: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'erp_auth_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.accessToken && parsed.user) {
            setAccessToken(parsed.accessToken);
            setUser(parsed.user);
          }
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const setAuthData = useCallback((data: LoginResponse) => {
    const userData: User = {
      id: 0, // Will be populated from profile API
      email: '', // Will be populated from profile API
      firstName: '',
      lastName: '',
      role: data.role,
      userType: data.userType,
    };
    
    setAccessToken(data.accessToken);
    setUser(userData);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: data.accessToken,
      user: userData,
    }));
  }, []);

  const clearAuthData = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    // This will be implemented with actual API call in components
    // Keeping it here for interface consistency
    console.log('Login called with:', credentials);
  }, []);

  const logout = useCallback(async () => {
    clearAuthData();
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    setAuthData,
    clearAuthData,
    hasRole,
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

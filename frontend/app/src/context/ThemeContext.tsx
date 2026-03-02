import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  gradient: string;
}

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const lightTheme: ThemeColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
};

const darkTheme: ThemeColors = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  success: '#4ade80',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#60a5fa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
  gradient: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const value: ThemeContextType = {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

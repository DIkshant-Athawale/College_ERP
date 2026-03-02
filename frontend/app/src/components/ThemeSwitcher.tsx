import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M21.64 13.2A9 9 0 1110.8 2.36 7 7 0 0021.64 13.2z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 4.5a1 1 0 011 1V8a1 1 0 11-2 0V5.5a1 1 0 011-1zm0 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm7.5-3.5a1 1 0 01-1 1H17a1 1 0 110-2h1.5a1 1 0 011 1zM6 12a1 1 0 01-1 1H3.5a1 1 0 110-2H5a1 1 0 011 1zm10.95 6.45a1 1 0 01-1.4 0l-1.06-1.06a1 1 0 111.41-1.41l1.05 1.05a1 1 0 01-.01 1.42zM7.5 7.99a1 1 0 01-1.41 0L5.03 6.54a1 1 0 111.41-1.41l1.06 1.06a1 1 0 010 1.41zM18.44 6.54a1 1 0 00-1.41-1.41l-1.06 1.06a1 1 0 101.41 1.41l1.06-1.06zM7.5 18.45a1 1 0 00-1.41 1.41l1.06 1.06a1 1 0 101.41-1.41l-1.06-1.06z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeSwitcher;

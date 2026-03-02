import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
  size = 'md',
}) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={`${sizeClasses[size]} animate-spin`}
        style={{ color: theme.primary }}
      />
      {message && (
        <p className="text-lg font-medium" style={{ color: theme.textMuted }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: `${theme.background}80` }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
};

export default LoadingSpinner;

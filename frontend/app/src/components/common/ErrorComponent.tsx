import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorComponentProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message,
  onRetry,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 rounded-xl"
      style={{ background: `${theme.danger}10` }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: `${theme.danger}20` }}
      >
        <AlertTriangle className="w-8 h-8" style={{ color: theme.danger }} />
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: theme.text }}
      >
        Something went wrong
      </h3>
      <p
        className="text-center mb-4 max-w-md"
        style={{ color: theme.textMuted }}
      >
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="rounded-lg"
          style={{ borderColor: theme.border }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorComponent;

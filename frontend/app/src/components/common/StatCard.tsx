import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  isLoading = false,
  error = null,
  onRetry,
  onClick,
}) => {
  const { theme } = useTheme();
  const cardColor = color || theme.primary;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1" style={{ background: cardColor }} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1" style={{ background: theme.danger }} />
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: theme.danger }}>
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm underline"
                style={{ color: theme.primary }}
              >
                Retry
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="h-1" style={{ background: cardColor }} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
              {title}
            </p>
            <p
              className="text-3xl font-bold"
              style={{ color: theme.text }}
            >
              {value}
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${cardColor}15` }}
          >
            <Icon className="w-6 h-6" style={{ color: cardColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;

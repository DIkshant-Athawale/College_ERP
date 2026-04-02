import { useState, useEffect, useCallback } from 'react';
import { statisticsApi } from '@/api/statistics';
import type { Statistics } from '@/types';
import { toast } from 'sonner';

export const useStatistics = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await statisticsApi.getAllStatistics();
      setStatistics(data);
    } catch (err) {
      setError('Failed to load statistics');
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refetch: fetchStatistics,
  };
};

export default useStatistics;

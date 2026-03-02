import { useState, useEffect, useCallback } from 'react';
import { departmentsApi } from '@/api/departments';
import type { Department, CreateDepartmentRequest, EditDepartmentRequest } from '@/types';
import { toast } from 'sonner';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Failed to load departments');
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const createDepartment = async (data: CreateDepartmentRequest) => {
    try {
      const result = await departmentsApi.create(data);
      toast.success(`Department created successfully! (${result.affectedRows} row(s) affected)`);
      await fetchDepartments();
      return true;
    } catch (err) {
      return false;
    }
  };

  const editDepartment = async (id: number, data: EditDepartmentRequest) => {
    try {
      await departmentsApi.edit(id, data);
      toast.success('Department updated successfully!');
      await fetchDepartments();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteDepartment = async (id: number) => {
    try {
      await departmentsApi.delete(id);
      toast.success('Department deleted successfully!');
      await fetchDepartments();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    departments,
    isLoading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    editDepartment,
    deleteDepartment,
  };
};

export default useDepartments;

import { useState, useCallback } from 'react';
import { teachersApi } from '@/api/teachers';
import type { Teacher, CreateTeacherRequest, EditTeacherRequest, BulkCreateTeachersResponse } from '@/types';
import { toast } from 'sonner';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (err) {
      setError('Failed to load teachers');
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTeachersByDepartment = useCallback(async (departmentId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await teachersApi.getByDepartment(departmentId);
      setTeachers(data);
    } catch (err) {
      setError('Failed to load teachers');
      toast.error('Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTeachers = async (data: CreateTeacherRequest[]) => {
    try {
      const result = await teachersApi.create(data);
      toast.success(`Teachers created successfully! (${result.affectedRows} row(s) affected)`);
      await fetchTeachers();
      return true;
    } catch (err) {
      return false;
    }
  };

  const bulkCreateTeachers = async (data: CreateTeacherRequest[]): Promise<BulkCreateTeachersResponse | null> => {
    try {
      const result = await teachersApi.bulkCreate(data);
      if (result.created > 0) {
        toast.success(`${result.created} teacher(s) created successfully!`);
      }
      if (result.failed_count > 0) {
        toast.warning(`${result.failed_count} teacher(s) failed to import.`);
      }
      await fetchTeachers();
      return result;
    } catch (err) {
      return null;
    }
  };

  const editTeacher = async (id: number, data: EditTeacherRequest) => {
    try {
      await teachersApi.edit(id, data);
      toast.success('Teacher updated successfully!');
      await fetchTeachers();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteTeacher = async (id: number) => {
    try {
      await teachersApi.delete(id);
      toast.success('Teacher deleted successfully!');
      await fetchTeachers();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    teachers,
    isLoading,
    error,
    fetchTeachers,
    fetchTeachersByDepartment,
    createTeachers,
    bulkCreateTeachers,
    editTeacher,
    deleteTeacher,
  };
};

export default useTeachers;


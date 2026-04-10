import { useState, useCallback } from 'react';
import { studentsApi } from '@/api/students';
import type {
  Student,
  CreateStudentRequest,
  EditStudentRequest,
  StudentFilters,
  PromoteStudentsRequest,
  DetainStudentRequest,
  BulkCreateStudentsResponse,
} from '@/types';
import { toast } from 'sonner';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilteredStudents = useCallback(async (filters: StudentFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await studentsApi.getFiltered(filters);
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStudent = async (data: CreateStudentRequest) => {
    try {
      const result = await studentsApi.create(data);
      toast.success(`Student created successfully! (${result.affectedRows} row(s) affected)`);
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  const bulkCreateStudents = async (data: CreateStudentRequest[]): Promise<BulkCreateStudentsResponse | null> => {
    try {
      const result = await studentsApi.bulkCreate(data);
      if (result.created > 0) {
        toast.success(`${result.created} student(s) created successfully!`);
      }
      if (result.failed_count > 0) {
        toast.warning(`${result.failed_count} student(s) failed to import.`);
      }
      await fetchStudents();
      return result;
    } catch (err) {
      return null;
    }
  };

  const editStudent = async (id: string | number, data: EditStudentRequest) => {
    try {
      await studentsApi.edit(id, data);
      toast.success('Student updated successfully!');
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteStudent = async (id: string | number) => {
    try {
      await studentsApi.delete(id);
      toast.success('Student deleted successfully!');
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  // Student Status Management
  const promoteStudents = async (data: PromoteStudentsRequest) => {
    try {
      const result = await studentsApi.promote(data);
      toast.success(`Students promoted successfully! (${result.affectedRows} row(s) affected)`);
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  const markDetained = async (id: string | number, data: DetainStudentRequest) => {
    try {
      await studentsApi.markDetained(id, data);
      toast.success('Student marked as detained successfully!');
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  const reEnrollStudent = async (studentId: string | number) => {
    try {
      await studentsApi.reEnroll(studentId);
      toast.success('Student re-enrolled successfully!');
      await fetchStudents();
      return true;
    } catch (err) {
      return false;
    }
  };

  const [dcStudents, setDcStudents] = useState<Student[]>([]);
  const fetchDcStudents = useCallback(async (department_id?: string | number, semester?: string | number) => {
    try {
      setIsLoading(true);
      const data = await studentsApi.getDcStudents(department_id, semester);
      setDcStudents(data);
    } catch (err) {
      toast.error('Failed to load DC students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    students,
    dcStudents,
    fetchDcStudents,
    isLoading,
    error,
    fetchStudents,
    fetchFilteredStudents,
    createStudent,
    bulkCreateStudents,
    editStudent,
    deleteStudent,
    promoteStudents,
    markDetained,
    reEnrollStudent,
  };
};

export default useStudents;

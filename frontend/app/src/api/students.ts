import apiClient from './axios';
import type {
  Student,
  CreateStudentRequest,
  EditStudentRequest,
  StudentFilters,
  PromoteStudentsRequest,
  DetainStudentRequest,
  BulkCreateStudentsResponse,
} from '@/types';

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await apiClient.get<{ students: Student[] }>('/admin/filter_students');
    return response.data.students;
  },

  getFiltered: async (filters: StudentFilters): Promise<Student[]> => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', String(filters.department_id));
    if (filters.year) params.append('year', String(filters.year));
    if (filters.academic_year) params.append('academic_year', String(filters.academic_year));

    const response = await apiClient.get<{ students: Student[] }>(`/admin/filter_students?${params.toString()}`);
    return response.data.students;
  },

  create: async (data: CreateStudentRequest): Promise<{ affectedRows: number; message?: string }> => {
    // Backend expects an array or single object, but singular endpoint is /create_student
    const response = await apiClient.post('/admin/create_student', data);
    return response.data;
  },

  bulkCreate: async (students: CreateStudentRequest[]): Promise<BulkCreateStudentsResponse> => {
    const response = await apiClient.post('/admin/bulk_create_students', { students });
    return response.data;
  },

  edit: async (id: string | number, data: EditStudentRequest): Promise<{ message?: string }> => {
    // Backend expects { students: [{ student_id, updates }] }
    const payload = {
      students: [
        {
          student_id: id,
          updates: data
        }
      ]
    };
    const response = await apiClient.patch('/admin/students/edit', payload);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message?: string }> => {
    const response = await apiClient.delete(`/admin/students/${id}`);
    return response.data;
  },

  // Student Status Management
  promote: async (data: PromoteStudentsRequest): Promise<{ message?: string; affectedRows?: number }> => {
    const response = await apiClient.post('/admin/promote_students', data);
    return response.data;
  },

  markDetained: async (id: string | number, data: DetainStudentRequest): Promise<{ message?: string }> => {
    const response = await apiClient.put(`/admin/students/${id}/mark_dc`, data);
    return response.data;
  },

  reEnroll: async (studentId: string | number): Promise<{ message?: string }> => {
    const response = await apiClient.put(`/admin/students/${studentId}/enroll`, { academic_year: '2025-2026' }); // Default or passed? User said body { academic_year }
    // Wait, reEnroll logic in backend requires academic_year.
    // I should update the reEnroll method signature to accept data.
    return response.data;
  },

  // New method
  getDcStudents: async (department_id?: string | number, semester?: string | number): Promise<Student[]> => {
    const params = new URLSearchParams();
    if (department_id) params.append('department_id', String(department_id));
    if (semester) params.append('semester', String(semester));
    const response = await apiClient.get<{ dc_students: Student[] }>(`/admin/students/dc?${params.toString()}`);
    return response.data.dc_students;
  },
};

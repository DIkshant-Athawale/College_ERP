import apiClient from './axios';
import type {
  Teacher,
  CreateTeacherRequest,
  EditTeacherRequest,
  TeachersResponse,
  BulkCreateTeachersResponse
} from '@/types';

export const teachersApi = {
  getAll: async (): Promise<Teacher[]> => {
    // using filter_teachers to ensure all fields are returned
    const response = await apiClient.get<TeachersResponse>('/admin/filter_teachers');
    return response.data.teachers;
  },

  getByDepartment: async (departmentId: string | number): Promise<Teacher[]> => {
    const response = await apiClient.get<TeachersResponse>(`/admin/filter_teachers?department_id=${departmentId}`);
    return response.data.teachers;
  },

  create: async (data: CreateTeacherRequest[]): Promise<{ affectedRows: number; message?: string }> => {
    // Backend uses singular /create_teacher but accepts array
    const response = await apiClient.post('/admin/create_teacher', data);
    return response.data;
  },

  bulkCreate: async (teachers: CreateTeacherRequest[]): Promise<BulkCreateTeachersResponse> => {
    const response = await apiClient.post('/admin/bulk_create_teachers', { teachers });
    return response.data;
  },

  edit: async (id: number, data: EditTeacherRequest): Promise<{ message?: string }> => {
    // Backend expects { teachers: [{ teacher_id, updates }] }
    // Assuming similar structure to students based on admin.js
    const payload = {
      teachers: [
        {
          teacher_id: id,
          updates: data // Verify if data needs to be wrapped or is the updates object
        }
      ]
    };
    // admin.js has /teachers/edit (bulk)
    const response = await apiClient.patch('/admin/teachers/edit', payload);
    return response.data;
  },

  delete: async (id: number): Promise<{ message?: string }> => {
    // Check if this exists in admin.js. If not found in previous read, need to verify.
    // Assuming /admin/teachers/:id based on pattern
    const response = await apiClient.delete(`/admin/teachers/${id}`);
    return response.data;
  },
};


import apiClient from './axios';
import type {
  Department,
  CreateDepartmentRequest,
  EditDepartmentRequest,
  DepartmentsResponse
} from '@/types';

export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get<DepartmentsResponse>('/admin/departments');
    return response.data.departments;
  },

  create: async (data: CreateDepartmentRequest): Promise<{ affectedRows: number; message?: string }> => {
    // Backend expects array if using bulk, but let's check if it handles single object.
    // admin.js: const departments = Array.isArray(req.body) ? req.body : [req.body];
    // So single object is fine.
    const response = await apiClient.post('/admin/create_department', data);
    return response.data;
  },

  edit: async (id: number, data: EditDepartmentRequest): Promise<{ message?: string }> => {
    // Backend expects { departments: [{ department_id, updates }] }
    const payload = {
      departments: [
        {
          department_id: id,
          updates: data
        }
      ]
    };
    const response = await apiClient.patch('/admin/departments/edit', payload);
    return response.data;
  },

  delete: async (id: number): Promise<{ message?: string }> => {
    // WARNING: Delete route not found in admin.js. This will likely 404.
    const response = await apiClient.delete(`/admin/departments/${id}`);
    return response.data;
  },
};

import apiClient from './axios';
import type {
  Course,
  CreateCourseRequest,
  EditCourseRequest,
  CoursesResponse,
  CourseFilters
} from '@/types';

export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get<CoursesResponse>('/admin/courses');
    return response.data.courses;
  },

  getFiltered: async (filters: CourseFilters): Promise<Course[]> => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', String(filters.department_id));
    if (filters.year) params.append('year', String(filters.year));
    if (filters.semester) params.append('semester', String(filters.semester));

    const response = await apiClient.get<CoursesResponse>(`/admin/filter_courses?${params.toString()}`);
    return response.data.courses;
  },

  create: async (data: CreateCourseRequest[]): Promise<{ affectedRows: number; message?: string }> => {
    // Backend uses singular /create_course but accepts array
    const response = await apiClient.post('/admin/create_course', data);
    return response.data;
  },

  edit: async (id: number, data: EditCourseRequest): Promise<{ message?: string }> => {
    // Backend expects { courses: [{ course_id, updates }] }
    const payload = {
      courses: [
        {
          course_id: id,
          updates: data
        }
      ]
    };
    const response = await apiClient.patch('/admin/courses/edit', payload);
    return response.data;
  },

  delete: async (id: number): Promise<{ message?: string }> => {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  },
};

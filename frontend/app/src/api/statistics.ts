import apiClient from './axios';
import type { Statistics } from '@/types';

export const statisticsApi = {
  getTotalDepartments: async (): Promise<{ total_departments: number }> => {
    const response = await apiClient.get('/admin/departments/total');
    return response.data;
  },

  getTotalTeachers: async (): Promise<{ total_teachers: number }> => {
    const response = await apiClient.get('/admin/teachers/total');
    // Backend returns { total_faculty: number }
    return { total_teachers: (response.data as any).total_faculty || 0 };
  },

  getTotalStudents: async (): Promise<{ total_students: number }> => {
    const response = await apiClient.get('/admin/students/total/enrolled');
    return response.data;
  },

  getTotalCourses: async (): Promise<{ total_courses: number }> => {
    const response = await apiClient.get('/admin/courses/total');
    return response.data;
  },

  getAllStatistics: async (): Promise<Statistics> => {
    const [departments, teachers, students, courses] = await Promise.all([
      statisticsApi.getTotalDepartments(),
      statisticsApi.getTotalTeachers(),
      statisticsApi.getTotalStudents(),
      statisticsApi.getTotalCourses(),
    ]);

    return {
      total_departments: departments.total_departments,
      total_teachers: teachers.total_teachers,
      total_students: students.total_students,
      total_courses: courses.total_courses,
    };
  },
};

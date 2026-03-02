import apiClient from './axios';
import type { StudentDashboardData } from '@/types';

export const studentApi = {
    getDashboard: async (): Promise<StudentDashboardData> => {
        const response = await apiClient.get<StudentDashboardData>('/student/dashboard');
        // Ensure notices is an array if missing from backend
        if (!response.data.notices) {
            response.data.notices = [];
        }
        return response.data;
    },
};

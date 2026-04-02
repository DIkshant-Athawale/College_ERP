import apiClient from './axios';
import type { Notice, CreateNoticeRequest } from '@/types';

export const noticesApi = {
    // Student: get recent notices
    getStudentNotices: async (): Promise<{ notices: Notice[] }> => {
        const response = await apiClient.get<{ notices: Notice[] }>('/student/notices/recent');
        return response.data;
    },

    // Faculty: get recent notices
    getFacultyNotices: async (): Promise<{ notices: Notice[] }> => {
        const response = await apiClient.get<{ notices: Notice[] }>('/teacher/notices/recent');
        return response.data;
    },

    // Admin: get recent notices
    getAdminNotices: async (): Promise<{ notices: Notice[] }> => {
        const response = await apiClient.get<{ notices: Notice[] }>('/admin/notices/recent');
        return response.data;
    },

    // Admin: post a new notice (with targeting)
    createAdminNotice: async (data: CreateNoticeRequest): Promise<{ message: string; notice_id: number }> => {
        const response = await apiClient.post<{ message: string; notice_id: number }>('/admin/notices', data);
        return response.data;
    },

    // Faculty: post a new notice (with targeting)
    createFacultyNotice: async (data: CreateNoticeRequest): Promise<{ message: string; notice_id: number }> => {
        const response = await apiClient.post<{ message: string; notice_id: number }>('/teacher/notices', data);
        return response.data;
    },
};

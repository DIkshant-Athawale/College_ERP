import apiClient from './axios';
import { type EssentialLink } from '@/types';
export type { EssentialLink };

export const linksApi = {
    // Get all essential links (Admin)
    getLinks: async () => {
        const response = await apiClient.get<{ links: EssentialLink[] }>('/admin/essential_links');
        return response.data;
    },

    // Add a new essential link (Admin only)
    addLink: async (data: { title: string; url: string }) => {
        const response = await apiClient.post<{ message: string; link_id: number }>(
            '/admin/essential_links',
            data
        );
        return response.data;
    },

    // Delete an essential link (Admin only)
    deleteLink: async (id: number) => {
        const response = await apiClient.delete<{ message: string }>(`/admin/essential_links/${id}`);
        return response.data;
    }
};

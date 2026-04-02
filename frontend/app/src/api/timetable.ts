import apiClient from './axios';
import type {
  TimetableSlot,
  TimeSlot,
  CreateTimetableRequest,
  EditTimetableSlotRequest,
  TimetableResponse,
  TimetableFilters
} from '@/types';

export const timetableApi = {
  getFiltered: async (filters: TimetableFilters): Promise<TimetableSlot[]> => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', String(filters.department_id));
    if (filters.semester) params.append('semester', String(filters.semester));

    const response = await apiClient.get<TimetableResponse>(`/admin/timetable?${params.toString()}`);
    return response.data.timetable;
  },

  create: async (data: CreateTimetableRequest): Promise<{ message?: string; affectedRows?: number }> => {
    const response = await apiClient.post('/admin/timetable', data);
    return response.data;
  },

  editSlot: async (data: EditTimetableSlotRequest): Promise<{ message?: string }> => {
    const { timetable_id, ...payload } = data;
    const response = await apiClient.put(`/admin/timetable/${timetable_id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<{ message?: string }> => {
    const response = await apiClient.delete(`/admin/timetable/${id}`);
    return response.data;
  },

  // Time Slots Management
  getTimeSlots: async (): Promise<TimeSlot[]> => {
    const response = await apiClient.get<{ slots: TimeSlot[] }>('/admin/time_slots');
    return response.data.slots;
  },

  createTimeSlot: async (data: { start_time: string; end_time: string }): Promise<{ message?: string }> => {
    const response = await apiClient.post('/admin/time_slots', data);
    return response.data;
  },

  updateTimeSlot: async (slotId: number | string, data: { start_time: string; end_time: string }): Promise<{ message?: string }> => {
    const response = await apiClient.patch(`/admin/time_slots/${slotId}`, data);
    return response.data;
  },

  deleteTimeSlot: async (slotId: number | string): Promise<{ message?: string }> => {
    const response = await apiClient.delete(`/admin/time_slots/${slotId}`);
    return response.data;
  },
};

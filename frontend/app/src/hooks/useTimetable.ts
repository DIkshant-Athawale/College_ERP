import { useState, useCallback } from 'react';
import { timetableApi } from '@/api/timetable';
import type {
  TimetableSlot,
  TimeSlot,
  CreateTimetableRequest,
  EditTimetableSlotRequest,
  TimetableFilters
} from '@/types';
import { toast } from 'sonner';

export const useTimetable = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async (filters: TimetableFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await timetableApi.getFiltered(filters);
      setTimetable(data);
    } catch (err) {
      setError('Failed to load timetable');
      toast.error('Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await timetableApi.getTimeSlots();
      setTimeSlots(data);
    } catch (err) {
      toast.error('Failed to load time slots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTimeSlot = async (data: { start_time: string; end_time: string }) => {
    try {
      await timetableApi.createTimeSlot(data);
      toast.success('Time slot created successfully!');
      await fetchTimeSlots();
      return true;
    } catch (err) {
      return false;
    }
  };

  const updateTimeSlot = async (slotId: number | string, data: { start_time: string; end_time: string }) => {
    try {
      await timetableApi.updateTimeSlot(slotId, data);
      toast.success('Time slot updated successfully!');
      await fetchTimeSlots();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteTimeSlot = async (slotId: number | string) => {
    try {
      await timetableApi.deleteTimeSlot(slotId);
      toast.success('Time slot deleted successfully!');
      await fetchTimeSlots();
      return true;
    } catch (err) {
      return false;
    }
  };

  const createTimetableSlot = async (data: CreateTimetableRequest) => {
    try {
      await timetableApi.create(data);
      toast.success('Timetable slot created successfully!');
      return true;
    } catch (err) {
      return false;
    }
  };

  const editTimetableSlot = async (data: EditTimetableSlotRequest) => {
    try {
      await timetableApi.editSlot(data);
      toast.success('Timetable slot updated successfully!');
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteTimetableSlot = async (id: number) => {
    try {
      await timetableApi.delete(id);
      toast.success('Timetable slot deleted successfully!');
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    timetable,
    timeSlots,
    isLoading,
    error,
    fetchTimetable,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    createTimetableSlot,
    editTimetableSlot,
    deleteTimetableSlot,
  };
};

export default useTimetable;

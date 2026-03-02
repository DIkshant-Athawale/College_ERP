import { useState, useCallback } from 'react';
import { coursesApi } from '@/api/courses';
import type { Course, CreateCourseRequest, EditCourseRequest, CourseFilters } from '@/types';
import { toast } from 'sonner';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await coursesApi.getAll();
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilteredCourses = useCallback(async (filters: CourseFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await coursesApi.getFiltered(filters);
      setCourses(data);
    } catch (err) {
      setError('Failed to load courses');
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourses = async (data: CreateCourseRequest[]) => {
    try {
      const result = await coursesApi.create(data);
      toast.success(`Courses created successfully! (${result.affectedRows} row(s) affected)`);
      await fetchCourses();
      return true;
    } catch (err) {
      return false;
    }
  };

  const editCourse = async (id: number, data: EditCourseRequest) => {
    try {
      await coursesApi.edit(id, data);
      toast.success('Course updated successfully!');
      await fetchCourses();
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      await coursesApi.delete(id);
      toast.success('Course deleted successfully!');
      await fetchCourses();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    fetchFilteredCourses,
    createCourses,
    editCourse,
    deleteCourse,
  };
};

export default useCourses;

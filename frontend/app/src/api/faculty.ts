import apiClient from './axios';
import type {
    FacultyDashboardData,
    Course,
    FacultyStudent,
    SubmitAttendanceRequest,
    CreateSessionResponse,
    SessionStudentsResponse
} from '@/types';

export const facultyApi = {
    getDashboard: async (): Promise<FacultyDashboardData> => {
        const response = await apiClient.get<FacultyDashboardData>('/teacher/dashboard');
        return response.data;
    },

    getMyCourses: async (): Promise<{ courses: Course[] }> => {
        const response = await apiClient.get<{ courses: Course[] }>('/teacher/attendance/my-courses');
        return response.data;
    },

    getAttendanceSummary: async (): Promise<{ courses: Course[] }> => {
        const response = await apiClient.get<{ courses: Course[] }>('/teacher/courses/attendance-summary');
        return response.data;
    },

    getEntireTimetable: async (): Promise<{ timetable: any[] }> => {
        const response = await apiClient.get<{ timetable: any[] }>('/teacher/entire_timetable');
        return response.data;
    },

    getCourseAttendance: async (courseId: string): Promise<{
        course_id: string;
        academic_year: string;
        total_sessions: number;
        students: FacultyStudent[];
    }> => {
        const response = await apiClient.get<{
            course_id: string;
            academic_year: string;
            total_sessions: number;
            students: FacultyStudent[];
        }>(`/teacher/courses/${courseId}/attendance`);
        return response.data;
    },

    createSession: async (courseId: number, date: string): Promise<CreateSessionResponse> => {
        const response = await apiClient.post<CreateSessionResponse>('/teacher/attendance/session', {
            course_id: courseId,
            session_date: date,
        });
        return response.data;
    },

    getSessionStudents: async (sessionId: number): Promise<SessionStudentsResponse> => {
        const response = await apiClient.get<SessionStudentsResponse>(`/teacher/attendance/session/${sessionId}/students`);
        return response.data;
    },

    submitAttendance: async (data: SubmitAttendanceRequest): Promise<void> => {
        await apiClient.post('/teacher/attendance/submit', data);
    },
};

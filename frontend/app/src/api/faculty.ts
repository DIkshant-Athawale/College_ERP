import apiClient from './axios';
import type {
    FacultyDashboardData,
    Course,
    FacultyStudent,
    SubmitAttendanceRequest,
    CreateSessionResponse,
    SessionStudentsResponse,
    Assignment,
    CreateAssignmentRequest,
    AssignmentSubmissionsResponse,
    SubmitAssignmentSubmissionsRequest,
    UnitTest,
    CreateTestRequest,
    TestScoresResponse,
    SubmitTestScoresRequest,
    StudentInternalMark
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

    // Assignment APIs
    getAssignments: async (courseId: number): Promise<{ course_id: number; assignments: Assignment[] }> => {
        const response = await apiClient.get<{ course_id: number; assignments: Assignment[] }>(`/teacher/assignments/${courseId}`);
        return response.data;
    },

    createAssignment: async (data: CreateAssignmentRequest): Promise<{ message: string; assignment_id: number }> => {
        const response = await apiClient.post<{ message: string; assignment_id: number }>('/teacher/assignments', data);
        return response.data;
    },

    deleteAssignment: async (assignmentId: number): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/teacher/assignments/${assignmentId}`);
        return response.data;
    },

    getAssignmentSubmissions: async (assignmentId: number): Promise<AssignmentSubmissionsResponse> => {
        const response = await apiClient.get<AssignmentSubmissionsResponse>(`/teacher/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    submitAssignmentSubmissions: async (assignmentId: number, data: SubmitAssignmentSubmissionsRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>(`/teacher/assignments/${assignmentId}/submissions`, data);
        return response.data;
    },

    // --- Unit Tests ---
    getTests: async (courseId: number): Promise<{ course_id: number; tests: UnitTest[] }> => {
        const response = await apiClient.get<{ course_id: number; tests: UnitTest[] }>(`/teacher/tests/${courseId}`);
        return response.data;
    },

    createTest: async (data: CreateTestRequest): Promise<{ message: string; test_id: number }> => {
        const response = await apiClient.post<{ message: string; test_id: number }>('/teacher/tests', data);
        return response.data;
    },

    deleteTest: async (testId: number): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(`/teacher/tests/${testId}`);
        return response.data;
    },

    getTestScores: async (testId: number): Promise<TestScoresResponse> => {
        const response = await apiClient.get<TestScoresResponse>(`/teacher/tests/${testId}/scores`);
        return response.data;
    },

    submitTestScores: async (testId: number, data: SubmitTestScoresRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>(`/teacher/tests/${testId}/scores`, data);
        return response.data;
    },

    // --- Internal Marks ---
    calculateInternalMarks: async (courseId: number, aw: number, utw: number, atw: number): Promise<StudentInternalMark[]> => {
        const response = await apiClient.get<StudentInternalMark[]>(`/teacher/internal-marks/calculate/${courseId}?aw=${aw}&utw=${utw}&atw=${atw}`);
        return response.data;
    },

    // --- Elective Enrollment ---
    getElectiveStudents: async (courseId: number): Promise<{
        course: { course_id: number; course_name: string; course_code: string; subject_type: string; semester: number; department_id: number };
        enrolled: { student_id: number; first_name: string; last_name: string; academic_year: string }[];
        eligible: { student_id: number; first_name: string; last_name: string; academic_year: string }[];
    }> => {
        const response = await apiClient.get(`/teacher/enrollment/${courseId}/students`);
        return response.data;
    },

    enrollStudents: async (courseId: number, studentIds: number[]): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/teacher/enrollment/enroll', {
            course_id: courseId,
            student_ids: studentIds,
        });
        return response.data;
    },

    unenrollStudent: async (courseId: number, studentId: number): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>('/teacher/enrollment/unenroll', {
            data: { course_id: courseId, student_id: studentId },
        });
        return response.data;
    },
};

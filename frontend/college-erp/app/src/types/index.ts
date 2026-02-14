// User Types
export type UserRole = 'admin' | 'student' | 'teacher';
export type UserType = 'faculty' | 'student';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  userType: UserType;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
  userType: UserType;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Student Dashboard Types
export interface StudentProfile {
  student_id: number;
  first_name: string;
  last_name: string;
  email: string;
  year: number;
  semester: number;
  department_id: number;
  academic_year: string;
}

export interface Subject {
  course_id: number;
  course_name: string;
  course_code: string;
}

export interface AttendanceBySubject {
  course_name: string;
  total_classes: number;
  present_classes: number;
}

export interface OverallAttendance {
  total_classes: number;
  present_classes: number;
  percentage: number;
}

export interface FeeRecord {
  total_fee: string;
  paid_amount: string;
  remaining_fee: string;
}

export interface TimetableRow {
  day: string;
  start_time: string;
  end_time: string;
  course_name: string;
  teacher_name: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  subjects: Subject[];
  attendance_by_subject: AttendanceBySubject[];
  overall_attendance: OverallAttendance;
  feeRecord: FeeRecord[];
  timetablerows: TimetableRow[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

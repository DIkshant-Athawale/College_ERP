// Auth Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Department Types
export interface Department {
  department_id: number;
  department_code: string;
  department_name: string;
}

export interface CreateDepartmentRequest {
  department_code: string;
  department_name: string;
}

export interface EditDepartmentRequest {
  department_code?: string;
  department_name?: string;
}

// Teacher Types
export interface Teacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  primary_phone: string;
  alternate_phone: string | null;
  department_id: number;
  designation: string;
}

export interface CreateTeacherRequest {
  first_name: string;
  last_name: string;
  email: string;
  primary_phone: string;
  alternate_phone?: string;
  department_id: string | number;
  designation: string;
  password: string;
}

export interface EditTeacherRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  primary_phone?: string;
  alternate_phone?: string;
  designation?: string;
  department_id?: string | number;
}

// Course Types
export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  department_id: number;
  department_name: string;
  year: number;
  semester: number;
  teacher_id: number;
  teacher_name: string;
  total_sessions?: number;
  subject_type: 'core' | 'open' | 'prof';
}

export interface CreateCourseRequest {
  course_code: string;
  course_name: string;
  department_id: string | number;
  year: string | number;
  semester: string | number;
  teacher_id: string | number;
  subject_type: string;
}

export interface EditCourseRequest {
  course_code?: string;
  course_name?: string;
  department_id?: string | number;
  year?: string | number;
  semester?: string | number;
  teacher_id?: string | number;
  subject_type?: string;
}

// Student Types
export interface Student {
  student_id: string | number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  DOB: string;
  email: string;
  primary_phone: string;
  alternate_phone: string | null;
  department_id: number;
  year: number;
  semester: number;
  academic_year: string;
}

export interface CreateStudentRequest {
  first_name: string;
  middle_name: string;
  last_name: string;
  DOB: string;
  year: string | number;
  semester: string | number;
  email: string;
  primary_phone: string;
  alternate_phone?: string;
  department_id: string | number;
  password: string;
  academic_year: string;
}

export interface EditStudentRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  primary_phone?: string;
  alternate_phone?: string;
}

// Student Status Management
export interface PromoteStudentsRequest {
  department_id: string | number;
  current_semester: string | number;
  new_academic_year: string;
}

export interface DetainStudentRequest {
  academic_year: string;
}

// Timetable Types
export interface TimetableSlot {
  timetable_id: number;
  day: string;
  slot: number;
  start_time: string;
  end_time: string;
  course_code: string;
  course_name: string;
  slot_id?: number;
}

export interface CreateTimetableRequest {
  department_id: string | number;
  semester: string | number;
  day: string;
  slot_id: string | number;
  course_id: string | number;
}

export interface EditTimetableSlotRequest {
  timetable_id: number;
  day: string;
  slot_id: string | number;
  course_id: string | number;
}

export interface TimeSlot {
  slot_id: number;
  start_time: string;
  end_time: string;
}

// Statistics Types
export interface Statistics {
  total_departments: number;
  total_teachers: number;
  total_students: number;
  total_courses: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  affectedRows?: number;
}

export interface DepartmentsResponse {
  departments: Department[];
}

export interface TeachersResponse {
  teachers: Teacher[];
}

export interface CoursesResponse {
  courses: Course[];
}

export interface StudentsResponse {
  students: Student[];
}

export interface TimetableResponse {
  timetable: TimetableSlot[];
}

// Table Column Type
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

// Filter Types
export interface TeacherFilters {
  department_id?: string | number;
}

export interface CourseFilters {
  department_id?: string | number;
  year?: string | number;
  semester?: string | number;
}

export interface StudentFilters {
  department_id?: string | number;
  year?: string | number;
  academic_year?: string;
}

export interface TimetableFilters {
  department_id?: string | number;
  semester?: string | number;
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

export interface DashboardSubject {
  course_id: number;
  course_name: string;
  course_code: string;
}

export interface AttendanceRecord {
  course_name: string;
  total_classes: number;
  present_classes: number;
}

export interface OverallAttendance {
  total_classes: number;
  present_classes: number;
  percentage: string | number;
}

export interface FeeRecord {
  total_fee: number;
  paid_amount: number;
  remaining_fee: number;
}

export interface TimetableEntry {
  day: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  teacher_name?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  semester?: number;
  slot?: number;
}

export interface Notice {
  notice_id: number;
  title: string;
  message: string;
  posted_by: string;
  posted_by_name: string;
  posted_at: string;
  department_id?: number | null;
  department_name?: string | null;
  year?: number | null;
  target_audience?: 'all' | 'students' | 'teachers';
  image_url?: string;
}

export interface CreateNoticeRequest {
  title: string;
  message: string;
  department_id?: number | null;
  year?: number | null;
  target_audience?: 'all' | 'students' | 'teachers';
}

export interface StudentAssignment {
  assignment_id: number;
  title: string;
  deadline: string | null;
  course_name: string;
  course_code: string;
  submitted: boolean | number;
}

export interface StudentTest {
  test_id: number;
  title: string;
  test_date: string | null;
  max_marks: number | string;
  course_name: string;
  course_code: string;
  marks_obtained: number | string | null;
  is_absent: boolean | number;
}

export interface EssentialLink {
  link_id: number;
  title: string;
  url: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  subjects: DashboardSubject[];
  attendance_by_subject: AttendanceRecord[];
  overall_attendance: OverallAttendance;
  feeRecord: FeeRecord[];
  timetablerows: TimetableEntry[];
  notices: Notice[];
  assignments: StudentAssignment[];
  tests: StudentTest[];
  essential_links: EssentialLink[];
}

// Faculty Dashboard Types
export interface FacultyProfile {
  teacher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number;
  department_name?: string;
  primary_phone?: string;
  designation: string;
}

export interface FacultyStudent {
  student_id: number;
  first_name: string;
  last_name: string;
  attendance_percentage?: number | string;
  attended_sessions?: number;
  total_sessions?: number;
}

export interface FacultyDashboardData {
  profile: FacultyProfile;
  teaches: Course[];
  today_timetable: TimetableEntry[];
  stats?: {
    total_students: number;
    classes_per_week: number;
    avg_attendance: string | number;
  };
  essential_links: EssentialLink[];
}

export interface SubmitAttendanceRequest {
  session_id: number;
  attendance: {
    student_id: number;
    status: 'present' | 'absent';
  }[];
}

export interface CreateSessionResponse {
  message: string;
  session_id: number;
}

export interface SessionStudentsResponse {
  students: {
    student_id: number;
    first_name: string;
    last_name: string;
  }[];
}

// Assignment Types
export interface Assignment {
  assignment_id: number;
  title: string;
  deadline: string | null;
  created_at: string;
  total_submissions: number;
}

export interface AssignmentStudent {
  student_id: number;
  first_name: string;
  last_name: string;
  submitted: boolean | number;
  submitted_at: string | null;
}

export interface AssignmentSubmissionsResponse {
  assignment_id: number;
  title: string;
  deadline: string | null;
  students: AssignmentStudent[];
}

export interface CreateAssignmentRequest {
  course_id: number;
  title: string;
  deadline?: string;
}

export interface SubmitAssignmentSubmissionsRequest {
  submissions: {
    student_id: number;
    submitted: boolean;
  }[];
}

// ==============
// UNIT TESTS
// ==============

export interface UnitTest {
  test_id: number;
  title: string;
  test_date: string | null;
  max_marks: number | string;
  created_at: string;
  total_scored?: number;
}

export interface TestStudent {
  student_id: number;
  first_name: string;
  last_name: string;
  marks_obtained: number | string | null;
  is_absent: boolean | number;
}

export interface TestScoresResponse {
  test_id: number;
  title: string;
  test_date: string | null;
  max_marks: number | string;
  students: TestStudent[];
}

export interface CreateTestRequest {
  course_id: number;
  title: string;
  test_date?: string;
  max_marks: number;
}

export interface SubmitTestScoresRequest {
  scores: {
    student_id: number;
    marks_obtained?: number | null;
    is_absent: boolean;
  }[];
}

// ==============
// INTERNAL MARKS (CALCULATED)
// ==============

export interface StudentInternalMark {
  student_id: number;
  first_name: string;
  last_name: string;
  assignment_score: number;
  unit_test_score: number;
  attendance_score: number;
  total_score: number;
}

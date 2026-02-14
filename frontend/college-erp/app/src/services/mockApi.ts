import type { 
  LoginCredentials, 
  LoginResponse, 
  StudentDashboardData,
  UserRole,
  UserType
} from '@/types';

// Mock data for demonstration
const MOCK_USERS: Record<string, { password: string; role: UserRole; userType: UserType }> = {
  'student@college.edu': {
    password: 'student123',
    role: 'student',
    userType: 'student',
  },
  'teacher@college.edu': {
    password: 'teacher123',
    role: 'teacher',
    userType: 'faculty',
  },
  'admin@college.edu': {
    password: 'admin123',
    role: 'admin',
    userType: 'faculty',
  },
};

const MOCK_STUDENT_DATA: StudentDashboardData = {
  profile: {
    student_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@college.edu',
    year: 3,
    semester: 6,
    department_id: 2,
    academic_year: '2025-2026',
  },
  subjects: [
    {
      course_id: 17,
      course_name: 'Object Oriented Analysis & Design',
      course_code: 'OOAD',
    },
    {
      course_id: 18,
      course_name: 'Database Management Systems',
      course_code: 'DBMS',
    },
    {
      course_id: 19,
      course_name: 'Computer Networks',
      course_code: 'CN',
    },
    {
      course_id: 20,
      course_name: 'Software Engineering',
      course_code: 'SE',
    },
    {
      course_id: 21,
      course_name: 'Web Technologies',
      course_code: 'WT',
    },
  ],
  attendance_by_subject: [
    {
      course_name: 'Object Oriented Analysis & Design',
      total_classes: 40,
      present_classes: 35,
    },
    {
      course_name: 'Database Management Systems',
      total_classes: 42,
      present_classes: 38,
    },
    {
      course_name: 'Computer Networks',
      total_classes: 38,
      present_classes: 34,
    },
    {
      course_name: 'Software Engineering',
      total_classes: 40,
      present_classes: 36,
    },
    {
      course_name: 'Web Technologies',
      total_classes: 36,
      present_classes: 32,
    },
  ],
  overall_attendance: {
    total_classes: 196,
    present_classes: 175,
    percentage: 89.29,
  },
  feeRecord: [
    {
      total_fee: '85000.00',
      paid_amount: '40000.00',
      remaining_fee: '45000.00',
    },
  ],
  timetablerows: [
    {
      day: 'Monday',
      start_time: '09:00:00',
      end_time: '10:00:00',
      course_name: 'Object Oriented Analysis & Design',
      teacher_name: 'Dr. Rochlani',
    },
    {
      day: 'Monday',
      start_time: '10:30:00',
      end_time: '11:30:00',
      course_name: 'Database Management Systems',
      teacher_name: 'Prof. Sharma',
    },
    {
      day: 'Monday',
      start_time: '13:00:00',
      end_time: '14:00:00',
      course_name: 'Computer Networks',
      teacher_name: 'Dr. Patel',
    },
    {
      day: 'Tuesday',
      start_time: '09:00:00',
      end_time: '10:30:00',
      course_name: 'Software Engineering',
      teacher_name: 'Prof. Gupta',
    },
    {
      day: 'Tuesday',
      start_time: '11:00:00',
      end_time: '12:30:00',
      course_name: 'Web Technologies',
      teacher_name: 'Dr. Kumar',
    },
    {
      day: 'Wednesday',
      start_time: '09:00:00',
      end_time: '10:00:00',
      course_name: 'Object Oriented Analysis & Design',
      teacher_name: 'Dr. Rochlani',
    },
    {
      day: 'Wednesday',
      start_time: '10:30:00',
      end_time: '12:00:00',
      course_name: 'Database Management Systems Lab',
      teacher_name: 'Prof. Sharma',
    },
    {
      day: 'Thursday',
      start_time: '10:00:00',
      end_time: '11:30:00',
      course_name: 'Computer Networks',
      teacher_name: 'Dr. Patel',
    },
    {
      day: 'Thursday',
      start_time: '13:00:00',
      end_time: '14:30:00',
      course_name: 'Software Engineering Lab',
      teacher_name: 'Prof. Gupta',
    },
    {
      day: 'Friday',
      start_time: '09:00:00',
      end_time: '10:30:00',
      course_name: 'Web Technologies Lab',
      teacher_name: 'Dr. Kumar',
    },
    {
      day: 'Friday',
      start_time: '11:00:00',
      end_time: '12:00:00',
      course_name: 'Object Oriented Analysis & Design',
      teacher_name: 'Dr. Rochlani',
    },
  ],
};

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Auth API
export const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    await delay(800); // Simulate network delay

    const user = MOCK_USERS[credentials.email];
    
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Generate mock access token
    const accessToken = `mock_jwt_token_${Date.now()}`;

    return {
      accessToken,
      role: user.role,
      userType: user.userType,
    };
  },

  logout: async (): Promise<void> => {
    await delay(500);
    // Simulate logout - clear any mock session data
    return;
  },

  refreshToken: async (): Promise<string> => {
    await delay(500);
    // Generate new mock token
    return `mock_jwt_token_refreshed_${Date.now()}`;
  },
};

// Mock Student API
export const mockStudentApi = {
  getDashboard: async (): Promise<StudentDashboardData> => {
    await delay(1000); // Simulate network delay
    return { ...MOCK_STUDENT_DATA };
  },
};

// Mock Admin API
export const mockAdminApi = {
  getDashboard: async () => {
    await delay(1000);
    return {
      stats: {
        totalStudents: 1250,
        totalTeachers: 85,
        totalCourses: 120,
        departments: 8,
      },
      recentActivities: [
        { id: 1, action: 'New student registered', timestamp: '2025-02-14T10:30:00Z' },
        { id: 2, action: 'Course updated', timestamp: '2025-02-14T09:15:00Z' },
        { id: 3, action: 'Fee payment received', timestamp: '2025-02-14T08:45:00Z' },
      ],
    };
  },
};

// Mock Teacher API
export const mockTeacherApi = {
  getDashboard: async () => {
    await delay(1000);
    return {
      profile: {
        teacher_id: 1,
        first_name: 'Dr. Smith',
        last_name: 'Johnson',
        email: 'smith.johnson@college.edu',
        department: 'Computer Science',
        designation: 'Associate Professor',
      },
      courses: [
        { course_id: 1, course_name: 'Data Structures', course_code: 'DS', students_count: 45 },
        { course_id: 2, course_name: 'Algorithms', course_code: 'ALG', students_count: 38 },
      ],
      schedule: [
        { day: 'Monday', time: '09:00 - 10:30', course: 'Data Structures', room: 'Lab 101' },
        { day: 'Tuesday', time: '11:00 - 12:30', course: 'Algorithms', room: 'Room 205' },
      ],
    };
  },
};

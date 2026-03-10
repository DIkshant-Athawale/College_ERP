import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { facultyApi } from '@/api/faculty';
import { useTheme } from '@/context/ThemeContext';
import type { FacultyDashboardData, FacultyStudent, SubmitAttendanceRequest } from '@/types';
import {
  LoadingSpinner,
  ErrorComponent,
  Navbar,
  FacultyProfileCard,
  FacultyCoursesCard,
  FacultyTimetableTable,
  AssignmentSection,
  UnitTestsSection,
  InternalMarksSection
} from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  User,
  BookOpen,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Calendar as CalendarIcon,
  Save,
  Users,
  TrendingUp,
  FileText,
  ClipboardEdit,
  Calculator
} from 'lucide-react';

type SectionType = 'profile' | 'courses' | 'attendance' | 'assignments' | 'tests' | 'marks' | 'timetable';

const FacultyDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>('profile');

  const [courses, setCourses] = useState<{ course_id: number; course_name: string; course_code: string; total_sessions: number }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionStudents, setSessionStudents] = useState<{ student_id: number; first_name: string; last_name: string }[]>([]);
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent'>>({});
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCourseDetail, setSelectedCourseDetail] = useState<{
    course_id: string;
    academic_year: string;
    total_sessions: number;
    students: FacultyStudent[];
  } | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dashboardData, coursesData, summaryData] = await Promise.all([
        facultyApi.getDashboard(),
        facultyApi.getMyCourses(),
        facultyApi.getAttendanceSummary(),
      ]);

      // Merge total_sessions from summaryData into dashboardData.teaches and coursesData.courses
      const sessionsMap = new Map(summaryData.courses.map(c => [c.course_id, c.total_sessions || 0]));

      const teachesWithStats = dashboardData.teaches.map(c => ({
        ...c,
        total_sessions: sessionsMap.get(c.course_id) || 0
      }));

      const coursesWithStats = coursesData.courses.map(c => ({
        ...c,
        total_sessions: sessionsMap.get(c.course_id) || 0
      }));

      // Polyfill profile data if missing
      if (!dashboardData.profile.department_id && coursesWithStats.length > 0) {
        const firstCourse = coursesWithStats[0];
        // Using Type Assertion to extend profile temporarily
        (dashboardData.profile as any).department_id = firstCourse.department_id;
        (dashboardData.profile as any).department_code = firstCourse.department_name; // Use department_name as code or name
        (dashboardData.profile as any).dept_id = firstCourse.department_id;
      }

      setData({ ...dashboardData, teaches: teachesWithStats });
      setCourses(coursesWithStats);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [fullTimetable, setFullTimetable] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'timetable' && fullTimetable.length === 0) {
      const fetchTimetable = async () => {
        try {
          setIsLoading(true);
          const { timetable } = await facultyApi.getEntireTimetable();
          setFullTimetable(timetable);
        } catch (err) {
          console.error("Failed to load timetable", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTimetable();
    }
  }, [activeSection]);

  const handleCourseClick = async (courseId: number) => {
    try {
      setIsLoading(true);
      const courseData = await facultyApi.getCourseAttendance(courseId.toString());
      setSelectedCourseDetail(courseData);
    } catch (err) {
      setError('Failed to load course data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedCourse || !selectedDate) return;

    try {
      setIsCreatingSession(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const session = await facultyApi.createSession(parseInt(selectedCourse), dateStr);
      setSessionId(session.session_id);

      const studentsData = await facultyApi.getSessionStudents(session.session_id);
      setSessionStudents(studentsData.students);

      const initialAttendance: Record<number, 'present' | 'absent'> = {};
      studentsData.students.forEach((s) => {
        initialAttendance[s.student_id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (err) {
      setError('Failed to create session.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!sessionId) return;

    try {
      setIsSubmitting(true);
      const attendanceData: SubmitAttendanceRequest = {
        session_id: sessionId,
        attendance: Object.entries(attendance).map(([student_id, status]) => ({
          student_id: parseInt(student_id),
          status,
        })),
      };
      await facultyApi.submitAttendance(attendanceData);

      setSessionId(null);
      setSessionStudents([]);
      setAttendance({});
      setSelectedCourse('');
      alert('Attendance submitted successfully!');
    } catch (err) {
      setError('Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen" style={{ background: theme.background }}>
        <Navbar userName="Loading..." userRole="Faculty" />
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen" style={{ background: theme.background }}>
        <Navbar userName="Error" userRole="Faculty" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorComponent message={error || 'Failed to load data'} onRetry={fetchDashboardData} />
        </div>
      </div>
    );
  }

  const userName = `${data.profile.first_name} ${data.profile.last_name}`;

  // Quick stats
  const quickStats = [
    { icon: BookOpen, label: 'Courses', value: data.teaches.length, color: theme.primary },
    { icon: Users, label: 'Students', value: data.stats?.total_students || 0, color: theme.success },
    { icon: CalendarDays, label: 'Classes/Week', value: data.stats?.classes_per_week || 0, color: theme.info },
    { icon: TrendingUp, label: 'Avg Attendance', value: `${data.stats?.avg_attendance || 0}%`, color: theme.warning },
  ];

  return (
    <div className="min-h-screen" style={{ background: theme.background }}>
      <Navbar userName={userName} userRole="Faculty" />

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2"
                style={{ color: theme.text }}
              >
                Welcome, Prof. {data.profile.first_name}! 👨‍🏫
              </h1>
              <p style={{ color: theme.textMuted }}>
                Manage your courses and track student attendance
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: `${theme.secondary}10` }}
            >
              <Clock className="w-5 h-5" style={{ color: theme.secondary }} />
              <span className="text-sm font-medium" style={{ color: theme.text }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ background: theme.surface }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm mb-1" style={{ color: theme.textMuted }}>
                        {stat.label}
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${stat.color}15` }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SectionType)} className="w-full space-y-6">
            <TabsList
              className="grid grid-cols-6 w-full p-1 rounded-xl"
              style={{ background: theme.surface }}
            >
              {[
                { value: 'profile', icon: User, label: 'Profile' },
                { value: 'courses', icon: BookOpen, label: 'Courses' },
                { value: 'attendance', icon: CalendarDays, label: 'Attendance' },
                { value: 'assignments', icon: FileText, label: 'Assignments' },
                { value: 'tests', icon: ClipboardEdit, label: 'Tests' },
                { value: 'marks', icon: Calculator, label: 'Internal Marks' },
                { value: 'timetable', icon: Clock, label: 'Timetable' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full flex items-center justify-center gap-2 rounded-lg data-[state=active]:shadow-md transition-all"
                  style={{
                    color: activeSection === tab.value ? '#fff' : theme.textMuted,
                    background: activeSection === tab.value ? theme.primary : 'transparent',
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Profile Section */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FacultyProfileCard profile={data.profile} />
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Today's Schedule */}
                  <Card
                    className="border-0 shadow-lg"
                    style={{ background: theme.surface }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: `${theme.secondary}15` }}
                        >
                          <Clock className="w-6 h-6" style={{ color: theme.secondary }} />
                        </div>
                        <div>
                          <CardTitle
                            className="text-xl font-bold"
                            style={{ color: theme.text }}
                          >
                            Today&apos;s Schedule
                          </CardTitle>
                          <p className="text-sm" style={{ color: theme.textMuted }}>
                            Your classes for today
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {data.today_timetable.length > 0 ? (
                        <div className="space-y-3">
                          {data.today_timetable.map((row, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + index * 0.1 }}
                              className="flex items-center justify-between p-4 rounded-xl"
                              style={{ background: `${theme.secondary}08` }}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                                  style={{ background: theme.gradient }}
                                >
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p
                                    className="font-semibold"
                                    style={{ color: theme.text }}
                                  >
                                    {row.course_name}
                                  </p>
                                  <p className="text-sm" style={{ color: theme.textMuted }}>
                                    Semester {row.semester}
                                  </p>
                                </div>
                              </div>
                              <div
                                className="px-4 py-2 rounded-xl"
                                style={{ background: `${theme.secondary}15` }}
                              >
                                <p
                                  className="font-medium"
                                  style={{ color: theme.secondary }}
                                >
                                  {formatTime(row.start_time)} - {formatTime(row.end_time)}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="text-center py-12 rounded-xl"
                          style={{ background: `${theme.secondary}05` }}
                        >
                          <Clock className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
                          <p style={{ color: theme.textMuted }}>No classes scheduled for today.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <FacultyCoursesCard
                    courses={data.teaches.slice(0, 3)}
                    onCourseClick={handleCourseClick}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Courses Section */}
            <TabsContent value="courses" className="space-y-6">
              {selectedCourseDetail ? (
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCourseDetail(null)}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Courses
                  </Button>

                  <Card
                    className="border-0 shadow-lg"
                    style={{ background: theme.surface }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <CardTitle
                            className="text-2xl font-bold"
                            style={{ color: theme.text }}
                          >
                            Course Attendance
                          </CardTitle>
                          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                            Academic Year: {selectedCourseDetail.academic_year}
                          </p>
                        </div>
                        <Badge
                          className="px-4 py-2"
                          style={{
                            background: `${theme.primary}20`,
                            color: theme.primary
                          }}
                        >
                          {selectedCourseDetail.total_sessions} Sessions
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: theme.border }}>
                        <Table>
                          <TableHeader>
                            <TableRow style={{ background: `${theme.primary}05` }}>
                              <TableHead style={{ color: theme.text }}>Student Name</TableHead>
                              <TableHead style={{ color: theme.text }}>Attendance %</TableHead>
                              <TableHead style={{ color: theme.text }}>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCourseDetail.students.map((student) => (
                              <TableRow
                                key={student.student_id}
                                style={{ background: 'transparent' }}
                              >
                                <TableCell className="font-medium" style={{ color: theme.text }}>
                                  {student.first_name} {student.last_name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: `${theme.secondary}20` }}>
                                      <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                          width: `${Number(student.total_sessions || 0) === 0 ? 0 : Number(student.attendance_percentage || 0)}%`,
                                          background: Number(student.total_sessions || 0) === 0
                                            ? 'transparent'
                                            : Number(student.attendance_percentage || 0) >= 75 ? theme.success : theme.danger
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                                        {Number(student.total_sessions || 0) === 0 ? '--' : `${Number(student.attendance_percentage || 0).toFixed(1)}%`}
                                      </span>
                                      <span className="text-xs" style={{ color: theme.textMuted }}>
                                        {student.attended_sessions || 0}/{student.total_sessions || 0} Sessions
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {Number(student.total_sessions || 0) === 0 ? (
                                    <Badge
                                      className="px-3 py-1 font-medium"
                                      style={{
                                        background: `${theme.textMuted}15`,
                                        color: theme.textMuted
                                      }}
                                    >
                                      No Sessions
                                    </Badge>
                                  ) : Number(student.attendance_percentage || 0) >= 75 ? (
                                    <Badge
                                      className="px-3 py-1"
                                      style={{
                                        background: `${theme.success}20`,
                                        color: theme.success
                                      }}
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Good
                                    </Badge>
                                  ) : (
                                    <Badge
                                      className="px-3 py-1"
                                      style={{
                                        background: `${theme.danger}20`,
                                        color: theme.danger
                                      }}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      At Risk
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <FacultyCoursesCard courses={courses} onCourseClick={handleCourseClick} />
              )}
            </TabsContent>

            {/* Attendance Section */}
            <TabsContent value="attendance" className="space-y-6">
              <Card
                className="border-0 shadow-lg"
                style={{ background: theme.surface }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${theme.success}15` }}
                    >
                      <CalendarDays className="w-6 h-6" style={{ color: theme.success }} />
                    </div>
                    <div>
                      <CardTitle
                        className="text-xl font-bold"
                        style={{ color: theme.text }}
                      >
                        Mark Attendance
                      </CardTitle>
                      <p className="text-sm" style={{ color: theme.textMuted }}>
                        Create session and mark student attendance
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!sessionId ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: theme.text }}>
                            Select Course
                          </label>
                          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger
                              className="h-12 rounded-xl"
                              style={{ borderColor: theme.border }}
                            >
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.course_id} value={course.course_id.toString()}>
                                  {course.course_name} ({course.course_code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium" style={{ color: theme.text }}>
                            Select Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-12 justify-start text-left font-normal rounded-xl"
                                style={{ borderColor: theme.border }}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" style={{ color: theme.primary }} />
                                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <Button
                        onClick={handleCreateSession}
                        disabled={!selectedCourse || !selectedDate || isCreatingSession}
                        className="h-12 px-6 rounded-xl text-white font-medium"
                        style={{ background: theme.gradient }}
                      >
                        {isCreatingSession ? 'Creating Session...' : 'Create Session'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: `${theme.success}10` }}
                      >
                        <div>
                          <p className="font-semibold" style={{ color: theme.text }}>
                            Session Created
                          </p>
                          <p className="text-sm" style={{ color: theme.textMuted }}>
                            Session ID: #{sessionId}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSessionId(null);
                            setSessionStudents([]);
                            setAttendance({});
                          }}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: theme.border }}>
                        <Table>
                          <TableHeader>
                            <TableRow style={{ background: `${theme.success}05` }}>
                              <TableHead style={{ color: theme.text }}>Student Name</TableHead>
                              <TableHead style={{ color: theme.text }}>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sessionStudents.map((student) => (
                              <TableRow key={student.student_id}>
                                <TableCell className="font-medium" style={{ color: theme.text }}>
                                  {student.first_name} {student.last_name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={attendance[student.student_id] === 'present' ? 'default' : 'outline'}
                                      onClick={() => handleAttendanceChange(student.student_id, 'present')}
                                      className="rounded-lg"
                                      style={{
                                        background: attendance[student.student_id] === 'present' ? theme.success : 'transparent',
                                        borderColor: theme.success,
                                        color: attendance[student.student_id] === 'present' ? 'white' : theme.success
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Present
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={attendance[student.student_id] === 'absent' ? 'default' : 'outline'}
                                      onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                                      className="rounded-lg"
                                      style={{
                                        background: attendance[student.student_id] === 'absent' ? theme.danger : 'transparent',
                                        borderColor: theme.danger,
                                        color: attendance[student.student_id] === 'absent' ? 'white' : theme.danger
                                      }}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Absent
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <Button
                        onClick={handleSubmitAttendance}
                        disabled={isSubmitting}
                        className="h-12 px-6 rounded-xl text-white font-medium"
                        style={{ background: theme.gradient }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignments Section */}
            <TabsContent value="assignments">
              <AssignmentSection courses={courses} />
            </TabsContent>

            {/* Tests Section */}
            <TabsContent value="tests">
              <UnitTestsSection courses={courses} />
            </TabsContent>

            {/* Internal Marks Section */}
            <TabsContent value="marks">
              <InternalMarksSection courses={courses} />
            </TabsContent>

            {/* Timetable Section */}
            <TabsContent value="timetable">
              <FacultyTimetableTable timetable={fullTimetable} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default FacultyDashboard;

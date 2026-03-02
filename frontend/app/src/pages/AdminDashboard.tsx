import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Navbar, StatCard, LoadingSpinner } from '@/components';
import {
  ManageDepartments,
  ManageTeachers,
  ManageCourses,
  ManageStudents,
  StudentStatusManagement,
  TimetableManagement,
} from '@/sections';
import { useStatistics } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Activity,
  Calendar,
} from 'lucide-react';

type SectionType = 'departments' | 'teachers' | 'courses' | 'students' | 'timetable';

const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { statistics, isLoading, error, refetch } = useStatistics();
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);

  const handleSectionChange = (value: string) => {
    setActiveSection(value as SectionType);
  };

  const stats = [
    {
      title: 'Total Departments',
      value: statistics?.total_departments || 0,
      icon: Building2,
      color: theme.info,
      isLoading,
      error,
      onRetry: refetch,
    },
    {
      title: 'Total Teachers',
      value: statistics?.total_teachers || 0,
      icon: GraduationCap,
      color: theme.success,
      isLoading,
      error,
      onRetry: refetch,
    },
    {
      title: 'Total Students',
      value: statistics?.total_students || 0,
      icon: Users,
      color: theme.primary,
      isLoading,
      error,
      onRetry: refetch,
    },
    {
      title: 'Total Courses',
      value: statistics?.total_courses || 0,
      icon: BookOpen,
      color: theme.warning,
      isLoading,
      error,
      onRetry: refetch,
    },
  ];

  const accordionItems = [
    {
      id: 'departments',
      title: 'Manage Departments',
      icon: Building2,
      color: theme.info,
      component: <ManageDepartments />,
    },
    {
      id: 'teachers',
      title: 'Manage Teachers',
      icon: GraduationCap,
      color: theme.success,
      component: <ManageTeachers />,
    },
    {
      id: 'courses',
      title: 'Manage Courses',
      icon: BookOpen,
      color: theme.warning,
      component: <ManageCourses />,
    },
    {
      id: 'students',
      title: 'Manage Students',
      icon: Users,
      color: theme.primary,
      component: <ManageStudents />,
    },
  ];

  if (!user) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <div className="min-h-screen" style={{ background: theme.background }}>
      <Navbar userName={`${user.first_name} ${user.last_name}`} userRole="Administrator" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Admin Dashboard
              </h1>
              <p style={{ color: theme.textMuted }}>
                Welcome to the administration panel. Manage your institution from here.
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: `${theme.primary}10` }}
            >
              <Activity className="w-5 h-5" style={{ color: theme.primary }} />
              <span className="text-sm font-medium" style={{ color: theme.text }}>
                System Status: <span style={{ color: theme.success }}>Operational</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Management Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Accordion Sections */}
          <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
            <CardContent className="p-6">
              <Accordion
                type="single"
                collapsible
                value={activeSection || undefined}
                onValueChange={handleSectionChange}
                className="space-y-4"
              >
                {accordionItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border rounded-xl overflow-hidden"
                    style={{ borderColor: theme.border }}
                  >
                    <AccordionTrigger
                      className="px-6 py-4 hover:no-underline"
                      style={{ background: `${item.color}05` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${item.color}15` }}
                        >
                          <item.icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <span
                          className="text-lg font-semibold"
                          style={{ color: theme.text }}
                        >
                          {item.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4">
                      {item.component}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Student Status Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StudentStatusManagement />
          </motion.div>

          {/* Timetable Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.secondary}15` }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: theme.secondary }} />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: theme.text }}
                    >
                      Timetable Management
                    </h3>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      Manage class schedules and timetables
                    </p>
                  </div>
                </div>
                <TimetableManagement />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;

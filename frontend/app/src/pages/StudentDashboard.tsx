import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { studentApi } from '@/api/student';
import { useTheme } from '@/context/ThemeContext';
import type { StudentDashboardData } from '@/types';
import {
  LoadingSpinner,
  ErrorComponent,
  Navbar,
  StudentProfileCard,
  SubjectsCard,
  AttendanceBarSection,
  FeeCard,
  TimetableTable,
  EssentialLinksSection,
} from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone, ShieldCheck } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await studentApi.getDashboard();
      setData(response);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: theme.background }}>
        <Navbar userName="Loading..." userRole="Student" />
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen" style={{ background: theme.background }}>
        <Navbar userName="Error" userRole="Student" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorComponent message={error || 'Failed to load data'} onRetry={fetchDashboardData} />
        </div>
      </div>
    );
  }

  const userName = `${data.profile.first_name} ${data.profile.last_name}`;

 
  return (
    <div className="min-h-screen" style={{ background: theme.background }}>
      <Navbar userName={userName} userRole="Student" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Welcome */}
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
                Welcome back, {data.profile.first_name}! 👋
              </h1>
              <p style={{ color: theme.textMuted }}>
                Here&apos;s your academic overview for today
              </p>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: `${theme.primary}10` }}
            >
             
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

  

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 items-start">
          {/* Left Sidebar - Profile */}
          <div id="student-profile" className="xl:col-span-3">
            <div className="sticky top-24 space-y-6">
              <StudentProfileCard profile={data.profile} />
              
              {/* Achievement Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card 
                  className="border-0 shadow-lg overflow-hidden"
                  style={{ background: theme.surface }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ background: `${theme.success}15` }}
                      >
     
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                          Current Status
                        </p>
                        <p 
                          className="text-lg font-bold"
                          style={{ color: theme.success }}
                        >
                          Good Standing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="xl:col-span-7 space-y-6 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-2">
            <SubjectsCard subjects={data.subjects} />
            <AttendanceBarSection 
              attendanceBySubject={data.attendance_by_subject}
              overallAttendance={data.overall_attendance}
            />
            <Card
              id="student-notifications"
              className="border-0 shadow-lg overflow-hidden"
              style={{ background: theme.surface }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.info}15` }}
                  >
                    <Bell className="w-6 h-6" style={{ color: theme.info }} />
                  </div>
                  <div>
                    <CardTitle style={{ color: theme.text }}>Notifications</CardTitle>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                      Notices from faculty and admin
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {data.notices.length === 0 ? (
                  <p className="text-sm" style={{ color: theme.textMuted }}>
                    No notifications available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.notices.map((notice) => (
                      <motion.div
                        key={notice.notice_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border"
                        style={{
                          borderColor: theme.border,
                          background: notice.posted_by === 'admin' ? `${theme.warning}08` : `${theme.info}06`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-semibold" style={{ color: theme.text }}>
                            {notice.title}
                          </h4>
                          <Badge
                            className="px-3 py-1 border-0"
                            style={{
                              background: notice.posted_by === 'admin' ? `${theme.warning}20` : `${theme.info}20`,
                              color: notice.posted_by === 'admin' ? theme.warning : theme.info,
                            }}
                          >
                            {notice.posted_by === 'admin' ? (
                              <>
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <Megaphone className="w-3 h-3 mr-1" />
                                Faculty
                              </>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                          {notice.message}
                        </p>
                        {notice.image_url && (
                          <img
                            src={notice.image_url}
                            alt={notice.title}
                            className="w-full max-h-64 rounded-lg border object-cover mb-2"
                            style={{ borderColor: theme.border }}
                          />
                        )}
                        <p className="text-xs" style={{ color: theme.textMuted }}>
                          Posted by {notice.posted_by_name} on {new Date(notice.posted_at).toLocaleString('en-US')}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <FeeCard feeRecords={data.feeRecord} />
            <TimetableTable timetable={data.timetablerows} />
            <EssentialLinksSection canManage={false} addedBy="faculty" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

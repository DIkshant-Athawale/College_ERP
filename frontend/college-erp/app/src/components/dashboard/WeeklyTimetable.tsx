import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, BookOpen } from 'lucide-react';
import type { TimetableRow } from '@/types';

interface WeeklyTimetableProps {
  timetableRows: TimetableRow[];
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({ timetableRows }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDayColor = (day: string): string => {
    const colors: Record<string, string> = {
      'Monday': 'bg-blue-100 text-blue-700 border-blue-200',
      'Tuesday': 'bg-green-100 text-green-700 border-green-200',
      'Wednesday': 'bg-purple-100 text-purple-700 border-purple-200',
      'Thursday': 'bg-orange-100 text-orange-700 border-orange-200',
      'Friday': 'bg-pink-100 text-pink-700 border-pink-200',
      'Saturday': 'bg-teal-100 text-teal-700 border-teal-200',
      'Sunday': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[day] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Group timetable by day
  const groupedByDay = daysOfWeek.map(day => ({
    day,
    classes: timetableRows.filter(row => row.day === day),
  })).filter(group => group.classes.length > 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Weekly Timetable
        </CardTitle>
      </CardHeader>
      <CardContent>
        {groupedByDay.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No timetable available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDay.map(({ day, classes }) => (
              <div key={day} className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getDayColor(day)} font-semibold px-3 py-1 text-sm`}
                  >
                    {day}
                  </Badge>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-500">
                    {classes.length} class{classes.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Classes for the day */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classes.map((classItem, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      {/* Time */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                          </p>
                        </div>
                      </div>

                      {/* Course Name */}
                      <div className="flex items-start gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Course</p>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {classItem.course_name}
                          </p>
                        </div>
                      </div>

                      {/* Teacher Name */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Teacher</p>
                          <p className="text-sm text-gray-700">
                            {classItem.teacher_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              Total Classes: <strong className="text-gray-700">{timetableRows.length}</strong>
            </span>
            <span>
              Active Days: <strong className="text-gray-700">{groupedByDay.length}</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyTimetable;

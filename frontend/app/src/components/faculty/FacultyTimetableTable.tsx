import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Calendar } from 'lucide-react';
import type { TimetableEntry } from '@/types';

interface FacultyTimetableTableProps {
    timetable: TimetableEntry[];
}

export const FacultyTimetableTable: React.FC<FacultyTimetableTableProps> = ({ timetable }) => {
    const { theme } = useTheme();

    // Group by semester
    const semesters = Array.from(new Set(timetable.map(t => t.semester || 0))).sort((a, b) => a - b);
    const groupedBySemester = semesters.map(semester => ({
        semester,
        entries: timetable.filter(t => (t.semester || 0) === semester)
    }));

    // Helper to group by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const getGroupedByDay = (entries: TimetableEntry[]) => {
        return days.map(day => ({
            day,
            slots: entries.filter(t => t.day === day)
        })).filter(g => g.slots.length > 0);
    };

    return (
        <div className="space-y-8">
            {groupedBySemester.length === 0 ? (
                <Card className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
                    <CardContent className="p-6 text-center" style={{ color: theme.textMuted }}>
                        No timetable available.
                    </CardContent>
                </Card>
            ) : (
                groupedBySemester.map(({ semester, entries }) => (
                    <Card key={semester} className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
                        <CardHeader className="pb-2 border-b" style={{ borderColor: theme.border }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}15` }}>
                                    <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg" style={{ color: theme.text }}>
                                        Semester {semester} Schedule
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: `${theme.primary}05`, color: theme.textMuted }}>
                                            <th className="p-3 text-left w-16">Slot</th>
                                            <th className="p-3 text-left w-32">Day</th>
                                            <th className="p-3 text-left w-48">Time</th>
                                            <th className="p-3 text-left">Course & Faculty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getGroupedByDay(entries).map((group) => (
                                            <React.Fragment key={group.day}>
                                                {group.slots.map((slot, idx) => (
                                                    <tr key={`${group.day}-${idx}`} className="border-b last:border-0" style={{ borderColor: theme.border }}>
                                                        {idx === 0 && (
                                                            <td rowSpan={group.slots.length} className="p-3 font-medium align-top border-r" style={{ color: theme.text, borderColor: theme.border }}>
                                                                {group.day}
                                                            </td>
                                                        )}
                                                        <td className="p-3 text-center font-mono text-xs" style={{ color: theme.textMuted }}>
                                                            {slot.slot || '-'}
                                                        </td>
                                                        <td className="p-3 align-top" style={{ color: theme.text }}>
                                                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                        </td>
                                                        <td className="p-3 font-semibold align-top" style={{ color: theme.primary }}>
                                                            {slot.course_name}
                                                            <div className="text-xs font-normal opacity-75">
                                                                {slot.course_code} • {slot.teacher_first_name} {slot.teacher_last_name}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
};

const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
};

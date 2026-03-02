import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Calendar } from 'lucide-react';
import type { TimetableEntry } from '@/types';

interface TimetableTableProps {
    timetable: TimetableEntry[];
}

export const TimetableTable: React.FC<TimetableTableProps> = ({ timetable }) => {
    const { theme } = useTheme();

    // Group by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = days.map(day => ({
        day,
        slots: timetable.filter(t => t.day === day)
    })).filter(g => g.slots.length > 0);

    return (
        <Card className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}15` }}>
                        <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                        <CardTitle className="text-lg" style={{ color: theme.text }}>Weekly Timetable</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: `${theme.primary}05`, color: theme.textMuted }}>
                                <th className="p-3 text-left">Day</th>
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">Subject</th>
                                <th className="p-3 text-left">Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grouped.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center" style={{ color: theme.textMuted }}>No timetable available.</td>
                                </tr>
                            ) : (
                                grouped.map((group) => (
                                    <React.Fragment key={group.day}>
                                        {group.slots.map((slot, idx) => (
                                            <tr key={`${group.day}-${idx}`} className="border-b" style={{ borderColor: theme.border }}>
                                                {idx === 0 && (
                                                    <td rowSpan={group.slots.length} className="p-3 font-medium align-top" style={{ color: theme.text }}>
                                                        {group.day}
                                                    </td>
                                                )}
                                                <td className="p-3" style={{ color: theme.text }}>
                                                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                </td>
                                                <td className="p-3 font-semibold" style={{ color: theme.primary }}>
                                                    {slot.course_name}
                                                </td>
                                                <td className="p-3" style={{ color: theme.textMuted }}>
                                                    {slot.teacher_name}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const formatTime = (time: string) => {
    // Check if time is in HH:mm:ss format or similar
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
};

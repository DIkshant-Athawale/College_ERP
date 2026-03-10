import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { BarChart, Activity } from 'lucide-react';
import type { AttendanceRecord, OverallAttendance } from '@/types';

interface AttendanceBarSectionProps {
    attendanceBySubject: AttendanceRecord[];
    overallAttendance: OverallAttendance;
}

export const AttendanceBarSection: React.FC<AttendanceBarSectionProps> = ({ attendanceBySubject, overallAttendance }) => {
    const { theme } = useTheme();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Attendance */}
            <Card className="col-span-1 border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}15` }}>
                            <Activity className="w-5 h-5" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <CardTitle className="text-lg" style={{ color: theme.text }}>Overall Attendance</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8"
                            style={{ borderColor: Number(overallAttendance.percentage) >= 75 ? theme.success : theme.warning }}
                        >
                            <span className="text-2xl font-bold" style={{ color: theme.text }}>
                                {overallAttendance.percentage}%
                            </span>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm" style={{ color: theme.textMuted }}>Total Classes: {overallAttendance.total_classes}</p>
                            <p className="text-sm" style={{ color: theme.textMuted }}>Present: {overallAttendance.present_classes}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Subject-wise Attendance */}
            <Card className="col-span-1 lg:col-span-2 border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.info}15` }}>
                            <BarChart className="w-5 h-5" style={{ color: theme.info }} />
                        </div>
                        <div>
                            <CardTitle className="text-lg" style={{ color: theme.text }}>Subject Attendance</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attendanceBySubject.map((record, index) => {
                            const percentage = record.total_classes > 0
                                ? (record.present_classes / record.total_classes) * 100
                                : 0;

                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium" style={{ color: theme.text }}>{record.course_name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs" style={{ color: theme.textMuted }}>{record.present_classes}/{record.total_classes}</span>
                                            <span style={{ color: percentage >= 75 ? theme.success : theme.warning }}>{percentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: theme.border }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                background: percentage >= 75 ? theme.success : theme.warning
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

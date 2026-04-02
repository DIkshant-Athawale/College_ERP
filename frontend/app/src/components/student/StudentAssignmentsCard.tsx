import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import type { StudentAssignment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';

interface StudentAssignmentsCardProps {
    assignments: StudentAssignment[];
}

const StudentAssignmentsCard: React.FC<StudentAssignmentsCardProps> = ({ assignments }) => {
    const { theme } = useTheme();

    // Group assignments by course
    const grouped = assignments.reduce<Record<string, StudentAssignment[]>>((acc, a) => {
        const key = `${a.course_name} (${a.course_code})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(a);
        return acc;
    }, {});

    const courseNames = Object.keys(grouped);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card
                id="student-assignments"
                className="border-0 shadow-lg overflow-hidden"
                style={{ background: theme.surface }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${theme.secondary}15` }}
                        >
                            <FileText className="w-6 h-6" style={{ color: theme.secondary }} />
                        </div>
                        <div>
                            <CardTitle style={{ color: theme.text }}>Assignments</CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Your assignment submissions across all courses
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {assignments.length === 0 ? (
                        <div
                            className="text-center py-10 rounded-xl"
                            style={{ background: `${theme.secondary}05` }}
                        >
                            <FileText className="w-10 h-10 mx-auto mb-2" style={{ color: theme.textMuted }} />
                            <p style={{ color: theme.textMuted }}>No assignments posted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {courseNames.map((courseName, ci) => (
                                <motion.div
                                    key={courseName}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + ci * 0.08 }}
                                >
                                    <h3 className="text-sm font-semibold mb-2" style={{ color: theme.primary }}>
                                        {courseName}
                                    </h3>
                                    <div
                                        className="overflow-x-auto rounded-xl border"
                                        style={{ borderColor: theme.border }}
                                    >
                                        <Table>
                                            <TableHeader>
                                                <TableRow style={{ background: `${theme.primary}05` }}>
                                                    <TableHead style={{ color: theme.text }}>#</TableHead>
                                                    <TableHead style={{ color: theme.text }}>Title</TableHead>
                                                    <TableHead style={{ color: theme.text }}>Deadline</TableHead>
                                                    <TableHead style={{ color: theme.text }}>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {grouped[courseName].map((a, i) => {
                                                    const isSubmitted = Boolean(a.submitted);
                                                    const isPastDeadline = a.deadline
                                                        ? new Date(a.deadline) < new Date()
                                                        : false;

                                                    return (
                                                        <TableRow key={a.assignment_id}>
                                                            <TableCell style={{ color: theme.textMuted }}>
                                                                {i + 1}
                                                            </TableCell>
                                                            <TableCell
                                                                className="font-medium"
                                                                style={{ color: theme.text }}
                                                            >
                                                                {a.title}
                                                            </TableCell>
                                                            <TableCell>
                                                                {a.deadline ? (
                                                                    <span
                                                                        className="text-sm"
                                                                        style={{
                                                                            color: isPastDeadline && !isSubmitted
                                                                                ? theme.danger
                                                                                : theme.textMuted,
                                                                        }}
                                                                    >
                                                                        {format(new Date(a.deadline), 'PP')}
                                                                        {isPastDeadline && !isSubmitted && (
                                                                            <span className="text-xs ml-1">(overdue)</span>
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: theme.textMuted }}>—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {isSubmitted ? (
                                                                    <Badge
                                                                        className="px-3 py-1 gap-1"
                                                                        style={{
                                                                            background: `${theme.success}20`,
                                                                            color: theme.success,
                                                                        }}
                                                                    >
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Submitted
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge
                                                                        className="px-3 py-1 gap-1"
                                                                        style={{
                                                                            background: `${theme.danger}20`,
                                                                            color: theme.danger,
                                                                        }}
                                                                    >
                                                                        <XCircle className="w-3 h-3" />
                                                                        Not Submitted
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export { StudentAssignmentsCard };
export default StudentAssignmentsCard;

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import type { StudentTest } from '@/types';
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
import { ClipboardEdit, XCircle } from 'lucide-react';

interface StudentTestsCardProps {
    tests: StudentTest[];
}

const StudentTestsCard: React.FC<StudentTestsCardProps> = ({ tests }) => {
    const { theme } = useTheme();

    // Group tests by course
    const grouped = tests.reduce<Record<string, StudentTest[]>>((acc, t) => {
        const key = `${t.course_name} (${t.course_code})`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});

    const courseNames = Object.keys(grouped);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <Card
                id="student-tests"
                className="border-0 shadow-lg overflow-hidden mt-6"
                style={{ background: theme.surface }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${theme.primary}15` }}
                        >
                            <ClipboardEdit className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <CardTitle style={{ color: theme.text }}>Unit Tests</CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Your unit test scores across all courses
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {tests.length === 0 ? (
                        <div
                            className="text-center py-10 rounded-xl"
                            style={{ background: `${theme.primary}05` }}
                        >
                            <ClipboardEdit className="w-10 h-10 mx-auto mb-2" style={{ color: theme.textMuted }} />
                            <p style={{ color: theme.textMuted }}>No tests recorded yet.</p>
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
                                                    <TableHead style={{ color: theme.text }}>Date</TableHead>
                                                    <TableHead className="text-right" style={{ color: theme.text }}>Score</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {grouped[courseName].map((t, i) => {
                                                    const isAbsent = Boolean(t.is_absent);
                                                    const hasScore = t.marks_obtained !== null;

                                                    return (
                                                        <TableRow key={t.test_id}>
                                                            <TableCell style={{ color: theme.textMuted }}>
                                                                {i + 1}
                                                            </TableCell>
                                                            <TableCell
                                                                className="font-medium"
                                                                style={{ color: theme.text }}
                                                            >
                                                                {t.title}
                                                            </TableCell>
                                                            <TableCell>
                                                                {t.test_date ? (
                                                                    <span
                                                                        className="text-sm"
                                                                        style={{ color: theme.textMuted }}
                                                                    >
                                                                        {format(new Date(t.test_date), 'PP')}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: theme.textMuted }}>—</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {isAbsent ? (
                                                                    <Badge
                                                                        className="px-3 py-1 gap-1"
                                                                        style={{
                                                                            background: `${theme.danger}20`,
                                                                            color: theme.danger,
                                                                        }}
                                                                    >
                                                                        <XCircle className="w-3 h-3" />
                                                                        Absent
                                                                    </Badge>
                                                                ) : hasScore ? (
                                                                    <span className="font-bold text-lg" style={{ color: theme.text }}>
                                                                        {Number(t.marks_obtained)}{' '}
                                                                        <span className="text-sm font-normal" style={{ color: theme.textMuted }}>
                                                                            / {t.max_marks}
                                                                        </span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm italic" style={{ color: theme.textMuted }}>
                                                                        Not Graded
                                                                    </span>
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

export { StudentTestsCard };
export default StudentTestsCard;

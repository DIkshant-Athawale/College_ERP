import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { facultyApi } from '@/api/faculty';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calculator, ArrowLeft, Download, FileText } from 'lucide-react';
import type { Course, StudentInternalMark } from '@/types';

interface InternalMarksSectionProps {
    courses: Course[];
}

type ViewState = 'SELECT_COURSE' | 'CALCULATOR';

export const InternalMarksSection: React.FC<InternalMarksSectionProps> = ({ courses }) => {
    const { theme } = useTheme();
    const [view, setView] = useState<ViewState>('SELECT_COURSE');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [marksData, setMarksData] = useState<StudentInternalMark[]>([]);

    // Config Weights
    const [aw, setAw] = useState<string>('5');
    const [utw, setUtw] = useState<string>('10');
    const [atw, setAtw] = useState<string>('5');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCalculate = async () => {
        if (!selectedCourse) return;

        setError(null);
        setIsLoading(true);

        const assignW = Number(aw) || 0;
        const testW = Number(utw) || 0;
        const attendW = Number(atw) || 0;
        const totalW = assignW + testW + attendW;

        if (totalW === 0) {
            setError('Total marks cannot be zero.');
            setIsLoading(false);
            return;
        }

        try {
            const data = await facultyApi.calculateInternalMarks(selectedCourse.course_id, assignW, testW, attendW);
            setMarksData(data);
        } catch (err) {
            setError('Failed to calculate internal marks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (marksData.length === 0) return;

        const headers = ['Student ID', 'First Name', 'Last Name', 'Assignment Score', 'Unit Test Score', 'Attendance Score', 'Total Internal Marks'];
        const csvContent = [
            headers.join(','),
            ...marksData.map(row =>
                [row.student_id, row.first_name, row.last_name, row.assignment_score, row.unit_test_score, row.attendance_score, row.total_score].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedCourse?.course_code}_Internal_Marks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (view === 'SELECT_COURSE') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <motion.div
                        key={course.course_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                            setSelectedCourse(course);
                            setMarksData([]);
                            setView('CALCULATOR');
                        }}
                    >
                        <Card
                            className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl border-t-4"
                            style={{
                                background: theme.surface,
                                borderColor: theme.primary,
                            }}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="mb-2" style={{ color: theme.text }}>
                                            {course.course_name}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" style={{ color: theme.textMuted, borderColor: theme.border }}>
                                                {course.course_code}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10" style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}>
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    }

    if (view === 'CALCULATOR' && selectedCourse) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl border mb-6 shadow-sm relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.primary}08 100%)`, borderColor: theme.border }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: theme.primary }} />
                    <div className="mb-4 md:mb-0">
                        <Button variant="ghost" size="sm" onClick={() => setView('SELECT_COURSE')} className="mb-3 -ml-2 hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.textMuted }}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight" style={{ color: theme.text }}>
                            Internal Marks Engine
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="px-2.5 py-0.5" style={{ color: theme.primary, borderColor: theme.primary }}>
                                {selectedCourse.course_code}
                            </Badge>
                            <span className="text-sm font-medium flex items-center opacity-70" style={{ color: theme.textMuted }}>
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                {selectedCourse.course_name}
                            </span>
                        </div>
                    </div>
                    {marksData.length > 0 && (
                        <Button onClick={handleExportCSV} variant="outline" size="lg" className="shadow-sm hover:shadow-md transition-all gap-2" style={{ color: theme.primary, borderColor: theme.primary }}>
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Weight Configuration Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card style={{ background: theme.surface, borderColor: theme.border }} className="shadow-lg border">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2" style={{ color: theme.text }}>
                                    <Calculator className="w-4 h-4" style={{ color: theme.primary }} />
                                    Configure Weights
                                </CardTitle>
                                <CardDescription>Set the maximum marks mapped to each component.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="font-semibold" style={{ color: theme.text }}>Assignments Weight</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={aw}
                                            onChange={e => setAw(e.target.value)}
                                            className="transition-all focus:ring-2 font-mono text-lg"
                                            style={{ borderColor: theme.border, background: 'transparent' }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Marks</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold" style={{ color: theme.text }}>Unit Tests Weight</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={utw}
                                            onChange={e => setUtw(e.target.value)}
                                            className="transition-all focus:ring-2 font-mono text-lg"
                                            style={{ borderColor: theme.border, background: 'transparent' }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Marks</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold" style={{ color: theme.text }}>Attendance Weight</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={atw}
                                            onChange={e => setAtw(e.target.value)}
                                            className="transition-all focus:ring-2 font-mono text-lg"
                                            style={{ borderColor: theme.border, background: 'transparent' }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Marks</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed" style={{ borderColor: theme.border }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-semibold text-sm" style={{ color: theme.textMuted }}>Total Internal Marks</span>
                                        <Badge variant="default" className="text-sm px-3 py-1" style={{ background: theme.primary }}>
                                            {(Number(aw) || 0) + (Number(utw) || 0) + (Number(atw) || 0)}
                                        </Badge>
                                    </div>
                                    <Button
                                        onClick={handleCalculate}
                                        disabled={isLoading}
                                        className="w-full shadow-md hover:shadow-lg transition-all font-medium py-6"
                                        style={{ background: theme.primary, color: 'white' }}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Calculator className="w-5 h-5 mr-2" />}
                                        Calculate Now
                                    </Button>
                                    {error && <p className="text-sm text-red-500 mt-2 text-center font-medium">{error}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Table */}
                    <div className="lg:col-span-3">
                        <Card style={{ background: theme.surface, borderColor: theme.border }} className="shadow-lg border min-h-[500px]">
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="flex flex-col justify-center items-center py-24 space-y-4">
                                        <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.primary }} />
                                        <p className="text-sm font-medium animate-pulse" style={{ color: theme.textMuted }}>Crunching the numbers...</p>
                                    </div>
                                ) : marksData.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center py-32 space-y-3 opacity-60">
                                        <Calculator className="w-16 h-16 text-gray-300" />
                                        <p className="text-lg font-medium" style={{ color: theme.textMuted }}>Hit calculate to generate internal marks</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow style={{ background: `${theme.primary}08` }}>
                                                    <TableHead className="w-[100px] font-semibold" style={{ color: theme.text }}>ID</TableHead>
                                                    <TableHead className="font-semibold" style={{ color: theme.text }}>Student Name</TableHead>
                                                    <TableHead className="text-center font-semibold" style={{ color: theme.text }}>Assignments</TableHead>
                                                    <TableHead className="text-center font-semibold" style={{ color: theme.text }}>Unit Tests</TableHead>
                                                    <TableHead className="text-center font-semibold" style={{ color: theme.text }}>Attendance</TableHead>
                                                    <TableHead className="text-right font-bold text-base" style={{ color: theme.primary }}>Total Marks</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {marksData.map((student, idx) => (
                                                        <motion.tr
                                                            key={student.student_id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.02 }}
                                                            className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b"
                                                            style={{ borderColor: theme.border }}
                                                        >
                                                            <TableCell className="font-mono text-sm" style={{ color: theme.textMuted }}>{student.student_id}</TableCell>
                                                            <TableCell className="font-medium" style={{ color: theme.text }}>
                                                                {student.first_name} {student.last_name}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="font-mono bg-background/50">
                                                                    {student.assignment_score.toFixed(2)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="font-mono bg-background/50">
                                                                    {student.unit_test_score.toFixed(2)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="font-mono bg-background/50">
                                                                    {student.attendance_score.toFixed(2)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span className="text-lg font-bold" style={{ color: theme.primary }}>
                                                                    {student.total_score.toFixed(2)}
                                                                </span>
                                                            </TableCell>
                                                        </motion.tr>
                                                    ))}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        );
    }

    return null;
};

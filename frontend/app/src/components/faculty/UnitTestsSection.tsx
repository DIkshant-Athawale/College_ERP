import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { facultyApi } from '@/api/faculty';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { Loader2, Plus, ArrowLeft, Trash2, ClipboardEdit, Calendar as CalendarIcon, Save, Edit3 } from 'lucide-react';
import type { Course, UnitTest, TestStudent } from '@/types';
import { format } from 'date-fns';

interface UnitTestsSectionProps {
    courses: Course[];
}

type ViewState = 'SELECT_COURSE' | 'TEST_LIST' | 'MARK_SCORES';

export const UnitTestsSection: React.FC<UnitTestsSectionProps> = ({ courses }) => {
    const { theme } = useTheme();
    const [view, setView] = useState<ViewState>('SELECT_COURSE');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [tests, setTests] = useState<UnitTest[]>([]);
    const [selectedTest, setSelectedTest] = useState<UnitTest | null>(null);
    const [students, setStudents] = useState<TestStudent[]>([]);

    // Form state
    const [newTestTitle, setNewTestTitle] = useState('');
    const [newTestDate, setNewTestDate] = useState('');
    const [newTestMaxMarks, setNewTestMaxMarks] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch tests when a course is selected
    useEffect(() => {
        if (selectedCourse && view === 'TEST_LIST') {
            loadTests();
        }
    }, [selectedCourse, view]);

    const loadTests = async () => {
        if (!selectedCourse) return;
        setIsLoading(true);
        try {
            const data = await facultyApi.getTests(selectedCourse.course_id);
            setTests(data.tests);
        } catch (err) {
            setError('Failed to load tests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse || !newTestTitle.trim() || !newTestMaxMarks) return;

        setIsSaving(true);
        setError(null);
        try {
            await facultyApi.createTest({
                course_id: selectedCourse.course_id,
                title: newTestTitle.trim(),
                test_date: newTestDate || undefined,
                max_marks: Number(newTestMaxMarks)
            });
            setNewTestTitle('');
            setNewTestDate('');
            setNewTestMaxMarks('');
            await loadTests();
        } catch (err) {
            setError('Failed to create test');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTest = async (testId: number) => {
        if (!confirm('Are you sure you want to delete this test? All marks will be lost.')) return;

        setIsSaving(true);
        try {
            await facultyApi.deleteTest(testId);
            await loadTests();
        } catch (err) {
            setError('Failed to delete test');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewScores = async (test: UnitTest) => {
        setSelectedTest(test);
        setIsLoading(true);
        setView('MARK_SCORES');
        try {
            const data = await facultyApi.getTestScores(test.test_id);
            // Convert boolean to number or boolean correctly (API sends 0/1 back)
            const parsedStudents = data.students.map(s => ({
                ...s,
                is_absent: Boolean(s.is_absent),
                marks_obtained: s.marks_obtained !== null ? Number(s.marks_obtained) : null
            }));
            setStudents(parsedStudents);
        } catch (err) {
            setError('Failed to load student scores');
            setView('TEST_LIST'); // Reset on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleScoreChange = (studentId: number, marks: string) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === studentId) {
                // If they enter a number, they are no longer absent automatically
                return {
                    ...s,
                    marks_obtained: marks === '' ? null : Number(marks),
                    is_absent: false
                };
            }
            return s;
        }));
    };

    const toggleAbsent = (studentId: number) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === studentId) {
                const isNowAbsent = !s.is_absent;
                return {
                    ...s,
                    is_absent: isNowAbsent,
                    marks_obtained: isNowAbsent ? null : s.marks_obtained // Clear score if typed
                };
            }
            return s;
        }));
    };

    const handleSaveScores = async () => {
        if (!selectedTest) return;
        setIsSaving(true);
        try {
            await facultyApi.submitTestScores(selectedTest.test_id, {
                scores: students.map(s => ({
                    student_id: s.student_id,
                    marks_obtained: s.marks_obtained !== null && s.marks_obtained !== '' ? Number(s.marks_obtained) : undefined,
                    is_absent: Boolean(s.is_absent)
                }))
            });
            setView('TEST_LIST');
            loadTests();
        } catch (err) {
            setError('Failed to save scores');
        } finally {
            setIsSaving(false);
        }
    };


    // === RENDERERS ===

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
                            setView('TEST_LIST');
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
                                        <ClipboardEdit className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </div>
        );
    }

    if (view === 'TEST_LIST' && selectedCourse) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => setView('SELECT_COURSE')}
                    className="mb-4"
                    style={{ color: theme.text }}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Test Form */}
                    <div className="lg:col-span-1">
                        <Card style={{ background: `linear-gradient(to bottom right, ${theme.surface}, ${theme.primary}08)`, borderColor: theme.border }} className="shadow-lg sticky top-24 overflow-hidden border">
                            <div className="h-1.5 w-full" style={{ background: theme.primary }} />
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center gap-2" style={{ color: theme.text }}>
                                    <ClipboardEdit className="w-5 h-5" style={{ color: theme.primary }} />
                                    New Unit Test
                                </CardTitle>
                                <CardDescription className="font-medium" style={{ color: theme.primary }}>For {selectedCourse.course_code}</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleCreateTest}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Test Title</Label>
                                        <Input
                                            placeholder="e.g., Midterm 1"
                                            value={newTestTitle}
                                            onChange={e => setNewTestTitle(e.target.value)}
                                            required
                                            className="transition-all focus:ring-2 bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Marks</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="e.g., 50"
                                            value={newTestMaxMarks}
                                            onChange={e => setNewTestMaxMarks(e.target.value)}
                                            required
                                            className="transition-all focus:ring-2 bg-background/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Test Date (Optional)</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                                            <Input
                                                type="date"
                                                value={newTestDate}
                                                onChange={e => setNewTestDate(e.target.value)}
                                                className="pl-10 transition-all focus:ring-2 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    {error && <p className="text-sm rounded-md p-2 bg-red-50 text-red-600 border border-red-100">{error}</p>}
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button type="submit" className="w-full shadow-md hover:shadow-lg transition-all" style={{ background: theme.primary, color: 'white' }} disabled={isSaving || !newTestTitle || !newTestMaxMarks}>
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Create Unit Test
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Test List */}
                    <div className="lg:col-span-2">
                        <Card style={{ background: theme.surface }} className="border-0 shadow-lg min-h-[500px]">
                            <CardHeader>
                                <CardTitle style={{ color: theme.text }}>Existing Tests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                                ) : tests.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 bg-gray-50/5 rounded-xl border border-dashed border-gray-200/20">
                                        No tests created yet for this course.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Scored</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tests.map(test => (
                                                <TableRow key={test.test_id}>
                                                    <TableCell className="font-medium">
                                                        {test.title}
                                                        <Badge variant="outline" className="ml-2 text-[10px]">{test.max_marks} marks</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {test.test_date ? format(new Date(test.test_date), 'PP') : '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{test.total_scored} students</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleViewScores(test)} className="hover:bg-primary/10 transition-colors" style={{ color: theme.primary, borderColor: `${theme.primary}50` }}>
                                                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Marks
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTest(test.test_id)} className="opacity-80 hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'MARK_SCORES' && selectedTest) {
        return (
            <div className="space-y-6">
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl border mb-6 shadow-sm relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.primary}08 100%)`, borderColor: theme.border }}
                >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ background: theme.primary }} />
                    <div className="mb-4 md:mb-0">
                        <Button variant="ghost" size="sm" onClick={() => setView('TEST_LIST')} className="mb-3 -ml-2 hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.textMuted }}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight" style={{ color: theme.text }}>
                            {selectedTest.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="px-2.5 py-0.5" style={{ color: theme.primary, borderColor: theme.primary }}>
                                Max Marks: {selectedTest.max_marks}
                            </Badge>
                            {selectedTest.test_date && (
                                <span className="text-sm font-medium flex items-center opacity-70" style={{ color: theme.textMuted }}>
                                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                                    {format(new Date(selectedTest.test_date), 'PP')}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button onClick={handleSaveScores} disabled={isSaving} size="lg" className="shadow-md hover:shadow-lg transition-all" style={{ background: theme.primary, color: 'white' }}>
                        {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Scores
                    </Button>
                </div>

                <Card style={{ background: theme.surface }} className="border-0 shadow-lg">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ background: `${theme.primary}08` }}>
                                        <TableHead className="w-[100px] font-semibold" style={{ color: theme.text }}>ID</TableHead>
                                        <TableHead className="font-semibold" style={{ color: theme.text }}>Student Name</TableHead>
                                        <TableHead className="text-center font-semibold" style={{ color: theme.text }}>Score (out of {selectedTest.max_marks})</TableHead>
                                        <TableHead className="text-center w-[150px] font-semibold" style={{ color: theme.text }}>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map(student => (
                                        <TableRow key={student.student_id} className={`transition-colors ${student.is_absent ? 'opacity-75' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={student.is_absent ? { background: `${theme.danger}08` } : {}}>
                                            <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                                            <TableCell className="font-medium">
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={Number(selectedTest.max_marks)}
                                                        step="0.1"
                                                        className="w-24 text-center text-lg font-bold border-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-offset-0"
                                                        style={{
                                                            borderColor: student.marks_obtained !== null && student.marks_obtained !== '' ? theme.primary : theme.border,
                                                            color: student.is_absent ? theme.textMuted : theme.text,
                                                            backgroundColor: student.is_absent ? 'transparent' : theme.surface
                                                        }}
                                                        placeholder="—"
                                                        value={student.marks_obtained !== null ? Number(student.marks_obtained) : ''}
                                                        onChange={e => handleScoreChange(student.student_id, e.target.value)}
                                                        disabled={Boolean(student.is_absent)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant={student.is_absent ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleAbsent(student.student_id)}
                                                    className="w-full font-medium transition-all"
                                                    style={student.is_absent ? {
                                                        background: theme.danger,
                                                        color: 'white'
                                                    } : {
                                                        borderColor: theme.danger,
                                                        color: theme.danger,
                                                        background: 'transparent'
                                                    }}
                                                >
                                                    {student.is_absent ? 'Absent' : 'Mark Absent'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No active students found in this course.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
};

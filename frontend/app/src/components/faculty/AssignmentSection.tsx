import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { facultyApi } from '@/api/faculty';
import { useTheme } from '@/context/ThemeContext';
import type { Assignment, AssignmentStudent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
    FileText,
    Plus,
    Trash2,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Save,
    Calendar as CalendarIcon,
    ClipboardList,
    Users,
} from 'lucide-react';

interface AssignmentSectionProps {
    courses: { course_id: number; course_name: string; course_code: string }[];
}

type View = 'select-course' | 'assignment-list' | 'submissions';

const AssignmentSection: React.FC<AssignmentSectionProps> = ({ courses }) => {
    const { theme } = useTheme();

    // View state
    const [currentView, setCurrentView] = useState<View>('select-course');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    // Assignment list state
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

    // Create form state
    const [newTitle, setNewTitle] = useState('');
    const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    // Submissions state
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [students, setStudents] = useState<AssignmentStudent[]>([]);
    const [submissionChanges, setSubmissionChanges] = useState<Record<number, boolean>>({});
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [isSavingSubmissions, setIsSavingSubmissions] = useState(false);

    // Fetch assignments for selected course
    const fetchAssignments = async (courseId: number) => {
        try {
            setIsLoadingAssignments(true);
            const data = await facultyApi.getAssignments(courseId);
            setAssignments(data.assignments);
        } catch (err) {
            console.error('Failed to fetch assignments', err);
        } finally {
            setIsLoadingAssignments(false);
        }
    };

    // Handle course selection
    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId);
        fetchAssignments(Number(courseId));
        setCurrentView('assignment-list');
    };

    // Create a new assignment
    const handleCreateAssignment = async () => {
        if (!newTitle.trim() || !selectedCourseId) return;

        try {
            setIsCreating(true);
            await facultyApi.createAssignment({
                course_id: Number(selectedCourseId),
                title: newTitle.trim(),
                deadline: newDeadline ? format(newDeadline, 'yyyy-MM-dd') : undefined,
            });
            setNewTitle('');
            setNewDeadline(undefined);
            await fetchAssignments(Number(selectedCourseId));
        } catch (err) {
            console.error('Failed to create assignment', err);
        } finally {
            setIsCreating(false);
        }
    };

    // Delete an assignment
    const handleDeleteAssignment = async (assignmentId: number) => {
        try {
            await facultyApi.deleteAssignment(assignmentId);
            await fetchAssignments(Number(selectedCourseId));
        } catch (err) {
            console.error('Failed to delete assignment', err);
        }
    };

    // Open submissions view for an assignment
    const handleOpenSubmissions = async (assignment: Assignment) => {
        try {
            setIsLoadingSubmissions(true);
            setSelectedAssignment(assignment);
            const data = await facultyApi.getAssignmentSubmissions(assignment.assignment_id);
            setStudents(data.students);
            // Initialize changes from current state
            const initial: Record<number, boolean> = {};
            data.students.forEach((s) => {
                initial[s.student_id] = Boolean(s.submitted);
            });
            setSubmissionChanges(initial);
            setCurrentView('submissions');
        } catch (err) {
            console.error('Failed to load submissions', err);
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    // Toggle submission
    const toggleSubmission = (studentId: number) => {
        setSubmissionChanges((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    // Save submissions
    const handleSaveSubmissions = async () => {
        if (!selectedAssignment) return;

        try {
            setIsSavingSubmissions(true);
            const submissions = Object.entries(submissionChanges).map(([id, submitted]) => ({
                student_id: Number(id),
                submitted,
            }));
            await facultyApi.submitAssignmentSubmissions(selectedAssignment.assignment_id, {
                submissions,
            });
            // Refresh assignment list for updated count
            await fetchAssignments(Number(selectedCourseId));
            setCurrentView('assignment-list');
            setSelectedAssignment(null);
        } catch (err) {
            console.error('Failed to save submissions', err);
        } finally {
            setIsSavingSubmissions(false);
        }
    };

    // Back to course selection
    const handleBackToCourses = () => {
        setCurrentView('select-course');
        setSelectedCourseId('');
        setAssignments([]);
    };

    // Back to assignment list
    const handleBackToAssignments = () => {
        setCurrentView('assignment-list');
        setSelectedAssignment(null);
        setStudents([]);
        setSubmissionChanges({});
    };

    const selectedCourseName = courses.find(
        (c) => c.course_id.toString() === selectedCourseId
    );

    // ─── RENDER: Course Selection ────────────────────────────
    if (currentView === 'select-course') {
        return (
            <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${theme.primary}15` }}
                        >
                            <FileText className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold" style={{ color: theme.text }}>
                                Assignments
                            </CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Select a course to manage assignments
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: theme.text }}>
                            Select Course
                        </label>
                        <Select onValueChange={handleCourseSelect}>
                            <SelectTrigger className="h-12 rounded-xl" style={{ borderColor: theme.border }}>
                                <SelectValue placeholder="Choose a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.course_id} value={course.course_id.toString()}>
                                        {course.course_name} ({course.course_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ─── RENDER: Submissions View ───────────────────────────
    if (currentView === 'submissions' && selectedAssignment) {
        const submittedCount = Object.values(submissionChanges).filter(Boolean).length;

        return (
            <div className="space-y-6">
                <Button
                    variant="outline"
                    onClick={handleBackToAssignments}
                    className="flex items-center gap-2 rounded-xl"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Assignments
                </Button>

                <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: `${theme.secondary}15` }}
                                >
                                    <Users className="w-6 h-6" style={{ color: theme.secondary }} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold" style={{ color: theme.text }}>
                                        {selectedAssignment.title}
                                    </CardTitle>
                                    <p className="text-sm" style={{ color: theme.textMuted }}>
                                        {selectedAssignment.deadline
                                            ? `Deadline: ${format(new Date(selectedAssignment.deadline), 'PPP')}`
                                            : 'No deadline set'}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                className="px-4 py-2"
                                style={{ background: `${theme.success}20`, color: theme.success }}
                            >
                                {submittedCount}/{students.length} Submitted
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingSubmissions ? (
                            <div className="text-center py-12">
                                <p style={{ color: theme.textMuted }}>Loading students...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div
                                className="text-center py-12 rounded-xl"
                                style={{ background: `${theme.secondary}05` }}
                            >
                                <Users className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
                                <p style={{ color: theme.textMuted }}>No enrolled students found.</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="overflow-x-auto rounded-xl border"
                                    style={{ borderColor: theme.border }}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow style={{ background: `${theme.secondary}05` }}>
                                                <TableHead style={{ color: theme.text }}>Student Name</TableHead>
                                                <TableHead style={{ color: theme.text }}>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map((student) => (
                                                <TableRow key={student.student_id}>
                                                    <TableCell className="font-medium" style={{ color: theme.text }}>
                                                        {student.first_name} {student.last_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleSubmission(student.student_id)}
                                                            className="rounded-lg gap-2"
                                                            style={{
                                                                background: submissionChanges[student.student_id]
                                                                    ? `${theme.success}15`
                                                                    : `${theme.danger}10`,
                                                                borderColor: submissionChanges[student.student_id]
                                                                    ? theme.success
                                                                    : theme.danger,
                                                                color: submissionChanges[student.student_id]
                                                                    ? theme.success
                                                                    : theme.danger,
                                                            }}
                                                        >
                                                            {submissionChanges[student.student_id] ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    Submitted
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-4 h-4" />
                                                                    Not Submitted
                                                                </>
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Button
                                    onClick={handleSaveSubmissions}
                                    disabled={isSavingSubmissions}
                                    className="h-12 px-6 rounded-xl text-white font-medium"
                                    style={{ background: theme.gradient }}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSavingSubmissions ? 'Saving...' : 'Save Submissions'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ─── RENDER: Assignment List ────────────────────────────
    return (
        <div className="space-y-6">
            <Button
                variant="outline"
                onClick={handleBackToCourses}
                className="flex items-center gap-2 rounded-xl"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Course Selection
            </Button>

            {/* Create Assignment Form */}
            <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${theme.success}15` }}
                        >
                            <Plus className="w-6 h-6" style={{ color: theme.success }} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold" style={{ color: theme.text }}>
                                Create Assignment
                            </CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                {selectedCourseName
                                    ? `${selectedCourseName.course_name} (${selectedCourseName.course_code})`
                                    : ''}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium" style={{ color: theme.text }}>
                                Title
                            </label>
                            <Input
                                placeholder="e.g. Assignment 1 - Linked Lists"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="h-12 rounded-xl"
                                style={{ borderColor: theme.border }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateAssignment();
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" style={{ color: theme.text }}>
                                Deadline
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-48 h-12 justify-start text-left font-normal rounded-xl"
                                        style={{ borderColor: theme.border }}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" style={{ color: theme.primary }} />
                                        {newDeadline ? format(newDeadline, 'PP') : 'Pick date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={newDeadline}
                                        onSelect={setNewDeadline}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleCreateAssignment}
                                disabled={!newTitle.trim() || isCreating}
                                className="h-12 px-6 rounded-xl text-white font-medium"
                                style={{ background: theme.gradient }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {isCreating ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignment List */}
            <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${theme.primary}15` }}
                        >
                            <ClipboardList className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold" style={{ color: theme.text }}>
                                All Assignments
                            </CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} created
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingAssignments ? (
                        <div className="text-center py-12">
                            <p style={{ color: theme.textMuted }}>Loading assignments...</p>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div
                            className="text-center py-12 rounded-xl"
                            style={{ background: `${theme.primary}05` }}
                        >
                            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
                            <p style={{ color: theme.textMuted }}>
                                No assignments yet. Create one above!
                            </p>
                        </div>
                    ) : (
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
                                        <TableHead style={{ color: theme.text }}>Submissions</TableHead>
                                        <TableHead style={{ color: theme.text }}>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((assignment, index) => (
                                        <motion.tr
                                            key={assignment.assignment_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b transition-colors hover:bg-muted/50"
                                            style={{ borderColor: theme.border }}
                                        >
                                            <TableCell style={{ color: theme.textMuted }}>{index + 1}</TableCell>
                                            <TableCell className="font-medium" style={{ color: theme.text }}>
                                                {assignment.title}
                                            </TableCell>
                                            <TableCell style={{ color: theme.textMuted }}>
                                                {assignment.deadline
                                                    ? format(new Date(assignment.deadline), 'PP')
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className="px-3 py-1"
                                                    style={{
                                                        background:
                                                            assignment.total_submissions > 0
                                                                ? `${theme.success}20`
                                                                : `${theme.textMuted}15`,
                                                        color:
                                                            assignment.total_submissions > 0
                                                                ? theme.success
                                                                : theme.textMuted,
                                                    }}
                                                >
                                                    {assignment.total_submissions} submitted
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenSubmissions(assignment)}
                                                        className="rounded-lg"
                                                        style={{ borderColor: theme.primary, color: theme.primary }}
                                                    >
                                                        <Users className="w-4 h-4 mr-1" />
                                                        Submissions
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-lg"
                                                                style={{ borderColor: theme.danger, color: theme.danger }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{assignment.title}"? This will also remove all submission records. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteAssignment(assignment.assignment_id)}
                                                                    className="text-white"
                                                                    style={{ background: theme.danger }}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export { AssignmentSection };
export default AssignmentSection;

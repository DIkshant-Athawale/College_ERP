import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useCourses, useDepartments, useTeachers } from '@/hooks';
import { DataTable, Modal, FormInput, ConfirmDialog, FormSelect } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { validateCourseForm } from '@/utils/validation';
import type { Course, CreateCourseRequest } from '@/types';

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];

const SEMESTER_OPTIONS = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

const SUBJECT_TYPE_OPTIONS = [
  { value: 'core', label: 'Core' },
  { value: 'open', label: 'Open Elective' },
  { value: 'prof', label: 'Professional Elective' },
];

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  core: 'Core',
  open: 'Open Elective',
  prof: 'Professional Elective',
};

export const ManageCourses: React.FC = () => {
  const { theme } = useTheme();
  const { departments } = useDepartments();
  const { teachers, fetchTeachers } = useTeachers();
  const { courses, isLoading, fetchFilteredCourses, createCourses, editCourse, deleteCourse } = useCourses();

  const [filters, setFilters] = useState({
    department_id: '',
    year: '',
    semester: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    department_id: '',
    year: '',
    semester: '',
    teacher_id: '',
    subject_type: 'core',
  });

  const [bulkCourses, setBulkCourses] = useState<CreateCourseRequest[]>([
    { course_code: '', course_name: '', department_id: '', year: '', semester: '', teacher_id: '', subject_type: 'core' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTeachers();
    fetchFilteredCourses({
      department_id: filters.department_id || undefined,
      year: filters.year || undefined,
      semester: filters.semester || undefined,
    });
  }, [filters]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleDbChange = () => {
      fetchFilteredCourses({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        semester: filters.semester || undefined,
      });
    };
    socket.on('db_change', handleDbChange);
    return () => {
      socket.off('db_change', handleDbChange);
    };
  }, [socket, filters]);

  const departmentOptions = departments.map((d) => ({
    value: String(d.department_id),
    label: `${d.department_code} - ${d.department_name}`,
  }));

  const teacherOptions = teachers.map((t) => ({
    value: String(t.teacher_id),
    label: `${t.first_name} ${t.last_name} (${t.designation})`,
  }));

  const handleOpenCreate = () => {
    setSelectedCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      department_id: '',
      year: '',
      semester: '',
      teacher_id: '',
      subject_type: 'core',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenBulkCreate = () => {
    setBulkCourses([
      { course_code: '', course_name: '', department_id: '', year: '', semester: '', teacher_id: '', subject_type: 'core' },
    ]);
    setErrors({});
    setIsBulkModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      department_id: String(course.department_id),
      year: String(course.year),
      semester: String(course.semester),
      teacher_id: String(course.teacher_id),
      subject_type: course.subject_type || 'core',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (course: Course) => {
    setSelectedCourse(course);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCourseForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    let success;
    if (selectedCourse) {
      success = await editCourse(selectedCourse.course_id, formData);
    } else {
      success = await createCourses([formData]);
    }

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
      fetchFilteredCourses({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        semester: filters.semester || undefined,
      });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all courses
    let hasErrors = false;

    bulkCourses.forEach((course) => {
      const validationErrors = validateCourseForm(course as {
        course_code: string;
        course_name: string;
        department_id: string;
        year: string;
        semester: string;
        teacher_id: string;
      });
      if (Object.keys(validationErrors).length > 0) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors({ bulk: 'Please fill in all required fields for all courses' });
      return;
    }

    setIsSubmitting(true);
    const success = await createCourses(bulkCourses);
    setIsSubmitting(false);

    if (success) {
      setIsBulkModalOpen(false);
      fetchFilteredCourses({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        semester: filters.semester || undefined,
      });
    }
  };

  const addBulkRow = () => {
    setBulkCourses([...bulkCourses, { course_code: '', course_name: '', department_id: '', year: '', semester: '', teacher_id: '', subject_type: 'core' }]);
  };

  const removeBulkRow = (index: number) => {
    setBulkCourses(bulkCourses.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: keyof CreateCourseRequest, value: string) => {
    const updated = [...bulkCourses];
    updated[index] = { ...updated[index], [field]: value };
    setBulkCourses(updated);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    const success = await deleteCourse(selectedCourse.course_id);
    setIsSubmitting(false);

    if (success) {
      setIsConfirmOpen(false);
      setSelectedCourse(null);
      fetchFilteredCourses({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        semester: filters.semester || undefined,
      });
    }
  };

  const columns = [
    { key: 'course_code', header: 'Course Code', sortable: true },
    { key: 'course_name', header: 'Course Name', sortable: true },
    { key: 'department_name', header: 'Department', sortable: true },
    { key: 'year', header: 'Year', sortable: true },
    { key: 'semester', header: 'Semester', sortable: true },
    { key: 'teacher_name', header: 'Assigned Teacher', sortable: true },
    {
      key: 'subject_type',
      header: 'Type',
      sortable: true,
      render: (course: Course) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: course.subject_type === 'core' ? '#dbeafe' : course.subject_type === 'open' ? '#dcfce7' : '#fef3c7',
            color: course.subject_type === 'core' ? '#1d4ed8' : course.subject_type === 'open' ? '#15803d' : '#b45309',
          }}
        >
          {SUBJECT_TYPE_LABELS[course.subject_type] ?? course.subject_type}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (course: Course) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(course)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDelete(course)}
            className="rounded-lg text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
          Manage Courses
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <FormSelect
            label=""
            value={filters.department_id || 'all'}
            onChange={(value) => setFilters({ ...filters, department_id: value === 'all' ? '' : value })}
            options={[{ value: 'all', label: 'All Departments' }, ...departmentOptions]}
            placeholder="Filter by Department"
          />
          <FormSelect
            label=""
            value={filters.year || 'all'}
            onChange={(value) => setFilters({ ...filters, year: value === 'all' ? '' : value })}
            options={[{ value: 'all', label: 'All Years' }, ...YEAR_OPTIONS]}
            placeholder="Filter by Year"
          />
          <FormSelect
            label=""
            value={filters.semester || 'all'}
            onChange={(value) => setFilters({ ...filters, semester: value === 'all' ? '' : value })}
            options={[{ value: 'all', label: 'All Semesters' }, ...SEMESTER_OPTIONS]}
            placeholder="Filter by Semester"
          />
          <Button
            onClick={handleOpenBulkCreate}
            variant="outline"
            className="rounded-lg"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Bulk Create
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="rounded-lg text-white"
            style={{ background: theme.gradient }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      <DataTable
        data={courses}
        columns={columns}
        keyExtractor={(item) => item.course_id}
        searchable
        searchKeys={['course_code', 'course_name', 'department_name', 'teacher_name']}
        isLoading={isLoading}
        emptyMessage="No courses found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Create Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Course Code"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              error={errors.course_code}
              required
              placeholder="e.g., CS101"
            />
            <FormInput
              label="Course Name"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              error={errors.course_name}
              required
              placeholder="e.g., Introduction to Programming"
            />
          </div>
          <FormSelect
            label="Department"
            value={formData.department_id}
            onChange={(value) => setFormData({ ...formData, department_id: value })}
            options={departmentOptions}
            required
            error={errors.department_id}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Year"
              value={formData.year}
              onChange={(value) => setFormData({ ...formData, year: value })}
              options={YEAR_OPTIONS}
              required
              error={errors.year}
            />
            <FormSelect
              label="Semester"
              value={formData.semester}
              onChange={(value) => setFormData({ ...formData, semester: value })}
              options={SEMESTER_OPTIONS}
              required
              error={errors.semester}
            />
          </div>
          <FormSelect
            label="Assigned Teacher"
            value={formData.teacher_id}
            onChange={(value) => setFormData({ ...formData, teacher_id: value })}
            options={teacherOptions}
            required
            error={errors.teacher_id}
          />
          <FormSelect
            label="Subject Type"
            value={formData.subject_type}
            onChange={(value) => setFormData({ ...formData, subject_type: value })}
            options={SUBJECT_TYPE_OPTIONS}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white"
              style={{ background: theme.gradient }}
            >
              {isSubmitting ? 'Saving...' : selectedCourse ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Create Courses"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {errors.bulk && (
            <p className="text-sm text-red-500">{errors.bulk}</p>
          )}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {bulkCourses.map((course, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: theme.text }}>Course {index + 1}</span>
                  {bulkCourses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBulkRow(index)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Course Code"
                    value={course.course_code}
                    onChange={(e) => updateBulkRow(index, 'course_code', e.target.value)}
                  />
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Course Name"
                    value={course.course_name}
                    onChange={(e) => updateBulkRow(index, 'course_name', e.target.value)}
                  />
                  <FormSelect
                    label=""
                    value={String(course.department_id)}
                    onChange={(value) => updateBulkRow(index, 'department_id', value)}
                    options={departmentOptions}
                    placeholder="Select Department"
                  />
                  <FormSelect
                    label=""
                    value={String(course.teacher_id)}
                    onChange={(value) => updateBulkRow(index, 'teacher_id', value)}
                    options={teacherOptions}
                    placeholder="Select Teacher"
                  />
                  <FormSelect
                    label=""
                    value={String(course.year)}
                    onChange={(value) => updateBulkRow(index, 'year', value)}
                    options={YEAR_OPTIONS}
                    placeholder="Select Year"
                  />
                  <FormSelect
                    label=""
                    value={String(course.semester)}
                    onChange={(value) => updateBulkRow(index, 'semester', value)}
                    options={SEMESTER_OPTIONS}
                    placeholder="Select Semester"
                  />
                  <FormSelect
                    label=""
                    value={String(course.subject_type ?? 'core')}
                    onChange={(value) => updateBulkRow(index, 'subject_type', value)}
                    options={SUBJECT_TYPE_OPTIONS}
                    placeholder="Subject Type"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addBulkRow}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Course
          </Button>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white"
              style={{ background: theme.gradient }}
            >
              {isSubmitting ? 'Creating...' : `Create ${bulkCourses.length} Courses`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete the course "${selectedCourse?.course_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default ManageCourses;

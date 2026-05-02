import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useStudents, useDepartments } from '@/hooks';
import { DataTable, Modal, FormInput, ConfirmDialog, FormSelect, BulkCreateStudents } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { validateStudentForm } from '@/utils/validation';
import type { Student } from '@/types';

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

export const ManageStudents: React.FC = () => {
  const { theme } = useTheme();
  const { departments } = useDepartments();
  const { students, isLoading, fetchFilteredStudents, createStudent, bulkCreateStudents, editStudent, deleteStudent } = useStudents();

  const [filters, setFilters] = useState({
    department_id: '',
    year: '',
    academic_year: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    DOB: '',
    year: '',
    semester: '',
    email: '',
    primary_phone: '',
    alternate_phone: '',
    department_id: '',
    password: '',
    academic_year: '',
  });



  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFilteredStudents({
      department_id: filters.department_id || undefined,
      year: filters.year || undefined,
      academic_year: filters.academic_year || undefined,
    });
  }, [filters]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleDbChange = () => {
      fetchFilteredStudents({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        academic_year: filters.academic_year || undefined,
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

  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      DOB: '',
      year: '',
      semester: '',
      email: '',
      primary_phone: '',
      alternate_phone: '',
      department_id: '',
      password: '',
      academic_year: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      middle_name: student.middle_name || '',
      last_name: student.last_name,
      DOB: student.DOB ? new Date(student.DOB).toISOString().split('T')[0] : '',
      year: String(student.year),
      semester: String(student.semester),
      email: student.email,
      primary_phone: student.primary_phone,
      alternate_phone: student.alternate_phone || '',
      department_id: String(student.department_id),
      password: '',
      academic_year: student.academic_year,
    });

    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateStudentForm(formData, !!selectedStudent);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    let success;
    if (selectedStudent) {
      const { password, year, semester, academic_year, ...updateData } = formData;
      success = await editStudent(selectedStudent.student_id, updateData);
    } else {
      success = await createStudent(formData);
    }

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
      fetchFilteredStudents({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        academic_year: filters.academic_year || undefined,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    const success = await deleteStudent(selectedStudent.student_id);
    setIsSubmitting(false);

    if (success) {
      setIsConfirmOpen(false);
      setSelectedStudent(null);
      fetchFilteredStudents({
        department_id: filters.department_id || undefined,
        year: filters.year || undefined,
        academic_year: filters.academic_year || undefined,
      });
    }
  };



  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (student: Student) => `${student.first_name} ${student.last_name}`,
      sortable: true,
    },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'primary_phone', header: 'Primary Phone', sortable: true },
    {
      key: 'department',
      header: 'Department',
      render: (student: Student) => {
        const dept = departments.find((d) => d.department_id === student.department_id);
        return dept ? dept.department_code : '-';
      },
    },
    { key: 'year', header: 'Year', sortable: true },
    { key: 'semester', header: 'Semester', sortable: true },
    { key: 'academic_year', header: 'Academic Year', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (student: Student) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(student)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDelete(student)}
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
          Manage Students
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
          <FormInput
            label=""
            placeholder="Academic Year (e.g., 2024-2025)"
            value={filters.academic_year}
            onChange={(e) => setFilters({ ...filters, academic_year: e.target.value })}
            className="w-48"
          />
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="rounded-lg gap-2"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            <Users className="w-4 h-4" />
            Bulk Create
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="rounded-lg text-white"
            style={{ background: theme.gradient }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Student
          </Button>
        </div>
      </div>

      <DataTable
        data={students}
        columns={columns}
        keyExtractor={(item) => item.student_id}
        searchable
        searchKeys={['first_name', 'last_name', 'email', 'academic_year']}
        isLoading={isLoading}
        emptyMessage="No students found"
        scrollable
        maxHeight="65vh"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStudent ? 'Edit Student' : 'Create Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              error={errors.first_name}
              required
            />
            <FormInput
              label="Middle Name"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            />
            <FormInput
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              error={errors.last_name}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
            {!selectedStudent && (
              <FormInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Primary Phone"
              value={formData.primary_phone}
              onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
              error={errors.primary_phone}
              required
            />
            <FormInput
              label="Alternate Phone"
              value={formData.alternate_phone}
              onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              error={errors.alternate_phone}
            />
          </div>
          {!selectedStudent && (
            <>
              <FormSelect
                label="Department"
                value={formData.department_id}
                onChange={(value) => setFormData({ ...formData, department_id: value })}
                options={departmentOptions}
                required
                error={errors.department_id}
              />
              <div className="grid grid-cols-3 gap-4">
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
                <FormInput
                  label="Academic Year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  error={errors.academic_year}
                  required
                  placeholder="e.g., 2024-2025"
                />
              </div>


            </>
          )}
          <FormInput
            label="Date of Birth"
            type="date"
            value={formData.DOB}
            onChange={(e) => setFormData({ ...formData, DOB: e.target.value })}
            error={errors.DOB}
            required={false}
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
              {isSubmitting ? 'Saving...' : selectedStudent ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete the student "${selectedStudent?.first_name} ${selectedStudent?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />

      {/* Bulk Create Modal */}
      <BulkCreateStudents
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        departments={departments}
        onBulkCreate={bulkCreateStudents}
      />

    </div >
  );
};

export default ManageStudents;

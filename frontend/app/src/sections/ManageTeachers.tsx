import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTeachers, useDepartments } from '@/hooks';
import { DataTable, Modal, FormInput, ConfirmDialog, FormSelect } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { Input } from '@/components/ui/input';
import { validateTeacherForm } from '@/utils/validation';
import type { Teacher, CreateTeacherRequest } from '@/types';

export const ManageTeachers: React.FC = () => {
  const { theme } = useTheme();
  const { departments } = useDepartments();
  const { teachers, isLoading, fetchTeachersByDepartment, createTeachers, editTeacher, deleteTeacher } = useTeachers();

  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    primary_phone: '',
    alternate_phone: '',
    department_id: '',
    designation: '',
    password: '',
  });

  const [bulkTeachers, setBulkTeachers] = useState<CreateTeacherRequest[]>([
    { first_name: '', last_name: '', email: '', primary_phone: '', alternate_phone: '', department_id: '', designation: '', password: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedDepartment) {
      fetchTeachersByDepartment(selectedDepartment);
    } else {
      fetchTeachersByDepartment('');
    }
  }, [selectedDepartment]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleDbChange = () => {
      fetchTeachersByDepartment(selectedDepartment || '');
    };
    socket.on('db_change', handleDbChange);
    return () => {
      socket.off('db_change', handleDbChange);
    };
  }, [socket, selectedDepartment]);

  const departmentOptions = departments.map((d) => ({
    value: String(d.department_id),
    label: `${d.department_code} - ${d.department_name}`,
  }));

  const handleOpenCreate = () => {
    setSelectedTeacher(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      primary_phone: '',
      alternate_phone: '',
      department_id: '',
      designation: '',
      password: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenBulkCreate = () => {
    setBulkTeachers([
      { first_name: '', last_name: '', email: '', primary_phone: '', alternate_phone: '', department_id: '', designation: '', password: '' },
    ]);
    setErrors({});
    setIsBulkModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      primary_phone: teacher.primary_phone,
      alternate_phone: teacher.alternate_phone || '',
      department_id: String(teacher.department_id),
      designation: teacher.designation,
      password: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTeacherForm(formData, !!selectedTeacher);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    let success;
    if (selectedTeacher) {
      const { password, ...updateData } = formData;
      success = await editTeacher(selectedTeacher.teacher_id, updateData);
    } else {
      success = await createTeachers([formData]);
    }

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all teachers
    const allErrors: Record<string, string>[] = [];
    let hasErrors = false;

    bulkTeachers.forEach((teacher, index) => {
      const validationErrors = validateTeacherForm(teacher as {
        first_name: string;
        last_name: string;
        email: string;
        primary_phone: string;
        department_id: string;
        designation: string;
        password: string;
      });
      allErrors[index] = validationErrors;
      if (Object.keys(validationErrors).length > 0) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors({ bulk: 'Please fix validation errors in all rows' });
      return;
    }

    setIsSubmitting(true);
    const success = await createTeachers(bulkTeachers);
    setIsSubmitting(false);

    if (success) {
      setIsBulkModalOpen(false);
    }
  };

  const addBulkRow = () => {
    setBulkTeachers([...bulkTeachers, { first_name: '', last_name: '', email: '', primary_phone: '', alternate_phone: '', department_id: '', designation: '', password: '' }]);
  };

  const removeBulkRow = (index: number) => {
    setBulkTeachers(bulkTeachers.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: keyof CreateTeacherRequest, value: string) => {
    const updated = [...bulkTeachers];
    updated[index] = { ...updated[index], [field]: value };
    setBulkTeachers(updated);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    setIsSubmitting(true);
    const success = await deleteTeacher(selectedTeacher.teacher_id);
    setIsSubmitting(false);

    if (success) {
      setIsConfirmOpen(false);
      setSelectedTeacher(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (teacher: Teacher) => `${teacher.first_name} ${teacher.last_name}`,
      sortable: true,
    },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'primary_phone', header: 'Primary Phone', sortable: true },
    { key: 'designation', header: 'Designation', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    {
      key: 'department',
      header: 'Department',
      render: (teacher: Teacher) => {
        const dept = departments.find((d) => d.department_id === teacher.department_id);
        return dept ? dept.department_code : '-';
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (teacher: Teacher) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(teacher)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDelete(teacher)}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
          Manage Teachers
        </h3>
        <div className="flex items-center gap-3">
          <FormSelect
            label=""
            value={selectedDepartment || 'all'}
            onChange={(val) => setSelectedDepartment(val === 'all' ? '' : val)}
            options={[{ value: 'all', label: 'All Departments' }, ...departmentOptions]}
            placeholder="Filter by Department"
          />
          <Button
            onClick={handleOpenBulkCreate}
            variant="outline"
            className="rounded-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Bulk Create
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="rounded-lg text-white"
            style={{ background: theme.gradient }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Teacher
          </Button>
        </div>
      </div>

      <DataTable
        data={teachers}
        columns={columns}
        keyExtractor={(item) => item.teacher_id}
        searchable
        searchKeys={['first_name', 'last_name', 'email', 'designation']}
        isLoading={isLoading}
        emptyMessage="No teachers found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTeacher ? 'Edit Teacher' : 'Create Teacher'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              error={errors.first_name}
              required
            />
            <FormInput
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              error={errors.last_name}
              required
            />
          </div>
          <FormInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
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
          <FormSelect
            label="Department"
            value={formData.department_id}
            onChange={(value) => setFormData({ ...formData, department_id: value })}
            options={departmentOptions}
            required
            error={errors.department_id}
          />
          <FormInput
            label="Designation"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            error={errors.designation}
            required
            placeholder="e.g., Assistant Professor"
          />
          {!selectedTeacher && (
            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />
          )}
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
              {isSubmitting ? 'Saving...' : selectedTeacher ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Create Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Create Teachers"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {errors.bulk && (
            <p className="text-sm text-red-500">{errors.bulk}</p>
          )}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {bulkTeachers.map((teacher, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3" style={{ borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: theme.text }}>Teacher {index + 1}</span>
                  {bulkTeachers.length > 1 && (
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
                  <Input
                    placeholder="First Name"
                    value={teacher.first_name}
                    onChange={(e) => updateBulkRow(index, 'first_name', e.target.value)}
                  />
                  <Input
                    placeholder="Last Name"
                    value={teacher.last_name}
                    onChange={(e) => updateBulkRow(index, 'last_name', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={teacher.email}
                    onChange={(e) => updateBulkRow(index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="Primary Phone"
                    value={teacher.primary_phone}
                    onChange={(e) => updateBulkRow(index, 'primary_phone', e.target.value)}
                  />
                  <FormSelect
                    label=""
                    value={String(teacher.department_id)}
                    onChange={(value) => updateBulkRow(index, 'department_id', value)}
                    options={departmentOptions}
                    placeholder="Select Department"
                  />
                  <Input
                    placeholder="Designation"
                    value={teacher.designation}
                    onChange={(e) => updateBulkRow(index, 'designation', e.target.value)}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={teacher.password}
                    onChange={(e) => updateBulkRow(index, 'password', e.target.value)}
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
            Add Another Teacher
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
              {isSubmitting ? 'Creating...' : `Create ${bulkTeachers.length} Teachers`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete the teacher "${selectedTeacher?.first_name} ${selectedTeacher?.last_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default ManageTeachers;

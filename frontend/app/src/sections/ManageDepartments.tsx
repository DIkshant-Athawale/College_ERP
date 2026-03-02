import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useDepartments } from '@/hooks';
import { DataTable, Modal, FormInput, ConfirmDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { validateDepartmentForm } from '@/utils/validation';
import type { Department } from '@/types';

export const ManageDepartments: React.FC = () => {
  const { theme } = useTheme();
  const { departments, isLoading, createDepartment, editDepartment, deleteDepartment } = useDepartments();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    department_code: '',
    department_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setSelectedDepartment(null);
    setFormData({ department_code: '', department_name: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      department_code: department.department_code,
      department_name: department.department_name,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateDepartmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    let success;
    if (selectedDepartment) {
      success = await editDepartment(selectedDepartment.department_id, formData);
    } else {
      success = await createDepartment(formData);
    }

    setIsSubmitting(false);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;
    
    setIsSubmitting(true);
    const success = await deleteDepartment(selectedDepartment.department_id);
    setIsSubmitting(false);
    
    if (success) {
      setIsConfirmOpen(false);
      setSelectedDepartment(null);
    }
  };

  const columns = [
    { key: 'department_code', header: 'Department Code', sortable: true },
    { key: 'department_name', header: 'Department Name', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (department: Department) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(department)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDelete(department)}
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
          Manage Departments
        </h3>
        <Button
          onClick={handleOpenCreate}
          className="rounded-lg text-white"
          style={{ background: theme.gradient }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Department
        </Button>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        keyExtractor={(item) => item.department_id}
        searchable
        searchKeys={['department_code', 'department_name']}
        isLoading={isLoading}
        emptyMessage="No departments found"
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDepartment ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Department Code"
            value={formData.department_code}
            onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
            error={errors.department_code}
            required
            placeholder="e.g., CSE"
          />
          <FormInput
            label="Department Name"
            value={formData.department_name}
            onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
            error={errors.department_name}
            required
            placeholder="e.g., Computer Science and Engineering"
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
              {isSubmitting ? 'Saving...' : selectedDepartment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        description={`Are you sure you want to delete the department "${selectedDepartment?.department_name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default ManageDepartments;

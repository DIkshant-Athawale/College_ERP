import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useStudents, useDepartments } from '@/hooks';
import { Modal, FormSelect, FormInput, DataTable, ConfirmDialog } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, UserX, UserCheck, Search } from 'lucide-react';
import type { Student } from '@/types';

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

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
];

export const StudentStatusManagement: React.FC = () => {
  const { theme } = useTheme();
  const { departments } = useDepartments();
  const { promoteStudents, reEnrollStudent, fetchFilteredStudents, markDetained, students, dcStudents, fetchDcStudents, isLoading } = useStudents();

  // Modal States
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isDetainOpen, setIsDetainOpen] = useState(false);
  const [isReEnrollOpen, setIsReEnrollOpen] = useState(false);

  // Confirmation States
  const [isPromoteConfirmOpen, setIsPromoteConfirmOpen] = useState(false);
  const [isDetainConfirmOpen, setIsDetainConfirmOpen] = useState(false);
  const [isReEnrollConfirmOpen, setIsReEnrollConfirmOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Data States
  const [promoteData, setPromoteData] = useState({
    department_id: '',
    semester: '',
    new_academic_year: '',
  });

  const [detainFilters, setDetainFilters] = useState({
    department_id: '',
    year: '',
    academic_year: '',
  });

  const [reEnrollFilters, setReEnrollFilters] = useState({
    department_id: '',
    semester: '',
  });

  const [actionData, setActionData] = useState({
    academic_year: '',
  });

  const departmentOptions = departments.map((d) => ({
    value: String(d.department_id),
    label: `${d.department_code} - ${d.department_name}`,
  }));

  // Handlers
  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteData.department_id || !promoteData.semester || !promoteData.new_academic_year) return;
    setIsPromoteOpen(false);
    setIsPromoteConfirmOpen(true);
  };

  const executePromote = async () => {
    setIsSubmitting(true);
    const success = await promoteStudents({
      department_id: promoteData.department_id,
      current_semester: promoteData.semester,
      new_academic_year: promoteData.new_academic_year,
    });
    setIsSubmitting(false);
    if (success) {
      setIsPromoteConfirmOpen(false);
      setPromoteData({ department_id: '', semester: '', new_academic_year: '' });
    }
  };

  const handleDetainSearch = () => {
    fetchFilteredStudents({
      department_id: detainFilters.department_id || undefined,
      year: detainFilters.year || undefined,
      academic_year: detainFilters.academic_year || undefined,
    });
  };

  const confirmDetain = (student: Student) => {
    setSelectedStudent(student);
    setActionData({ academic_year: student.academic_year }); // Default to current
    setIsDetainConfirmOpen(true);
  };

  const executeDetain = async () => {
    if (!selectedStudent || !actionData.academic_year) return;
    setIsSubmitting(true);
    const success = await markDetained(selectedStudent.student_id, {
      academic_year: actionData.academic_year
    });
    setIsSubmitting(false);
    if (success) {
      setIsDetainConfirmOpen(false);
      setSelectedStudent(null);
      handleDetainSearch(); // Refresh list
    }
  };

  const handleReEnrollSearch = () => {
    fetchDcStudents(
      reEnrollFilters.department_id || undefined,
      reEnrollFilters.semester || undefined
    );
  };

  const confirmReEnroll = (student: Student) => {
    setSelectedStudent(student);
    setIsReEnrollConfirmOpen(true);
  };

  const executeReEnroll = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    const success = await reEnrollStudent(selectedStudent.student_id);
    setIsSubmitting(false);
    if (success) {
      setIsReEnrollConfirmOpen(false);
      setSelectedStudent(null);
      handleReEnrollSearch(); // Refresh list
    }
  };


  return (
    <div className="space-y-8 p-4">
      <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
        Student Status Management
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cards */}
        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          style={{ background: theme.surface }}
          onClick={() => setIsPromoteOpen(true)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.success}15` }}>
                <TrendingUp className="w-6 h-6" style={{ color: theme.success }} />
              </div>
              <CardTitle className="text-lg font-bold" style={{ color: theme.text }}>Promote Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: theme.textMuted }}>Promote students to the next semester/academic year</p>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          style={{ background: theme.surface }}
          onClick={() => setIsDetainOpen(true)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.warning}15` }}>
                <UserX className="w-6 h-6" style={{ color: theme.warning }} />
              </div>
              <CardTitle className="text-lg font-bold" style={{ color: theme.text }}>Discontinue Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: theme.textMuted }}>Discontinue students for academic reasons</p>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          style={{ background: theme.surface }}
          onClick={() => setIsReEnrollOpen(true)}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.info}15` }}>
                <UserCheck className="w-6 h-6" style={{ color: theme.info }} />
              </div>
              <CardTitle className="text-lg font-bold" style={{ color: theme.text }}>Re-Enroll Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: theme.textMuted }}>Re-enroll discontinued students back to active status</p>
          </CardContent>
        </Card>
      </div>

      {/* Promote Modal */}
      <Modal isOpen={isPromoteOpen} onClose={() => setIsPromoteOpen(false)} title="Promote Students">
        <form onSubmit={handlePromoteSubmit} className="space-y-4">
          <FormSelect label="Department" value={promoteData.department_id} onChange={(v) => setPromoteData({ ...promoteData, department_id: v })} options={departmentOptions} required />
          <FormSelect label="Current Semester" value={promoteData.semester} onChange={(v) => setPromoteData({ ...promoteData, semester: v })} options={SEMESTER_OPTIONS} required />
          <FormInput label="New Academic Year" value={promoteData.new_academic_year} onChange={(e) => setPromoteData({ ...promoteData, new_academic_year: e.target.value })} required placeholder="e.g., 2026-2027" />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPromoteOpen(false)}>Cancel</Button>
            <Button type="submit" className="text-white" style={{ background: theme.success }}>Promote Students</Button>
          </div>
        </form>
      </Modal>

      {/* Promote Confirmation */}
      <ConfirmDialog
        isOpen={isPromoteConfirmOpen}
        onClose={() => setIsPromoteConfirmOpen(false)}
        onConfirm={executePromote}
        title="Confirm Promotion"
        description="Are you sure you want to promote these students? This action will update their semester and year."
        confirmText="Yes, Promote"
        isLoading={isSubmitting}
        variant="success"
      />

      {/* Detain Modal (Full Screen / Large) */}
      <Modal isOpen={isDetainOpen} onClose={() => setIsDetainOpen(false)} title="Discontinue Students" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 p-2">
            <FormSelect label="Department" value={detainFilters.department_id} onChange={(v) => setDetainFilters({ ...detainFilters, department_id: v })} options={departmentOptions} />
            <FormSelect label="Year" value={detainFilters.year} onChange={(v) => setDetainFilters({ ...detainFilters, year: v })} options={YEAR_OPTIONS} />
            <FormInput label="Academic Year" value={detainFilters.academic_year} onChange={(e) => setDetainFilters({ ...detainFilters, academic_year: e.target.value })} placeholder="e.g. 2025-2026" />
            <div className="flex items-end">
              <Button onClick={handleDetainSearch} className="w-full text-white" style={{ background: theme.primary }}>
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
            <DataTable
              data={students}
              isLoading={isLoading}
              keyExtractor={(s) => s.student_id}
              columns={[
                { key: 'first_name', header: 'Name', render: (s) => `${s.first_name} ${s.last_name}` },
                { key: 'email', header: 'Email' },
                { key: 'department_id', header: 'Dept', render: (s) => departments.find(d => d.department_id === s.department_id)?.department_code || '-' },
                { key: 'semester', header: 'Sem' },
                {
                  key: 'actions', header: 'Action', render: (s) => (
                    <Button size="sm" variant="destructive" onClick={() => confirmDetain(s)}>Discontinue</Button>
                  )
                }
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Detain Confirmation */}
      <ConfirmDialog
        isOpen={isDetainConfirmOpen}
        onClose={() => setIsDetainConfirmOpen(false)}
        onConfirm={executeDetain}
        title="Confirm Discontinuation"
        description={`Are you sure you want to discontinue ${selectedStudent?.first_name}?`}
        confirmText="Confirm Discontinue"
        isLoading={isSubmitting}
        variant="danger"
      >
        <div className="mt-4">
          <FormInput label="Confirm Academic Year" value={actionData.academic_year} onChange={(e) => setActionData({ ...actionData, academic_year: e.target.value })} />
        </div>
      </ConfirmDialog>

      {/* Re-Enroll Modal (Full Screen / Large) */}
      <Modal isOpen={isReEnrollOpen} onClose={() => setIsReEnrollOpen(false)} title="Re-Enroll Students" maxWidth="max-w-4xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 p-2">
            <FormSelect label="Department" value={reEnrollFilters.department_id} onChange={(v) => setReEnrollFilters({ ...reEnrollFilters, department_id: v })} options={departmentOptions} />
            <FormSelect label="Semester" value={reEnrollFilters.semester} onChange={(v) => setReEnrollFilters({ ...reEnrollFilters, semester: v })} options={SEMESTER_OPTIONS} />
            <div className="flex items-end">
              <Button onClick={handleReEnrollSearch} className="w-full text-white" style={{ background: theme.info }}>
                <Search className="w-4 h-4 mr-2" /> Search DC Students
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
            <DataTable
              data={dcStudents}
              isLoading={isLoading}
              keyExtractor={(s) => s.student_id}
              columns={[
                { key: 'first_name', header: 'Name', render: (s) => `${s.first_name} ${s.last_name}` },
                { key: 'email', header: 'Email' },
                { key: 'department_id', header: 'Dept', render: (s) => departments.find(d => d.department_id === s.department_id)?.department_code || '-' },
                { key: 'semester', header: 'Sem' },
                {
                  key: 'actions', header: 'Action', render: (s) => (
                    <Button size="sm" style={{ background: theme.info, color: 'white' }} onClick={() => confirmReEnroll(s)}>Re-Enroll</Button>
                  )
                }
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Re-Enroll Confirmation */}
      <ConfirmDialog
        isOpen={isReEnrollConfirmOpen}
        onClose={() => setIsReEnrollConfirmOpen(false)}
        onConfirm={executeReEnroll}
        title="Confirm Re-Enrollment"
        description={`Are you sure you want to re-enroll ${selectedStudent?.first_name}? They will be set to Active status.`}
        confirmText="Yes, Re-Enroll"
        isLoading={isSubmitting}
        variant="info"
      />

    </div>
  );
};

export default StudentStatusManagement;

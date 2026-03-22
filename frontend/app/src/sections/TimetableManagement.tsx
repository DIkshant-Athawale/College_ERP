import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTimetable, useDepartments, useCourses } from '@/hooks';
import { DataTable, Modal, FormInput, ConfirmDialog, FormSelect } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Clock, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import type { TimetableSlot, TimeSlot } from '@/types';

const DAY_OPTIONS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
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

export const TimetableManagement: React.FC = () => {
  const { theme } = useTheme();
  const { departments } = useDepartments();
  const { courses, fetchFilteredCourses } = useCourses();
  const {
    timetable,
    timeSlots,
    isLoading,
    fetchTimetable,
    fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    createTimetableSlot,
    editTimetableSlot,
    deleteTimetableSlot,
  } = useTimetable();

  const [filters, setFilters] = useState({
    department_id: '',
    semester: '',
  });

  // Timetable Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time Slots section
  const [isTimeSlotsExpanded, setIsTimeSlotsExpanded] = useState(false);
  const [isCreateTimeSlotOpen, setIsCreateTimeSlotOpen] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({ start_time: '', end_time: '' });
  const [isEditTimeSlotOpen, setIsEditTimeSlotOpen] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [editTimeSlotData, setEditTimeSlotData] = useState({ start_time: '', end_time: '' });
  const [isDeleteTimeSlotOpen, setIsDeleteTimeSlotOpen] = useState(false);
  const [deletingTimeSlot, setDeletingTimeSlot] = useState<TimeSlot | null>(null);

  const [formData, setFormData] = useState({
    department_id: '',
    semester: '',
    day: '',
    slot_id: '',
    course_id: '',
  });

  const [editFormData, setEditFormData] = useState({
    timetable_id: 0,
    department_id: '',
    semester: '',
    day: '',
    slot_id: '',
    course_id: '',
  });

  useEffect(() => {
    if (filters.department_id && filters.semester) {
      fetchTimetable({
        department_id: filters.department_id,
        semester: filters.semester,
      });
      fetchFilteredCourses({
        department_id: filters.department_id,
        semester: filters.semester,
      });
    }
  }, [filters]);

  // Load time slots on mount so they're available for the create dropdown
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Load time slots when section is expanded
  useEffect(() => {
    if (isTimeSlotsExpanded) {
      fetchTimeSlots();
    }
  }, [isTimeSlotsExpanded]);

  const departmentOptions = departments.map((d) => ({
    value: String(d.department_id),
    label: `${d.department_code} - ${d.department_name}`,
  }));

  const courseOptions = courses.map((c) => ({
    value: String(c.course_id),
    label: `${c.course_code} - ${c.course_name}`,
  }));

  const slotOptions = timeSlots.map((s) => ({
    value: String(s.slot_id),
    label: `Slot ${s.slot_id} (${s.start_time} - ${s.end_time})`,
  }));

  const handleOpenCreate = () => {
    setFormData({
      department_id: filters.department_id,
      semester: filters.semester,
      day: '',
      slot_id: '',
      course_id: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditTime = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setEditFormData({
      timetable_id: slot.timetable_id,
      department_id: filters.department_id,
      semester: filters.semester,
      day: slot.day,
      slot_id: String(slot.slot_id || ''),
      course_id: String(courses.find(c => c.course_code === slot.course_code)?.course_id || ''),
    });
    setIsEditTimeModalOpen(true);
  };

  const handleOpenDelete = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.department_id || !formData.semester || !formData.day || !formData.slot_id || !formData.course_id) {
      return;
    }

    setIsSubmitting(true);
    const success = await createTimetableSlot({
      department_id: formData.department_id,
      semester: formData.semester,
      day: formData.day,
      slot_id: formData.slot_id,
      course_id: formData.course_id,
    });
    setIsSubmitting(false);

    if (success) {
      setIsModalOpen(false);
      fetchTimetable({
        department_id: filters.department_id,
        semester: filters.semester,
      });
    }
  };

  const handleEditTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.timetable_id || !editFormData.day || !editFormData.slot_id) {
      return;
    }

    setIsSubmitting(true);
    const success = await editTimetableSlot({
      timetable_id: editFormData.timetable_id,
      day: editFormData.day,
      slot_id: editFormData.slot_id,
      course_id: editFormData.course_id,
    });
    setIsSubmitting(false);

    if (success) {
      setIsEditTimeModalOpen(false);
      fetchTimetable({
        department_id: filters.department_id,
        semester: filters.semester,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    const success = await deleteTimetableSlot(selectedSlot.timetable_id);
    setIsSubmitting(false);

    if (success) {
      setIsConfirmOpen(false);
      fetchTimetable({
        department_id: filters.department_id,
        semester: filters.semester,
      });
    }
  };

  const handleCreateTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeSlot.start_time || !newTimeSlot.end_time) return;

    setIsSubmitting(true);
    const success = await createTimeSlot(newTimeSlot);
    setIsSubmitting(false);

    if (success) {
      setIsCreateTimeSlotOpen(false);
      setNewTimeSlot({ start_time: '', end_time: '' });
    }
  };

  const handleOpenEditTimeSlot = (slot: TimeSlot) => {
    setEditingTimeSlot(slot);
    setEditTimeSlotData({ start_time: slot.start_time, end_time: slot.end_time });
    setIsEditTimeSlotOpen(true);
  };

  const handleEditTimeSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeSlot || !editTimeSlotData.start_time || !editTimeSlotData.end_time) return;

    setIsSubmitting(true);
    const success = await updateTimeSlot(editingTimeSlot.slot_id, {
      start_time: editTimeSlotData.start_time,
      end_time: editTimeSlotData.end_time,
    });
    setIsSubmitting(false);

    if (success) {
      setIsEditTimeSlotOpen(false);
      fetchTimeSlots();
    }
  };

  const columns = [
    { key: 'day', header: 'Day', sortable: true },
    { key: 'slot', header: 'Slot', sortable: true },
    { key: 'start_time', header: 'Start Time', sortable: true },
    { key: 'end_time', header: 'End Time', sortable: true },
    { key: 'course_code', header: 'Course Code', sortable: true },
    { key: 'course_name', header: 'Course Name', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (slot: TimetableSlot) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditTime(slot)}
            className="rounded-lg"
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenDelete(slot)}
            className="rounded-lg text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const timeSlotColumns = [
    { key: 'slot_id', header: 'Slot ID', sortable: true },
    { key: 'start_time', header: 'Start Time', sortable: true },
    { key: 'end_time', header: 'End Time', sortable: true },
    {
      key: 'actions',
      header: 'Actions',
      render: (slot: TimeSlot) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditTimeSlot(slot)}
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setDeletingTimeSlot(slot); setIsDeleteTimeSlotOpen(true); }}
            className="rounded-lg text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Timetable Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Timetable Management
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <FormSelect
              label=""
              value={filters.department_id}
              onChange={(value) => setFilters({ ...filters, department_id: value })}
              options={departmentOptions}
              placeholder="Select Department"
              required
            />
            <FormSelect
              label=""
              value={filters.semester}
              onChange={(value) => setFilters({ ...filters, semester: value })}
              options={SEMESTER_OPTIONS}
              placeholder="Select Semester"
              required
            />
            <Button
              onClick={handleOpenCreate}
              className="rounded-lg text-white"
              style={{ background: theme.gradient }}
              disabled={!filters.department_id || !filters.semester}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Timetable
            </Button>
          </div>
        </div>

        <DataTable
          data={timetable}
          columns={columns}
          keyExtractor={(item) => item.timetable_id}
          searchable
          searchKeys={['day', 'course_code', 'course_name']}
          isLoading={isLoading}
          emptyMessage={!filters.department_id || !filters.semester
            ? "Please select department and semester to view timetable"
            : "No timetable slots found"}
        />
      </div>

      {/* ── Time Slots Section ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: theme.border, background: theme.surface }}
      >
        <button
          onClick={() => setIsTimeSlotsExpanded(!isTimeSlotsExpanded)}
          className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:opacity-80"
          style={{ background: `${theme.info}08` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${theme.info}15` }}
            >
              <Clock className="w-5 h-5" style={{ color: theme.info }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: theme.text }}>
              Time Slots
            </span>
            <span className="text-sm" style={{ color: theme.textMuted }}>
              — View & manage time slot definitions
            </span>
          </div>
          {isTimeSlotsExpanded
            ? <ChevronUp className="w-5 h-5" style={{ color: theme.textMuted }} />
            : <ChevronDown className="w-5 h-5" style={{ color: theme.textMuted }} />
          }
        </button>

        {isTimeSlotsExpanded && (
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsCreateTimeSlotOpen(true)}
                className="rounded-lg text-white"
                style={{ background: theme.info }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </div>

            <DataTable
              data={timeSlots}
              columns={timeSlotColumns}
              keyExtractor={(item) => item.slot_id}
              isLoading={isLoading}
              emptyMessage="No time slots defined yet"
            />
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Create Timetable Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Timetable"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Day"
            value={formData.day}
            onChange={(value) => setFormData({ ...formData, day: value })}
            options={DAY_OPTIONS}
            required
          />
          <FormSelect
            label="Slot Number"
            value={formData.slot_id}
            onChange={(value) => setFormData({ ...formData, slot_id: value })}
            options={slotOptions}
            required
          />
          <FormSelect
            label="Course"
            value={formData.course_id}
            onChange={(value) => setFormData({ ...formData, course_id: value })}
            options={courseOptions}
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
              {isSubmitting ? 'Creating...' : 'Create Timetable'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Timetable Entry Modal */}
      <Modal
        isOpen={isEditTimeModalOpen}
        onClose={() => setIsEditTimeModalOpen(false)}
        title="Edit Timetable Entry"
      >
        <form onSubmit={handleEditTimeSubmit} className="space-y-4">
          <FormSelect
            label="Day"
            value={editFormData.day}
            onChange={(value) => setEditFormData({ ...editFormData, day: value })}
            options={DAY_OPTIONS}
            required
          />
          <FormSelect
            label="Slot Number"
            value={editFormData.slot_id}
            onChange={(value) => setEditFormData({ ...editFormData, slot_id: value })}
            options={slotOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditTimeModalOpen(false)}
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
              {isSubmitting ? 'Saving...' : 'Update Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Time Slot Modal */}
      <Modal
        isOpen={isCreateTimeSlotOpen}
        onClose={() => setIsCreateTimeSlotOpen(false)}
        title="Add Time Slot"
      >
        <form onSubmit={handleCreateTimeSlot} className="space-y-4">
          <FormInput
            label="Start Time"
            type="time"
            value={newTimeSlot.start_time}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start_time: e.target.value })}
            required
          />
          <FormInput
            label="End Time"
            type="time"
            value={newTimeSlot.end_time}
            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end_time: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateTimeSlotOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white"
              style={{ background: theme.info }}
            >
              {isSubmitting ? 'Creating...' : 'Create Time Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal
        isOpen={isEditTimeSlotOpen}
        onClose={() => setIsEditTimeSlotOpen(false)}
        title={`Edit Time Slot #${editingTimeSlot?.slot_id}`}
      >
        <form onSubmit={handleEditTimeSlotSubmit} className="space-y-4">
          <FormInput
            label="Start Time"
            type="time"
            value={editTimeSlotData.start_time}
            onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, start_time: e.target.value })}
            required
          />
          <FormInput
            label="End Time"
            type="time"
            value={editTimeSlotData.end_time}
            onChange={(e) => setEditTimeSlotData({ ...editTimeSlotData, end_time: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditTimeSlotOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white"
              style={{ background: theme.info }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Timetable Slot"
        description={`Are you sure you want to delete this timetable slot for "${selectedSlot?.course_name}" on ${selectedSlot?.day}? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />

      {/* Delete Time Slot Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteTimeSlotOpen}
        onClose={() => setIsDeleteTimeSlotOpen(false)}
        onConfirm={async () => {
          if (!deletingTimeSlot) return;
          setIsSubmitting(true);
          const success = await deleteTimeSlot(deletingTimeSlot.slot_id);
          setIsSubmitting(false);
          if (success) setIsDeleteTimeSlotOpen(false);
        }}
        title="Delete Time Slot"
        description={`Are you sure you want to delete Time Slot #${deletingTimeSlot?.slot_id} (${deletingTimeSlot?.start_time} - ${deletingTimeSlot?.end_time})? This cannot be undone if it's not referenced by any timetable entry.`}
        confirmText="Delete"
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
};

export default TimetableManagement;

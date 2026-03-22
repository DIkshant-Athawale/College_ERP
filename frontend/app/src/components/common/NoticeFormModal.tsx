import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Modal, FormInput } from '@/components';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Department, CreateNoticeRequest } from '@/types';

interface NoticeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateNoticeRequest) => Promise<void>;
    isLoading: boolean;
    departments?: Department[];
    role?: 'admin' | 'faculty';
}

export const NoticeFormModal: React.FC<NoticeFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    departments = [],
}) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [departmentId, setDepartmentId] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'teachers'>('all');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            title,
            message,
            department_id: departmentId ? Number(departmentId) : null,
            year: year ? Number(year) : null,
            target_audience: targetAudience,
        });
        setTitle('');
        setMessage('');
        setDepartmentId('');
        setYear('');
        setTargetAudience('all');
    };

    const selectStyle: React.CSSProperties = {
        background: theme.background,
        color: theme.text,
        borderColor: theme.border,
        width: '100%',
        padding: '8px 12px',
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        fontSize: '14px',
        outline: 'none',
    };

    const audienceOptions: { value: 'all' | 'students' | 'teachers'; label: string; emoji: string }[] = [
        { value: 'all', label: 'Everyone', emoji: '👥' },
        { value: 'students', label: 'Students Only', emoji: '🎓' },
        { value: 'teachers', label: 'Teachers Only', emoji: '👨‍🏫' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Post New Notice"
            description="Create a targeted notice for your institution."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Notice Title"
                    id="title"
                    required
                    placeholder="E.g., Holiday Announcement"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                />

                <div className="space-y-2">
                    <Label htmlFor="message" style={{ color: theme.text }}>
                        Message <span style={{ color: theme.danger }}>*</span>
                    </Label>
                    <textarea
                        id="message"
                        required
                        placeholder="Type your notice content here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-24 p-3 rounded-lg border transition-all duration-300 focus:ring-2 resize-none"
                        style={{
                            background: theme.background,
                            color: theme.text,
                            borderColor: theme.border,
                            '--tw-ring-color': theme.primary,
                        } as React.CSSProperties}
                    />
                </div>

                {/* Targeting Options */}
                <div
                    className="p-4 rounded-xl space-y-4"
                    style={{ background: `${theme.primary}08`, border: `1px solid ${theme.border}` }}
                >
                    <p className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.text }}>
                        🎯 Target Audience
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Department */}
                        <div className="space-y-1">
                            <Label htmlFor="dept" className="text-xs" style={{ color: theme.textMuted }}>
                                Department
                            </Label>
                            <select
                                id="dept"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">All Departments</option>
                                {departments.map((d) => (
                                    <option key={d.department_id} value={d.department_id}>
                                        {d.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="space-y-1">
                            <Label htmlFor="year" className="text-xs" style={{ color: theme.textMuted }}>
                                Year
                            </Label>
                            <select
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">All Years</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Audience Radio Buttons */}
                    <div className="space-y-1">
                        <Label className="text-xs" style={{ color: theme.textMuted }}>
                            Send To
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                            {audienceOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setTargetAudience(opt.value)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    style={{
                                        background: targetAudience === opt.value ? theme.primary : `${theme.primary}10`,
                                        color: targetAudience === opt.value ? '#fff' : theme.text,
                                        border: `1px solid ${targetAudience === opt.value ? theme.primary : theme.border}`,
                                    }}
                                >
                                    <span>{opt.emoji}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            borderColor: theme.border,
                            color: theme.text,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !title.trim() || !message.trim()}
                        style={{
                            background: theme.primary,
                            color: '#fff',
                        }}
                        className="hover:opacity-90"
                    >
                        {isLoading ? 'Posting...' : 'Post Notice'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

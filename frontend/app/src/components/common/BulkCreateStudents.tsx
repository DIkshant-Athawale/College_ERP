import React, { useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Modal } from '@/components/common';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/common';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Info,
} from 'lucide-react';
import type { Department, CreateStudentRequest, BulkCreateStudentsResponse } from '@/types';

interface BulkCreateStudentsProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onBulkCreate: (students: CreateStudentRequest[]) => Promise<BulkCreateStudentsResponse | null>;
}

interface ParsedStudent extends CreateStudentRequest {
  _rowNum: number;
  _valid: boolean;
  _error?: string;
}

const CSV_HEADERS = [
  'first_name',
  'middle_name',
  'last_name',
  'email',
  'password',
  'DOB',
  'primary_phone',
  'alternate_phone',
  'department_id',
  'year',
  'semester',
  'academic_year',
];

const TEMPLATE_CSV = CSV_HEADERS.join(',') + '\nJohn,,Doe,john@example.com,Pass1234,2003-05-15,9876543210,,1,1,1,2025-2026\nJane,M,Smith,jane@example.com,Pass5678,2002-08-20,9876543211,,1,1,1,2025-2026';

export const BulkCreateStudents: React.FC<BulkCreateStudentsProps> = ({
  isOpen,
  onClose,
  departments,
  onBulkCreate,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkCreateStudentsResponse | null>(null);
  const [stage, setStage] = useState<'upload' | 'preview' | 'result'>('upload');
  const [defaultDeptId, setDefaultDeptId] = useState<string>('');

  const departmentOptions = departments.map((d) => ({
    value: String(d.department_id),
    label: `${d.department_code} - ${d.department_name}`,
  }));

  const resetState = () => {
    setParsedStudents([]);
    setFileName('');
    setIsUploading(false);
    setResult(null);
    setStage('upload');
    setDefaultDeptId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_import_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current = '';
    let inQuotes = false;
    let row: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(current.trim());
          current = '';
        } else if (char === '\n' || (char === '\r' && next === '\n')) {
          row.push(current.trim());
          if (row.some((cell) => cell !== '')) rows.push(row);
          row = [];
          current = '';
          if (char === '\r') i++;
        } else {
          current += char;
        }
      }
    }
    // Last row
    row.push(current.trim());
    if (row.some((cell) => cell !== '')) rows.push(row);

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length < 2) {
        alert('CSV file must have at least 1 data row (header + data)');
        return;
      }

      // Normalize header row
      const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, '_'));
      const dataRows = rows.slice(1);

      const students: ParsedStudent[] = dataRows.map((row, idx) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });

        // Use default dept if not specified in CSV
        const deptId = obj.department_id || defaultDeptId;

        const student: ParsedStudent = {
          first_name: obj.first_name || '',
          middle_name: obj.middle_name || '',
          last_name: obj.last_name || '',
          email: obj.email || '',
          password: obj.password || '',
          DOB: obj.dob || obj.DOB || '',
          primary_phone: obj.primary_phone || '',
          alternate_phone: obj.alternate_phone || '',
          department_id: deptId,
          year: obj.year || '',
          semester: obj.semester || '',
          academic_year: obj.academic_year || '',
          _rowNum: idx + 2,
          _valid: true,
        };

        // Quick client-side validation
        const missing: string[] = [];
        if (!student.first_name) missing.push('first_name');
        if (!student.last_name) missing.push('last_name');
        if (!student.email) missing.push('email');
        if (!student.password) missing.push('password');
        if (!student.primary_phone) missing.push('primary_phone');
        if (!student.department_id) missing.push('department_id');
        if (!student.year) missing.push('year');
        if (!student.semester) missing.push('semester');
        if (!student.academic_year) missing.push('academic_year');

        if (missing.length > 0) {
          student._valid = false;
          student._error = `Missing: ${missing.join(', ')}`;
        }

        return student;
      });

      setParsedStudents(students);
      setStage('preview');
    };

    reader.readAsText(file);
  };

  const removeRow = (rowNum: number) => {
    setParsedStudents((prev) => prev.filter((s) => s._rowNum !== rowNum));
  };

  const handleSubmit = async () => {
    const validStudents = parsedStudents.filter((s) => s._valid);
    if (validStudents.length === 0) {
      alert('No valid students to import');
      return;
    }

    setIsUploading(true);

    // Strip internal fields before sending
    const payload: CreateStudentRequest[] = validStudents.map(({ _rowNum, _valid, _error, ...rest }) => rest);

    const res = await onBulkCreate(payload);
    setResult(res);
    setStage('result');
    setIsUploading(false);
  };

  const validCount = parsedStudents.filter((s) => s._valid).length;
  const invalidCount = parsedStudents.filter((s) => !s._valid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Create Students"
      description="Import multiple students from a CSV file"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {/* STAGE: UPLOAD */}
        {stage === 'upload' && (
          <div className="space-y-5">
            {/* Info Banner */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: `${theme.info}12`, border: `1px solid ${theme.info}30` }}
            >
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: theme.info }} />
              <div className="text-sm space-y-1" style={{ color: theme.text }}>
                <p className="font-medium">CSV Format Requirements:</p>
                <p style={{ color: theme.textMuted }}>
                  The CSV file must have headers matching:{' '}
                  <code className="text-xs px-1 py-0.5 rounded" style={{ background: `${theme.border}80` }}>
                    first_name, middle_name, last_name, email, password, DOB, primary_phone, alternate_phone, department_id, year, semester, academic_year
                  </code>
                </p>
                <p style={{ color: theme.textMuted }}>
                  Download the template below for the exact format.
                </p>
              </div>
            </div>

            {/* Optional Default Department */}
            <FormSelect
              label="Default Department (applies to rows without department_id)"
              value={defaultDeptId || 'none'}
              onChange={(v) => setDefaultDeptId(v === 'none' ? '' : v)}
              options={[{ value: 'none', label: 'No Default' }, ...departmentOptions]}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl gap-2 transition-all hover:scale-[1.02]"
                style={{ borderColor: theme.border }}
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>

              <Button
                className="flex-1 h-12 rounded-xl gap-2 text-white transition-all hover:scale-[1.02]"
                style={{ background: theme.gradient }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload CSV File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-opacity-80"
              style={{ borderColor: `${theme.primary}40` }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.background = `${theme.primary}08`;
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = `${theme.primary}40`;
                e.currentTarget.style.background = 'transparent';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = `${theme.primary}40`;
                e.currentTarget.style.background = 'transparent';
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith('.csv')) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  if (fileInputRef.current) {
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }
              }}
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: theme.primary }} />
              <p className="text-sm font-medium" style={{ color: theme.text }}>
                Drag & drop your CSV file here
              </p>
              <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                or click to browse
              </p>
            </div>
          </div>
        )}

        {/* STAGE: PREVIEW */}
        {stage === 'preview' && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" style={{ color: theme.primary }} />
                <span className="font-medium text-sm" style={{ color: theme.text }}>
                  {fileName}
                </span>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={resetState}>
                Change File
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: `${theme.info}12` }}
              >
                <p className="text-2xl font-bold" style={{ color: theme.info }}>
                  {parsedStudents.length}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Total Rows
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: `${theme.success}12` }}
              >
                <p className="text-2xl font-bold" style={{ color: theme.success }}>
                  {validCount}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Valid
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: `${theme.danger}12` }}
              >
                <p className="text-2xl font-bold" style={{ color: theme.danger }}>
                  {invalidCount}
                </p>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Invalid
                </p>
              </div>
            </div>

            {/* Preview Table */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: theme.border }}
            >
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: `${theme.primary}08` }}>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Row
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Email
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Dept
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Year
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Sem
                      </th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedStudents.map((student) => {
                      const dept = departments.find(
                        (d) => String(d.department_id) === String(student.department_id)
                      );
                      return (
                        <tr
                          key={student._rowNum}
                          className="border-t transition-colors"
                          style={{
                            borderColor: theme.border,
                            background: student._valid ? 'transparent' : `${theme.danger}06`,
                          }}
                        >
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {student._rowNum}
                          </td>
                          <td className="px-3 py-2">
                            {student._valid ? (
                              <CheckCircle2 className="w-4 h-4" style={{ color: theme.success }} />
                            ) : (
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: theme.danger }} />
                                <span className="text-xs" style={{ color: theme.danger }}>
                                  {student._error}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium" style={{ color: theme.text }}>
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {student.email}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {dept?.department_code || student.department_id || '-'}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {student.year}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {student.semester}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeRow(student._rowNum)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" style={{ color: theme.danger }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {invalidCount > 0 && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{ background: `${theme.warning}12`, color: theme.warning }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {invalidCount} row(s) have errors and will be skipped during import.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || validCount === 0}
                className="rounded-lg text-white gap-2"
                style={{ background: theme.gradient }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {validCount} Student{validCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STAGE: RESULT */}
        {stage === 'result' && result && (
          <div className="space-y-4">
            {/* Summary */}
            <div
              className="text-center p-6 rounded-xl"
              style={{
                background:
                  result.failed_count === 0
                    ? `${theme.success}10`
                    : result.created === 0
                    ? `${theme.danger}10`
                    : `${theme.warning}10`,
              }}
            >
              {result.failed_count === 0 ? (
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: theme.success }} />
              ) : result.created === 0 ? (
                <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: theme.danger }} />
              ) : (
                <AlertTriangle className="w-12 h-12 mx-auto mb-3" style={{ color: theme.warning }} />
              )}
              <h3 className="text-xl font-bold mb-1" style={{ color: theme.text }}>
                {result.message}
              </h3>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                {result.created} of {result.total} students were created successfully
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl text-center" style={{ background: `${theme.success}12` }}>
                <p className="text-3xl font-bold" style={{ color: theme.success }}>
                  {result.created}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  Successfully Created
                </p>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: `${theme.danger}12` }}>
                <p className="text-3xl font-bold" style={{ color: theme.danger }}>
                  {result.failed_count}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                  Failed
                </p>
              </div>
            </div>

            {/* Failed Details */}
            {result.failed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm" style={{ color: theme.text }}>
                  Failed Rows:
                </h4>
                <div
                  className="rounded-xl border overflow-hidden max-h-[200px] overflow-y-auto"
                  style={{ borderColor: theme.border }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: `${theme.danger}08` }}>
                        <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                          Row
                        </th>
                        <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                          Email
                        </th>
                        <th className="px-3 py-2 text-left font-medium" style={{ color: theme.textMuted }}>
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.failed.map((fail, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: theme.border }}>
                          <td className="px-3 py-2" style={{ color: theme.textMuted }}>
                            {fail.row}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.text }}>
                            {fail.email}
                          </td>
                          <td className="px-3 py-2" style={{ color: theme.danger }}>
                            {fail.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Done Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleClose}
                className="rounded-lg text-white"
                style={{ background: theme.gradient }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkCreateStudents;

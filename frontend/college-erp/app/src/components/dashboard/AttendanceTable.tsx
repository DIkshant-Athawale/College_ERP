import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import type { AttendanceBySubject, OverallAttendance } from '@/types';

interface AttendanceTableProps {
  attendanceBySubject: AttendanceBySubject[];
  overallAttendance: OverallAttendance;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendanceBySubject,
  overallAttendance,
}) => {
  const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 85) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Attendance Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-gray-900">Overall Attendance</span>
            </div>
            <Badge 
              className={`${getAttendanceColor(overallAttendance.percentage)} border-0 text-sm font-bold`}
            >
              {overallAttendance.percentage.toFixed(2)}%
            </Badge>
          </div>
          <Progress 
            value={overallAttendance.percentage} 
            className="h-3"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Present: {overallAttendance.present_classes} classes</span>
            <span>Total: {overallAttendance.total_classes} classes</span>
          </div>
        </div>

        {/* Subject-wise Attendance Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Subject</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceBySubject.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                    No attendance data available
                  </TableCell>
                </TableRow>
              ) : (
                attendanceBySubject.map((subject, index) => {
                  const percentage = (subject.present_classes / subject.total_classes) * 100;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-sm">
                        {subject.course_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.present_classes}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.total_classes}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-semibold ${
                            percentage >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {percentage >= 75 ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Good
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Low
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;

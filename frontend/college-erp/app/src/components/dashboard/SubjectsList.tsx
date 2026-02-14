import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Hash } from 'lucide-react';
import type { Subject } from '@/types';

interface SubjectsListProps {
  subjects: Subject[];
}

export const SubjectsList: React.FC<SubjectsListProps> = ({ subjects }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Enrolled Subjects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subjects.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No subjects enrolled</p>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.course_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {subject.course_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Course Code: {subject.course_code}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2 shrink-0">
                  ID: {subject.course_id}
                </Badge>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Total Subjects: <span className="font-semibold text-gray-700">{subjects.length}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectsList;

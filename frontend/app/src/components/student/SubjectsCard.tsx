import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardSubject } from '@/types';

interface SubjectsCardProps {
    subjects: DashboardSubject[];
}

export const SubjectsCard: React.FC<SubjectsCardProps> = ({ subjects }) => {
    const { theme } = useTheme();

    return (
        <Card className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${theme.primary}15` }}>
                            <BookOpen className="w-6 h-6" style={{ color: theme.primary }} />
                        </div>
                        <div>
                            <CardTitle style={{ color: theme.text }}>Enrolled Subjects</CardTitle>
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Current semester courses
                            </p>
                        </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: theme.primary }}>
                        {subjects.length}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {subjects.length === 0 ? (
                    <p className="text-sm" style={{ color: theme.textMuted }}>No subjects enrolled.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subject, index) => (
                            <motion.div
                                key={subject.course_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-xl border group cursor-pointer transition-all hover:shadow-md"
                                style={{
                                    borderColor: theme.border,
                                    background: `${theme.primary}05`
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono px-2 py-1 rounded bg-white/50" style={{ color: theme.textMuted }}>
                                        {subject.course_code}
                                    </span>
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: theme.primary }} />
                                </div>
                                <h3 className="font-semibold line-clamp-2 mb-1" style={{ color: theme.text }}>
                                    {subject.course_name}
                                </h3>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

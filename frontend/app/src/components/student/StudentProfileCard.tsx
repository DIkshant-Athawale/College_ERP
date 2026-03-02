import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { GraduationCap, Mail, Calendar, Hash, BookOpen } from 'lucide-react';
import type { StudentProfile } from '@/types';

interface StudentProfileCardProps {
    profile: StudentProfile;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ profile }) => {
    const { theme } = useTheme();

    const details = [
        { icon: Mail, label: 'Email', value: profile.email },
        { icon: Hash, label: 'Student ID', value: profile.student_id },
        { icon: Calendar, label: 'Year/Sem', value: `Year ${profile.year} • Sem ${profile.semester}` },
        { icon: BookOpen, label: 'Academic Year', value: profile.academic_year },
    ];

    return (
        <Card
            className="border-0 shadow-lg overflow-hidden relative"
            style={{ background: theme.surface }}
        >
            <div
                className="h-32 absolute top-0 left-0 right-0"
                style={{ background: theme.gradient }}
            />
            <CardContent className="pt-20 px-6 pb-6 relative z-10">
                <div className="text-center mb-6">
                    <Avatar className="w-24 h-24 mx-auto border-4 mb-4" style={{ borderColor: theme.surface }}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.first_name}`} />
                        <AvatarFallback>{profile.first_name[0]}{profile.last_name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
                        {profile.first_name} {profile.last_name}
                    </h2>
                    <Badge variant="outline" className="px-3" style={{ borderColor: theme.border, color: theme.textMuted }}>
                        Student
                    </Badge>
                </div>

                <div className="space-y-4">
                    {details.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${theme.primary}05` }}>
                            <div className="p-2 rounded-full" style={{ background: `${theme.primary}10` }}>
                                <item.icon className="w-4 h-4" style={{ color: theme.primary }} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                                    {item.label}
                                </p>
                                <p className="text-sm font-semibold truncate" style={{ color: theme.text }}>
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface EssentialLinksSectionProps {
    canManage?: boolean;
    addedBy?: string;
}

export const EssentialLinksSection: React.FC<EssentialLinksSectionProps> = ({ canManage = false }) => {
    const { theme } = useTheme();

    // Mock links for now
    const links = [
        { title: 'University Website', url: '#' },
        { title: 'Exam Portal', url: '#' },
        { title: 'Library Catalog', url: '#' },
    ];

    return (
        <Card className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.secondary}15` }}>
                        <LinkIcon className="w-5 h-5" style={{ color: theme.secondary }} />
                    </div>
                    <div>
                        <CardTitle className="text-lg" style={{ color: theme.text }}>Essential Links</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            className="flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-black/5"
                            style={{ borderColor: theme.border, color: theme.text }}
                        >
                            <span className="font-medium">{link.title}</span>
                            <ExternalLink className="w-4 h-4" style={{ color: theme.textMuted }} />
                        </a>
                    ))}
                    {canManage && (
                        <button className="w-full py-2 text-sm text-center border border-dashed rounded-lg" style={{ borderColor: theme.border, color: theme.textMuted }}>
                            + Add Link
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

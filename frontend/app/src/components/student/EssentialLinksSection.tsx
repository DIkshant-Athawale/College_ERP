import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface EssentialLinksSectionProps {
    links?: {
        link_id: number;
        title: string;
        url: string;
    }[];
    canManage?: boolean;
}

export const EssentialLinksSection: React.FC<EssentialLinksSectionProps> = ({
    links = [],
    canManage = false
}) => {
    const { theme } = useTheme();

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
                    {links && links.length > 0 ? (
                        links.map((link) => (
                            <a
                                key={link.link_id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg border transition-all hover:bg-black/5"
                                style={{ borderColor: theme.border, color: theme.text }}
                            >
                                <span className="font-medium">{link.title}</span>
                                <ExternalLink className="w-4 h-4" style={{ color: theme.textMuted }} />
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-6 text-sm" style={{ color: theme.textMuted }}>
                            No essential links available.
                        </div>
                    )}
                    {canManage && (
                        <div className="mt-4 p-4 border-2 border-dashed rounded-xl text-center" style={{ borderColor: theme.border }}>
                            <p className="text-xs" style={{ color: theme.textMuted }}>
                                Manage these links via the Admin dashboard
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

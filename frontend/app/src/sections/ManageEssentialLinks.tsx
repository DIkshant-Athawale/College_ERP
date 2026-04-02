import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Link2, Trash2, Plus, ExternalLink } from 'lucide-react';
import { linksApi, type EssentialLink } from '@/api';
import { toast } from 'sonner';

export const ManageEssentialLinks = () => {
    const { theme } = useTheme();
    const [links, setLinks] = useState<EssentialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const fetchLinks = async () => {
        try {
            setIsLoading(true);
            const data = await linksApi.getLinks();
            setLinks(data.links || []);
        } catch (error) {
            toast.error('Failed to load essential links');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTitle.trim() || !newUrl.trim()) {
            toast.error('Both title and URL are required');
            return;
        }

        try {
            setIsSubmitting(true);
            await linksApi.addLink({ title: newTitle.trim(), url: newUrl.trim() });
            toast.success('Link added successfully');
            setNewTitle('');
            setNewUrl('');
            fetchLinks();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add link');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this link?')) return;

        try {
            await linksApi.deleteLink(id);
            toast.success('Link deleted');
            fetchLinks();
        } catch (error) {
            toast.error('Failed to delete link');
        }
    };

    return (
        <Card className="border-0 shadow-lg" style={{ background: theme.surface }}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}15` }}>
                        <Link2 className="w-5 h-5" style={{ color: theme.primary }} />
                    </div>
                    <div>
                        <CardTitle className="text-xl" style={{ color: theme.text }}>Essential Links</CardTitle>
                        <CardDescription style={{ color: theme.textMuted }}>
                            Manage global URLs available to students and faculty.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Add new link form */}
                <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Link Title (e.g. Exam Portal)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            style={{
                                background: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            type="url"
                            placeholder="URL (e.g. https://portal.example.com)"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            style={{
                                background: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ background: theme.primary, color: '#fff' }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Link
                    </Button>
                </form>

                {/* List links */}
                <div className="space-y-3">
                    {isLoading ? (
                        <p className="text-center py-4 text-sm" style={{ color: theme.textMuted }}>Loading links...</p>
                    ) : links.length === 0 ? (
                        <div className="text-center py-8 rounded-xl border border-dashed" style={{ borderColor: theme.border }}>
                            <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No essential links added yet.</p>
                        </div>
                    ) : (
                        links.map((link) => (
                            <div
                                key={link.link_id}
                                className="flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md"
                                style={{ borderColor: theme.border, background: theme.background }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${theme.secondary}15` }}>
                                        <ExternalLink className="w-4 h-4" style={{ color: theme.secondary }} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base" style={{ color: theme.text }}>
                                            {link.title}
                                        </h4>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-xs inline-block hover:underline" style={{ color: theme.info }}>
                                            {link.url}
                                        </a>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(link.link_id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

            </CardContent>
        </Card>
    );
};

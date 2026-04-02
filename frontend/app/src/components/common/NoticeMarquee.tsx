import React, { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { Notice } from '@/types';
import { Megaphone } from 'lucide-react';

interface NoticeMarqueeProps {
    notices: Notice[];
    maxCount?: number;
    maxDays?: number;
}

/**
 * Filter notices to the most recent `maxCount` within `maxDays`.
 */
const getRecentNotices = (notices: Notice[], maxCount = 10, maxDays = 7): Notice[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays);
    return notices
        .filter((n) => new Date(n.posted_at) >= cutoff)
        .sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime())
        .slice(0, maxCount);
};

export const NoticeMarquee: React.FC<NoticeMarqueeProps> = ({
    notices,
    maxCount = 10,
    maxDays = 7,
}) => {
    const { theme } = useTheme();

    const recentNotices = useMemo(
        () => getRecentNotices(notices, maxCount, maxDays),
        [notices, maxCount, maxDays]
    );

    if (recentNotices.length === 0) return null;

    // Build the ticker text: duplicate for seamless loop
    const tickerText = recentNotices
        .map((n) => `📢 ${n.title} — ${n.message}`)
        .join('   •   ');

    // Speed: roughly 80px per second per character; longer text → longer duration
    const duration = Math.max(20, tickerText.length * 0.18);

    return (
        <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{
                background: `linear-gradient(135deg, ${theme.primary}18, ${theme.secondary}12)`,
                borderLeft: `4px solid ${theme.primary}`,
            }}
        >
            {/* Label badge */}
            <div
                className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4"
                style={{
                    background: `linear-gradient(to right, ${theme.primary}30, transparent)`,
                }}
            >
                <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                    style={{ background: theme.primary, color: '#fff' }}
                >
                    <Megaphone className="w-3.5 h-3.5" />
                    Notices
                </div>
            </div>

            {/* Scrolling ticker */}
            <div
                className="py-3 pl-36 pr-4"
                style={{ minHeight: '44px' }}
            >
                <div
                    className="inline-flex whitespace-nowrap animate-marquee"
                    style={{
                        animationDuration: `${duration}s`,
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.animationPlayState = 'paused';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.animationPlayState = 'running';
                    }}
                >
                    <span
                        className="text-sm font-medium"
                        style={{ color: theme.text }}
                    >
                        {tickerText}
                    </span>
                    {/* Gap + duplicate for seamless loop */}
                    <span className="mx-16" />
                    <span
                        className="text-sm font-medium"
                        style={{ color: theme.text }}
                    >
                        {tickerText}
                    </span>
                </div>
            </div>

            {/* Inject the keyframes (scoped via style tag) */}
            <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee-scroll linear infinite;
        }
      `}</style>
        </div>
    );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import type { FeeRecord } from '@/types';

interface FeeCardProps {
    feeRecords: FeeRecord[];
}

export const FeeCard: React.FC<FeeCardProps> = ({ feeRecords }) => {
    const { theme } = useTheme();

    if (!feeRecords || feeRecords.length === 0) return null;

    const record = feeRecords[0]; // Assuming single fee record for now
    const isPaid = record.remaining_fee <= 0;

    return (
        <Card className="border-0 shadow-lg overflow-hidden" style={{ background: theme.surface }}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: isPaid ? `${theme.success}15` : `${theme.warning}15` }}>
                        <DollarSign className="w-5 h-5" style={{ color: isPaid ? theme.success : theme.warning }} />
                    </div>
                    <div>
                        <CardTitle className="text-lg" style={{ color: theme.text }}>Fee Status</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm" style={{ color: theme.textMuted }}>Total Fee</p>
                        <p className="text-xl font-bold" style={{ color: theme.text }}>₹{record.total_fee.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm" style={{ color: theme.textMuted }}>Paid Amount</p>
                        <p className="text-xl font-bold" style={{ color: theme.success }}>₹{record.paid_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="text-sm" style={{ color: theme.textMuted }}>Remaining</p>
                        <p className="text-xl font-bold" style={{ color: theme.warning }}>₹{record.remaining_fee.toLocaleString()}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isPaid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="font-semibold">{isPaid ? 'Fully Paid' : 'Pending'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

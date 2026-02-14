import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { FeeRecord } from '@/types';

interface FeeSummaryProps {
  feeRecords: FeeRecord[];
}

export const FeeSummary: React.FC<FeeSummaryProps> = ({ feeRecords }) => {
  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const getPaymentStatus = (paid: number, total: number): { label: string; color: string } => {
    const percentage = (paid / total) * 100;
    if (percentage >= 100) return { label: 'Fully Paid', color: 'bg-green-100 text-green-700' };
    if (percentage >= 50) return { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Payment Due', color: 'bg-red-100 text-red-700' };
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Fee Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feeRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No fee records available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feeRecords.map((record, index) => {
              const totalFee = parseFloat(record.total_fee);
              const paidAmount = parseFloat(record.paid_amount);
              const remainingFee = parseFloat(record.remaining_fee);
              const paidPercentage = (paidAmount / totalFee) * 100;
              const status = getPaymentStatus(paidAmount, totalFee);

              return (
                <div key={index} className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <Badge className={`${status.color} text-sm font-medium px-3 py-1`}>
                      {status.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {paidPercentage.toFixed(1)}% Paid
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={paidPercentage} className="h-3" />
                  </div>

                  {/* Fee Breakdown Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Total Fee */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <IndianRupee className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          Total Fee
                        </span>
                      </div>
                      <p className="text-xl font-bold text-blue-900">
                        {formatCurrency(record.total_fee)}
                      </p>
                    </div>

                    {/* Paid Amount */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 uppercase">
                          Paid
                        </span>
                      </div>
                      <p className="text-xl font-bold text-green-900">
                        {formatCurrency(record.paid_amount)}
                      </p>
                    </div>

                    {/* Remaining Amount */}
                    <div className={`p-4 rounded-lg border ${
                      remainingFee > 0 
                        ? 'bg-red-50 border-red-100' 
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          remainingFee > 0 ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {remainingFee > 0 ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className={`text-xs font-medium uppercase ${
                          remainingFee > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          Remaining
                        </span>
                      </div>
                      <p className={`text-xl font-bold ${
                        remainingFee > 0 ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {formatCurrency(record.remaining_fee)}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">
                        Paid: <strong className="text-gray-900">{paidPercentage.toFixed(0)}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-gray-600">
                        Pending: <strong className="text-gray-900">{(100 - paidPercentage).toFixed(0)}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeSummary;

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} style={{ color: theme.text }}>
        {label}
        {props.required && <span style={{ color: theme.danger }}> *</span>}
      </Label>
      <Input
        {...props}
        className={`h-11 rounded-lg transition-all duration-300 focus:ring-2 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        style={{
          borderColor: error ? '#ef4444' : theme.border,
          '--tw-ring-color': theme.primary,
        } as React.CSSProperties}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm" style={{ color: theme.textMuted }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormInput;

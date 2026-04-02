import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  const { theme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${maxWidth} max-h-[90vh] overflow-y-auto`}
        style={{ background: theme.surface, borderColor: theme.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: theme.text }}>{title}</DialogTitle>
          {description && (
            <DialogDescription style={{ color: theme.textMuted }}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;

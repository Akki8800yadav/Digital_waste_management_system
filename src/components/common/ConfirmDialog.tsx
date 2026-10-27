import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-full shrink-0 ${
          isDestructive ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
          {message}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors shadow-sm ${
            isDestructive 
              ? 'bg-rose-600 hover:bg-rose-700' 
              : 'bg-ecogreen hover:bg-ecogreen-dark'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

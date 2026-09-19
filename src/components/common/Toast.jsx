import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

export const Toast = () => {
  const { toast } = useBudget();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} style={{ color: '#10B981' }} />,
    error: <AlertCircle size={20} style={{ color: '#EF4444' }} />,
    info: <Info size={20} style={{ color: '#3B82F6' }} />
  };

  return (
    <div className="cbm-toast">
      {icons[toast.type] || icons.success}
      <span>{toast.message}</span>
    </div>
  );
};

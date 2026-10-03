import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';

export const Toast = () => {
  const { toast } = useBudget();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} style={{ color: '#4ADE80', flexShrink: 0 }} />,
    error: <AlertCircle size={18} style={{ color: '#F87171', flexShrink: 0 }} />,
    info: <Info size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
  };

  return (
    <div className="cbm-toast" role="status" aria-live="polite">
      {icons[toast.type] || icons.success}
      <span>{toast.message}</span>
    </div>
  );
};

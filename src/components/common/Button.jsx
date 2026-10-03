import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'md', // sm, md, lg
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  style = {},
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'cbm-btn-sm' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`cbm-btn cbm-btn-${variant} ${sizeClass} ${className}`}
      style={style}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} aria-hidden="true" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

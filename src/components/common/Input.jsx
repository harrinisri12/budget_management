import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`cbm-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="cbm-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="cbm-input-wrapper">
        {Icon && (
          <div style={{ position: 'absolute', left: 12, color: 'var(--slate-500)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
            <Icon size={16} aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`cbm-input ${error ? 'cbm-input-error' : ''}`}
          style={{ paddingLeft: Icon ? 36 : 12, ...style }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          required={required}
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="cbm-error-text" role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          <span>{error}</span>
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="cbm-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};

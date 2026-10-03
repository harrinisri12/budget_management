import React, { useState } from 'react';
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

export const PasswordInput = ({
  label = 'Password',
  error,
  helperText,
  id = 'password',
  placeholder = 'Enter password',
  value,
  onChange,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id;

  return (
    <div className={`cbm-input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="cbm-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="cbm-input-wrapper">
        <div style={{ position: 'absolute', left: 12, color: 'var(--slate-500)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
          <Lock size={16} aria-hidden="true" />
        </div>
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`cbm-input ${error ? 'cbm-input-error' : ''}`}
          style={{ paddingLeft: 36, paddingRight: 38, ...style }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          required={required}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 10,
            background: 'none',
            border: 'none',
            color: showPassword ? 'var(--primary)' : 'var(--slate-500)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4
          }}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
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

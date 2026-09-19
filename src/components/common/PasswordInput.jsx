import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`cbm-input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="cbm-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="cbm-input-wrapper">
        <div style={{ position: 'absolute', left: 16, color: 'var(--secondary)', pointerEvents: 'none', display: 'flex' }}>
          <Lock size={18} />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`cbm-input ${error ? 'cbm-input-error' : ''}`}
          style={{ paddingLeft: 44, paddingRight: 44 }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 14,
            background: 'none',
            border: 'none',
            color: showPassword ? 'var(--primary)' : 'var(--secondary)',
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
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="cbm-error-text">⚠️ {error}</span>}
      {!error && helperText && <span className="cbm-helper-text">{helperText}</span>}
    </div>
  );
};

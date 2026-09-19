import React from 'react';

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
  ...props
}) => {
  return (
    <div className={`cbm-input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="cbm-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <div className="cbm-input-wrapper">
        {Icon && (
          <div style={{ position: 'absolute', left: 16, color: 'var(--secondary)', pointerEvents: 'none', display: 'flex' }}>
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`cbm-input ${error ? 'cbm-input-error' : ''}`}
          style={{ paddingLeft: Icon ? 44 : 16 }}
          {...props}
        />
      </div>
      {error && <span className="cbm-error-text">⚠️ {error}</span>}
      {!error && helperText && <span className="cbm-helper-text">{helperText}</span>}
    </div>
  );
};

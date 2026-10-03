import React from 'react';

export const StatCard = ({ title, amount, supportingText, icon: Icon, highlight = false }) => {
  // Format currency if number
  const formattedAmount = typeof amount === 'number'
    ? `₹${amount.toLocaleString('en-IN')}`
    : amount;

  return (
    <div className="cbm-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: highlight ? 'var(--primary-subtle)' : 'var(--slate-100)',
            color: highlight ? 'var(--primary)' : 'var(--slate-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {Icon && <Icon size={16} aria-hidden="true" />}
        </div>
      </div>

      <div style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: 4, wordBreak: 'break-word' }}>
        {formattedAmount}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        <span>{supportingText}</span>
      </div>
    </div>
  );
};

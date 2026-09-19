import React from 'react';

export const StatCard = ({ title, amount, supportingText, icon: Icon, color = 'var(--primary)', isPositive = true }) => {
  // Format currency if number
  const formattedAmount = typeof amount === 'number'
    ? `₹${amount.toLocaleString('en-IN')}`
    : amount;

  return (
    <div className="cbm-card cbm-card-hover" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.02em', marginBottom: 8 }}>
        {formattedAmount}
      </div>

      <div style={{ fontSize: 13, color: 'var(--dark-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{supportingText}</span>
      </div>
    </div>
  );
};

import React from 'react';

export const Badge = ({ status, text }) => {
  const value = text || status;
  const normalized = String(value).toLowerCase();

  let variantClass = 'cbm-badge-secondary';
  let dotClass = 'cbm-dot-secondary';

  if (normalized === 'approved' || normalized === 'active') {
    variantClass = 'cbm-badge-success';
    dotClass = 'cbm-dot-success';
  } else if (normalized === 'pending') {
    variantClass = 'cbm-badge-warning';
    dotClass = 'cbm-dot-warning';
  } else if (normalized === 'rejected' || normalized === 'inactive') {
    variantClass = 'cbm-badge-danger';
    dotClass = 'cbm-dot-danger';
  }

  return (
    <span className={`cbm-badge ${variantClass}`}>
      <span className={`cbm-dot ${dotClass}`} />
      {value}
    </span>
  );
};

import React from 'react';

export const Skeleton = ({
  variant = 'text', // 'text', 'title', 'avatar', 'rect', 'card', 'table-row'
  width,
  height,
  className = '',
  style = {}
}) => {
  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style
  };

  if (variant === 'table-row') {
    return (
      <tr>
        <td colSpan={10} style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="cbm-skeleton cbm-skeleton-avatar" style={{ width: 28, height: 28 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="cbm-skeleton" style={{ height: 14, width: '40%' }} />
              <div className="cbm-skeleton" style={{ height: 11, width: '25%' }} />
            </div>
            <div className="cbm-skeleton" style={{ height: 14, width: 80 }} />
            <div className="cbm-skeleton" style={{ height: 20, width: 70, borderRadius: 4 }} />
          </div>
        </td>
      </tr>
    );
  }

  if (variant === 'card') {
    return (
      <div className="cbm-skeleton-card" style={customStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="cbm-skeleton" style={{ height: 12, width: '40%' }} />
          <div className="cbm-skeleton" style={{ height: 28, width: 28, borderRadius: 6 }} />
        </div>
        <div className="cbm-skeleton" style={{ height: 26, width: '60%', margin: '4px 0' }} />
        <div className="cbm-skeleton" style={{ height: 12, width: '80%' }} />
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`cbm-skeleton cbm-skeleton-avatar ${className}`} style={customStyle} />;
  }

  if (variant === 'title') {
    return <div className={`cbm-skeleton cbm-skeleton-title ${className}`} style={customStyle} />;
  }

  return <div className={`cbm-skeleton cbm-skeleton-text ${className}`} style={customStyle} />;
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} variant="table-row" />
      ))}
    </tbody>
  );
};

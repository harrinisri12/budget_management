import React from 'react';
import { useBudget } from '../../context/BudgetContext';

export const AllocationCard = () => {
  const { categoryAllocations } = useBudget();

  return (
    <div className="cbm-card" style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>Category Budget Utilization</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution across CSE units & academic accounts</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {categoryAllocations.map(cat => {
          const percentSpent = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
          return (
            <div key={cat.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4, fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                <span style={{ color: 'var(--text-heading)' }}>{cat.name}</span>
                <span style={{ color: 'var(--text-body)' }}>
                  ₹{cat.spent.toLocaleString('en-IN')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ ₹{cat.allocated.toLocaleString('en-IN')}</span>
                </span>
              </div>
              
              {/* Progress Track */}
              <div style={{ width: '100%', height: 5, borderRadius: 3, backgroundColor: 'var(--slate-100)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, percentSpent)}%`,
                    backgroundColor: percentSpent > 85 ? 'var(--warning)' : 'var(--primary)',
                    borderRadius: 3,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
                <span>{cat.percentage}% of CSE budget</span>
                <span>{percentSpent}% utilized</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

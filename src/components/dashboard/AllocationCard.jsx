import React from 'react';
import { useBudget } from '../../context/BudgetContext';

export const AllocationCard = () => {
  const { categoryAllocations } = useBudget();

  return (
    <div className="cbm-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--dark)' }}>CSE Activity Allocations</h3>
        <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Fund distribution across CSE units & activities</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {categoryAllocations.map(cat => (
          <div key={cat.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              <span style={{ color: 'var(--dark)' }}>{cat.name}</span>
              <span style={{ color: 'var(--dark-muted)' }}>
                ₹{cat.spent.toLocaleString('en-IN')} <span style={{ color: 'var(--secondary)', fontWeight: 400 }}>/ ₹{cat.allocated.toLocaleString('en-IN')}</span>
              </span>
            </div>
            
            {/* Progress Track */}
            <div style={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: '#F1EFFD', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(cat.spent / cat.allocated) * 100}%`,
                  backgroundColor: cat.color,
                  borderRadius: 4,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--secondary)', marginTop: 4 }}>
              <span>{cat.percentage}% of total CSE budget</span>
              <span>{Math.round((cat.spent / cat.allocated) * 100)}% spent</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

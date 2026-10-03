import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useBudget } from '../../context/BudgetContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-dropdown)',
          fontSize: 12
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-heading)' }}>{label} 2026</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ color: 'var(--gold-text)', fontWeight: 600 }}>
            Allocated: ₹{payload[0]?.value?.toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'var(--text-body)', fontWeight: 600 }}>
            Disbursed: ₹{payload[1]?.value?.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const BudgetChart = () => {
  const { monthlySpending } = useBudget();

  return (
    <div className="cbm-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>Monthly Budget & Expenditure</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comparison for Academic Year 2026-27</p>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#C5A059' }} />
            <span style={{ color: 'var(--text-body)' }}>Allocated Budget</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#27272A' }} />
            <span style={{ color: 'var(--text-body)' }}>Actual Spending</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlySpending} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11.5, fontWeight: 500 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717A', fontSize: 11.5, fontWeight: 500 }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="budget" name="Budget" fill="#C5A059" radius={[3, 3, 0, 0]} maxBarSize={22} />
            <Bar dataKey="spending" name="Actual Spending" fill="#27272A" radius={[3, 3, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useBudget } from '../../context/BudgetContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--dark)' }}>{label} 2026</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          <div style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Allocated Budget: ₹{payload[0]?.value?.toLocaleString('en-IN')}
          </div>
          <div style={{ color: '#ABA7CD', fontWeight: 600 }}>
            Actual Spending: ₹{payload[1]?.value?.toLocaleString('en-IN')}
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
    <div className="cbm-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--dark)' }}>Budget vs Spending</h3>
          <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Monthly comparisons for H1 Academic Year 2026-27</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--primary)' }} />
            <span>Budget</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--secondary)' }} />
            <span>Actual Spending</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 310 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlySpending} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E3F0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#4B4963', fontSize: 12 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#4B4963', fontSize: 12 }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="budget" name="Budget" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="spending" name="Actual Spending" fill="var(--secondary)" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

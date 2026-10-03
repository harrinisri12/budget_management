import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CSE_UNITS_OVERVIEW } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';

export const BudgetOverviewPage = () => {
  const { categories, showToast } = useBudget();

  const unitsData = CSE_UNITS_OVERVIEW.map(item => {
    const matched = categories.find(c => c.name.toLowerCase().includes(item.unit.toLowerCase().slice(0, 5)));
    const allocated = matched ? Number(matched.allocated_amount) : item.allocated;
    const spent = matched ? Number(matched.spent_amount) : item.spent;
    const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : item.utilization;
    return {
      ...item,
      allocated,
      spent,
      utilization
    };
  });

  const handleExport = () => {
    showToast?.('Exporting CSE departmental budget quota worksheet (CSV)...', 'info');
  };

  return (
    <DashboardLayout pageTitle="CSE Budget Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                DEPARTMENTAL ALLOCATIONS
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>CSE Department Unit Allocations</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Annual budget quotas and utilization ratios across CSE activity units, laboratories, and chapters.
            </p>
          </div>
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export Quota Worksheet
          </Button>
        </div>

        <hr className="cbm-divider" />

        {/* Allocations Table Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Departmental Budget Quotas & Utilization</h2>
              <p className="cbm-section-subtitle">
                Fiscal year 2026-27 allocations for all academic associations, laboratories, and functional units
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {unitsData.length} Units Monitored
            </div>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>CSE Activity Unit / Category</th>
                  <th>Faculty In-Charge</th>
                  <th>Allocated Quota</th>
                  <th>Amount Spent</th>
                  <th>Utilization %</th>
                  <th>Activities / Assets</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {unitsData.map((item) => (
                  <tr key={item.unit}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {item.unit}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>{item.head}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>₹{item.allocated.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)' }}>₹{item.spent.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, minWidth: 70, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, item.utilization)}%`,
                              backgroundColor: item.utilization > 80 ? 'var(--warning)' : 'var(--primary)',
                              borderRadius: 3
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', minWidth: 32 }}>{item.utilization}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>{item.eventsCount} items</td>
                    <td>
                      <Badge status="Active" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};


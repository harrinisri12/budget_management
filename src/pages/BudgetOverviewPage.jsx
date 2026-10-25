import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';

export const BudgetOverviewPage = () => {
  const { categories, activeAcademicYear, proposals, showToast } = useBudget();

  const ayCategories = activeAcademicYear?.categories || categories || [];
  const ayLabel = activeAcademicYear
    ? (activeAcademicYear.name || activeAcademicYear.academicYear || `${activeAcademicYear.startYear} - ${activeAcademicYear.endYear}`)
    : 'No Active Academic Year';

  const unitsData = ayCategories.map(cat => {
    const allocated = Number(cat.budget || cat.allocated_amount || 0);

    const catProposals = (proposals || []).filter(
      p => p.categoryId === cat.id || (p.category && cat.name && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase())
    );

    // Reserved amount: accepted proposals awaiting settlement
    const reserved = catProposals.reduce((sum, p) => {
      const statusLower = (p.status || '').toLowerCase();
      const settlementStatusLower = (p.settlementStatus || '').toLowerCase();
      const isAccepted = ['accepted', 'approved'].includes(statusLower);
      const isSettled = settlementStatusLower === 'settled';
      if (isAccepted && !isSettled) {
        return sum + Number(p.amount || p.approvedAmount || 0);
      }
      return sum;
    }, 0);

    // Actual expenditure: finalized settlements
    const actual = catProposals.reduce((sum, p) => {
      const settlementStatusLower = (p.settlementStatus || '').toLowerCase();
      if (settlementStatusLower === 'settled') {
        return sum + Number(p.settlementAmount ?? p.amount ?? 0);
      }
      return sum;
    }, 0);

    const remaining = Math.max(0, allocated - reserved - actual);
    const spent = reserved + actual;
    const utilization = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
    const subCount = cat.subcategories?.length || 0;

    return {
      id: cat.id,
      unit: cat.name,
      allocated,
      reserved,
      actual,
      remaining,
      spent,
      utilization,
      subCount,
      proposalsCount: catProposals.length
    };
  });

  const totalAllocated = unitsData.reduce((sum, u) => sum + u.allocated, 0);
  const totalSpent = unitsData.reduce((sum, u) => sum + u.spent, 0);

  const handleExport = () => {
    const headers = ['Category / Unit', 'Subcategories Count', 'Allocated Quota (INR)', 'Disbursed Amount (INR)', 'Remaining Quota (INR)', 'Utilization %', 'Proposals Logged'];
    const rows = unitsData.map(u => [
      `"${u.unit.replace(/"/g, '""')}"`,
      u.subCount,
      u.allocated,
      u.spent,
      Math.max(0, u.allocated - u.spent),
      `${u.utilization}%`,
      u.proposalsCount
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KEC_CSE_Category_Allocations_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast?.(`Exported CSE departmental budget quota worksheet for ${ayLabel}.`, 'success');
  };

  return (
    <DashboardLayout pageTitle="CSE Budget Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                DEPARTMENTAL ALLOCATIONS • {ayLabel}
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>CSE Department Category Allocations</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
              Annual budget quotas and utilization ratios across active departmental categories, associations, and laboratories.
            </p>
          </div>
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>
            Export Quota Worksheet
          </Button>
        </div>

        {/* Allocations Table Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Category Budget Quotas & Utilization ({ayLabel})</h2>
              <p className="cbm-section-subtitle">
                Category allocations for all academic associations, laboratories, and functional units
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {unitsData.length} Categories Monitored
            </div>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Category / Unit</th>
                  <th>Subcategories</th>
                  <th style={{ textAlign: 'right' }}>Allocated Quota</th>
                  <th style={{ textAlign: 'right' }}>Disbursed Amount</th>
                  <th>Utilization %</th>
                  <th>Proposals Logged</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {unitsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No categories configured for the active academic year yet.
                    </td>
                  </tr>
                ) : (
                  unitsData.map((item) => (
                    <tr key={item.id || item.unit}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {item.unit}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>
                        {item.subCount > 0 ? `${item.subCount} Subcategories` : 'Direct Category'}
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-heading)' }}>
                        ₹{item.allocated.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontWeight: 500, textAlign: 'right', color: 'var(--text-muted)' }}>
                        ₹{item.spent.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, height: 6, minWidth: 70, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${item.utilization}%`,
                                backgroundColor: item.utilization > 80 ? 'var(--warning)' : 'var(--primary)',
                                borderRadius: 3
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)', minWidth: 32 }}>{item.utilization}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>{item.proposalsCount} proposals</td>
                      <td>
                        <Badge status="Active" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {unitsData.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--bg-page)', fontWeight: 800 }}>
                    <td colSpan={2} style={{ textAlign: 'right' }}>TOTAL:</td>
                    <td style={{ textAlign: 'right', fontSize: 15, color: 'var(--gold-text)' }}>
                      ₹{totalAllocated.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 14 }}>
                      ₹{totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { CCC_DETAILS } from '../data/mockData';
import { UserCheck, Shield } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const CCCPage = () => {
  const { categories } = useBudget();
  const cccCategory = categories.find(c => c.name.toLowerCase().includes('ccc'));
  const allocated = cccCategory ? Number(cccCategory.allocated_amount) : CCC_DETAILS.allocated;
  const spent = cccCategory ? Number(cccCategory.spent_amount) : CCC_DETAILS.spent;
  const remaining = Math.max(0, allocated - spent);
  const spentPercent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '68.6';

  return (
    <DashboardLayout pageTitle="CCC Coding Club">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              CSE DEPARTMENT COMPETITIVE PROGRAMMING CLUB
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>
            {CCC_DETAILS.fullName} ({CCC_DETAILS.name})
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, maxWidth: 850 }}>
            {CCC_DETAILS.description}
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* SECTION 1: Club Leadership & Budget Quota */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Club Quota & Leadership</h2>
              <p className="cbm-section-subtitle">
                Fiscal allocation and faculty coordination for Kongu Collegiate Coding Club
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <UserCheck size={14} style={{ color: 'var(--gold)' }} />
                <span>Faculty: <strong>{CCC_DETAILS.facultyInCharge}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <Shield size={14} style={{ color: 'var(--gold)' }} />
                <span>President: <strong>{CCC_DETAILS.studentPresident}</strong></span>
              </div>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="cbm-metric-strip">
            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Allocated Budget</span>
              <div className="cbm-metric-value">₹{allocated.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">Annual CCC FY 2026-27 Quota</span>
            </div>

            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Amount Spent</span>
              <div className="cbm-metric-value">₹{spent.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">{spentPercent}% of allocated funds utilized</span>
            </div>

            <div className="cbm-metric-item cbm-metric-item-highlight">
              <span className="cbm-metric-label">Remaining Balance</span>
              <div className="cbm-metric-value">₹{remaining.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">Available for contests & hackathons</span>
            </div>
          </div>
        </section>

        <hr className="cbm-divider" />

        {/* SECTION 2: Activities & Contests Table */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">CCC Hackathons & Contests Expenditure</h2>
              <p className="cbm-section-subtitle">
                Competitive programming bootcamps, hackathons, and server compute expenses
              </p>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {CCC_DETAILS.activities.length} Contests Logged
            </span>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Coding Event / Contest Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Disbursed Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CCC_DETAILS.activities.map((act, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {act.title}
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', color: 'var(--slate-700)', fontWeight: 600, fontSize: 11.5 }}>
                        {act.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 12.5 }}>{act.date}</td>
                    <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-heading)' }}>₹{act.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <Badge status={act.status} />
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



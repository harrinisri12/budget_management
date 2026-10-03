import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { CSEA_DETAILS } from '../data/mockData';
import { UserCheck, Shield } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const CSEAPage = () => {
  const { categories } = useBudget();
  const cseaCategory = categories.find(c => c.name.toLowerCase().includes('csea'));
  const allocated = cseaCategory ? Number(cseaCategory.allocated_amount) : CSEA_DETAILS.allocated;
  const spent = cseaCategory ? Number(cseaCategory.spent_amount) : CSEA_DETAILS.spent;
  const remaining = Math.max(0, allocated - spent);
  const spentPercent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '71.1';

  return (
    <DashboardLayout pageTitle="CSEA Association">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              CSE DEPARTMENT STUDENT ASSOCIATION
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>
            {CSEA_DETAILS.fullName} ({CSEA_DETAILS.name})
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, maxWidth: 850 }}>
            {CSEA_DETAILS.description}
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* SECTION 1: Unit Leadership & Budget Quota */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Association Quota & Leadership</h2>
              <p className="cbm-section-subtitle">
                Fiscal allocation and administrative leadership for Computer Science and Engineering Association
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <UserCheck size={14} style={{ color: 'var(--gold)' }} />
                <span>Faculty: <strong>{CSEA_DETAILS.facultyInCharge}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <Shield size={14} style={{ color: 'var(--gold)' }} />
                <span>President: <strong>{CSEA_DETAILS.studentPresident}</strong></span>
              </div>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="cbm-metric-strip">
            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Allocated Budget</span>
              <div className="cbm-metric-value">₹{allocated.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">Annual CSEA FY 2026-27 Quota</span>
            </div>

            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Amount Spent</span>
              <div className="cbm-metric-value">₹{spent.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">{spentPercent}% of allocated funds utilized</span>
            </div>

            <div className="cbm-metric-item cbm-metric-item-highlight">
              <span className="cbm-metric-label">Remaining Balance</span>
              <div className="cbm-metric-value">₹{remaining.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">Available for association activities</span>
            </div>
          </div>
        </section>

        <hr className="cbm-divider" />

        {/* SECTION 2: Activities & Expenditure Table */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">CSEA Activities & Expenditure</h2>
              <p className="cbm-section-subtitle">
                Departmental symposiums, workshops, and guest lectures hosted under CSEA
              </p>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {CSEA_DETAILS.activities.length} Events Logged
            </span>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Activity / Event Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Disbursed Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CSEA_DETAILS.activities.map((act, i) => (
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



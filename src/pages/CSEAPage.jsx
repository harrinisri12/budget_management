import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { UserCheck, Shield } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const CSEAPage = () => {
  const { categories, activeAcademicYear, proposals } = useBudget();

  // Find CSEA category from active academic year or budget categories
  const activeCategories = activeAcademicYear?.categories || categories || [];
  const cseaCategory = activeCategories.find(c => c.name.toLowerCase().includes('csea')) || null;

  const allocated = Number(cseaCategory?.budget || cseaCategory?.allocated_amount || 0);

  // Filter proposals and activities for CSEA
  const cseaProposals = proposals.filter(p =>
    (p.category || '').toLowerCase().includes('csea')
  );

  const spent = cseaProposals.reduce((sum, p) => {
    const sLower = (p.status || '').toLowerCase();
    const ssLower = (p.settlementStatus || '').toLowerCase();
    const isSettled = sLower === 'settled' || ssLower === 'settled';
    const isAccepted = ['accepted', 'approved'].includes(sLower);
    if (isSettled) {
      return sum + (Number(p.settlementAmount ?? p.actualAmount ?? p.amount ?? 0) || 0);
    }
    if (isAccepted) {
      return sum + (Number(p.approvedAmount ?? p.amount ?? 0) || 0);
    }
    return sum;
  }, 0);

  const remaining = Math.max(0, allocated - spent);
  const spentPercent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0';

  const ayLabel = activeAcademicYear?.name || activeAcademicYear?.academicYear || 'No Active Academic Year';

  return (
    <DashboardLayout pageTitle="CSEA Association">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              CSE DEPARTMENT STUDENT ASSOCIATION
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
            Computer Science and Engineering Association (CSEA)
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0, maxWidth: 850 }}>
            Primary departmental student association driving technical symposiums, workshops, guest lectures, and industry interaction for CSE students.
          </p>
        </div>

        {/* SECTION 1: Unit Quota & Department Overview */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Association Quota & Overview</h2>
              <p className="cbm-section-subtitle">
                Fiscal allocation and departmental coordination for Computer Science and Engineering Association ({ayLabel})
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-heading)' }}>
                <UserCheck size={13} style={{ color: 'var(--gold)' }} />
                <span>Department: <strong>CSE</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-heading)' }}>
                <Shield size={13} style={{ color: 'var(--gold)' }} />
                <span>Session: <strong>{ayLabel}</strong></span>
              </div>
            </div>
          </div>

          {/* Metric Strip */}
          <div className="cbm-metric-strip">
            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Allocated Category Budget</span>
              <div className="cbm-metric-value">₹{allocated.toLocaleString('en-IN')}</div>
              <span className="cbm-metric-supporting">Direct {ayLabel} Category Quota</span>
            </div>

            <div className="cbm-metric-item">
              <span className="cbm-metric-label">Amount Disbursed / Approved</span>
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

        {/* SECTION 2: Activities & Expenditure Table */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">CSEA Activities & Proposals</h2>
              <p className="cbm-section-subtitle">
                Departmental symposiums, workshops, and guest lectures hosted under CSEA
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              {cseaProposals.length} Proposals / Activities Logged
            </span>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Proposal / Activity Name</th>
                  <th>Subcategory</th>
                  <th>Program Date</th>
                  <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cseaProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--text-muted)' }}>
                      No proposals or activities recorded under CSEA Association yet.
                    </td>
                  </tr>
                ) : (
                  cseaProposals.map((prop, i) => (
                    <tr key={prop.dbId || prop.id || i}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {prop.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          ID: {prop.proposalNumber || prop.proposalId || prop.id}
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 4, backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', color: 'var(--text-body)', fontWeight: 600, fontSize: 11.5 }}>
                          {prop.subCategory || 'General Activity'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 12.5 }}>
                        {prop.programDate || prop.proposalDate || '—'}
                      </td>
                      <td style={{ fontWeight: 700, textAlign: 'right', color: 'var(--text-heading)' }}>
                        ₹{Number(prop.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <Badge status={prop.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

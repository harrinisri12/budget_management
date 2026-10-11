import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { UserCheck, Shield } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const CCCPage = () => {
  const { categories, activeAcademicYear, proposals } = useBudget();

  // Find CCC category from active academic year or budget categories
  const activeCategories = activeAcademicYear?.categories || categories || [];
  const cccCategory = activeCategories.find(c => c.name.toLowerCase().includes('ccc')) || null;

  const allocated = Number(cccCategory?.budget || cccCategory?.allocated_amount || 0);

  // Filter proposals and activities for CCC
  const cccProposals = proposals.filter(p =>
    (p.category || '').toLowerCase().includes('ccc')
  );

  const spent = cccProposals
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const remaining = Math.max(0, allocated - spent);
  const spentPercent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0';

  const ayLabel = activeAcademicYear?.name || activeAcademicYear?.academicYear || 'No Active Academic Year';

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
            Competitive Coding Club (CCC)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, maxWidth: 850 }}>
            Specialized CSE algorithmic coding hub fostering competitive programming, hackathons, LeetCode sprints, and open-source contributions.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* SECTION 1: Club Quota & Department Overview */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Club Quota & Overview</h2>
              <p className="cbm-section-subtitle">
                Fiscal allocation and departmental coordination for Kongu Collegiate Coding Club ({ayLabel})
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <UserCheck size={14} style={{ color: 'var(--gold)' }} />
                <span>Department: <strong>CSE</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)' }}>
                <Shield size={14} style={{ color: 'var(--gold)' }} />
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
              <span className="cbm-metric-supporting">Available for contests & hackathons</span>
            </div>
          </div>
        </section>

        <hr className="cbm-divider" />

        {/* SECTION 2: Activities & Contests Table */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">CCC Hackathons & Contests Proposals</h2>
              <p className="cbm-section-subtitle">
                Competitive programming bootcamps, hackathons, and server compute proposals
              </p>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {cccProposals.length} Proposals / Contests Logged
            </span>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Coding Event / Contest Name</th>
                  <th>Subcategory</th>
                  <th>Program Date</th>
                  <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cccProposals.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No proposals or activities recorded under CCC Coding Club yet.
                    </td>
                  </tr>
                ) : (
                  cccProposals.map((prop, i) => (
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
                          {prop.subCategory || 'Coding Event'}
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

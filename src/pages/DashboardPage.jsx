import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { useBudget } from '../context/BudgetContext';
import {
  Wallet,
  PieChart,
  Clock,
  CreditCard,
  Building,
  Activity
} from 'lucide-react';

export const DashboardPage = () => {
  const { kpis, proposals, activeAcademicYear, categories } = useBudget();

  // 1. TOTAL BUDGET: Active academic year real database budget
  const totalBudget = Number(activeAcademicYear?.budget ?? activeAcademicYear?.annualBudget ?? kpis.totalBudget ?? 0);

  // 2. ALLOCATED QUOTA: SUM(budget_categories.allocated_amount) for active academic year
  const activeAyCategories = (categories || []).filter(c => !activeAcademicYear || c.academic_year_id === activeAcademicYear.id || c.academicYearId === activeAcademicYear.id);
  const allocatedQuota = (activeAyCategories.length > 0 ? activeAyCategories : (categories || [])).reduce(
    (sum, c) => sum + Number(c.allocated_amount || c.allocatedAmount || c.allocated || 0),
    0
  ) || kpis.allocated || 0;

  // 3. REMAINING BALANCE: totalBudget - totalSpent from actual database category spent amounts
  const categorySpent = (activeAyCategories.length > 0 ? activeAyCategories : (categories || [])).reduce(
    (sum, c) => sum + Number(c.spent_amount || c.spentAmount || c.spent || 0),
    0
  );
  const remainingBalance = Math.max(0, totalBudget - categorySpent);

  // 4. PENDING PROPOSALS: Count and sum of proposals for active academic year with status 'Pending'
  const activeYearProposals = (proposals || []).filter(
    (p) => !activeAcademicYear || p.academicYearId === activeAcademicYear.id || p.academicYear === activeAcademicYear.academicYear || p.academicYear === activeAcademicYear.name
  );
  const pendingProposals = activeYearProposals.filter(
    (p) => p.status === 'Pending'
  );
  const pendingCount = pendingProposals.length;
  const pendingTotal = pendingProposals.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const ayLabel = activeAcademicYear
    ? (activeAcademicYear.name || activeAcademicYear.academicYear || `${activeAcademicYear.startYear} - ${activeAcademicYear.endYear}`)
    : 'No Active Academic Year';
  const allocationPercent = totalBudget > 0
    ? ((allocatedQuota / totalBudget) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Top Title Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Building size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.04em' }}>
                {activeAcademicYear ? `ADMINISTRATIVE PORTAL • ACADEMIC YEAR ${ayLabel}` : 'ADMINISTRATIVE PORTAL • NO ACTIVE ACADEMIC YEAR CONFIGURED'}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>
              CSE Department Budget Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Official administrative ledger for managing departmental budget quotas, allocations, faculty activity proposals, and expenditure audits.
            </p>
          </div>
        </div>

        {/* SECTION DIVIDER */}
        <hr className="cbm-divider" />

        {/* 1. LARGE SECTION: BUDGET & FINANCIAL OVERVIEW */}
        <section className="cbm-section" aria-labelledby="section-budget-overview">
          <div className="cbm-section-header">
            <div>
              <h2 id="section-budget-overview" className="cbm-section-title">
                Budget Overview
              </h2>
              <p className="cbm-section-subtitle">
                Departmental fiscal allocation and current disbursement status
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-text)', backgroundColor: 'var(--gold-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-border)' }}>
              Fiscal Session {ayLabel}
            </span>
          </div>

          {/* Unified Horizontal Metric Strip */}
          <div className="cbm-metric-strip">
            {/* Metric 1: Total Budget */}
            <div className="cbm-metric-item cbm-metric-item-highlight">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Total Budget</span>
                <div className="cbm-metric-icon cbm-metric-icon-gold">
                  <Wallet size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{totalBudget.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">Academic Year Quota</div>
              </div>
            </div>

            {/* Metric 2: Allocated Amount */}
            <div className="cbm-metric-item">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Allocated Quota</span>
                <div className="cbm-metric-icon">
                  <PieChart size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{allocatedQuota.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">{allocationPercent}% of Total Budget</div>
              </div>
            </div>

            {/* Metric 3: Remaining Balance */}
            <div className="cbm-metric-item">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Remaining Balance</span>
                <div className="cbm-metric-icon">
                  <CreditCard size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{remainingBalance.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">Department Available Surplus</div>
              </div>
            </div>

            {/* Metric 4: Pending Proposals */}
            <div className="cbm-metric-item">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Pending Proposals</span>
                <div className="cbm-metric-icon">
                  <Clock size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">{pendingCount} Request{pendingCount === 1 ? '' : 's'}</div>
                <div className="cbm-metric-supporting">
                  {pendingTotal > 0 ? `₹${pendingTotal.toLocaleString('en-IN')} awaiting review` : 'All proposals evaluated'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <hr className="cbm-divider" />

        {/* 2. LARGE SECTION: RECENT DEPARTMENT ACTIVITY & TRANSACTIONS */}
        <section className="cbm-section" aria-labelledby="section-recent-activity">
          <div className="cbm-section-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={16} style={{ color: 'var(--gold)' }} />
                <h2 id="section-recent-activity" className="cbm-section-title">
                  Recent Department Activity
                </h2>
              </div>
              <p className="cbm-section-subtitle">
                Real-time departmental proposals, category allocations, and activity audit trail
              </p>
            </div>
          </div>

          <TransactionTable />
        </section>
      </div>
    </DashboardLayout>
  );
};

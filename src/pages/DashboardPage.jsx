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
  const { kpis, proposals } = useBudget();

  // Derive pending metrics
  const pendingProposals = proposals.filter((p) => p.status === 'Pending');
  const pendingCount = pendingProposals.length;
  const pendingTotal = pendingProposals.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Top Title Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Building size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.04em' }}>
                ADMINISTRATIVE PORTAL • ACADEMIC YEAR 2026-27
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
              Fiscal FY 2026-27
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
                <div className="cbm-metric-value">₹{kpis.totalBudget.toLocaleString('en-IN')}</div>
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
                <div className="cbm-metric-value">₹{kpis.allocated.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">74.3% of Total Budget</div>
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
                <div className="cbm-metric-value">₹{kpis.remaining.toLocaleString('en-IN')}</div>
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
                <div className="cbm-metric-value">{pendingCount} Requests</div>
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
                Real-time financial disbursements, vendor vouchers, and departmental expenditure records
              </p>
            </div>
          </div>

          <TransactionTable />
        </section>
      </div>
    </DashboardLayout>
  );
};

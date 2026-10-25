import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { useBudget } from '../context/BudgetContext';
import { exportProposalsToExcel } from '../utils/excelExport';
import {
  Wallet,
  PieChart,
  Clock,
  CreditCard,
  Building,
  Activity,
  FileSpreadsheet,
  Layers
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

  // 3. REMAINING BALANCE: Available budget = annual budget minus accepted proposals that have not yet been settled,
  // minus finalized settlement expenses. Pending and rejected proposals must not reduce available budget.
  const activeYearProposals = (proposals || []).filter(
    (p) => !activeAcademicYear || p.academicYearId === activeAcademicYear.id || p.academicYear === activeAcademicYear.academicYear || p.academicYear === activeAcademicYear.name
  );

  const acceptedProposals = activeYearProposals.filter(
    (p) => ['Accepted', 'accepted', 'Approved', 'approved'].includes(p.status)
  );

  const proposalDeductions = acceptedProposals.reduce((sum, p) => {
    if (p.settlementStatus === 'settled' || p.settlement_status === 'settled') {
      return sum + Number(p.settlementAmount ?? p.settlement_amount ?? 0);
    }
    return sum + Number(p.approvedAmount ?? p.approved_amount ?? p.amount ?? 0);
  }, 0);

  const recordedCategorySpent = (activeAyCategories.length > 0 ? activeAyCategories : (categories || [])).reduce(
    (sum, c) => sum + Number(c.spent_amount || c.spentAmount || c.spent || 0),
    0
  );

  const totalEffectiveSpent = Math.max(recordedCategorySpent, proposalDeductions);
  const remainingBalance = Math.max(0, totalBudget - totalEffectiveSpent);

  // 4. PENDING PROPOSALS: Count and sum of proposals awaiting evaluation
  const pendingProposals = activeYearProposals.filter(
    (p) => ['Pending', 'pending', 'Under Review', 'under review'].includes(p.status)
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

  // 5. CATEGORY BUDGET SUMMARY:
  // Remaining Budget = Total Category Budget - Reserved Amount - Actual Expenditure
  // Reserved amount includes accepted proposals awaiting settlement
  // Actual expenditure includes finalized settlements
  // A settled proposal is NOT counted in both amounts
  // Pending and rejected proposals do NOT reduce remaining budget
  const effectiveCats = activeAyCategories.length > 0 ? activeAyCategories : (categories || []);
  const categorySummaries = effectiveCats.map((c) => {
    const totalCategoryBudget = Number(c.allocated_amount || c.allocatedAmount || c.budget || 0);

    const catProposals = activeYearProposals.filter((p) =>
      p.categoryId === c.id ||
      (p.category && c.name && p.category.trim().toLowerCase() === c.name.trim().toLowerCase())
    );

    const acceptedAwaitingSettlement = catProposals.filter((p) => {
      const normStatus = (p.status || '').toLowerCase();
      const isAccepted = normStatus === 'accepted' || normStatus === 'approved';
      const isSettled = (p.settlementStatus || '').toLowerCase() === 'settled';
      return isAccepted && !isSettled;
    });

    const reservedAmount = acceptedAwaitingSettlement.reduce(
      (sum, p) => sum + Number(p.amount || p.approvedAmount || 0),
      0
    );

    const settledProposals = catProposals.filter((p) => {
      return (p.settlementStatus || '').toLowerCase() === 'settled';
    });

    const actualExpenditure = settledProposals.reduce(
      (sum, p) => sum + Number(p.settlementAmount ?? p.amount ?? 0),
      0
    );

    const remainingBudget = Math.max(0, totalCategoryBudget - reservedAmount - actualExpenditure);
    const totalCommitted = reservedAmount + actualExpenditure;
    const utilizationRate = totalCategoryBudget > 0
      ? Math.min(100, Math.round((totalCommitted / totalCategoryBudget) * 100))
      : 0;

    return {
      id: c.id,
      name: c.name,
      totalBudget: totalCategoryBudget,
      reservedAmount,
      reservedCount: acceptedAwaitingSettlement.length,
      actualExpenditure,
      settledCount: settledProposals.length,
      remainingBudget,
      utilizationRate
    };
  });

  const handleDownloadExcel = () => {
    const recordsToExport = activeYearProposals.length > 0 ? activeYearProposals : proposals;
    exportProposalsToExcel(recordsToExport, ayLabel);
  };

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Page Top Title Area with Download Excel Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Building size={14} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.04em' }}>
                {activeAcademicYear ? `ADMINISTRATIVE PORTAL • ACADEMIC YEAR ${ayLabel}` : 'ADMINISTRATIVE PORTAL • NO ACTIVE ACADEMIC YEAR CONFIGURED'}
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', margin: 0, lineHeight: 1.2 }}>
              CSE Department Budget Dashboard
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
              Official administrative ledger for managing departmental budget quotas, allocations, proposals, and audits.
            </p>
          </div>

          <button
            onClick={handleDownloadExcel}
            className="cbm-btn cbm-btn-primary"
            style={{
              height: 34,
              padding: '0 14px',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
            title="Export official proposals and settlements register to Excel with Google Drive links"
          >
            <FileSpreadsheet size={15} />
            <span>Download Excel</span>
          </button>
        </div>

        {/* 1. SECTION: BUDGET & FINANCIAL OVERVIEW */}
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
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', backgroundColor: 'var(--gold-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-border)' }}>
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
                  <Wallet size={15} />
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
                  <PieChart size={15} />
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
                  <CreditCard size={15} />
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
                  <Clock size={15} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">{pendingCount} Request{pendingCount === 1 ? '' : 's'}</div>
                <div className="cbm-metric-supporting">
                  {pendingTotal > 0 ? `₹${pendingTotal.toLocaleString('en-IN')} awaiting review` : 'All evaluated'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ADMIN CATEGORY BUDGET SUMMARY */}
        <section className="cbm-section" aria-labelledby="section-category-summary">
          <div className="cbm-section-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={15} style={{ color: 'var(--primary)' }} />
                <h2 id="section-category-summary" className="cbm-section-title">
                  Admin Category Budget Summary
                </h2>
              </div>
              <p className="cbm-section-subtitle">
                Category budget allocations, reserved amounts for accepted proposals, finalized settlements, and remaining budgets.
              </p>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
              Remaining Budget = Total Category Budget − Reserved − Expenditure
            </div>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th style={{ textAlign: 'right' }}>Total Category Budget</th>
                  <th style={{ textAlign: 'right' }}>Reserved Amount</th>
                  <th style={{ textAlign: 'right' }}>Actual Expenditure</th>
                  <th style={{ textAlign: 'right' }}>Remaining Budget</th>
                  <th style={{ textAlign: 'center' }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {categorySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                      No categories configured for the active academic session.
                    </td>
                  </tr>
                ) : (
                  categorySummaries.map((cat) => (
                    <tr key={cat.id || cat.name}>
                      <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {cat.name}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-heading)' }}>
                        ₹{cat.totalBudget.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gold-text)' }}>
                        ₹{cat.reservedAmount.toLocaleString('en-IN')}
                        {cat.reservedCount > 0 && (
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 400 }}>
                            {cat.reservedCount} accepted proposal{cat.reservedCount > 1 ? 's' : ''} awaiting settlement
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#0369A1' }}>
                        ₹{cat.actualExpenditure.toLocaleString('en-IN')}
                        {cat.settledCount > 0 && (
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 400 }}>
                            {cat.settledCount} finalized settlement{cat.settledCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: cat.remainingBudget > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        ₹{cat.remainingBudget.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: cat.remainingBudget > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                            color: cat.remainingBudget > 0 ? 'var(--success-text)' : 'var(--danger-text)',
                            border: cat.remainingBudget > 0 ? '1px solid var(--success-border)' : '1px solid var(--danger-border)'
                          }}
                        >
                          {cat.utilizationRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. RECENT DEPARTMENT ACTIVITY & TRANSACTIONS */}
        <section className="cbm-section" aria-labelledby="section-recent-activity">
          <div className="cbm-section-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={15} style={{ color: 'var(--gold)' }} />
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

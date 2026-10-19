import React from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Receipt,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { Button } from '../common/Button';
import { FUNDING_SOURCE_OPTIONS } from '../../config/proposalFormSchemas';

export const Step3BudgetDetails = ({
  academicYearLabel,
  allocatedQuota = 0,
  approvedCommittedExpenditure = 0,
  availableBalance = 0,
  proposedAmount = '',
  onProposedAmountChange,
  fundingSource,
  onFundingSourceChange,
  budgetRemarks,
  onBudgetRemarksChange,
  onBack,
  onContinue
}) => {
  const parsedAmount = Number(proposedAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  // Check if reliable quota/balance tracking is configured for this faculty or category
  const hasQuotaTracking = Number(allocatedQuota) > 0 || Number(availableBalance) > 0;
  const isOverBudget = hasQuotaTracking && isAmountValid && parsedAmount > availableBalance;
  const remainingBalanceAfterProposal = availableBalance - (isAmountValid ? parsedAmount : 0);

  // Can proceed only with valid positive amount and non-empty funding source
  const canProceed = isAmountValid && Boolean(fundingSource);

  // Currency formatter helper
  const formatInRupees = (val) => {
    const num = Number(val);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="cbm-card" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="cbm-form-ribbon">Step 3 of 5</span>
              <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>Budget & Funding Details</h2>
            </div>
            <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
              Specify the single total proposed expenditure amount and accounting funding source head for this proposal.
            </p>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--bg-page)',
              border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Receipt size={16} color={isOverBudget ? 'var(--danger)' : 'var(--primary)'} />
            <span style={{ fontSize: 13, fontWeight: 700, color: isOverBudget ? 'var(--danger-text)' : 'var(--text-heading)' }}>
              Total Proposed: {isAmountValid ? formatInRupees(parsedAmount) : '₹0'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* SINGLE BUDGET ENTRY SECTION */}
        <div
          style={{
            padding: '24px 26px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--gold-border)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <IndianRupee size={17} color="var(--primary)" />
                Single Proposal Budget Requisition
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Enter the comprehensive proposed budget figure. No itemised expense rows are required.
              </p>
            </div>
            <span className="cbm-form-ribbon">Single Amount Requisition</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
            {/* Funding Source Head */}
            <div className="cbm-input-group">
              <label htmlFor="funding-source-select" className="cbm-label">
                Funding Source Head <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="funding-source-select"
                value={fundingSource}
                onChange={(e) => onFundingSourceChange(e.target.value)}
                className="cbm-select"
                style={{ height: 44, fontSize: 13.5, fontWeight: 600 }}
                required
              >
                {FUNDING_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Designated institutional budget head against which financial sanctions are audited.
              </span>
            </div>

            {/* Total Proposed Budget Amount (₹) */}
            <div className="cbm-input-group">
              <label htmlFor="proposed-amount-input" className="cbm-label">
                Total Proposed Budget Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    fontSize: 16
                  }}
                >
                  ₹
                </span>
                <input
                  id="proposed-amount-input"
                  type="number"
                  min="1"
                  step="any"
                  value={proposedAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Disallow negative sign
                    if (val.startsWith('-')) return;
                    onProposedAmountChange(val);
                  }}
                  placeholder="e.g. 25000"
                  required
                  className="cbm-input"
                  style={{
                    height: 44,
                    paddingLeft: 34,
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-heading)'
                  }}
                />
              </div>

              {/* Validation helper / amount preview */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11.5, color: isAmountValid ? 'var(--text-muted)' : 'var(--danger)' }}>
                  {isAmountValid
                    ? `Sanction Figure: ${formatInRupees(parsedAmount)}`
                    : 'A valid, positive monetary amount is required.'}
                </span>
                {isAmountValid && (
                  <span style={{ fontSize: 11, color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} /> Valid Amount
                  </span>
                )}
              </div>
            </div>

            {/* Budget Justification / Special Remarks */}
            <div className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="budget-remarks-input" className="cbm-label">
                  Budget Justification / Special Remarks
                </label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  (Optional)
                </span>
              </div>
              <textarea
                id="budget-remarks-input"
                rows={3}
                value={budgetRemarks}
                onChange={(e) => onBudgetRemarksChange(e.target.value)}
                placeholder="Provide rationale for the requested expenditure, cost estimation basis, vendor quotation references, or TA/DA rate guidelines (Optional)..."
                className="cbm-textarea"
                style={{ fontSize: 13 }}
              />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Optional remarks to assist the Head of Department (HOD) and Budget Administrator during financial evaluation.
              </span>
            </div>
          </div>
        </div>

        {/* FINANCIAL ALLOCATION & QUOTA STATUS (WHEN CONFIGURED) */}
        {hasQuotaTracking && (
          <div
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FAFAFA',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PieChart size={15} color="var(--primary)" />
                Department Financial Allocation Quota Tracking
              </h4>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Session: <strong>{academicYearLabel}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Allocated Quota</span>
                <p style={{ margin: '4px 0 0 0', fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {formatInRupees(allocatedQuota)}
                </p>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved / Committed</span>
                <p style={{ margin: '4px 0 0 0', fontSize: 15, fontWeight: 700, color: 'var(--text-body)' }}>
                  {formatInRupees(approvedCommittedExpenditure)}
                </p>
              </div>

              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available Balance</span>
                <p style={{ margin: '4px 0 0 0', fontSize: 15, fontWeight: 700, color: 'var(--success-text)' }}>
                  {formatInRupees(availableBalance)}
                </p>
              </div>

              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isOverBudget ? 'var(--danger-bg)' : '#FFFFFF',
                  border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: isOverBudget ? 'var(--danger-text)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Remaining After Proposal
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: 15, fontWeight: 700, color: isOverBudget ? 'var(--danger-text)' : 'var(--primary)' }}>
                  {formatInRupees(remainingBalanceAfterProposal)}
                </p>
              </div>
            </div>

            {/* Over-budget Warning */}
            {isOverBudget && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
                role="alert"
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>
                  Proposed amount of {formatInRupees(parsedAmount)} exceeds your current available allocation balance of {formatInRupees(availableBalance)}.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          style={{ height: 42, padding: '0 20px', fontSize: 13.5 }}
        >
          Back to Proposal Details
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!canProceed || isOverBudget}
          icon={ArrowRight}
          style={{ height: 42, padding: '0 24px', fontSize: 13.5 }}
        >
          Continue to Review & Submit
        </Button>
      </div>
    </div>
  );
};

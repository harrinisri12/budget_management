import React, { useMemo } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Receipt,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Button } from '../common/Button';
import { FUNDING_SOURCE_OPTIONS, COMMON_EXPENSE_SUGGESTIONS } from '../../config/proposalFormSchemas';

export const Step3BudgetDetails = ({
  academicYearLabel,
  allocatedQuota = 0,
  approvedCommittedExpenditure = 0,
  availableBalance = 0,
  expenses = [],
  onAddExpense,
  onRemoveExpense,
  onExpenseChange,
  fundingSource,
  onFundingSourceChange,
  budgetRemarks,
  onBudgetRemarksChange,
  onBack,
  onContinue
}) => {
  // Compute total proposed expenditure from itemised expense rows
  const computedTotalProposed = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.proposedAmount) || 0), 0);
  }, [expenses]);

  const remainingBalanceAfterProposal = availableBalance - computedTotalProposed;
  const isOverBudget = computedTotalProposed > availableBalance;
  const isAmountValid = computedTotalProposed > 0;

  // Validation: can proceed only if proposed amount is > 0 and within available balance
  const canProceed = isAmountValid && !isOverBudget;

  const handleAddSuggestedExpense = (purposeText) => {
    onAddExpense(purposeText);
  };

  return (
    <div className="cbm-card" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="cbm-form-ribbon">Step 3 of 5</span>
              <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>Budget & Expenditure Details</h2>
            </div>
            <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
              Itemise requested expenditures in accordance with the institutional Programme Approval Form schedule.
            </p>
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--bg-page)',
              border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Receipt size={16} color={isOverBudget ? 'var(--danger)' : 'var(--primary)'} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: isOverBudget ? 'var(--danger-text)' : 'var(--text-heading)' }}>
              Total Proposed: ₹{computedTotalProposed.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* SECTION: FUNDING SOURCE & ALLOCATION OVERVIEW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 18 }}>
          <div className="cbm-input-group">
            <label htmlFor="funding-source-select" className="cbm-label">
              Funding Source Head <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="funding-source-select"
              value={fundingSource}
              onChange={(e) => onFundingSourceChange(e.target.value)}
              className="cbm-select"
              style={{ height: 42, fontSize: 13.5, fontWeight: 600 }}
              required
            >
              {FUNDING_SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Accounting head against which this proposal will be audited upon programme completion.
            </span>
          </div>

          <div className="cbm-input-group">
            <label htmlFor="budget-remarks-input" className="cbm-label">
              Budget Justification / Special Remarks <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <input
              id="budget-remarks-input"
              type="text"
              value={budgetRemarks}
              onChange={(e) => onBudgetRemarksChange(e.target.value)}
              placeholder="e.g. Rate negotiated as per institutional honorarium standards"
              className="cbm-input"
              style={{ height: 42 }}
            />
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Provide rationale if requesting high-expenditure travel or specialized honorarium.
            </span>
          </div>
        </div>

        {/* SECTION: REPEATABLE EXPENDITURE TABLE (Matching Pink Approval Form) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={16} color="var(--primary)" />
                Itemised Expenditure Table
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pink-accent-text)', backgroundColor: 'var(--pink-accent-bg)', padding: '2px 8px', borderRadius: 4 }}>
                  Approval Form Schedule
                </span>
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Itemise proposed expenses row by row. Revised and Actual columns are locked for subsequent audit workflows.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddExpense('')}
              className="cbm-btn cbm-btn-primary"
              style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} /> Add Expense Row
            </button>
          </div>

          {/* Quick Expense Suggestion Pills */}
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Add Common Expense Items:
            </span>
            <div className="cbm-pill-group" style={{ marginTop: 6 }}>
              {COMMON_EXPENSE_SUGGESTIONS.slice(0, 5).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddSuggestedExpense(item)}
                  className="cbm-pill-btn"
                  style={{ fontSize: 11.5, padding: '4px 10px' }}
                >
                  <Plus size={12} /> {item}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="cbm-expenditure-wrap">
            <table className="cbm-expenditure-table">
              <thead>
                <tr>
                  <th style={{ width: 50, textAlign: 'center' }}>S. No.</th>
                  <th style={{ minWidth: 240 }}>Purpose / Expense Description</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Proposed Amount (₹)</th>
                  <th style={{ width: 140, textAlign: 'right' }}>
                    Revised Amount <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'none' }}>(Post-Review)</span>
                  </th>
                  <th style={{ width: 140, textAlign: 'right' }}>
                    Actual Amount <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'none' }}>(Settlement)</span>
                  </th>
                  <th style={{ minWidth: 160 }}>Remarks</th>
                  <th style={{ width: 50, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 500 }}>
                        No expense rows added yet. Add itemised expenses to calculate the total proposed amount.
                      </p>
                      <button
                        type="button"
                        onClick={() => onAddExpense('')}
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      >
                        <Plus size={13} /> Add First Expense
                      </button>
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp, idx) => (
                    <tr key={exp.id || idx}>
                      {/* S. No. */}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                        {idx + 1}
                      </td>

                      {/* Purpose */}
                      <td>
                        <input
                          type="text"
                          value={exp.purpose || ''}
                          onChange={(e) => onExpenseChange(exp.id, 'purpose', e.target.value)}
                          placeholder="e.g. Honorarium for Guest Speaker / Travel Allowance"
                          required
                          className="cbm-input"
                          style={{ height: 34, fontSize: 12.5 }}
                        />
                      </td>

                      {/* Proposed Amount */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--slate-500)', fontSize: 12 }}>₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={exp.proposedAmount === '' ? '' : exp.proposedAmount}
                            onChange={(e) => onExpenseChange(exp.id, 'proposedAmount', e.target.value)}
                            placeholder="0"
                            required
                            className="cbm-input"
                            style={{ height: 34, paddingLeft: 24, textAlign: 'right', fontWeight: 700, fontSize: 13 }}
                          />
                        </div>
                      </td>

                      {/* Revised Amount (Locked for Faculty) */}
                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            height: 34,
                            padding: '0 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            fontSize: 12,
                            fontWeight: 500
                          }}
                          title="Revised Amount is modified exclusively during authorized HOD / Administrator revision workflows"
                        >
                          —
                        </div>
                      </td>

                      {/* Actual Amount (Locked for Faculty post-programme settlement) */}
                      <td style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            height: 34,
                            padding: '0 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            fontSize: 12,
                            fontWeight: 500
                          }}
                          title="Actual Amount is submitted following completion of the programme during voucher settlement"
                        >
                          —
                        </div>
                      </td>

                      {/* Remarks */}
                      <td>
                        <input
                          type="text"
                          value={exp.remarks || ''}
                          onChange={(e) => onExpenseChange(exp.id, 'remarks', e.target.value)}
                          placeholder="Optional notes / breakdown"
                          className="cbm-input"
                          style={{ height: 34, fontSize: 12 }}
                        />
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'center' }}>
                        {expenses.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => onRemoveExpense(exp.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--danger)',
                              cursor: 'pointer',
                              padding: 4,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            aria-label={`Remove row ${idx + 1}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span style={{ color: 'var(--slate-300)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#F8F9FA', fontWeight: 700, borderTop: '2px solid var(--border)' }}>
                  <td colSpan={2} style={{ padding: '12px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-heading)' }}>
                    Total Requested Proposed Expenditure:
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{computedTotalProposed.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={4} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                    Automatically calculated sum of itemised expenditure rows.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* SECTION: FINANCIAL COMPUTATION & REMAINING BALANCE (Source of Truth) */}
        <div
          style={{
            padding: '22px 24px',
            borderRadius: 'var(--radius-card)',
            backgroundColor: isOverBudget ? 'var(--danger-bg)' : '#FCFBF8',
            border: isOverBudget ? '1.5px solid var(--danger-border)' : '1.5px solid var(--gold-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                Financial Computation & Remaining Quota Audit
              </h3>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Source of truth: Authentic Database Quota
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Cycle</span>
              <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                {academicYearLabel || 'Active Session'}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allocated Annual Quota</span>
              <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-body)' }}>
                ₹{allocatedQuota.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Committed / Approved</span>
              <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                ₹{approvedCommittedExpenditure.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Available Balance</span>
              <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                ₹{availableBalance.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Proposed Amount</span>
              <p style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                ₹{computedTotalProposed.toLocaleString('en-IN')}
              </p>
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--success-bg)',
                border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--success-border)'
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 700, color: isOverBudget ? 'var(--danger-text)' : 'var(--success-text)', textTransform: 'uppercase' }}>
                Remaining After This Proposal
              </span>
              <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: isOverBudget ? 'var(--danger-text)' : 'var(--success-text)' }}>
                ₹{remainingBalanceAfterProposal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Validation Alert */}
          {isOverBudget && (
            <div
              style={{
                marginTop: 16,
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
              <AlertCircle size={16} />
              <span>
                Insufficient available quota balance. The proposed expenditure of ₹{computedTotalProposed.toLocaleString('en-IN')} exceeds your permitted remaining balance of ₹{availableBalance.toLocaleString('en-IN')} by ₹{Math.abs(remainingBalanceAfterProposal).toLocaleString('en-IN')}. Please reduce itemised expenses to proceed.
              </span>
            </div>
          )}

          {!isAmountValid && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--warning-text)',
                fontSize: 12.5,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Info size={16} />
              <span>Please enter itemised proposed expense amounts greater than ₹0 to calculate the proposal budget.</span>
            </div>
          )}
        </div>
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
          disabled={!canProceed}
          icon={ArrowRight}
          style={{ height: 42, padding: '0 24px', fontSize: 13.5 }}
        >
          Continue to Review & Submit
        </Button>
      </div>
    </div>
  );
};

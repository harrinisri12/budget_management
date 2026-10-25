import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Receipt,
  AlertCircle,
  CheckCircle2,
  PieChart,
  UploadCloud,
  FileText,
  FileCheck,
  Eye,
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Button } from '../common/Button';

export const Step3BudgetDetails = ({
  academicYearLabel,
  allocatedQuota = 0,
  approvedCommittedExpenditure = 0,
  availableBalance = 0,
  proposedAmount = '',
  onProposedAmountChange,
  // Automatically matched funding category from Step 1
  fundingCategory = '',
  categoryBudget = 0,
  fundingSource = '',
  onFundingSourceChange: _onFundingSourceChange,
  budgetRemarks = '',
  onBudgetRemarksChange,
  // Letter ID and PDF Upload fields
  letterId = '',
  onLetterIdChange,
  letterFile = null,
  onLetterFileChange,
  onBack,
  onContinue
}) => {
  const [fileError, setFileError] = useState('');
  const [letterIdTouched, setLetterIdTouched] = useState(false);

  const parsedAmount = Number(proposedAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const effectiveFundingSource = fundingCategory || fundingSource || '';

  // Letter ID validation: Reject empty or whitespace-only values
  const trimmedLetterId = (letterId || '').trim();
  const isLetterIdValid = trimmedLetterId.length > 0;

  // PDF file validation: Require a valid selected PDF file
  const isLetterFileValid = Boolean(letterFile && letterFile.name);

  // File size formatter
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // PDF file upload handler
  const handleFileSelection = (file) => {
    if (!file) return;
    setFileError('');

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      const errMsg = 'Invalid file type: Please upload a valid PDF document (.pdf).';
      setFileError(errMsg);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = `File size (${formatFileSize(file.size)}) exceeds the 10 MB maximum limit.`;
      setFileError(errMsg);
      return;
    }

    if (letterFile?.previewUrl) {
      try {
        URL.revokeObjectURL(letterFile.previewUrl);
      } catch {
        // ignore
      }
    }

    const previewUrl = URL.createObjectURL(file);
    if (onLetterFileChange) {
      onLetterFileChange({
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        lastModified: file.lastModified,
        previewUrl,
        uploadedAt: new Date().toISOString()
      });
    }
  };

  // Check if reliable quota/balance tracking is configured for this faculty or category
  const hasQuotaTracking = Number(allocatedQuota) > 0 || Number(availableBalance) > 0;
  const isOverBudget = hasQuotaTracking && isAmountValid && parsedAmount > availableBalance;
  const remainingBalanceAfterProposal = availableBalance - (isAmountValid ? parsedAmount : 0);

  // Can proceed only with valid positive amount, non-empty funding source, valid Letter ID, and valid PDF
  const canProceed = isAmountValid && Boolean(effectiveFundingSource) && isLetterIdValid && isLetterFileValid;

  // Currency formatter helper
  const formatInRupees = (val) => {
    const num = Number(val);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="cbm-card" style={{ padding: '12px 18px' }}>
      {/* Compact Header */}
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="cbm-form-ribbon" style={{ padding: '2px 7px', fontSize: 10.5 }}>Step 3 of 5</span>
          <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 14 }}>Budget &amp; Funding Details</h2>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>— Single Proposed Amount &amp; Sanction Letter</span>
        </div>

        <div
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--bg-page)',
            border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            fontWeight: 700,
            color: isOverBudget ? 'var(--danger-text)' : 'var(--text-heading)'
          }}
        >
          <Receipt size={13} color={isOverBudget ? 'var(--danger)' : 'var(--primary)'} />
          <span>Total Proposed: {isAmountValid ? formatInRupees(parsedAmount) : '₹0'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* SECTION 1: PROPOSED BUDGET ENTRY */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FAFAFA',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px 12px' }}>
            {/* Funding Source Head */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Funding Source Head <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>Derived from Category</span>
              </div>
              <div
                style={{
                  height: 32,
                  padding: '0 10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  color: 'var(--text-heading)',
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{effectiveFundingSource || 'Not Selected'}</span>
                <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: 'var(--slate-100)', color: 'var(--slate-600)', fontWeight: 700 }}>
                  LOCKED
                </span>
              </div>
            </div>

            {/* Total Proposed Budget Amount */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="budget-amount-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                Proposed Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="budget-amount-input"
                type="number"
                min="1"
                step="any"
                value={proposedAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('-')) return;
                  onProposedAmountChange(val);
                }}
                placeholder="e.g. 15000"
                required
                className="cbm-input"
                style={{
                  height: 32,
                  fontSize: 13,
                  fontWeight: 700,
                  color: isOverBudget ? 'var(--danger-text)' : 'var(--primary)',
                  borderColor: isOverBudget ? 'var(--danger)' : undefined
                }}
              />
            </div>

            {/* Budget Remarks (Optional) */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="budget-remarks-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                Justification / Notes <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <input
                id="budget-remarks-input"
                type="text"
                value={budgetRemarks || ''}
                onChange={(e) => onBudgetRemarksChange && onBudgetRemarksChange(e.target.value)}
                placeholder="Brief justification or breakdown"
                className="cbm-input"
                style={{ height: 32, fontSize: 12.5 }}
              />
            </div>
          </div>

          {/* Budget Error Alert if Over Quota */}
          {isOverBudget && (
            <div
              style={{
                marginTop: 6,
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: 11.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              role="alert"
            >
              <AlertCircle size={13} />
              <span>Insufficient balance: Proposed amount exceeds permitted remaining quota of ₹{availableBalance.toLocaleString('en-IN')}.</span>
            </div>
          )}
        </div>

        {/* SECTION 2: SANCTION LETTER & DOCUMENT ATTACHMENT */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FAFAFA',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            {/* Letter ID Field */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="letter-id-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Sanction / Permission Letter ID <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 3,
                    backgroundColor: isLetterIdValid ? '#F0FDF4' : '#FEF2F2',
                    color: isLetterIdValid ? '#166534' : '#DC2626'
                  }}
                >
                  {isLetterIdValid ? '✓ Valid' : 'Required *'}
                </span>
              </div>
              <input
                id="letter-id-input"
                type="text"
                value={letterId}
                onChange={(e) => {
                  setLetterIdTouched(true);
                  if (onLetterIdChange) onLetterIdChange(e.target.value);
                }}
                onBlur={() => setLetterIdTouched(true)}
                placeholder="e.g. KEC/CSE/2026-27/OD-104 or REF-458"
                className="cbm-input"
                required
                style={{
                  height: 32,
                  fontSize: 12.5,
                  borderColor: letterIdTouched && !isLetterIdValid ? 'var(--danger)' : undefined
                }}
              />
            </div>

            {/* PDF Upload Field */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbm-label" htmlFor="letter-pdf-input" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Sanction Letter (PDF Document) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 3,
                    backgroundColor: isLetterFileValid ? '#F0FDF4' : '#FEF2F2',
                    color: isLetterFileValid ? '#166534' : '#DC2626'
                  }}
                >
                  {isLetterFileValid ? '✓ PDF Attached' : 'Required (PDF) *'}
                </span>
              </div>

              {!letterFile ? (
                <label
                  htmlFor="letter-pdf-input"
                  style={{
                    height: 32,
                    border: '1.5px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-page)',
                    transition: 'all 0.15s ease'
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelection(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <UploadCloud size={14} color="var(--primary)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                    Click or drag &amp; drop PDF letter (max 10MB)
                  </span>
                  <input
                    id="letter-pdf-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelection(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              ) : (
                <div
                  style={{
                    height: 32,
                    padding: '0 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #BBF7D0',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                    <FileCheck size={14} color="#166534" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {letterFile.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#166534', flexShrink: 0 }}>
                      ({formatFileSize(letterFile.size)})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {letterFile.previewUrl && (
                      <a
                        href={letterFile.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ height: 22, padding: '0 6px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, borderRadius: 3, border: '1px solid var(--border)', backgroundColor: '#FFFFFF', color: 'var(--text-body)', textDecoration: 'none' }}
                      >
                        <Eye size={11} /> View
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (letterFile?.previewUrl) {
                          try { URL.revokeObjectURL(letterFile.previewUrl); } catch { /* ignore */ }
                        }
                        if (onLetterFileChange) onLetterFileChange(null);
                      }}
                      style={{ height: 22, padding: '0 6px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, borderRadius: 3, border: '1px solid var(--danger-border)', backgroundColor: '#FFFFFF', color: 'var(--danger)', cursor: 'pointer' }}
                      title="Remove file"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inline File Selection Error */}
          {fileError && (
            <div
              style={{
                marginTop: 4,
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: 11.5,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              role="alert"
            >
              <AlertCircle size={12} style={{ flexShrink: 0 }} />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* FINANCIAL ALLOCATION & QUOTA STATUS (SLIM STRIP) */}
        {hasQuotaTracking && (
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FAFAFA',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 6,
              fontSize: 11.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PieChart size={13} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Quota Tracking ({academicYearLabel}):</span>
              <strong style={{ color: 'var(--text-heading)' }}>Available Balance: ₹{availableBalance.toLocaleString('en-IN')}</strong>
            </div>
            <span style={{ fontWeight: 600, color: remainingBalanceAfterProposal >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
              Est. Remaining: ₹{Math.max(0, remainingBalanceAfterProposal).toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          style={{ height: 34, padding: '0 16px', fontSize: 12.5 }}
        >
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!canProceed}
          icon={ArrowRight}
          style={{ height: 34, padding: '0 18px', fontSize: 12.5 }}
        >
          Review Proposal
        </Button>
      </div>
    </div>
  );
};

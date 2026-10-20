import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Receipt,
  IndianRupee,
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
  budgetRemarks,
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
      alert(errMsg);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const errMsg = `File size (${formatFileSize(file.size)}) exceeds the 10 MB maximum limit.`;
      setFileError(errMsg);
      alert(errMsg);
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
            {/* Funding Source Head (Read-Only, Automatically Matched from Selected Category) */}
            <div className="cbm-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbm-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lock size={12} color="var(--primary)" />
                  Funding Source Head <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    backgroundColor: effectiveFundingSource ? '#F0FDF4' : '#FEF3C7',
                    color: effectiveFundingSource ? '#166534' : '#92400E',
                    border: effectiveFundingSource ? '1px solid #BBF7D0' : '1px solid #FDE68A'
                  }}
                >
                  {effectiveFundingSource ? 'Auto-Matched from Category' : 'Awaiting Category'}
                </span>
              </div>

              <div
                id="funding-source-display"
                style={{
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
                title="Funding source is automatically determined by the Category selected in Step 1"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: effectiveFundingSource ? 'var(--text-heading)' : 'var(--text-muted)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {effectiveFundingSource || 'Select a category in Step 1'}
                  </span>
                </div>

                {effectiveFundingSource && categoryBudget > 0 && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--primary)',
                      flexShrink: 0,
                      padding: '2px 8px',
                      backgroundColor: 'var(--gold-subtle)',
                      borderRadius: 4,
                      border: '1px solid var(--gold-border)'
                    }}
                  >
                    Allocated: {formatInRupees(categoryBudget)}
                  </span>
                )}
              </div>

              <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} color="var(--success-text)" />
                Automatically determined by the Category selected in Step 1.
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

        {/* SANCTION / REFERENCE LETTER & DOCUMENT ATTACHMENT */}
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
                <FileText size={17} color="var(--primary)" />
                Sanction / Reference Letter & Document Attachment <span style={{ color: 'var(--danger)' }}>*</span>
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Provide the official sanction or permission letter identifier and attach the mandatory approval letter (PDF).
              </p>
            </div>
            <span
              className="cbm-form-ribbon"
              style={{
                backgroundColor: isLetterIdValid && isLetterFileValid ? '#F0FDF4' : '#FEF2F2',
                color: isLetterIdValid && isLetterFileValid ? '#166534' : '#DC2626',
                border: isLetterIdValid && isLetterFileValid ? '1px solid #BBF7D0' : '1px solid #FECACA'
              }}
            >
              {isLetterIdValid && isLetterFileValid ? 'Mandatory Requirements Satisfied' : 'Mandatory Document & ID *'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
            {/* Letter ID Field */}
            <div className="cbm-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="letter-id-input" className="cbm-label">
                  Sanction / Permission Letter ID <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    backgroundColor: isLetterIdValid ? '#F0FDF4' : '#FEF2F2',
                    color: isLetterIdValid ? '#166534' : '#DC2626',
                    border: isLetterIdValid ? '1px solid #BBF7D0' : '1px solid #FECACA'
                  }}
                >
                  {isLetterIdValid ? 'Valid ID' : 'Required *'}
                </span>
              </div>
              <input
                id="letter-id-input"
                type="text"
                value={letterId}
                onChange={(e) => {
                  setLetterIdTouched(true);
                  if (onLetterIdChange) {
                    onLetterIdChange(e.target.value);
                  }
                }}
                onBlur={() => setLetterIdTouched(true)}
                placeholder="e.g. KEC/CSE/2026-27/OD-104 or REF-LTR-458"
                className="cbm-input"
                required
                aria-required="true"
                style={{
                  height: 44,
                  fontSize: 13.5,
                  borderColor: letterIdTouched && !isLetterIdValid ? 'var(--danger)' : undefined
                }}
              />
              <div style={{ marginTop: 4 }}>
                {letterIdTouched && !isLetterIdValid ? (
                  <span style={{ fontSize: 11.5, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} />
                    Sanction / Permission Letter ID is required and cannot be empty or whitespace only.
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, color: isLetterIdValid ? 'var(--success-text)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isLetterIdValid ? (
                      <>
                        <CheckCircle2 size={12} color="var(--success-text)" />
                        Sanction Letter ID verified: <strong>{trimmedLetterId}</strong>
                      </>
                    ) : (
                      'Official reference code or outward number of the principal / HOD approval letter (Mandatory).'
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* PDF Upload Field */}
            <div className="cbm-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cbm-label" htmlFor="letter-pdf-input">
                  Approval / Sanction Letter (PDF Document) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    backgroundColor: isLetterFileValid ? '#F0FDF4' : '#FEF2F2',
                    color: isLetterFileValid ? '#166534' : '#DC2626',
                    border: isLetterFileValid ? '1px solid #BBF7D0' : '1px solid #FECACA'
                  }}
                >
                  {isLetterFileValid ? 'PDF Attached' : 'Required (PDF) *'}
                </span>
              </div>

              {!letterFile ? (
                <div>
                  <label
                    htmlFor="letter-pdf-input"
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
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
                    <UploadCloud size={24} color="var(--primary)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                      Click to choose PDF or drag & drop here
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Supports standard PDF documents up to 10 MB (Mandatory)
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
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #BBF7D0',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <FileCheck size={20} />
                    </div>
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {letterFile.name}
                      </p>
                      <span style={{ fontSize: 11.5, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{formatFileSize(letterFile.size)} • PDF</span>
                        <span>•</span>
                        <span style={{ fontWeight: 600 }}>Ready for submission</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {letterFile.previewUrl && (
                      <a
                        href={letterFile.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                        style={{ height: 30, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={12} /> View
                      </a>
                    )}
                    {/* Replace PDF Button */}
                    <label
                      htmlFor="letter-pdf-replace-input"
                      className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      style={{ height: 30, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                      title="Replace with another PDF"
                    >
                      <RefreshCw size={12} /> Replace
                      <input
                        id="letter-pdf-replace-input"
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
                    <button
                      type="button"
                      onClick={() => {
                        if (letterFile?.previewUrl) {
                          try { URL.revokeObjectURL(letterFile.previewUrl); } catch { /* ignore */ }
                        }
                        if (onLetterFileChange) {
                          onLetterFileChange(null);
                        }
                      }}
                      className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      style={{ height: 30, fontSize: 11.5, color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                      title="Remove file"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Inline File Selection Error */}
              {fileError && (
                <div
                  style={{
                    marginTop: 6,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  role="alert"
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Required PDF prompt when file is not selected */}
              {!letterFile && !fileError && (
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Official approval or sanction document in PDF format must be selected before proceeding.
                </span>
              )}

              {/* Informative storage notice respecting constraint 6 and 7 */}
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  ℹ️ Document metadata (Letter ID, filename, size, type, upload timestamp) is recorded with proposal details. Cloud binary file storage requires a provisioned Supabase Storage bucket.
                </span>
              </div>
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

      {/* Missing Requirements Guidance Alert */}
      {!canProceed && (
        <div
          style={{
            marginTop: 24,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#92400E',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
          role="alert"
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>Mandatory requirements to proceed to Review & Submit:</strong>{' '}
            {[
              !isAmountValid ? 'Valid proposed budget amount (₹)' : null,
              !effectiveFundingSource ? 'Category selection from Step 1' : null,
              !isLetterIdValid ? 'Sanction / Permission Letter ID' : null,
              !isLetterFileValid ? 'Approval / Sanction Letter (PDF)' : null
            ].filter(Boolean).join(' • ')}
          </span>
        </div>
      )}

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 20,
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

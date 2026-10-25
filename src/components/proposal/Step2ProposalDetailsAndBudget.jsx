import React, { useState, useMemo } from 'react';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Users,
  Building,
  AlertTriangle,
  Timer,
  Receipt,
  FileText,
  AlertCircle,
  PieChart,
  UploadCloud,
  FileCheck,
  Eye,
  Trash2,
  Calendar
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  AUDIENCE_OPTIONS,
  calculateHackathonDuration
} from '../../config/proposalFormSchemas';

export const Step2ProposalDetailsAndBudget = ({
  proposalIdPreview,
  categoryName,
  subCategoryName,
  schema = {},
  // Common details
  title = '',
  onTitleChange,
  programDate = '',
  onProgramDateChange,
  endDate = '',
  onEndDateChange,
  selectedAudience = '',
  selectedAudiences = [],
  onAudienceChange,
  onToggleAudience,
  // Hackathon duration manual entry
  hackathonDurationHours = '',
  onHackathonDurationHoursChange,
  // Dynamic category details
  eventData = {},
  onEventDataChange,
  // Budget & Quota details
  academicYearLabel,
  allocatedQuota = 0,
  approvedCommittedExpenditure = 0,
  availableBalance = 0,
  proposedAmount = '',
  onProposedAmountChange,
  fundingCategory = '',
  categoryBudget = 0,
  fundingSource = '',
  onFundingSourceChange: _onFundingSourceChange,
  budgetRemarks = '',
  onBudgetRemarksChange,
  // Letter ID & PDF Upload fields
  letterId = '',
  onLetterIdChange,
  letterFile = null,
  onLetterFileChange,
  // Navigation
  onBack,
  onContinue
}) => {
  const [fileError, setFileError] = useState('');
  const [letterIdTouched, setLetterIdTouched] = useState(false);

  const isHackathon = Boolean(schema?.isHackathon || schema?.type === 'hackathon');
  const requiresMultiDay = Boolean(schema?.requiresMultiDay);

  // Active audience selection
  const currentAudience = selectedAudience || (Array.isArray(selectedAudiences) && selectedAudiences.length > 0 ? selectedAudiences[0] : '');

  const handleAudienceSelect = (val) => {
    if (typeof onAudienceChange === 'function') {
      onAudienceChange(val);
    }
    if (typeof onToggleAudience === 'function') {
      onToggleAudience(val);
    }
  };

  // Live Hackathon Duration Calculation
  const hackathonDuration = useMemo(() => {
    if (!isHackathon) return null;
    return calculateHackathonDuration(programDate, endDate, '09:00', '17:00');
  }, [isHackathon, programDate, endDate]);

  // Only required dynamic fields from schema
  const requiredDynamicFields = useMemo(() => {
    return (schema?.fields || []).filter((f) => Boolean(f.required));
  }, [schema]);

  // Budget calculations
  const parsedAmount = Number(proposedAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const effectiveFundingSource = fundingCategory || fundingSource || categoryName || '';

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

  // Quota & Balance tracking
  const hasQuotaTracking = Number(allocatedQuota) > 0 || Number(availableBalance) > 0;
  const isOverBudget = hasQuotaTracking && isAmountValid && parsedAmount > availableBalance;
  const remainingBalanceAfterProposal = availableBalance - (isAmountValid ? parsedAmount : 0);

  // Currency formatter helper
  const formatInRupees = (val) => {
    const num = Number(val);
    return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  // Combined Comprehensive Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    // 1. Programme Details
    if (!title || !title.trim()) {
      errors.push('Programme / Proposal Title is required.');
    }
    if (!programDate) {
      errors.push('Start Date of Programme is required.');
    }
    if (requiresMultiDay && !endDate) {
      errors.push(`End Date of Programme is required for ${schema.name || 'this activity'}.`);
    }
    if (endDate && programDate && endDate < programDate) {
      errors.push('End Date cannot precede the Start Date.');
    }
    if (!currentAudience) {
      errors.push('Please select the Target Audience.');
    }

    // Hackathon Duration
    if (isHackathon) {
      if (!hackathonDurationHours && !hackathonDuration?.isValid) {
        errors.push('Hackathon Duration is required (please enter total duration in hours).');
      } else if (hackathonDurationHours && (isNaN(Number(hackathonDurationHours)) || Number(hackathonDurationHours) <= 0)) {
        errors.push('Hackathon Duration must be a positive number of hours.');
      }
    }

    // Dynamic schema fields
    for (const field of requiredDynamicFields) {
      const val = eventData[field.key];
      if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
        errors.push(`"${field.label}" is required.`);
      }
    }

    // 2. Budget & Funding Details
    if (!proposedAmount || !isAmountValid) {
      errors.push('Proposed budget amount greater than ₹0 is required.');
    } else if (isOverBudget) {
      errors.push('Proposed amount exceeds permitted remaining quota.');
    }

    // 3. Sanction Letter & Document Details
    if (!isLetterIdValid) {
      errors.push('Sanction / Permission Letter ID is required.');
    }
    if (!isLetterFileValid) {
      errors.push('Sanction Letter (PDF Document) is required.');
    }

    return errors;
  }, [
    title,
    programDate,
    endDate,
    requiresMultiDay,
    currentAudience,
    schema,
    requiredDynamicFields,
    eventData,
    isHackathon,
    hackathonDurationHours,
    hackathonDuration,
    proposedAmount,
    isAmountValid,
    isOverBudget,
    isLetterIdValid,
    isLetterFileValid
  ]);

  const isValid = validationErrors.length === 0;

  return (
    <div className="cbm-card">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="cbm-form-ribbon" style={{ padding: '3px 8px', fontSize: 11 }}>Step 2 of 3</span>
            <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 16 }}>
              Proposal Details &amp; Budget
            </h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              — {subCategoryName || categoryName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-subtle)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 11
              }}
            >
              {schema.badge || schema.name || 'Proposal'}
            </span>

            {proposalIdPreview && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  backgroundColor: 'var(--slate-100)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace'
                }}
                title="System Generated Sequence Preview"
              >
                <Lock size={10} /> {proposalIdPreview}
              </span>
            )}

            <div
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--bg-page)',
                border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: isOverBudget ? 'var(--danger-text)' : 'var(--text-heading)'
              }}
            >
              <Receipt size={12} color={isOverBudget ? 'var(--danger)' : 'var(--primary)'} />
              <span>Proposed: {isAmountValid ? formatInRupees(parsedAmount) : '₹0'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* ========================================================================= */}
        {/* SECTION 1: PROGRAMME DETAILS & SPECIFICATIONS                             */}
        {/* ========================================================================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Calendar size={14} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
              1. Programme Details &amp; Specifications
            </h3>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
              {/* Programme Title - Full Width */}
              <div className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                <label htmlFor="prog-title-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Programme / Proposal Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prog-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="e.g. Industry Guest Lecture on Cloud Architecture / National Hackathon 2026"
                  required
                  className="cbm-input"
                  style={{ height: 32, fontSize: 12.5 }}
                />
              </div>

              {/* Start Date & End Date Side by Side */}
              <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="prog-start-date-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  Start Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="prog-start-date-input"
                  type="date"
                  value={programDate}
                  onChange={(e) => onProgramDateChange(e.target.value)}
                  required
                  className="cbm-input"
                  style={{ height: 32, fontSize: 12.5 }}
                />
              </div>

              <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="prog-end-date-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                    End Date {requiresMultiDay ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                  </label>
                  {!requiresMultiDay && (
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>(Optional if 1-day)</span>
                  )}
                </div>
                <input
                  id="prog-end-date-input"
                  type="date"
                  value={endDate}
                  min={programDate || undefined}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  required={requiresMultiDay}
                  className="cbm-input"
                  style={{ height: 32, fontSize: 12.5 }}
                />
              </div>

              {/* Intended Target Audience (Dropdown) - Full Width */}
              <div className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                <label htmlFor="prog-audience-select" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={12} /> Intended Target Audience <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  id="prog-audience-select"
                  value={currentAudience}
                  onChange={(e) => handleAudienceSelect(e.target.value)}
                  required
                  className="cbm-select"
                  style={{ height: 32, fontSize: 12.5 }}
                >
                  <option value="" disabled>-- Select Intended Target Audience --</option>
                  {AUDIENCE_OPTIONS.map((aud) => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compact Hackathon Duration Specification if applicable */}
            {isHackathon && (
              <div
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Timer size={14} color="#0284C7" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0369A1' }}>
                    Duration (Hours) <span style={{ color: 'var(--danger)' }}>*</span>:
                  </span>
                  <input
                    id="hackathon-duration-input"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="Hours (e.g. 24)"
                    value={hackathonDurationHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('-')) return;
                      onHackathonDurationHoursChange(val);
                    }}
                    className="cbm-input"
                    style={{ height: 28, width: 110, fontSize: 12, fontWeight: 600, color: '#0369A1', padding: '0 8px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {[
                    { label: '12h', hours: '12' },
                    { label: '24h', hours: '24' },
                    { label: '36h', hours: '36' },
                    { label: '48h', hours: '48' }
                  ].map((preset) => (
                    <button
                      key={preset.hours}
                      type="button"
                      onClick={() => onHackathonDurationHoursChange(preset.hours)}
                      style={{
                        padding: '2px 7px',
                        borderRadius: 3,
                        fontSize: 10.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: hackathonDurationHours === preset.hours ? '1px solid #0284C7' : '1px solid #BAE6FD',
                        backgroundColor: hackathonDurationHours === preset.hours ? '#0284C7' : '#FFFFFF',
                        color: hackathonDurationHours === preset.hours ? '#FFFFFF' : '#0369A1'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Programme-Specific Form Fields (Strictly Required Fields Only) */}
          {requiredDynamicFields.length > 0 && (
            <div
              style={{
                marginTop: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Building size={13} color="var(--primary)" />
                  {schema.name} Specific Details
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '8px 12px' }}>
                {requiredDynamicFields.map((field) => {
                  const val = eventData[field.key] ?? (field.defaultValue || '');

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                        <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                          {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <textarea
                          id={`field-${field.key}`}
                          value={val}
                          onChange={(e) => onEventDataChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          required
                          className="cbm-textarea"
                          style={{ fontSize: 12.5, minHeight: 48, padding: '6px 10px' }}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.key} className="cbm-input-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                          {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select
                          id={`field-${field.key}`}
                          value={val}
                          onChange={(e) => onEventDataChange(field.key, e.target.value)}
                          required
                          className="cbm-select"
                          style={{ height: 32, fontSize: 12.5 }}
                        >
                          <option value="">-- Select {field.label} --</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className="cbm-input-group" style={{ marginBottom: 0 }}>
                      <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                        {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        id={`field-${field.key}`}
                        type={field.type || 'text'}
                        value={val}
                        min={field.min}
                        onChange={(e) => onEventDataChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        required
                        className="cbm-input"
                        style={{ height: 32, fontSize: 12.5 }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: BUDGET & FUNDING ALLOCATION                                    */}
        {/* ========================================================================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Receipt size={14} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
              2. Budget &amp; Funding Allocation
            </h3>
          </div>

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

            {/* FINANCIAL ALLOCATION & QUOTA STATUS (SLIM STRIP) */}
            {hasQuotaTracking && (
              <div
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
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
                  <strong style={{ color: 'var(--text-heading)' }}>Available: ₹{availableBalance.toLocaleString('en-IN')}</strong>
                </div>
                <span style={{ fontWeight: 600, color: remainingBalanceAfterProposal >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  Est. Remaining: ₹{Math.max(0, remainingBalanceAfterProposal).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SANCTION LETTER & DOCUMENT ATTACHMENT                          */}
        {/* ========================================================================= */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <FileText size={14} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
              3. Sanction Letter &amp; Approval Document
            </h3>
          </div>

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
        </div>

        {/* Validation Errors Notice */}
        {!isValid && validationErrors.length > 0 && (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              color: 'var(--warning-text)',
              fontSize: 11.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <AlertTriangle size={13} />
              <span>Please complete the required fields: {validationErrors.join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          style={{ height: 38, padding: '0 18px', fontSize: 13 }}
        >
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!isValid || isOverBudget}
          icon={ArrowRight}
          style={{ height: 38, padding: '0 20px', fontSize: 13 }}
        >
          Continue to Review &amp; Submit
        </Button>
      </div>
    </div>
  );
};

export const Step2ProposalDetails = Step2ProposalDetailsAndBudget;

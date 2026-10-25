import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Edit2,
  Calendar,
  Layers,
  Receipt,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  Copy,
  PlusCircle,
  List
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { calculateHackathonDuration } from '../../config/proposalFormSchemas';

export const Step3ReviewAndSubmit = ({
  // Proposal review details
  academicYearLabel,
  submissionDateStr,
  categoryName,
  subCategoryName,
  proposalIdPreview,
  schema = {},
  title = '',
  programDate = '',
  endDate = '',
  startTime = '',
  endTime = '',
  selectedAudiences = [],
  hackathonDurationHours = '',
  letterId = '',
  letterFile = null,
  eventData = {},
  fundingSource = '',
  budgetRemarks = '',
  proposedAmount = 0,
  availableBalance = 0,
  remainingBalance = 0,
  isOverBudget = false,
  isSubmitting = false,
  error = '',
  onEditStep,
  onBack,
  onSubmit,
  // Post-submission state
  submittedProposal = null,
  onResetForm
}) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Numeric amount
  const numericAmount = Number(proposedAmount) || 0;

  // Hackathon duration calculation
  const isHackathon = Boolean(schema?.isHackathon || schema?.type === 'hackathon');
  const hackathonDuration = useMemo(() => {
    return isHackathon ? calculateHackathonDuration(programDate, endDate, startTime, endTime) : null;
  }, [isHackathon, programDate, endDate, startTime, endTime]);

  const effectiveHackathonDurationText = useMemo(() => {
    if (!isHackathon) return null;
    if (hackathonDurationHours) {
      return `${hackathonDurationHours} Hour${Number(hackathonDurationHours) === 1 ? '' : 's'}`;
    }
    return hackathonDuration?.isValid ? hackathonDuration.displayText : null;
  }, [isHackathon, hackathonDurationHours, hackathonDuration]);

  // Validation checks for mandatory Sanction Letter ID and PDF file
  const trimmedLetterId = (letterId || '').trim();
  const isLetterIdValid = trimmedLetterId.length > 0;
  const isLetterFileValid = Boolean(letterFile && letterFile.name);
  const isDocumentStepValid = isLetterIdValid && isLetterFileValid;
  const canSubmit = numericAmount > 0 && !isOverBudget && isDocumentStepValid && !isSubmitting;

  // File size formatter helper
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDisplayDate = (dateIso) => {
    if (!dateIso) return '—';
    const d = new Date(dateIso);
    return isNaN(d.getTime())
      ? dateIso
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleConfirmSubmit = () => {
    if (!isDocumentStepValid) return;
    setShowConfirmModal(false);
    onSubmit();
  };

  // =========================================================================
  // STATE B: SUBMISSION CONFIRMATION / SUCCESS STATE
  // Rendered after the proposal is successfully submitted
  // =========================================================================
  if (submittedProposal) {
    const finalProposalId =
      submittedProposal?.proposalNumber ||
      submittedProposal?.proposalId ||
      submittedProposal?.id ||
      'PROP-REGISTERED';
    const finalTitle = submittedProposal?.title || title || 'Programme Proposal';
    const finalCategory = submittedProposal?.category || categoryName || '';
    const finalSubCategory = submittedProposal?.subCategory || subCategoryName || '';
    const finalAmount = Number(submittedProposal?.amount || numericAmount || 0);
    const finalSubmissionDate =
      submittedProposal?.proposalDate ||
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const finalStatus = submittedProposal?.status || 'Pending';
    const finalLetterId =
      submittedProposal?.eventDetails?.letterId ||
      submittedProposal?.eventDetails?.documentDetails?.letterId ||
      trimmedLetterId;
    const finalDocName =
      submittedProposal?.eventDetails?.documentDetails?.fileName ||
      letterFile?.name ||
      'Sanction Letter Attached';

    const handleCopyId = () => {
      if (navigator?.clipboard) {
        navigator.clipboard.writeText(finalProposalId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    };

    return (
      <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div
          className="cbm-card"
          style={{
            padding: '24px 28px',
            textAlign: 'center',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* Animated / Styled Checkmark Circle */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              border: '2px solid var(--success-border)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto'
            }}
          >
            <CheckCircle2 size={26} />
          </div>

          <span className="cbm-form-ribbon" style={{ padding: '2px 8px', fontSize: 10.5, marginBottom: 4 }}>
            Step 3 of 3 — Submission Complete
          </span>

          <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-heading)', margin: '4px 0 2px 0' }}>
            Proposal Submitted Successfully!
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 12px auto', lineHeight: 1.45 }}>
            Your budget proposal has been registered in the system and forwarded to the Head of Department and Budget Administrator for review and approval.
          </p>

          {/* Highlighted Proposal ID Badge Card */}
          <div
            style={{
              maxWidth: 500,
              margin: '0 auto 14px auto',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FCFBF7',
              border: '1.5px solid var(--gold-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Official Proposal ID
              </span>
              <p style={{ margin: '1px 0 0 0', fontSize: 14, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                {finalProposalId}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              className="cbm-btn cbm-btn-outline cbm-btn-sm"
              style={{ height: 28, fontSize: 11, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              aria-label="Copy Proposal ID"
            >
              <Copy size={11} />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Proposal Summary Grid */}
          <div
            style={{
              maxWidth: 600,
              margin: '0 auto 16px auto',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border)',
              padding: '12px 16px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px 14px' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme Title</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {finalTitle}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Session</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                  {academicYearLabel}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-body)' }}>
                  {finalCategory} {finalSubCategory ? `— ${finalSubCategory}` : ''}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposed Budget</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{finalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sanction Letter ID</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                  {finalLetterId || '—'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attached PDF</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-body)' }}>
                  📄 {finalDocName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Date</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-body)' }}>
                  {finalSubmissionDate}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Status</span>
                <div style={{ marginTop: 2 }}>
                  <Badge variant="warning">{finalStatus === 'Pending' ? 'Pending HOD Approval' : finalStatus}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              paddingTop: 10,
              borderTop: '1px solid var(--border)'
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onResetForm}
              icon={PlusCircle}
              style={{ height: 38, padding: '0 18px', fontSize: 13 }}
            >
              Submit Another Proposal
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => navigate('/faculty/proposals')}
              icon={List}
              style={{ height: 38, padding: '0 20px', fontSize: 13 }}
            >
              View My Proposals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE A: PRE-SUBMISSION PROPOSAL REVIEW STATE
  // Rendered before the user clicks final submit
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main Review Card */}
      <div className="cbm-card">
        {/* Header */}
        <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="cbm-form-ribbon" style={{ padding: '3px 8px', fontSize: 11 }}>Step 3 of 3</span>
              <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 16 }}>Review &amp; Submit Proposal</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                — Verify specifications before final submission
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-subtle)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 11
              }}
            >
              <FileCheck size={13} />
              <span>Pre-Submission Review</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8
            }}
            role="alert"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Responsive Grid for the 4 Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '8px 12px' }}>
          {/* SECTION 1: PROPOSAL CONFIGURATION SUMMARY */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={14} color="var(--primary)" />
                1. Configuration &amp; Tracking
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 24, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <Edit2 size={11} /> Edit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Session</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {academicYearLabel}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date of Submission</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 500, color: 'var(--text-body)' }}>
                  {submissionDateStr}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--primary)' }}>
                  {categoryName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subcategory</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--text-body)' }}>
                  {subCategoryName || '(Direct Category)'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed var(--border-subtle)', paddingTop: 4 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposal ID Preview: </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {proposalIdPreview}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROGRAMME DETAILS & SPECIFICATIONS */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="var(--primary)" />
                2. Programme Details
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 24, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <Edit2 size={11} /> Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Title */}
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposal Title</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {title}
                </p>
              </div>

              {/* Schedule and Audience Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Start Date</span>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                    {formatDisplayDate(programDate)}
                  </p>
                </div>

                {endDate && (
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>End Date</span>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                      {formatDisplayDate(endDate)}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audience</span>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                    {Array.isArray(selectedAudiences) && selectedAudiences.length > 0 ? selectedAudiences.join(', ') : 'Not Specified'}
                  </p>
                </div>

                {/* If Hackathon: Display duration */}
                {isHackathon && (effectiveHackathonDurationText || hackathonDuration?.isValid) && (
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>Duration</span>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#0369A1' }}>
                      {effectiveHackathonDurationText || hackathonDuration?.displayText}
                    </p>
                  </div>
                )}
              </div>

              {/* Dynamic Programme-Specific Fields (Required only) */}
              {schema?.fields && schema.fields.filter((f) => f.required).length > 0 && (
                <div style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 6 }}>
                    {schema.fields.filter((f) => f.required).map((field) => {
                      const val = eventData[field.key];
                      if (!val) return null;
                      return (
                        <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {field.label}:{' '}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: BUDGET & FUNDING SUMMARY */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', border: '1.5px solid var(--gold-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={14} color="var(--primary)" />
                3. Proposed Budget
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 24, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <Edit2 size={11} /> Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Funding Source</span>
                  <p style={{ margin: '1px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                    {fundingSource}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposed Amount</span>
                  <p style={{ margin: '1px 0 0 0', fontSize: 17, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{numericAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Budget Justification (Displayed only when provided) */}
              {budgetRemarks && budgetRemarks.trim() && (
                <div style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)', fontSize: 11.5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Remarks: </span>
                  <span style={{ color: 'var(--text-body)' }}>{budgetRemarks}</span>
                </div>
              )}

              {/* Quota balance info if tracked */}
              {availableBalance > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Available Quota: ₹{availableBalance.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 600, color: remainingBalance >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    Remaining: ₹{remainingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: SANCTION LETTER & DOCUMENT ATTACHMENT */}
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                  4. Sanction Document
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 3,
                    backgroundColor: isDocumentStepValid ? '#F0FDF4' : '#FEF2F2',
                    color: isDocumentStepValid ? '#166534' : '#DC2626'
                  }}
                >
                  {isDocumentStepValid ? '✓ Verified' : 'Required *'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 24, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <Edit2 size={11} /> Edit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px' }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Letter ID <span style={{ color: 'var(--danger)' }}>*</span>
                </span>
                {isLetterIdValid ? (
                  <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                    {trimmedLetterId}
                  </p>
                ) : (
                  <p style={{ margin: '1px 0 0 0', fontSize: 11.5, fontWeight: 700, color: 'var(--danger)' }}>
                    ⚠️ Missing Letter ID
                  </p>
                )}
              </div>

              <div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  PDF Document <span style={{ color: 'var(--danger)' }}>*</span>
                </span>
                {isLetterFileValid ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>
                      📄 {letterFile.name}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      ({formatFileSize(letterFile.size)})
                    </span>
                    {letterFile.previewUrl && (
                      <a
                        href={letterFile.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                        style={{ height: 22, padding: '0 6px', fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                      >
                        <Eye size={10} /> View
                      </a>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: '1px 0 0 0', fontSize: 11.5, fontWeight: 700, color: 'var(--danger)' }}>
                    ⚠️ Missing PDF
                  </p>
                )}
              </div>

              {!isDocumentStepValid && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  role="alert"
                >
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>Missing required sanction documents. Click Edit to provide Letter ID and PDF.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Navigation Actions */}
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
            Back to Proposal &amp; Budget
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (!isDocumentStepValid) return;
              setShowConfirmModal(true);
            }}
            disabled={!canSubmit}
            isLoading={isSubmitting}
            icon={Send}
            style={{ height: 38, padding: '0 20px', fontSize: 13 }}
            title={
              !isDocumentStepValid
                ? 'Both Sanction Letter ID and Approval Letter (PDF) are mandatory.'
                : (!numericAmount ? 'Valid budget amount required' : '')
            }
          >
            Submit Proposal
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="cbm-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div
            className="cbm-modal-content"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div style={{ textAlign: 'center', padding: '8px 0 16px 0' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: 'var(--gold-subtle)',
                  color: 'var(--gold-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto'
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <h3 id="confirm-modal-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                Confirm Proposal Submission
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                Are you sure you want to submit this budget proposal for <strong>{title}</strong> totaling <strong>₹{numericAmount.toLocaleString('en-IN')}</strong>?
              </p>

              <div
                style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Academic Cycle:</span>
                  <span style={{ fontWeight: 600 }}>{academicYearLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Category / Subcategory:</span>
                  <span style={{ fontWeight: 600 }}>{categoryName} {subCategoryName ? `(${subCategoryName})` : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Funding Source:</span>
                  <span style={{ fontWeight: 600 }}>{fundingSource}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sanction Letter ID:</span>
                  <span style={{ fontWeight: 600 }}>{trimmedLetterId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approval Document (PDF):</span>
                  <span style={{ fontWeight: 600 }}>{letterFile?.name || 'None'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Proposed Amount:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{numericAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                style={{ flex: 1, height: 40 }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmSubmit}
                isLoading={isSubmitting}
                style={{ flex: 1, height: 40 }}
              >
                Confirm &amp; Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Step4ReviewSubmit = Step3ReviewAndSubmit;

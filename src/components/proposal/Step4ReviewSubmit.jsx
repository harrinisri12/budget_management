import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  Edit2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Award,
  UserCheck,
  Receipt,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Timer,
  FileText,
  Eye
} from 'lucide-react';
import { Button } from '../common/Button';
import { calculateHackathonDuration } from '../../config/proposalFormSchemas';

export const Step4ReviewSubmit = ({
  academicYearLabel,
  submissionDateStr,
  categoryName,
  subCategoryName,
  proposalIdPreview,
  schema,
  title,
  programDate,
  endDate,
  startTime,
  endTime,
  venue,
  programmeLevel,
  selectedAudiences = [],
  coordinatorName,
  coordinatorDesignation,
  coordinatorContact,
  // Hackathon duration manual entry prop
  hackathonDurationHours = '',
  // Letter ID & PDF File props
  letterId = '',
  letterFile = null,
  eventData = {},
  fundingSource,
  budgetRemarks,
  proposedAmount = 0,
  availableBalance = 0,
  remainingBalance = 0,
  isOverBudget: _isOverBudget = false,
  isSubmitting = false,
  error = '',
  onEditStep,
  onBack,
  onSubmit
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const numericAmount = Number(proposedAmount) || 0;

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
    setShowConfirmModal(false);
    onSubmit();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Main Review Card */}
      <div className="cbm-card" style={{ padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="cbm-form-ribbon">Step 4 of 5</span>
                <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>Review & Confirm Proposal</h2>
              </div>
              <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
                Review all institutional specifications, scheduling parameters, and single budget amount before final submission.
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-subtle)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 12
              }}
            >
              <FileCheck size={15} />
              <span>Pre-Submission Review</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20
            }}
            role="alert"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* SECTION 1: PROPOSAL CONFIGURATION SUMMARY */}
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="var(--primary)" />
                1. Proposal Configuration & Tracking
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 28, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Edit2 size={12} /> Edit Section 1
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Year</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {academicYearLabel}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date of Submission</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>
                  {submissionDateStr}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Main Category</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {categoryName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subcategory / Activity</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                  {subCategoryName || '(Direct Main Category)'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposal ID Preview</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {proposalIdPreview}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROGRAMME DETAILS & SPECIFICATIONS */}
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="var(--primary)" />
                2. Programme Details & Activity Specifications
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(2)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 28, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Edit2 size={12} /> Edit Section 2
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme / Proposal Title</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {title}
                </p>
              </div>

              {/* Schedule, Venue & Level Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> Start Date
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                    {formatDisplayDate(programDate)}
                  </p>
                </div>

                {endDate && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> End Date
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                      {formatDisplayDate(endDate)}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Session Timings
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                    {startTime} to {endTime}
                  </p>
                </div>

                {/* If Hackathon: Display duration */}
                {isHackathon && (effectiveHackathonDurationText || hackathonDuration?.isValid) && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Timer size={12} /> Total Hackathon Duration
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{effectiveHackathonDurationText || hackathonDuration?.displayText}</span>
                      {hackathonDurationHours ? (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                          Manually Specified
                        </span>
                      ) : (
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F1F5F9', color: 'var(--text-muted)' }}>
                          Auto-Computed
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> Venue / Location
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                    {venue}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Award size={12} /> Programme Level
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                    {programmeLevel}
                  </p>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Audience</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {selectedAudiences.map((aud) => (
                    <span
                      key={aud}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: '#EDE9FE',
                        color: '#5B21B6',
                        fontSize: 11.5,
                        fontWeight: 600
                      }}
                    >
                      {aud}
                    </span>
                  ))}
                </div>
              </div>

              {/* Coordinator Details */}
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCheck size={13} /> Faculty Coordinator
                </span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                  {coordinatorName} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {coordinatorDesignation} ({coordinatorContact})</span>
                </p>
              </div>

              {/* Dynamic Programme-Specific Fields */}
              {schema?.fields && schema.fields.length > 0 && (
                <div style={{ marginTop: 4, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--gold-border)' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    {schema.name} Specific Parameters
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
                    {schema.fields.map((field) => {
                      const val = eventData[field.key];
                      if (!val) return null;
                      return (
                        <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {field.label}
                          </span>
                          <p style={{ margin: '2px 0 0 0', fontSize: 12.5, fontWeight: 500, color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>
                            {String(val)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: BUDGET & FUNDING SUMMARY (SINGLE AMOUNT - NO ITEMIZED TABLE) */}
          <div style={{ padding: '20px 22px', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', border: '1.5px solid var(--gold-border)', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={17} color="var(--primary)" />
                3. Proposed Budget & Funding Details
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 28, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Edit2 size={12} /> Edit Section 3
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Funding Source Head</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                    {fundingSource}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Proposed Budget Amount</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{numericAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Budget Justification (Displayed only when provided) */}
              {budgetRemarks && budgetRemarks.trim() && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Budget Justification / Special Remarks
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-body)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {budgetRemarks}
                  </p>
                </div>
              )}

              {/* Quota balance info if tracked */}
              {availableBalance > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  <span>Current Available Quota: ₹{availableBalance.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 600, color: remainingBalance >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    Estimated Remaining: ₹{remainingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: SANCTION / REFERENCE LETTER & DOCUMENT ATTACHMENT */}
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="var(--primary)" />
                4. Sanction / Permission Letter & Document Reference
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(3)}
                className="cbm-btn cbm-btn-outline cbm-btn-sm"
                style={{ height: 28, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <Edit2 size={12} /> Edit Section 3
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sanction / Reference Letter ID
                </span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13.5, fontWeight: 700, color: letterId ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                  {letterId || 'None specified (Optional)'}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Attached Sanction Document (PDF)
                </span>
                {letterFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileCheck size={16} color="#DC2626" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {letterFile.name}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        ({formatFileSize(letterFile.size)})
                      </span>
                    </div>
                    {letterFile.previewUrl && (
                      <a
                        href={letterFile.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                        style={{ height: 26, padding: '0 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={11} /> View PDF
                      </a>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No PDF document attached (Optional)
                  </p>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', fontSize: 11.5, color: 'var(--text-muted)' }}>
                <span>
                  <strong>Persistence Status:</strong> Letter ID and document metadata will be recorded in the proposal record. Supabase Storage bucket is currently not configured, so binary file storage requires provisioning a cloud storage bucket.
                </span>
              </div>
            </div>
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
            Back to Budget Details
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => setShowConfirmModal(true)}
            disabled={numericAmount <= 0 || isSubmitting}
            isLoading={isSubmitting}
            icon={Send}
            style={{ height: 42, padding: '0 28px', fontSize: 14 }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                Confirm & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

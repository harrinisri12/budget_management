import React, { useState } from 'react';
import {
  FileCheck,
  Edit2,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Award,
  Users,
  UserCheck,
  Receipt,
  Calculator,
  ArrowLeft,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Building
} from 'lucide-react';
import { Button } from '../common/Button';

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
  eventData = {},
  repeatableEvents = [],
  fundingSource,
  budgetRemarks,
  expenses = [],
  totalProposedAmount = 0,
  availableBalance = 0,
  remainingBalance = 0,
  isOverBudget = false,
  isSubmitting = false,
  error = '',
  onEditStep,
  onBack,
  onSubmit
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
                <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>Review Your Proposal</h2>
              </div>
              <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
                Review all configuration, programme specifications, and itemised expenditure details before final administrative submission.
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
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--text-body)' }}>
                  {categoryName}
                </p>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subcategory</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
                  {subCategoryName || 'Direct Category'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Proposal ID Preview</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                  {proposalIdPreview}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROGRAMME DETAILS SUMMARY */}
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} color="var(--primary)" />
                2. Programme Proposal Details
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme Title</span>
                <p style={{ margin: '3px 0 0 0', fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {title}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme Schedule</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {formatDisplayDate(programDate)} {endDate ? `to ${formatDisplayDate(endDate)}` : ''}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Time</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {startTime ? `${startTime} ${endTime ? `– ${endTime}` : ''}` : 'As Scheduled'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Venue</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {venue || 'Department Seminar Hall'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {programmeLevel || 'Department'}
                  </p>
                </div>
              </div>

              {selectedAudiences.length > 0 && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Audience</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {selectedAudiences.join(', ')}
                  </p>
                </div>
              )}

              {coordinatorName && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty Coordinator</span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                    {coordinatorName} {coordinatorDesignation ? `(${coordinatorDesignation})` : ''} {coordinatorContact ? `• ${coordinatorContact}` : ''}
                  </p>
                </div>
              )}

              {/* Category-Specific Details Breakdown */}
              {schema.type === 'guest_lecture' && (eventData.guestName || eventData.guestOrg) && (
                <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Guest Speaker Credentials
                  </span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                    {eventData.guestName} — {eventData.guestDesignation}, {eventData.guestOrg}
                  </p>
                  {eventData.lectureTopic && (
                    <p style={{ margin: '2px 0 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                      Topic: <em>{eventData.lectureTopic}</em>
                    </p>
                  )}
                  {eventData.purpose && (
                    <p style={{ margin: '6px 0 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Purpose: {eventData.purpose}
                    </p>
                  )}
                </div>
              )}

              {schema.type === 'workshop' && (eventData.resourcePersonName || eventData.topic) && (
                <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Workshop Resource Person & Topic
                  </span>
                  <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                    {eventData.resourcePersonName} ({eventData.resourcePersonDesignation}, {eventData.resourcePersonOrg})
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Topic: <strong>{eventData.topic}</strong>
                  </p>
                  {eventData.prerequisites && (
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      Lab Prerequisites: {eventData.prerequisites}
                    </p>
                  )}
                </div>
              )}

              {schema.type === 'partial_guest' && (
                <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 10 }}>
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Invited Expert Details
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>
                      {eventData.guestName} ({eventData.guestDesignation})
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      {eventData.guestOrg} • Topic: {eventData.lectureTopic}
                    </p>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FCFBF7', border: '1px dashed var(--gold-border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase' }}>
                      Host Faculty Mapping
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>
                      {eventData.hostName} ({eventData.hostDesignation})
                    </p>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                      Ref Code: <strong>{eventData.hostCode}</strong> • Course: {eventData.subjectCodeName}
                    </p>
                  </div>
                </div>
              )}

              {/* Repeatable Events Preview */}
              {schema.hasRepeatableEvents && repeatableEvents.length > 0 && (
                <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Itemised Events Schedule ({repeatableEvents.length} Events Added)
                  </span>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {repeatableEvents.map((ev, i) => (
                      <div key={ev.id || i} style={{ fontSize: 12.5, padding: '4px 0', borderBottom: i < repeatableEvents.length - 1 ? '1px dashed var(--border-subtle)' : 'none' }}>
                        <strong>#{i + 1} {ev.eventName}</strong> {ev.eventDate ? `• Date: ${formatDisplayDate(ev.eventDate)}` : ''} {ev.venue ? `• Venue: ${ev.venue}` : ''}
                        {ev.eventDescription && <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: 'var(--text-muted)' }}>{ev.eventDescription}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {schema.type === 'senior_junior' && eventData.seniorParticipants && (
                <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FFFFFF', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Mentoring Session Details
                  </span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 12.5 }}>
                    <strong>Senior Mentors:</strong> {eventData.seniorParticipants}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: 12.5 }}>
                    <strong>Junior Target Group:</strong> {eventData.juniorGroup}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: BUDGET & EXPENDITURE SUMMARY */}
          <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={16} color="var(--primary)" />
                3. Proposed Expenditure & Budget Breakdown
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Funding Source</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>
                    {fundingSource}
                  </p>
                </div>
                {budgetRemarks && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Budget Remarks</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                      {budgetRemarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Itemised Expense Table Preview */}
              <div className="cbm-expenditure-wrap" style={{ marginTop: 6 }}>
                <table className="cbm-expenditure-table">
                  <thead>
                    <tr>
                      <th style={{ width: 45, textAlign: 'center' }}>S. No.</th>
                      <th>Purpose / Expense Description</th>
                      <th style={{ width: 140, textAlign: 'right' }}>Proposed (₹)</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp, idx) => (
                      <tr key={exp.id || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{exp.purpose}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-heading)' }}>
                          ₹{(Number(exp.proposedAmount) || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{exp.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#F8F9FA', fontWeight: 800 }}>
                      <td colSpan={2} style={{ padding: '10px 12px', fontSize: 13, textTransform: 'uppercase' }}>
                        Total Proposed Amount:
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 12px', fontSize: 15, color: 'var(--primary)' }}>
                        ₹{totalProposedAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Remaining Balance: ₹{remainingBalance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
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
            disabled={isOverBudget || totalProposedAmount <= 0 || isSubmitting}
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
                Are you sure you want to submit this budget proposal for <strong>{title}</strong> totaling <strong>₹{totalProposedAmount.toLocaleString('en-IN')}</strong>?
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining Quota Balance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>₹{remainingBalance.toLocaleString('en-IN')}</span>
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

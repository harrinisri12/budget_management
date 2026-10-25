import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  List,
  PlusCircle,
  Copy,
  Eye
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const Step5SubmissionComplete = ({
  submittedProposal,
  academicYearLabel,
  onResetForm
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const proposalId = submittedProposal?.proposalNumber || submittedProposal?.proposalId || submittedProposal?.id || 'PROP-SUBMITTED';
  const title = submittedProposal?.title || 'Programme Proposal';
  const category = submittedProposal?.category || '';
  const subCategory = submittedProposal?.subCategory || '';
  const amount = Number(submittedProposal?.amount || 0);
  const submissionDate = submittedProposal?.proposalDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const status = submittedProposal?.status || 'Pending';
  const letterId = submittedProposal?.eventDetails?.letterId || submittedProposal?.eventDetails?.documentDetails?.letterId;
  const docName = submittedProposal?.eventDetails?.documentDetails?.fileName;
  const durationText = submittedProposal?.eventDetails?.programmeDetails?.duration ||
    (submittedProposal?.eventDetails?.programmeDetails?.durationHours ? `${submittedProposal.eventDetails.programmeDetails.durationHours} Hours` : null);

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(proposalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div
        className="cbm-card"
        style={{
          padding: '24px 28px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Animated Checkmark Circle */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            border: '2px solid var(--success-border)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px auto'
          }}
        >
          <CheckCircle2 size={24} />
        </div>

        <span className="cbm-form-ribbon" style={{ padding: '2px 8px', fontSize: 10.5, marginBottom: 4 }}>
          Submission Acknowledged
        </span>

        <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)', margin: '4px 0 2px 0' }}>
          Proposal Submitted Successfully!
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 10px auto', lineHeight: 1.4 }}>
          Your budget proposal has been registered and forwarded to the HOD and Budget Administrator for review.
        </p>

        {/* Highlighted Proposal ID Badge Card */}
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto 10px auto',
            padding: '8px 14px',
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
              {proposalId}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="cbm-btn cbm-btn-outline cbm-btn-sm"
            style={{ height: 26, fontSize: 11, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            aria-label="Copy Proposal ID"
          >
            <Copy size={11} />
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Proposal Summary Grid */}
        <div
          style={{
            maxWidth: 580,
            margin: '0 auto 12px auto',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '8px 12px' }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme Title</span>
              <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                {title}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Session</span>
              <p style={{ margin: '1px 0 0 0', fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                {academicYearLabel}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</span>
              <p style={{ margin: '1px 0 0 0', fontSize: 12, color: 'var(--text-body)' }}>
                {category} {subCategory ? `— ${subCategory}` : ''}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Date</span>
              <p style={{ margin: '1px 0 0 0', fontSize: 12, color: 'var(--text-body)' }}>
                {submissionDate}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposed Amount</span>
              <p style={{ margin: '1px 0 0 0', fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>
                ₹{amount.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workflow Status</span>
              <div style={{ marginTop: 2 }}>
                <Badge status={status} />
              </div>
            </div>

            {letterId && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sanction Letter ID</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12, fontWeight: 700, color: 'var(--text-heading)' }}>
                  {letterId}
                </p>
              </div>
            )}

            {durationText && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Duration</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 12, fontWeight: 700, color: '#0369A1' }}>
                  {durationText}
                </p>
              </div>
            )}

            {docName && (
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sanction Document</span>
                <p style={{ margin: '1px 0 0 0', fontSize: 11.5, fontWeight: 600, color: 'var(--primary)' }}>
                  📄 {docName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetailModal(true)}
            icon={Eye}
            style={{ height: 38, fontSize: 13, padding: '0 16px' }}
          >
            View Details
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/faculty/proposals')}
            icon={List}
            style={{ height: 38, fontSize: 13, padding: '0 18px' }}
          >
            My Proposals
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onResetForm}
            icon={PlusCircle}
            style={{ height: 38, fontSize: 13, padding: '0 16px' }}
          >
            New Proposal
          </Button>
        </div>
      </div>

      {/* Quick Detail Modal */}
      {showDetailModal && (
        <div className="cbm-modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="cbm-modal-content"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Official Proposal Record
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', margin: '2px 0 0 0' }}>
                  {proposalId}
                </h3>
              </div>
              <Badge status={status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Programme Title</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 13.5, fontWeight: 700 }}>{title}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13 }}>{category} {subCategory ? `— ${subCategory}` : ''}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposed Amount</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>₹{amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Submission Date</span>
                <p style={{ margin: '2px 0 0 0', fontSize: 13 }}>{submissionDate}</p>
              </div>

              {letterId && (
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sanction Letter ID</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 700 }}>{letterId}</p>
                </div>
              )}

              {durationText && (
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Event Duration</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 700, color: '#0369A1' }}>{durationText}</p>
                </div>
              )}

              {docName && (
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Attached Document</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>📄 {docName}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDetailModal(false)}
                style={{ flex: 1, height: 38 }}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => navigate('/faculty/proposals')}
                style={{ flex: 1, height: 38 }}
              >
                Go to My Proposals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

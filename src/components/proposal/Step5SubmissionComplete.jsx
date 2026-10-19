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

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(proposalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', width: '100%' }}>
      <div
        className="cbm-card"
        style={{
          padding: '40px 36px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Animated Checkmark Circle */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            border: '2px solid var(--success-border)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          <CheckCircle2 size={40} />
        </div>

        <span className="cbm-form-ribbon" style={{ marginBottom: 12 }}>
          Submission Acknowledged
        </span>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0' }}>
          Proposal Submitted Successfully!
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 540, margin: '0 auto 24px auto', lineHeight: 1.55 }}>
          Your budget proposal has been officially registered and forwarded to the Head of Department (HOD) and Budget Administrator for administrative review and financial audit.
        </p>

        {/* Highlighted Proposal ID Badge Card */}
        <div
          style={{
            maxWidth: 520,
            margin: '0 auto 28px auto',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FCFBF7',
            border: '1.5px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Assigned Official Proposal Identifier
            </span>
            <p style={{ margin: '2px 0 0 0', fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
              {proposalId}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="cbm-btn cbm-btn-outline cbm-btn-sm"
            style={{ height: 32, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            aria-label="Copy Proposal ID"
          >
            <Copy size={13} />
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Proposal Summary Grid */}
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto 32px auto',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)',
            padding: '20px 24px',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Programme Title</span>
              <p style={{ margin: '3px 0 0 0', fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                {title}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Academic Cycle</span>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-body)' }}>
                {academicYearLabel}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category / Subcategory</span>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                {category} {subCategory ? `— ${subCategory}` : ''}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submission Timestamp</span>
              <p style={{ margin: '3px 0 0 0', fontSize: 13, color: 'var(--text-body)' }}>
                {submissionDate}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Proposed Amount</span>
              <p style={{ margin: '3px 0 0 0', fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>
                ₹{amount.toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Initial Workflow Status</span>
              <div style={{ marginTop: 4 }}>
                <Badge status={status} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetailModal(true)}
            icon={Eye}
            style={{ height: 42, fontSize: 13.5 }}
          >
            View Submitted Proposal
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => navigate('/faculty/proposals')}
            icon={List}
            style={{ height: 42, fontSize: 13.5 }}
          >
            Return to My Proposals
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onResetForm}
            icon={PlusCircle}
            style={{ height: 42, fontSize: 13.5 }}
          >
            Submit Another Proposal
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

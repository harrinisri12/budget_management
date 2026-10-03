import React, { useState } from 'react';
import { Modal } from './Modal';
import { ShieldCheck, FileText, Lock, Building } from 'lucide-react';

export const LegalModal = ({ isOpen, onClose, defaultTab = 'privacy' }) => {
  const [tab, setTab] = useState(defaultTab);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Institutional Governance & Legal Policies" maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Policy Tab Switch */}
        <div
          role="tablist"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--slate-100)',
            padding: 3,
            borderRadius: 6,
            border: '1px solid var(--border)'
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'privacy'}
            onClick={() => setTab('privacy')}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: tab === 'privacy' ? 700 : 500,
              backgroundColor: tab === 'privacy' ? 'var(--bg-surface)' : 'transparent',
              color: tab === 'privacy' ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: tab === 'privacy' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={14} />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === 'terms'}
            onClick={() => setTab('terms')}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: tab === 'terms' ? 700 : 500,
              backgroundColor: tab === 'terms' ? 'var(--bg-surface)' : 'transparent',
              color: tab === 'terms' ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: tab === 'terms' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: 4, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.6 }}>
          {tab === 'privacy' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                    Internal Administrative Privacy Policy
                  </h4>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Kongu Engineering College • Computer Science and Engineering Department
                  </p>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  1. Scope & Applicability
                </h5>
                <p>
                  This system is an internal financial and administrative record-keeping portal restricted exclusively to authorized faculty members, department administrators, and institutional audit officials of Kongu Engineering College.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  2. Collection & Usage of Institutional Data
                </h5>
                <p>
                  The system processes institutional credentials (@kongu.edu email addresses), employee identifiers, departmental proposal requests, event expenditure budgets, and administrative approval decisions solely for the purpose of managing departmental budget allocations.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  3. Financial Confidentiality & Audit Logging
                </h5>
                <p>
                  All submitted activity proposals, financial disbursements, and administrative approvals are logged with timestamps and user identifiers to ensure strict compliance with institutional audit guidelines. Data is never shared with third-party advertising or commercial entities.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  4. Security & Access Controls
                </h5>
                <p>
                  Access is governed by role-based authorization. Users are responsible for maintaining the confidentiality of their credentials and must immediately report unauthorized access to the CSE System Administrator.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <Building size={20} color="var(--primary)" />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                    Terms of Use & Administrative Governance
                  </h4>
                  <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Kongu Engineering College Financial Management System
                  </p>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  1. Authorized Use Policy
                </h5>
                <p>
                  By accessing this portal, you affirm that you are a designated faculty member or administrative officer of the Computer Science and Engineering Department at Kongu Engineering College. Unauthorized access attempts are logged and subject to disciplinary review.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  2. Accuracy of Proposal Data
                </h5>
                <p>
                  Faculty submitting budget proposals are responsible for the factual accuracy of program titles, dates, estimated expenses, and vendor justifications in accordance with college financial regulations.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  3. Approval & Disbursal Protocol
                </h5>
                <p>
                  Submission of a proposal does not guarantee financial disbursal. Final authorization requires administrative evaluation and approval based on academic year quota availability and department priorities.
                </p>
              </div>

              <div>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
                  4. Institutional Compliance
                </h5>
                <p>
                  All records stored within this system constitute official college financial records and are subject to periodic institutional and statutory audits.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="cbm-btn cbm-btn-outline"
            style={{ height: 36, fontSize: 13 }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

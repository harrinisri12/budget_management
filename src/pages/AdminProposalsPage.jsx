import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { exportProposalsToExcel, getProposalFileLink } from '../utils/excelExport';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  CreditCard,
  Clock,
  Check,
  Receipt,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  RotateCcw,
  Loader2
} from 'lucide-react';

export const AdminProposalsPage = () => {
  const { isAdmin } = useAuth();
  const {
    proposals,
    categories,
    activeAcademicYear,
    acceptProposal,
    rejectProposal,
    settleProposal,
    reopenSettlement,
    refreshProposals,
    refreshBudget,
    facultyList,
    showToast,
    loading
  } = useBudget();

  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Settlement Modal State (Finalize or Review)
  const [settlingProposal, setSettlingProposal] = useState(null);
  const [settlementAmountInput, setSettlementAmountInput] = useState('');
  const [settlementRemarksInput, setSettlementRemarksInput] = useState('');
  const [settleSubmitting, setSettleSubmitting] = useState(false);
  const [settleError, setSettleError] = useState('');

  // Reopen Modal State
  const [reopeningProposal, setReopeningProposal] = useState(null);
  const [reopenRemarksInput, setReopenRemarksInput] = useState('');
  const [reopenSubmitting, setReopenSubmitting] = useState(false);
  const [reopenError, setReopenError] = useState('');

  // Active academic year label
  const ayLabel = activeAcademicYear
    ? (activeAcademicYear.name || activeAcademicYear.academicYear || `${activeAcademicYear.startYear} - ${activeAcademicYear.endYear}`)
    : 'Active Academic Session';

  const handleOpenReview = (prop) => {
    setSelectedProposal(prop);
    setAdminRemarks(prop.adminRemarks || '');
  };

  const handleOpenSettlement = (prop) => {
    setSettlingProposal(prop);
    // If faculty previously submitted actual amount, pre-populate that; otherwise original amount
    const prefill = prop.settlementAmount !== null && prop.settlementAmount !== undefined
      ? String(prop.settlementAmount)
      : String(prop.amount || '');
    setSettlementAmountInput(prefill);
    setSettlementRemarksInput(prop.settlementRemarks || '');
    setSettleError('');
  };

  const handleOpenReopen = (prop) => {
    setReopeningProposal(prop);
    setReopenRemarksInput('');
    setReopenError('');
  };

  const handleAccept = async (prop) => {
    if (!isAdmin) return;
    const propId = prop.dbId || prop.id;
    setActionLoadingId(propId);
    try {
      await acceptProposal(propId, adminRemarks);
      if (selectedProposal && (selectedProposal.dbId === propId || selectedProposal.id === propId)) {
        setSelectedProposal(null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (prop) => {
    if (!isAdmin) return;
    const propId = prop.dbId || prop.id;
    setActionLoadingId(propId);
    try {
      await rejectProposal(propId, adminRemarks);
      if (selectedProposal && (selectedProposal.dbId === propId || selectedProposal.id === propId)) {
        setSelectedProposal(null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFinalizeSettlement = async (e) => {
    e.preventDefault();
    if (!isAdmin || !settlingProposal) return;

    const parsed = Number(settlementAmountInput);
    if (isNaN(parsed) || parsed < 0) {
      setSettleError('Please enter a valid non-negative settlement amount.');
      return;
    }

    setSettleSubmitting(true);
    setSettleError('');
    try {
      const res = await settleProposal(settlingProposal.dbId || settlingProposal.id, {
        settlementAmount: parsed,
        remarks: settlementRemarksInput
      });

      if (res?.success) {
        setSettlingProposal(null);
        if (selectedProposal && (selectedProposal.dbId === settlingProposal.dbId || selectedProposal.id === settlingProposal.id)) {
          setSelectedProposal(null);
        }
      } else if (res?.error) {
        setSettleError(res.error);
      }
    } catch (err) {
      setSettleError(err.message || 'Error processing settlement.');
    } finally {
      setSettleSubmitting(false);
    }
  };

  const handleConfirmReopen = async (e) => {
    e.preventDefault();
    if (!isAdmin || !reopeningProposal) return;

    setReopenSubmitting(true);
    setReopenError('');
    try {
      const res = await reopenSettlement(reopeningProposal.dbId || reopeningProposal.id, reopenRemarksInput);
      if (res?.success) {
        setReopeningProposal(null);
        if (selectedProposal && (selectedProposal.dbId === reopeningProposal.dbId || selectedProposal.id === reopeningProposal.id)) {
          setSelectedProposal(null);
        }
      } else if (res?.error) {
        setReopenError(res.error);
      }
    } catch (err) {
      setReopenError(err.message || 'Error reopening settlement.');
    } finally {
      setReopenSubmitting(false);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'All') return true;

    const normStatus = (p.status || '').toLowerCase();
    const normSettlement = (p.settlementStatus || p.settlement_status || '').toLowerCase();
    const isSettled = normSettlement === 'settled';
    const isPendingSettlement = normSettlement === 'pending_settlement';

    if (filterStatus === 'Pending') {
      return normStatus === 'pending' || normStatus === 'under review';
    }
    if (filterStatus === 'Accepted') {
      return (normStatus === 'accepted' || normStatus === 'approved') && !isSettled;
    }
    if (filterStatus === 'Settlement Review') {
      return isPendingSettlement;
    }
    if (filterStatus === 'Settled') {
      return isSettled;
    }
    if (filterStatus === 'Rejected') {
      return normStatus === 'rejected';
    }
    return p.status === filterStatus;
  });

  // Calculate settlement variance preview
  const prevDeductionForSettling = settlingProposal
    ? (settlingProposal.settlementStatus === 'settled' && settlingProposal.settlementAmount !== null
      ? Number(settlingProposal.settlementAmount)
      : Number(settlingProposal.approvedAmount ?? settlingProposal.amount ?? 0))
    : 0;
  const currentSettlementInputVal = Number(settlementAmountInput || 0);
  const settlementDiff = !isNaN(currentSettlementInputVal)
    ? currentSettlementInputVal - prevDeductionForSettling
    : 0;


  // ---------------------------------------------------------------------------
  // Category Budget Calculation for Proposal Details Modal
  // ---------------------------------------------------------------------------
  const modalCategoryBudget = useMemo(() => {
    if (!selectedProposal) return null;

    const catObj = (categories || []).find(c =>
      c.id === selectedProposal.categoryId ||
      (c.name && selectedProposal.category && c.name.trim().toLowerCase() === selectedProposal.category.trim().toLowerCase())
    );

    const totalAllocated = Number(catObj?.allocated_amount || catObj?.allocatedAmount || catObj?.budget || 0);

    // Proposals under this category
    const catProposals = proposals.filter(p =>
      p.categoryId === catObj?.id ||
      (p.category && selectedProposal.category && p.category.trim().toLowerCase() === selectedProposal.category.trim().toLowerCase())
    );

    const isThisProposalAccepted = ['accepted', 'approved'].includes((selectedProposal.status || '').toLowerCase());
    const isThisProposalSettled = (selectedProposal.settlementStatus || '').toLowerCase() === 'settled';

    // Amount reserved for OTHER accepted proposals awaiting settlement (excluding this proposal)
    const otherAcceptedAwaitingSettlement = catProposals.filter(p => {
      const isThis = (p.id === selectedProposal.id || p.dbId === selectedProposal.dbId || p.proposalNumber === selectedProposal.proposalNumber);
      if (isThis) return false;
      const norm = (p.status || '').toLowerCase();
      const isAcc = norm === 'accepted' || norm === 'approved';
      const isSet = (p.settlementStatus || '').toLowerCase() === 'settled';
      return isAcc && !isSet;
    });

    const reservedAmount = otherAcceptedAwaitingSettlement.reduce(
      (sum, p) => sum + Number(p.amount || p.approvedAmount || 0),
      0
    );

    // Actual expenditure from finalized settlements
    const finalizedSettlements = catProposals.filter(p => {
      const isThis = (p.id === selectedProposal.id || p.dbId === selectedProposal.dbId || p.proposalNumber === selectedProposal.proposalNumber);
      if (isThis && !isThisProposalSettled) return false;
      return (p.settlementStatus || '').toLowerCase() === 'settled';
    });

    const actualExpenditure = finalizedSettlements.reduce(
      (sum, p) => sum + Number(p.settlementAmount ?? p.amount ?? 0),
      0
    );

    // Remaining available budget before accepting this proposal
    // Remaining Budget = Total Category Budget − Reserved Amount − Actual Expenditure
    const availableBeforeThis = Math.max(0, totalAllocated - reservedAmount - actualExpenditure);

    // Remaining budget taking into account this proposal if accepted
    const remainingBudget = Math.max(
      0,
      totalAllocated - reservedAmount - actualExpenditure - (isThisProposalAccepted && !isThisProposalSettled ? Number(selectedProposal.amount || 0) : 0)
    );

    const proposedAmt = Number(selectedProposal.amount || 0);
    const isInsufficient = !isThisProposalAccepted && proposedAmt > availableBeforeThis;

    return {
      categoryName: catObj?.name || selectedProposal.category || 'Category',
      totalAllocated,
      reservedAmount,
      otherReservedCount: otherAcceptedAwaitingSettlement.length,
      actualExpenditure,
      settledCount: finalizedSettlements.length,
      availableBeforeThis,
      remainingBudget,
      isInsufficient,
      isThisProposalAccepted
    };
  }, [selectedProposal, categories, proposals]);

  const handleDownloadExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const recordsToExport = filteredProposals;
      if (!recordsToExport || recordsToExport.length === 0) {
        showToast?.('No proposals match the current filter criteria to export.', 'warning');
        setIsExporting(false);
        return;
      }
      const res = exportProposalsToExcel(recordsToExport, ayLabel, { facultyList });
      if (res?.success) {
        showToast?.(`Exported ${res.count} proposal records to ${res.filename}.`, 'success');
      }
    } catch (err) {
      console.error('Error generating Excel export:', err);
      showToast?.(err.message || 'Failed to generate Excel report.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Top Header with Download Excel Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Faculty Budget Proposals &amp; Management
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
              {isAdmin
                ? 'Review, accept, and reject department proposals, evaluate category allocations, and finalize post-activity settlements.'
                : 'Review department funding proposals submitted by faculty members.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button
                onClick={handleDownloadExcel}
                disabled={isExporting}
                className="cbm-btn cbm-btn-primary"
                style={{
                  height: 38,
                  padding: '0 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  opacity: isExporting ? 0.7 : 1
                }}
                title="Download complete proposals and settlements report in official 9-column Excel format"
              >
                {isExporting ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
                <span>{isExporting ? 'Exporting...' : 'Download Excel'}</span>
              </button>
            )}

            {!isAdmin && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--slate-700)', fontWeight: 600 }}>
                <AlertCircle size={14} />
                <span>Read-only evaluation mode</span>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* PROPOSALS REGISTER SECTION */}
        {/* ---------------------------------------------------------------------- */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Department Budget Proposals Register</h2>
              <p className="cbm-section-subtitle">
                Official register of departmental funding proposals submitted by faculty members
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              Showing {filteredProposals.length} of {proposals.length} records
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Filter size={14} style={{ color: 'var(--slate-500)' }} /> Filter:
            </span>
            {['All', 'Pending', 'Accepted', 'Settlement Review', 'Settled', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5,
                  fontWeight: filterStatus === st ? 600 : 500,
                  backgroundColor: filterStatus === st ? 'var(--primary)' : 'var(--bg-surface)',
                  color: filterStatus === st ? '#FFFFFF' : 'var(--text-body)',
                  border: filterStatus === st ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Proposals Table */}
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Faculty Member</th>
                  <th>Event Name</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                  <th style={{ textAlign: 'right' }}>Settlement Amount</th>
                  <th>Proposal Status</th>
                  <th>Settlement Status</th>
                  <th style={{ textAlign: 'center', minWidth: 160 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={5} columns={10} />
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--text-muted)' }}>
                      No proposals found matching status filter "{filterStatus}".
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((prop) => {
                    const normStatus = (prop.status || '').toLowerCase();
                    const isAwaitingApproval = normStatus === 'pending' || normStatus === 'under review';
                    const isAccepted = normStatus === 'accepted' || normStatus === 'approved';
                    const isRejected = normStatus === 'rejected';

                    const normSettlement = String(prop.settlementStatus || prop.settlement_status || '').toLowerCase();
                    const isSettled = normSettlement === 'settled';
                    const isPendingSettlement = normSettlement === 'pending_settlement';

                    const propId = prop.dbId || prop.id;
                    const isRowBusy = actionLoadingId === propId;

                    return (
                      <tr key={propId}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {prop.proposalNumber || prop.proposalId || prop.id}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {prop.facultyName || 'Faculty Member'}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{prop.facultyEmail}</div>
                        </td>
                        <td style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{prop.title}</td>
                        <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                          {prop.category || '—'}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {prop.subCategory || 'General'}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>
                          ₹{Number(prop.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isSettled ? (
                            <div>
                              <span style={{ fontWeight: 700, color: '#0369A1' }}>
                                ₹{Number(prop.settlementAmount).toLocaleString('en-IN')}
                              </span>
                              {prop.settlementAmount !== prop.amount && (
                                <div style={{ fontSize: 10.5, color: prop.settlementAmount < prop.amount ? 'var(--success-text)' : 'var(--danger-text)', fontWeight: 600 }}>
                                  {prop.settlementAmount < prop.amount
                                    ? `-₹${(prop.amount - prop.settlementAmount).toLocaleString('en-IN')}`
                                    : `+₹${(prop.settlementAmount - prop.amount).toLocaleString('en-IN')}`}
                                </div>
                              )}
                            </div>
                          ) : isPendingSettlement ? (
                            <div>
                              <span style={{ fontWeight: 700, color: '#92400E' }}>
                                ₹{Number(prop.settlementAmount || 0).toLocaleString('en-IN')}
                              </span>
                              <div style={{ fontSize: 10.5, color: '#92400E', fontWeight: 600 }}>
                                Submitted by Faculty
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Badge status={prop.status} />
                            {isRejected && prop.rejectedAt && (
                              <span style={{ fontSize: 10, color: 'var(--danger-text)', display: 'inline-flex', alignItems: 'center', gap: 2 }} title={`Rejected on ${new Date(prop.rejectedAt).toLocaleString('en-IN')}. Automatically purged after 24h.`}>
                                <Clock size={10} /> 24h retention
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {isSettled ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: 3, width: 'fit-content' }}>
                              <Check size={11} /> Settled
                            </span>
                          ) : isPendingSettlement ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 7px', borderRadius: 3, width: 'fit-content' }}>
                              <Receipt size={11} /> Review Pending
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                              Unsettled
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {/* Accept and Reject action buttons for proposals awaiting approval */}
                            {isAwaitingApproval && isAdmin && (
                              <>
                                <button
                                  onClick={() => handleAccept(prop)}
                                  disabled={isRowBusy}
                                  title="Accept proposal and reserve proposed amount from category budget"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--success-bg)',
                                    color: 'var(--success-text)',
                                    border: '1px solid var(--success-border)',
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    cursor: isRowBusy ? 'not-allowed' : 'pointer',
                                    opacity: isRowBusy ? 0.6 : 1
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleReject(prop)}
                                  disabled={isRowBusy}
                                  title="Reject proposal (purged automatically after 24h)"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--danger-bg)',
                                    color: 'var(--danger-text)',
                                    border: '1px solid var(--danger-border)',
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    cursor: isRowBusy ? 'not-allowed' : 'pointer',
                                    opacity: isRowBusy ? 0.6 : 1
                                  }}
                                >
                                  <XCircle size={12} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* Settle / Review Settlement Action for accepted proposals */}
                            {isAccepted && isAdmin && (
                              <button
                                onClick={() => handleOpenSettlement(prop)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isPendingSettlement ? '#FEF3C7' : isSettled ? 'var(--bg-surface)' : '#F0F9FF',
                                  color: isPendingSettlement ? '#92400E' : isSettled ? 'var(--text-body)' : '#0369A1',
                                  border: isPendingSettlement ? '1px solid #FDE68A' : isSettled ? '1px solid var(--border)' : '1px solid #BAE6FD',
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  cursor: 'pointer'
                                }}
                                title={isPendingSettlement ? 'Review faculty settlement submission' : (isSettled ? 'Edit finalized settlement amount' : 'Record actual settlement expense')}
                              >
                                <Receipt size={12} />
                                <span>{isPendingSettlement ? 'Review Settlement' : (isSettled ? 'Edit Settlement' : 'Settle')}</span>
                              </button>
                            )}

                            {/* Reopen Action for settled / pending settlement */}
                            {isAdmin && (isSettled || isPendingSettlement) && (
                              <button
                                onClick={() => handleOpenReopen(prop)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-surface)',
                                  color: 'var(--slate-700)',
                                  border: '1px solid var(--border)',
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  cursor: 'pointer'
                                }}
                                title="Reopen settlement for faculty to correct or resubmit"
                              >
                                <RotateCcw size={11} />
                                <span>Reopen</span>
                              </button>
                            )}

                            {/* View Details Button */}
                            <button
                              onClick={() => handleOpenReview(prop)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-body)',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: 11.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------------------------------------------------------------- */}
        {/* 3. PROPOSAL DETAILS & REVIEW MODAL */}
        {/* ---------------------------------------------------------------------- */}
        {selectedProposal && (
          <div
            onClick={() => setSelectedProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 620 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Proposal Details &amp; Evaluation
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2, margin: 0 }}>
                    {selectedProposal.proposalNumber || selectedProposal.proposalId || selectedProposal.id}
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge status={selectedProposal.status} />
                  {selectedProposal.settlementStatus === 'settled' && (
                    <Badge status="Settled" text="Settled" />
                  )}
                  {selectedProposal.settlementStatus === 'pending_settlement' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: 4 }}>
                      Settlement Pending Review
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Proposal Overview Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 10, backgroundColor: 'var(--bg-page)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Reference Number</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 1, fontFamily: 'monospace' }}>
                      {selectedProposal.proposalNumber || selectedProposal.id}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Faculty Name</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                      {selectedProposal.facultyName}
                    </p>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Event / Programme Name</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                      {selectedProposal.title}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                      {selectedProposal.category || '—'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Subcategory</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', marginTop: 1 }}>
                      {selectedProposal.subCategory || 'Direct Category / General'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Proposal Status</span>
                    <div style={{ marginTop: 2 }}>
                      <Badge status={selectedProposal.status} />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Settlement Status</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: selectedProposal.settlementStatus === 'settled' ? '#0369A1' : selectedProposal.settlementStatus === 'pending_settlement' ? '#92400E' : 'var(--text-muted)', marginTop: 1 }}>
                      {selectedProposal.settlementStatus === 'settled' ? 'Settled' : selectedProposal.settlementStatus === 'pending_settlement' ? 'Submitted (Review Pending)' : 'Unsettled'}
                    </p>
                  </div>

                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Uploaded File Link</span>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
                      {(() => {
                        const fileLink = getProposalFileLink(selectedProposal);
                        if (fileLink && fileLink !== 'Not Uploaded') {
                          return (
                            <a
                              href={fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              📄 Open Uploaded Document (Google Drive)
                            </a>
                          );
                        }
                        return <span style={{ color: 'var(--text-muted)' }}>Not Uploaded</span>;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Proposed vs Settlement Amount Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedProposal.settlementStatus === 'settled' || selectedProposal.settlementStatus === 'pending_settlement' ? '1fr 1fr' : '1fr', gap: 12, backgroundColor: 'var(--slate-50)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Original Proposed Amount
                    </span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>
                      ₹{Number(selectedProposal.amount).toLocaleString('en-IN')}
                    </p>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      Preserved for fiscal audit trail
                    </span>
                  </div>

                  {(selectedProposal.settlementStatus === 'settled' || selectedProposal.settlementStatus === 'pending_settlement') && (
                    <div>
                      <span style={{ fontSize: 11, color: selectedProposal.settlementStatus === 'settled' ? '#0369A1' : '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
                        {selectedProposal.settlementStatus === 'settled' ? 'Finalized Settlement' : 'Submitted Settlement Amount'}
                      </span>
                      <p style={{ fontSize: 18, fontWeight: 800, color: selectedProposal.settlementStatus === 'settled' ? '#0369A1' : '#92400E', marginTop: 2 }}>
                        ₹{Number(selectedProposal.settlementAmount || 0).toLocaleString('en-IN')}
                      </p>
                      <span style={{ fontSize: 10.5, color: selectedProposal.settlementStatus === 'settled' ? 'var(--success-text)' : '#92400E', fontWeight: 600 }}>
                        {selectedProposal.settlementStatus === 'settled'
                          ? (selectedProposal.settlementAmount < selectedProposal.amount
                            ? `₹${(selectedProposal.amount - selectedProposal.settlementAmount).toLocaleString('en-IN')} credited back to category`
                            : selectedProposal.settlementAmount > selectedProposal.amount
                              ? `₹${(selectedProposal.settlementAmount - selectedProposal.amount).toLocaleString('en-IN')} additional deducted`
                              : 'Exact match with proposed amount')
                          : 'Awaiting administrator finalization'}
                      </span>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* MANDATORY CATEGORY BUDGET BREAKDOWN FOR THIS PROPOSAL'S CATEGORY */}
                {/* ------------------------------------------------------------------ */}
                {modalCategoryBudget && (
                  <div style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Category Budget Breakdown: "{modalCategoryBudget.categoryName}"
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Calculated from official records
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 4, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Total Category Allocated Budget
                        </span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                          ₹{modalCategoryBudget.totalAllocated.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 4, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Reserved (Other Accepted Proposals)
                        </span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-text)', marginTop: 2 }}>
                          ₹{modalCategoryBudget.reservedAmount.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {modalCategoryBudget.otherReservedCount} accepted proposal{modalCategoryBudget.otherReservedCount === 1 ? '' : 's'} awaiting settlement
                        </span>
                      </div>

                      <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 4, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Actual Expenditure (Finalized)
                        </span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0369A1', marginTop: 2 }}>
                          ₹{modalCategoryBudget.actualExpenditure.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {modalCategoryBudget.settledCount} finalized settlement{modalCategoryBudget.settledCount === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 4, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Remaining Available Category Budget
                        </span>
                        <div style={{ fontSize: 14, fontWeight: 800, color: modalCategoryBudget.remainingBudget > 0 ? 'var(--success-text)' : 'var(--danger-text)', marginTop: 2 }}>
                          ₹{modalCategoryBudget.remainingBudget.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          Total - Reserved - Actual
                        </span>
                      </div>
                    </div>

                    {/* INSUFFICIENT BUDGET WARNING */}
                    {modalCategoryBudget.isInsufficient && (
                      <div style={{ marginTop: 12, padding: '10px 12px', backgroundColor: 'var(--danger-bg)', border: '1.5px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                          <AlertTriangle size={15} />
                          <span>Warning: Insufficient Available Category Budget!</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', lineHeight: 1.4 }}>
                          Available category budget is <strong>₹{modalCategoryBudget.availableBeforeThis.toLocaleString('en-IN')}</strong>, but this proposal requires <strong>₹{Number(selectedProposal.amount).toLocaleString('en-IN')}</strong>. Approving this proposal will result in a category budget deficit of ₹{(Number(selectedProposal.amount) - modalCategoryBudget.availableBeforeThis).toLocaleString('en-IN')}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Remarks Input for pending proposals */}
                {isAdmin && ['pending', 'under review'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div>
                    <label className="cbm-label" htmlFor="admin-remarks-input">
                      Administrative Decision Remarks
                    </label>
                    <textarea
                      id="admin-remarks-input"
                      rows={2}
                      className="cbm-input"
                      placeholder="Enter approval comments, stipulations, or reasons for rejection..."
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      style={{ height: 'auto', padding: '8px 10px', fontSize: 12.5 }}
                    />
                  </div>
                )}

                {/* Existing remarks if any */}
                {selectedProposal.adminRemarks && (
                  <div style={{ padding: 10, backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator Remarks:</span>
                    <p style={{ fontSize: 12.5, color: 'var(--text-body)', marginTop: 2 }}>{selectedProposal.adminRemarks}</p>
                  </div>
                )}

                {/* Admin Status Actions for Pending Proposals */}
                {isAdmin && ['pending', 'under review'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: 8 }}>
                      Administrative Decision Actions:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        onClick={() => handleAccept(selectedProposal)}
                        disabled={actionLoadingId === (selectedProposal.dbId || selectedProposal.id) || modalCategoryBudget?.isInsufficient}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: modalCategoryBudget?.isInsufficient ? 'not-allowed' : 'pointer',
                          opacity: modalCategoryBudget?.isInsufficient ? 0.5 : 1,
                          border: '1px solid var(--success-border)',
                          backgroundColor: 'var(--success-bg)',
                          color: 'var(--success-text)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                        title={modalCategoryBudget?.isInsufficient ? 'Cannot accept: Insufficient category budget' : 'Accept proposal and reserve proposed amount'}
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept Proposal</span>
                      </button>

                      <button
                        onClick={() => handleReject(selectedProposal)}
                        disabled={actionLoadingId === (selectedProposal.dbId || selectedProposal.id)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--danger-bg)',
                          color: 'var(--danger-text)',
                          border: '1px solid var(--danger-border)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <XCircle size={15} />
                        <span>Reject Proposal</span>
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 6, textAlign: 'center' }}>
                      Acceptance will reserve ₹{Number(selectedProposal.amount).toLocaleString('en-IN')} under "{modalCategoryBudget?.categoryName}".
                    </span>
                  </div>
                )}

                {/* Option to Settle / Reopen if accepted */}
                {isAdmin && ['accepted', 'approved'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => handleOpenSettlement(selectedProposal)}
                      style={{
                        flex: 2,
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        border: '1px solid #BAE6FD',
                        backgroundColor: '#F0F9FF',
                        color: '#0369A1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Receipt size={15} />
                      <span>{selectedProposal.settlementStatus === 'settled' ? 'Edit Finalized Settlement' : (selectedProposal.settlementStatus === 'pending_settlement' ? 'Review & Approve Settlement' : 'Finalize Settlement Amount')}</span>
                    </button>

                    {(selectedProposal.settlementStatus === 'settled' || selectedProposal.settlementStatus === 'pending_settlement') && (
                      <button
                        onClick={() => handleOpenReopen(selectedProposal)}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--slate-700)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                        title="Reopen settlement for faculty revision"
                      >
                        <RotateCcw size={14} />
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-body)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  marginTop: 14,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* 4. SETTLEMENT MODAL (APPROVE / FINALIZE SETTLEMENT) */}
        {/* ---------------------------------------------------------------------- */}
        {settlingProposal && (
          <div
            onClick={() => setSettlingProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 520 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Activity Financial Settlement
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2, margin: 0 }}>
                    {settlingProposal.proposalNumber || settlingProposal.proposalId}
                  </h2>
                </div>
                <Badge status={settlingProposal.status} />
              </div>

              <form onSubmit={handleFinalizeSettlement} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ backgroundColor: 'var(--slate-50)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                    {settlingProposal.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Category: <strong>{settlingProposal.category}</strong> • Academic Year: <strong>{settlingProposal.academicYear}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Original Proposed Amount</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>
                        ₹{Number(settlingProposal.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Currently Deducted</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-text)' }}>
                        ₹{prevDeductionForSettling.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="cbm-label" htmlFor="settlement-amount-field" style={{ fontWeight: 700 }}>
                    Actual Settlement Amount (INR) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--slate-400)' }}>
                      ₹
                    </span>
                    <input
                      id="settlement-amount-field"
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="0.00"
                      value={settlementAmountInput}
                      onChange={(e) => setSettlementAmountInput(e.target.value)}
                      className="cbm-input"
                      style={{ paddingLeft: 28, fontSize: 15, fontWeight: 700 }}
                    />
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    This actual settlement replaces the reserved provisional ₹{prevDeductionForSettling.toLocaleString('en-IN')} deduction.
                  </span>
                </div>

                {!isNaN(currentSettlementInputVal) && currentSettlementInputVal >= 0 && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: settlementDiff < 0 ? 'var(--success-bg)' : settlementDiff > 0 ? '#FFFBEB' : 'var(--slate-100)',
                      border: settlementDiff < 0 ? '1px solid var(--success-border)' : settlementDiff > 0 ? '1px solid #FDE68A' : '1px solid var(--border)',
                      fontSize: 12,
                      color: settlementDiff < 0 ? 'var(--success-text)' : settlementDiff > 0 ? '#92400E' : 'var(--slate-700)'
                    }}
                  >
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={14} />
                      <span>Budget Adjustment Preview:</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {settlementDiff < 0 ? (
                        <span>
                          <strong>₹{Math.abs(settlementDiff).toLocaleString('en-IN')}</strong> will be <strong>credited back</strong> to the category and available budget.
                        </span>
                      ) : settlementDiff > 0 ? (
                        <span>
                          An additional <strong>₹{settlementDiff.toLocaleString('en-IN')}</strong> will be deducted from the available category budget.
                        </span>
                      ) : (
                        <span>Settlement amount exactly equals the reserved deduction. No net change to budget.</span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="cbm-label" htmlFor="settlement-remarks-field">
                    Settlement Notes &amp; Invoice / Voucher References
                  </label>
                  <textarea
                    id="settlement-remarks-field"
                    rows={2}
                    className="cbm-input"
                    placeholder="Enter voucher numbers, vendor bills, audit notes, or refund justifications..."
                    value={settlementRemarksInput}
                    onChange={(e) => setSettlementRemarksInput(e.target.value)}
                    style={{ height: 'auto', padding: '8px 10px', fontSize: 12.5 }}
                  />
                </div>

                {settleError && (
                  <div style={{ padding: 10, backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: 12.5 }}>
                    {settleError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setSettlingProposal(null)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-body)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={settleSubmitting}
                    style={{
                      flex: 2,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: settleSubmitting ? 'not-allowed' : 'pointer',
                      opacity: settleSubmitting ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Check size={15} />
                    <span>{settleSubmitting ? 'Finalizing...' : 'Finalize Settlement'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* 5. REOPEN SETTLEMENT MODAL */}
        {/* ---------------------------------------------------------------------- */}
        {reopeningProposal && (
          <div
            onClick={() => setReopeningProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 480 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Reopen Settlement
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                    {reopeningProposal.proposalNumber || reopeningProposal.proposalId}
                  </h2>
                </div>
              </div>

              <form onSubmit={handleConfirmReopen} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--text-body)', margin: 0, lineHeight: 1.4 }}>
                  Reopening this settlement will reset its status to <strong>Unsettled</strong> and restore category reservations, allowing faculty to edit and resubmit actual expenses.
                </p>

                <div>
                  <label className="cbm-label" htmlFor="reopen-remarks-input">
                    Reason for Reopening / Required Corrections:
                  </label>
                  <textarea
                    id="reopen-remarks-input"
                    rows={3}
                    className="cbm-input"
                    placeholder="Provide details on why this settlement is being reopened for correction..."
                    value={reopenRemarksInput}
                    onChange={(e) => setReopenRemarksInput(e.target.value)}
                    style={{ height: 'auto', padding: '8px 10px', fontSize: 12.5 }}
                    required
                  />
                </div>

                {reopenError && (
                  <div style={{ padding: 10, backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: 12.5 }}>
                    {reopenError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setReopeningProposal(null)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-body)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={reopenSubmitting}
                    style={{
                      flex: 2,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#92400E',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: reopenSubmitting ? 'not-allowed' : 'pointer',
                      opacity: reopenSubmitting ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>{reopenSubmitting ? 'Reopening...' : 'Confirm Reopen'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

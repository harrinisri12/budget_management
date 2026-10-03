import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle, ArrowRight, Calendar, AlertTriangle, Calculator, FileCheck } from 'lucide-react';
import { CATEGORY_LIST, getSubcategoriesForCategory } from '../data/categories';

export const NewProposalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { academicYears, addProposal, getFacultyMetrics, generateProposalId } = useBudget();

  // Active academic years created by Admin
  const activeAcademicYears = (academicYears || []).filter(ay => ay.isActive !== false);

  // Faculty balance metrics
  const metrics = getFacultyMetrics(user?.email);
  const currentAvailableBalance = metrics.remainingBalance;

  // Form Fields State
  const [academicYearId, setAcademicYearId] = useState(() => {
    return activeAcademicYears.length > 0 ? activeAcademicYears[0].id : '';
  });

  // Effective academic year ID
  const effectiveAcademicYearId = academicYearId || (activeAcademicYears.length > 0 ? activeAcademicYears[0].id : '');

  // Field 2: Date (Auto proposal date)
  const [proposalDateStr] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);

  // Field 3: Category
  const [category, setCategory] = useState(CATEGORY_LIST[0] || 'CSEA');

  // Field 4: Sub Category
  const [subCategory, setSubCategory] = useState(() => {
    const subs = getSubcategoriesForCategory(CATEGORY_LIST[0] || 'CSEA');
    return subs.length > 0 ? subs[0] : '';
  });

  // Field 5: Proposal ID (Manual text entry)
  const [proposalId, setProposalId] = useState(() => generateProposalId());

  // Additional Proposal Fields
  const [title, setTitle] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [guestDetails, setGuestDetails] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subcategories for currently selected category
  const availableSubcategories = getSubcategoriesForCategory(category);

  // Handle Category change - resets subcategory
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const newSubs = getSubcategoriesForCategory(newCat);
    setSubCategory(newSubs.length > 0 ? newSubs[0] : '');
  };

  // Selected academic year object
  const selectedAcademicYearObj = activeAcademicYears.find(ay => ay.id === effectiveAcademicYearId);
  const selectedAcademicYearLabel = selectedAcademicYearObj ? selectedAcademicYearObj.academicYear : 'None Selected';

  // Live financial calculations
  const parsedAmount = Number(proposedAmount) || 0;
  const remainingBalance = currentAvailableBalance - parsedAmount;
  const isOverBudget = parsedAmount > currentAvailableBalance;

  // Format program date for display
  const formatDisplayDate = (dateIso) => {
    if (!dateIso) return '';
    const d = new Date(dateIso);
    return isNaN(d.getTime())
      ? dateIso
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeAcademicYears.length === 0) {
      setError('No active academic year available. Please contact the administrator.');
      return;
    }
    if (!effectiveAcademicYearId) {
      setError('Please select an Academic Year.');
      return;
    }

    if (!category) {
      setError('Please select a Category.');
      return;
    }

    if (availableSubcategories.length > 0 && !subCategory) {
      setError(`Please select a Sub Category for ${category}.`);
      return;
    }

    const cleanProposalId = proposalId.trim();
    if (!cleanProposalId) {
      setError('Please enter a valid Proposal ID.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter the Program / Proposal Title.');
      return;
    }
    if (!programDate) {
      setError('Please select the Date of Program.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Please enter a valid proposed amount greater than ₹0.');
      return;
    }
    if (isOverBudget) {
      setError('Insufficient available balance. Proposed amount exceeds your remaining balance.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addProposal({
        proposalId: cleanProposalId,
        id: cleanProposalId,
        academicYearId: effectiveAcademicYearId,
        academicYear: selectedAcademicYearLabel,
        proposalDate: todayIso,
        facultyName: user?.name || 'Faculty Member',
        facultyEmail: user?.email || 'faculty@kongu.edu',
        category,
        subCategory: availableSubcategories.length > 0 ? subCategory : '',
        title: title.trim(),
        programDate,
        guestDetails: guestDetails.trim() || 'None',
        amount: parsedAmount
      });

      setIsSubmitting(false);

      if (result.success) {
        navigate('/faculty/proposals');
      } else {
        setError(result.error || 'Failed to submit proposal. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Error submitting proposal.');
    }
  };

  return (
    <FacultyLayout pageTitle="New Proposal">
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>Submit Budget Proposal</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Submit an activity budget proposal for Computer Science and Engineering, Kongu Engineering College.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* Form & Summary Container */}
        <div className="cbm-proposal-grid">
          {/* Main Form Card */}
          <div className="cbm-card" style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    fontSize: 12.5,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  role="alert"
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Warning if no Academic Years available */}
              {activeAcademicYears.length === 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                    color: 'var(--warning-text)',
                    fontSize: 12.5,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>No active academic year available. Please contact the administrator.</span>
                </div>
              )}

              {/* FIELD 1: ACADEMIC YEAR & FIELD 2: DATE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* Field 1 — Academic Year Dropdown */}
                <div className="cbm-input-group">
                  <label htmlFor="academic-year-select" className="cbm-label">
                    Academic Year <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  {activeAcademicYears.length > 0 ? (
                    <select
                      id="academic-year-select"
                      value={effectiveAcademicYearId}
                      onChange={(e) => setAcademicYearId(e.target.value)}
                      required
                      className="cbm-select"
                    >
                      {activeAcademicYears.map((ay) => (
                        <option key={ay.id} value={ay.id}>
                          {ay.academicYear} (Budget: ₹{Number(ay.budget).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--danger-bg)',
                        border: '1px solid var(--danger-border)',
                        color: 'var(--danger-text)',
                        fontSize: 12.5,
                        fontWeight: 500
                      }}
                    >
                      No academic year available.
                    </div>
                  )}
                </div>

                {/* Field 2 — Date (System / Proposal Date) */}
                <div className="cbm-input-group">
                  <label className="cbm-label">
                    Date of Submission <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(System Date)</span>
                  </label>
                  <div
                    style={{
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border)',
                      fontWeight: 500,
                      color: 'var(--text-heading)',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Calendar size={15} color="var(--primary)" />
                    <span>{proposalDateStr}</span>
                  </div>
                </div>
              </div>

              {/* FIELD 3: CATEGORY & FIELD 4: SUB CATEGORY */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* Field 3 — Category Dropdown */}
                <div className="cbm-input-group">
                  <label htmlFor="category-select" className="cbm-label">
                    Category <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={handleCategoryChange}
                    required
                    className="cbm-select"
                  >
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 4 — Sub Category */}
                <div className="cbm-input-group">
                  <label htmlFor="subcategory-select" className="cbm-label">
                    Sub Category {availableSubcategories.length > 0 && <span style={{ color: 'var(--danger)' }}>*</span>}
                  </label>
                  {availableSubcategories.length > 0 ? (
                    <select
                      id="subcategory-select"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      required
                      className="cbm-select"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      id="subcategory-select"
                      disabled
                      className="cbm-select"
                    >
                      <option value="">None for {category}</option>
                    </select>
                  )}
                </div>
              </div>

              {/* FIELD 5: PROPOSAL ID */}
              <Input
                id="proposal-id-input"
                label="Proposal ID"
                required
                placeholder="e.g. PROP-2026-005"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
              />

              {/* Program Title */}
              <Input
                id="program-title-input"
                label="Program / Proposal Title"
                required
                placeholder="e.g. CSEA Technical Symposium"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Date of Program */}
              <div className="cbm-input-group">
                <label htmlFor="program-date-input" className="cbm-label">
                  Date of Program <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="program-date-input"
                  type="date"
                  min={todayIso}
                  value={programDate}
                  onChange={(e) => setProgramDate(e.target.value)}
                  required
                  className="cbm-input"
                />
              </div>

              {/* Guest Details */}
              <div className="cbm-input-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="guest-details-input" className="cbm-label">Guest Details</label>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Optional</span>
                </div>
                <textarea
                  id="guest-details-input"
                  placeholder="Enter guest name, designation, organization, etc."
                  value={guestDetails}
                  onChange={(e) => setGuestDetails(e.target.value)}
                  rows={2}
                  className="cbm-textarea"
                />
              </div>

              {/* Proposed Amount */}
              <Input
                id="proposed-amount-input"
                label="Proposed Amount (₹)"
                required
                type="number"
                min="1"
                placeholder="Enter amount in ₹ (e.g. 35000)"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
              />

              {/* Live Financial Calculation Box */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isOverBudget ? 'var(--danger-bg)' : 'var(--bg-page)',
                  border: isOverBudget ? '1px solid var(--danger-border)' : '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Calculator size={13} />
                  <span>Financial Computation</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-body)' }}>
                  <span>Available Quota:</span>
                  <span style={{ fontWeight: 600 }}>₹{currentAvailableBalance.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-body)' }}>
                  <span>Proposed Expenditure:</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{parsedAmount.toLocaleString('en-IN')}</span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: isOverBudget ? 'var(--danger-text)' : 'var(--success-text)'
                  }}
                >
                  <span>Remaining Quota:</span>
                  <span>₹{remainingBalance.toLocaleString('en-IN')}</span>
                </div>

                {isOverBudget && (
                  <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <AlertCircle size={14} /> Insufficient quota balance.
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isOverBudget || isSubmitting || activeAcademicYears.length === 0}
                icon={ArrowRight}
                style={{ height: 42, fontSize: 14, marginTop: 4 }}
              >
                Submit Proposal
              </Button>
            </form>
          </div>

          {/* Live Proposal Summary Preview Card */}
          <div className="cbm-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <FileCheck size={18} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>
                  Proposal Summary Preview
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Real-time validation summary
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Academic Year</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{selectedAcademicYearLabel}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Submission</span>
                <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{proposalDateStr}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', marginTop: 1 }}>
                  {category} {subCategory ? `— ${subCategory}` : ''}
                </p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposal ID</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginTop: 1 }}>{proposalId || '—'}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Title</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{title || '—'}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Program</span>
                <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{formatDisplayDate(programDate) || '—'}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Guest Details</span>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{guestDetails.trim() || 'None'}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposed Amount</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginTop: 1 }}>₹{parsedAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Remaining Quota Balance</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: isOverBudget ? 'var(--danger-text)' : 'var(--success-text)', marginTop: 1 }}>
                  ₹{remainingBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

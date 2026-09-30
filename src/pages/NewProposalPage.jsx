import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';
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
  // Field 1: Academic Year
  const [academicYearId, setAcademicYearId] = useState(() => {
    return activeAcademicYears.length > 0 ? activeAcademicYears[0].id : '';
  });

  // Keep academicYearId updated if activeAcademicYears loads after mount
  useEffect(() => {
    if (!academicYearId && activeAcademicYears.length > 0) {
      setAcademicYearId(activeAcademicYears[0].id);
    }
  }, [activeAcademicYears, academicYearId]);

  // Field 2: Date (Existing auto proposal date)
  const [proposalDateStr] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);

  // Field 3: Category
  const [category, setCategory] = useState(CATEGORY_LIST[0] || 'CSEA');

  // Field 4: Sub Category (dependent on Category)
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
  const selectedAcademicYearObj = activeAcademicYears.find(ay => ay.id === academicYearId);
  const selectedAcademicYearLabel = selectedAcademicYearObj ? selectedAcademicYearObj.academicYear : 'None Selected';

  // Live financial calculations
  const parsedAmount = Number(proposedAmount) || 0;
  const remainingBalance = currentAvailableBalance - parsedAmount;
  const isOverBudget = parsedAmount > currentAvailableBalance;

  // Format program date for display e.g. 2026-09-25 -> 25 Sep 2026
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

    // Field 1 Validation: Academic Year
    if (activeAcademicYears.length === 0) {
      setError('No academic year available. Please contact the administrator.');
      return;
    }
    if (!academicYearId) {
      setError('Please select an Academic Year.');
      return;
    }

    // Field 2 Validation: Date is auto-set

    // Field 3 Validation: Category
    if (!category) {
      setError('Please select a Category.');
      return;
    }

    // Field 4 Validation: Sub Category (when subcategories are available)
    if (availableSubcategories.length > 0 && !subCategory) {
      setError(`Please select a Sub Category for ${category}.`);
      return;
    }

    // Field 5 Validation: Proposal ID
    const cleanProposalId = proposalId.trim();
    if (!cleanProposalId) {
      setError('Please enter a valid Proposal ID.');
      return;
    }

    // Other validations
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
        academicYearId,
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
    <FacultyLayout pageTitle="New Budget Proposal">
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>New Budget Proposal</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
            Submit an activity budget proposal for Computer Science and Engineering, Kongu Engineering College.
          </p>
        </div>

        {/* Form & Summary Container */}
        <div className="cbm-proposal-grid">
          {/* Main Form Card */}
          <div className="cbm-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Warning if no Academic Years available */}
              {activeAcademicYears.length === 0 && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#B45309',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>No academic year available. Please contact the administrator.</span>
                </div>
              )}

              {/* ========================================================= */}
              {/* FIELD 1: ACADEMIC YEAR & FIELD 2: DATE                    */}
              {/* ========================================================= */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16 }}>
                {/* Field 1 — Academic Year Dropdown */}
                <div>
                  <label htmlFor="academic-year-select" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Academic Year <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  {activeAcademicYears.length > 0 ? (
                    <select
                      id="academic-year-select"
                      value={academicYearId}
                      onChange={(e) => setAcademicYearId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        backgroundColor: '#FFFFFF',
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: 'var(--dark)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
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
                        padding: '12px 16px',
                        borderRadius: 10,
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#EF4444',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      No academic year available. Please contact the administrator.
                    </div>
                  )}
                </div>

                {/* Field 2 — Date (System / Proposal Date) */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Date <span style={{ color: 'var(--secondary)', fontSize: 11 }}>(System Date)</span>
                  </label>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: '#F8F7FD',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      color: 'var(--dark)',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Calendar size={16} color="var(--primary)" />
                    <span>{proposalDateStr}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FIELD 3: CATEGORY & FIELD 4: SUB CATEGORY                */}
              {/* ========================================================= */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16 }}>
                {/* Field 3 — Category Dropdown */}
                <div>
                  <label htmlFor="category-select" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Category <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={handleCategoryChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      backgroundColor: '#FFFFFF',
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: 'var(--dark)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {CATEGORY_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 4 — Sub Category (Dependent Dropdown) */}
                <div>
                  <label htmlFor="subcategory-select" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Sub Category {availableSubcategories.length > 0 && <span style={{ color: '#EF4444' }}>*</span>}
                  </label>
                  {availableSubcategories.length > 0 ? (
                    <select
                      id="subcategory-select"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        backgroundColor: '#FFFFFF',
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: 'var(--dark)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
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
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        backgroundColor: '#F8F7FD',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--dark-muted)',
                        outline: 'none',
                        cursor: 'not-allowed'
                      }}
                    >
                      <option value="">Select Sub Category (None for {category})</option>
                    </select>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* FIELD 5: PROPOSAL ID                                     */}
              {/* ========================================================= */}
              <div>
                <label htmlFor="proposal-id-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Proposal ID <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="proposal-id-input"
                  placeholder="Enter proposal ID e.g. PROP-2026-005"
                  value={proposalId}
                  onChange={(e) => setProposalId(e.target.value)}
                  required
                />
              </div>

              {/* ========================================================= */}
              {/* ADDITIONAL PROPOSAL FIELDS                               */}
              {/* ========================================================= */}

              {/* Program Title */}
              <div>
                <label htmlFor="program-title-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Program / Proposal Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="program-title-input"
                  placeholder="Enter program title e.g. CSEA Technical Symposium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Date of Program */}
              <div>
                <label htmlFor="program-date-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Date of Program <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="program-date-input"
                  type="date"
                  min={todayIso}
                  value={programDate}
                  onChange={(e) => setProgramDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: 'var(--dark)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Guest Details (Optional) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label htmlFor="guest-details-input" style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>Guest Details</label>
                  <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>Optional</span>
                </div>
                <textarea
                  id="guest-details-input"
                  placeholder="Enter guest name, designation, organization, etc. e.g. Dr. Arun Kumar, Senior Software Engineer, ABC Technologies"
                  value={guestDetails}
                  onChange={(e) => setGuestDetails(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14,
                    color: 'var(--dark)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Proposed Amount */}
              <div>
                <label htmlFor="proposed-amount-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Proposed Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="proposed-amount-input"
                  type="number"
                  min="1"
                  placeholder="Enter amount in ₹ e.g. 35000"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                  required
                />
              </div>

              {/* Live Financial Calculation Box */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: 14,
                  backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.06)' : 'rgba(68, 60, 222, 0.05)',
                  border: isOverBudget ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(68, 60, 222, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Financial Calculation
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--dark)' }}>
                  <span>Available Balance:</span>
                  <span style={{ fontWeight: 700 }}>₹{currentAvailableBalance.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--dark)' }}>
                  <span>Proposed Amount:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parsedAmount.toLocaleString('en-IN')}</span>
                </div>

                <div
                  style={{
                    borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    fontWeight: 800,
                    color: isOverBudget ? '#EF4444' : '#10B981'
                  }}
                >
                  <span>Remaining Balance:</span>
                  <span>₹{remainingBalance.toLocaleString('en-IN')}</span>
                </div>

                {isOverBudget && (
                  <div style={{ fontSize: 12.5, color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={16} /> Insufficient available balance.
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
                style={{ height: 50, fontSize: 16, marginTop: 8 }}
              >
                Submit Proposal
              </Button>
            </form>
          </div>

          {/* Live Proposal Summary Preview Card */}
          <div className="cbm-card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>
              Proposal Summary Preview
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--dark-muted)', marginBottom: 20 }}>
              Live summary automatically updated as you fill in details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Academic Year</span>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>{selectedAcademicYearLabel}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Date of Proposal</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{proposalDateStr}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>
                  {category} {subCategory ? `— ${subCategory}` : ''}
                </p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposal ID</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--dark)', marginTop: 2 }}>{proposalId || '—'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Program Title</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>{title || '—'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Date of Program</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{formatDisplayDate(programDate) || '—'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Guest Details</span>
                <p style={{ fontSize: 13.5, color: 'var(--dark-muted)', marginTop: 2 }}>{guestDetails.trim() || 'None'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Available Balance</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>₹{currentAvailableBalance.toLocaleString('en-IN')}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposed Amount</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>₹{parsedAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Remaining Balance</span>
                <p style={{ fontSize: 16, fontWeight: 800, color: isOverBudget ? '#EF4444' : '#10B981', marginTop: 2 }}>
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

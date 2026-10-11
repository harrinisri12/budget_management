import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle, ArrowRight, Calendar, AlertTriangle, Calculator, FileCheck, Lock, UserCheck } from 'lucide-react';
import { getEventConfig, FIELD_GROUPS } from '../config/eventFormConfig';
import { slugify } from '../utils/slugify';

export const NewProposalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    academicYears,
    activeAcademicYear,
    fetchActiveAcademicYearConfig,
    addProposal,
    getFacultyMetrics
  } = useBudget();

  // Load active academic year config on mount
  useEffect(() => {
    fetchActiveAcademicYearConfig();
  }, [fetchActiveAcademicYearConfig]);

  // Determine active academic year object
  const activeAy = useMemo(() => {
    if (activeAcademicYear && (activeAcademicYear.status === 'ACTIVE' || activeAcademicYear.isActive)) {
      return activeAcademicYear;
    }
    return (academicYears || []).find(ay => ay.status === 'ACTIVE' || ay.isActive) || null;
  }, [activeAcademicYear, academicYears]);

  // Dynamic Categories belonging to the active academic year
  const dynamicCategories = useMemo(() => {
    if (!activeAy) return [];
    return activeAy.categories || [];
  }, [activeAy]);

  // Faculty balance metrics
  const metrics = getFacultyMetrics(user?.email);
  const currentAvailableBalance = metrics.remainingBalance;

  // ---------------------------------------------------------------------------
  // Form State
  // ---------------------------------------------------------------------------
  // Category Selection
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState('');

  // Effective category and subcategory
  const effectiveCategoryName = selectedCategoryName || (dynamicCategories.length > 0 ? dynamicCategories[0].name : '');

  // Selected Category Object
  const selectedCategoryObj = useMemo(() => {
    return dynamicCategories.find(c => c.name === effectiveCategoryName) || null;
  }, [dynamicCategories, effectiveCategoryName]);

  // Dynamic Subcategories for currently selected category
  const availableSubcategories = useMemo(() => {
    return selectedCategoryObj?.subcategories || [];
  }, [selectedCategoryObj]);

  const effectiveSubCategoryName = selectedSubCategoryName !== ''
    ? selectedSubCategoryName
    : (availableSubcategories.length > 0 ? availableSubcategories[0].name : '');

  // Dates
  const [proposalDateStr] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);

  // Dynamic Event-Specific State Object (cleared on category / subcategory change)
  const [eventData, setEventData] = useState({});

  // Common Proposal Fields State
  const [title, setTitle] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active event configuration
  const activeEventConfig = getEventConfig(effectiveSubCategoryName || effectiveCategoryName);
  const activeFieldGroupIds = activeEventConfig.fieldGroupIds || [];

  // Academic year label
  const selectedAcademicYearLabel = activeAy
    ? (activeAy.name || activeAy.academicYear || `${activeAy.startYear}-${activeAy.endYear}`)
    : 'No Active Academic Year';

  // ---------------------------------------------------------------------------
  // Automatic Global Proposal ID Preview (Read-only UI Preview)
  // Format: KEC/{ACADEMIC_YEAR}/{CATEGORY}/{SUBCATEGORY}/(assigned on submit)
  // ---------------------------------------------------------------------------
  const categorySlug = slugify(effectiveCategoryName || 'GENERAL');
  const subCategorySlug = slugify(effectiveSubCategoryName);
  const compactAyLabel = selectedAcademicYearLabel.replace(/\s+/g, '');

  const proposalIdPreview = activeAy
    ? (subCategorySlug
      ? `KEC/${compactAyLabel}/${categorySlug}/${subCategorySlug}/(assigned on submit)`
      : `KEC/${compactAyLabel}/${categorySlug}/(assigned on submit)`)
    : 'KEC/NO-SESSION/(pending active session configuration)';

  // ---------------------------------------------------------------------------
  // Category / Sub Category Change Handlers
  // ---------------------------------------------------------------------------
  const handleCategoryChange = (e) => {
    const newCatName = e.target.value;
    setSelectedCategoryName(newCatName);

    const catObj = dynamicCategories.find(c => c.name === newCatName);
    const subs = catObj?.subcategories || [];
    setSelectedSubCategoryName(subs.length > 0 ? subs[0].name : '');
    setEventData({});
    setError('');
  };

  const handleSubCategoryChange = (e) => {
    const newSubName = e.target.value;
    setSelectedSubCategoryName(newSubName);
    setEventData({});
    setError('');
  };

  const handleEventDataChange = (key, value) => {
    setEventData(prev => ({
      ...prev,
      [key]: value
    }));
    setError('');
  };

  // ---------------------------------------------------------------------------
  // Live Financial Calculations
  // ---------------------------------------------------------------------------
  const parsedAmount = Number(proposedAmount) || 0;
  const remainingBalance = currentAvailableBalance - parsedAmount;
  const isOverBudget = parsedAmount > currentAvailableBalance;

  // Date Formatter
  const formatDisplayDate = (dateIso) => {
    if (!dateIso) return '';
    const d = new Date(dateIso);
    return isNaN(d.getTime())
      ? dateIso
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ---------------------------------------------------------------------------
  // Form Submission Handler
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!activeAy) {
      setError('No active academic year available. Please contact the administrator.');
      return;
    }

    if (!effectiveCategoryName) {
      setError('Please select a Category.');
      return;
    }

    if (availableSubcategories.length > 0 && !effectiveSubCategoryName) {
      setError(`Please select a Sub Category for ${effectiveCategoryName}.`);
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

    // Dynamic Event-Specific Validation
    for (const groupId of activeFieldGroupIds) {
      const group = FIELD_GROUPS[groupId];
      if (group && group.fields) {
        for (const field of group.fields) {
          if (field.required) {
            const val = (eventData[field.key] || '').trim();
            if (!val) {
              setError(`Please enter the required field: ${field.label}.`);
              return;
            }
          }
        }
      }
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

    // Build event-specific payload & formatted guest string if guest fields active
    const activePayloadEventData = { ...eventData };
    let formattedGuestDetails = '';

    if (activeFieldGroupIds.includes('guestFields')) {
      const { guestName, guestDesignation, guestOrg, guestDetails } = eventData;
      const parts = [];
      if (guestName) parts.push(guestName.trim());
      if (guestDesignation) parts.push(guestDesignation.trim());
      if (guestOrg) parts.push(guestOrg.trim());

      let baseStr = parts.join(', ');
      if (guestDetails && guestDetails.trim()) {
        baseStr += baseStr ? ` — ${guestDetails.trim()}` : guestDetails.trim();
      }
      formattedGuestDetails = baseStr;
    }

    // Find selected subcategory ID
    const selectedSubObj = availableSubcategories.find(s => s.name === effectiveSubCategoryName);

    try {
      const result = await addProposal({
        proposalId: proposalIdPreview,
        academicYearId: activeAy.id,
        academicYear: selectedAcademicYearLabel,
        proposalDate: todayIso,
        facultyName: user?.name || 'Faculty Member',
        facultyEmail: user?.email || 'faculty@kongu.edu',
        category: effectiveCategoryName,
        categoryId: selectedCategoryObj?.id || null,
        subCategory: availableSubcategories.length > 0 ? effectiveSubCategoryName : '',
        subcategoryId: selectedSubObj?.id || null,
        title: title.trim(),
        programDate,
        guestDetails: formattedGuestDetails,
        eventDetails: activePayloadEventData,
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

              {/* Warning if no Active Academic Year */}
              {!activeAy && (
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
                  <span>No active academic year available for proposals. Please contact the administrator.</span>
                </div>
              )}

              {/* FIELD 1: ACADEMIC YEAR (Active Cycle) & FIELD 2: SUBMISSION DATE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* Field 1 — Active Academic Year Display */}
                <div className="cbm-input-group">
                  <label className="cbm-label">
                    Active Academic Year <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div
                    style={{
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      color: 'var(--text-heading)',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{selectedAcademicYearLabel}</span>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', fontWeight: 700 }}>
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Field 2 — Date of Submission */}
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

              {/* FIELD 3: DYNAMIC CATEGORY & FIELD 4: DYNAMIC SUB CATEGORY */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                {/* Field 3 — Category Dropdown (Driven by Active Academic Year) */}
                <div className="cbm-input-group">
                  <label htmlFor="category-select" className="cbm-label">
                    Category <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  {dynamicCategories.length > 0 ? (
                    <select
                      id="category-select"
                      value={effectiveCategoryName}
                      onChange={handleCategoryChange}
                      required
                      className="cbm-select"
                    >
                      {dynamicCategories.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.name} {cat.budget ? `(₹${Number(cat.budget).toLocaleString('en-IN')})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)' }}>
                      No categories configured for this cycle.
                    </div>
                  )}
                </div>

                {/* Field 4 — Dynamic Sub Category (Shown only if category has subcategories) */}
                {availableSubcategories.length > 0 ? (
                  <div className="cbm-input-group">
                    <label htmlFor="subcategory-select" className="cbm-label">
                      Sub Category <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      id="subcategory-select"
                      value={effectiveSubCategoryName}
                      onChange={handleSubCategoryChange}
                      required
                      className="cbm-select"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id || sub.name} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="cbm-input-group">
                    <label className="cbm-label">Sub Category</label>
                    <div style={{ height: 40, padding: '0 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      No subcategories available (Direct Category)
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD 5: PROPOSAL ID (Automatic Global Sequence Preview) */}
              <div className="cbm-input-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="cbm-label" htmlFor="proposal-id-preview">
                    Proposal ID <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(Auto-Generated System ID)</span>
                  </label>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={11} /> Auto Sequence
                  </span>
                </div>
                <div
                  id="proposal-id-preview"
                  style={{
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-page)',
                    border: '1px solid var(--border)',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{proposalIdPreview}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                    Read-only
                  </span>
                </div>
              </div>

              {/* Program Title */}
              <Input
                id="program-title-input"
                label="Program / Proposal Title"
                required
                placeholder="e.g. Technical Symposium / AI Guest Talk / Hackathon"
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

              {/* DYNAMIC EVENT-SPECIFIC FIELD GROUPS */}
              {activeFieldGroupIds.map((groupId) => {
                const group = FIELD_GROUPS[groupId];
                if (!group) return null;

                return (
                  <div
                    key={groupId}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserCheck size={16} color="var(--primary)" />
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
                        {group.title} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>(Required for {selectedSubCategoryName || selectedCategoryName})</span>
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14 }}>
                      {group.fields.map((field) => {
                        const fieldValue = eventData[field.key] || '';

                        if (field.type === 'textarea') {
                          return (
                            <div key={field.key} className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor={`dynamic-${field.key}`} className="cbm-label">
                                  {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                                </label>
                                {!field.required && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional</span>}
                              </div>
                              <textarea
                                id={`dynamic-${field.key}`}
                                placeholder={field.placeholder}
                                value={fieldValue}
                                onChange={(e) => handleEventDataChange(field.key, e.target.value)}
                                rows={field.rows || 2}
                                required={field.required}
                                className="cbm-textarea"
                              />
                            </div>
                          );
                        }

                        return (
                          <div key={field.key} className="cbm-input-group">
                            <label htmlFor={`dynamic-${field.key}`} className="cbm-label">
                              {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                            </label>
                            <input
                              id={`dynamic-${field.key}`}
                              type="text"
                              placeholder={field.placeholder}
                              value={fieldValue}
                              onChange={(e) => handleEventDataChange(field.key, e.target.value)}
                              required={field.required}
                              className="cbm-input"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

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
                disabled={isOverBudget || isSubmitting || !activeAy}
                icon={ArrowRight}
                style={{ height: 42, fontSize: 14, marginTop: 4 }}
              >
                {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
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
                  {effectiveCategoryName || '—'} {effectiveSubCategoryName ? `— ${effectiveSubCategoryName}` : ''}
                </p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposal ID Preview</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', marginTop: 1 }}>{proposalIdPreview}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Title</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{title || '—'}</p>
              </div>

              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Program</span>
                <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{formatDisplayDate(programDate) || '—'}</p>
              </div>

              {/* Dynamic Event Details Preview */}
              {activeFieldGroupIds.includes('guestFields') && (eventData.guestName || eventData.guestDesignation || eventData.guestOrg) && (
                <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Guest Information</span>
                  <div style={{ fontSize: 12.5, color: 'var(--text-body)', marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {eventData.guestName && <p style={{ margin: 0, fontWeight: 600 }}>{eventData.guestName}</p>}
                    {(eventData.guestDesignation || eventData.guestOrg) && (
                      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {[eventData.guestDesignation, eventData.guestOrg].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {eventData.guestDetails && (
                      <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>
                        {eventData.guestDetails}
                      </p>
                    )}
                  </div>
                </div>
              )}

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

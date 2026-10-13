import React, { useMemo } from 'react';
import { Calendar, ArrowRight, AlertTriangle, Layers, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

export const Step1ProposalConfig = ({
  academicYears,
  selectedAyId,
  onAyChange,
  submissionDateStr,
  categories,
  categoriesLoading,
  categoriesError,
  onReloadCategories,
  selectedCategoryName,
  onCategoryChange,
  availableSubcategories,
  selectedSubCategoryName,
  onSubCategoryChange,
  onContinue
}) => {
  // Filter only academic years permitted for proposal submission (ACTIVE)
  const permittedAcademicYears = useMemo(() => {
    return (academicYears || []).filter(
      (ay) => ay.status === 'ACTIVE' || ay.status === 'Active' || Boolean(ay.isActive || ay.is_active)
    );
  }, [academicYears]);

  // Selected academic year object
  const currentAy = useMemo(() => {
    return permittedAcademicYears.find((ay) => ay.id === selectedAyId) || permittedAcademicYears[0] || null;
  }, [permittedAcademicYears, selectedAyId]);

  // Selected category object
  const currentCat = useMemo(() => {
    return (categories || []).find((c) => c.name === selectedCategoryName) || null;
  }, [categories, selectedCategoryName]);

  const canProceed = Boolean(
    currentAy &&
    selectedCategoryName &&
    (!availableSubcategories.length || selectedSubCategoryName) &&
    !categoriesLoading
  );

  return (
    <div className="cbm-card" style={{ padding: '28px 32px' }}>
      {/* Section Header */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="cbm-form-ribbon">Step 1 of 5</span>
              <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>Proposal Configuration</h2>
            </div>
            <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
              Select an active academic year, funding category, and classification subcategory configured for CSE department activities.
            </p>
          </div>

          {currentAy && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                color: 'var(--success-text)',
                fontSize: 12,
                fontWeight: 700
              }}
            >
              <CheckCircle2 size={14} />
              <span>ACTIVE SESSION: {currentAy.name || currentAy.academicYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning if no permitted academic years */}
      {permittedAcademicYears.length === 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--warning-text)',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20
          }}
          role="alert"
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            No active academic year is currently open for proposal submissions. Please contact the CSE Budget Administrator to open the submission window.
          </span>
        </div>
      )}

      {/* Error state if categories failed to load */}
      {categoriesError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 20
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} />
            <span>{categoriesError}</span>
          </div>
          {onReloadCategories && (
            <button
              type="button"
              onClick={onReloadCategories}
              className="cbm-btn cbm-btn-outline cbm-btn-sm"
              style={{ height: 28, fontSize: 11.5 }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {/* Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
        {/* Field 1: Academic Year Selection */}
        <div className="cbm-input-group">
          <label htmlFor="ay-select" className="cbm-label">
            Academic Year <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          {permittedAcademicYears.length > 1 ? (
            <select
              id="ay-select"
              value={selectedAyId || (currentAy?.id || '')}
              onChange={(e) => onAyChange(e.target.value)}
              className="cbm-select"
              style={{ height: 42, fontSize: 13.5, fontWeight: 600 }}
            >
              {permittedAcademicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name || ay.academicYear} (Annual Quota: ₹{Number(ay.budget || ay.annualBudget || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          ) : (
            <div
              id="ay-select"
              style={{
                height: 42,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                color: 'var(--text-heading)',
                fontSize: 13.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{currentAy ? (currentAy.name || currentAy.academicYear) : 'Loading academic year...'}</span>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 3,
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success-text)',
                  fontWeight: 700
                }}
              >
                OPEN FOR PROPOSALS
              </span>
            </div>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Proposals can only be submitted against active cycles configured by the administrator.
          </span>
        </div>

        {/* Field 2: Date of Submission (System Date - Read Only) */}
        <div className="cbm-input-group">
          <label className="cbm-label">
            Date of Submission <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>(System Timestamp)</span>
          </label>
          <div
            style={{
              height: 42,
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border)',
              fontWeight: 500,
              color: 'var(--text-heading)',
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--primary)" />
              <span>{submissionDateStr}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Read-only
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Populated automatically from institutional server calendar.
          </span>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
        {/* Field 3: Category (Dynamic from Admin Configuration) */}
        <div className="cbm-input-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="category-select" className="cbm-label">
              Category <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            {categoriesLoading && (
              <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>Loading categories...</span>
            )}
          </div>

          {categoriesLoading ? (
            <div
              style={{
                height: 42,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                color: 'var(--text-muted)',
                fontSize: 13
              }}
            >
              Loading configured categories...
            </div>
          ) : categories && categories.length > 0 ? (
            <select
              id="category-select"
              value={selectedCategoryName}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="cbm-select"
              style={{ height: 42, fontSize: 13.5, fontWeight: 600 }}
              required
            >
              <option value="" disabled>-- Select Administrative Category --</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name} {cat.budget || cat.allocated_amount ? `(₹${Number(cat.budget || cat.allocated_amount).toLocaleString('en-IN')})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                color: 'var(--warning-text)',
                fontSize: 12.5,
                fontWeight: 500
              }}
            >
              No active categories found for this academic cycle. Please contact the administrator.
            </div>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Loads categories configured by the administrator for {currentAy?.name || 'this cycle'}.
          </span>
        </div>

        {/* Field 4: Subcategory (Dynamic based on selected Category) */}
        <div className="cbm-input-group">
          <label htmlFor="subcategory-select" className="cbm-label">
            Subcategory {availableSubcategories.length > 0 && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>

          {availableSubcategories.length > 0 ? (
            <select
              id="subcategory-select"
              value={selectedSubCategoryName}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              className="cbm-select"
              style={{ height: 42, fontSize: 13.5, fontWeight: 600 }}
              required
            >
              <option value="" disabled>-- Select Subcategory Event Type --</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id || sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              style={{
                height: 42,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Direct Category (No subcategories required)</span>
              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', color: 'var(--slate-600)', fontWeight: 600 }}>
                Direct
              </span>
            </div>
          )}
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {availableSubcategories.length > 0
              ? 'Select the event classification to generate its specialized form.'
              : 'This category uses a unified proposal form without subcategory divisions.'}
          </span>
        </div>
      </div>

      {/* Informative Category Meta Card */}
      {currentCat && (
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FCFBF8',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}
        >
          <Layers size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                {currentCat.name}
              </h4>
              {(currentCat.budget || currentCat.allocated_amount) && (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                  Allocated Quota: ₹{Number(currentCat.budget || currentCat.allocated_amount).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {currentCat.description ? (
              <p style={{ margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                {currentCat.description}
              </p>
            ) : (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Official department budget line for academic proposals and events.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!canProceed}
          icon={ArrowRight}
          style={{ height: 42, padding: '0 24px', fontSize: 13.5 }}
        >
          Continue to Proposal Details
        </Button>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { Calendar, ArrowRight, AlertTriangle, Layers, CheckCircle2, RefreshCw } from 'lucide-react';
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
  selectedCategoryId,
  onCategoryChange,
  availableSubcategories = [],
  subcategoriesLoading = false,
  subcategoriesError = '',
  onReloadSubcategories,
  selectedSubCategoryId,
  onSubCategoryChange,
  onContinue
}) => {
  // Filter only academic years permitted for proposal submission (ACTIVE)
  const permittedAcademicYears = useMemo(() => {
    const active = (academicYears || []).filter(
      (ay) => ay.status === 'ACTIVE' || ay.status === 'Active' || Boolean(ay.isActive || ay.is_active)
    );
    return active.length > 0 ? active : (academicYears || []);
  }, [academicYears]);

  // Selected academic year object (strictly matching selectedAyId)
  const currentAy = useMemo(() => {
    return permittedAcademicYears.find((ay) => ay.id === selectedAyId) || null;
  }, [permittedAcademicYears, selectedAyId]);

  // Selected category object
  const currentCat = useMemo(() => {
    return (categories || []).find((c) => c.id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const canProceed = Boolean(
    selectedAyId &&
    selectedCategoryId &&
    (!availableSubcategories.length || selectedSubCategoryId) &&
    !categoriesLoading &&
    !subcategoriesLoading &&
    !categoriesError &&
    !subcategoriesError
  );

  return (
    <div className="cbm-card">
      {/* Section Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="cbm-form-ribbon" style={{ padding: '3px 8px', fontSize: 11 }}>Step 1 of 5</span>
          <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 16 }}>Proposal Configuration</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— Academic Session &amp; Funding Category</span>
        </div>

        {currentAy && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              color: 'var(--success-text)',
              fontSize: 11,
              fontWeight: 700
            }}
          >
            <CheckCircle2 size={12} />
            <span>ACTIVE: {currentAy.name || currentAy.academicYear}</span>
          </div>
        )}
      </div>

      {/* Warning if no permitted academic years */}
      {permittedAcademicYears.length === 0 && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--warning-text)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}
          role="alert"
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>No active academic year is open for submissions. Please contact the administrator.</span>
        </div>
      )}

      {/* Error state if categories failed to load */}
      {categoriesError && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 8
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} />
            <span>{categoriesError}</span>
          </div>
          {onReloadCategories && (
            <button
              type="button"
              onClick={onReloadCategories}
              className="cbm-btn cbm-btn-outline cbm-btn-sm"
              style={{ height: 24, fontSize: 11, padding: '0 8px' }}
            >
              <RefreshCw size={11} /> Retry
            </button>
          )}
        </div>
      )}

      {/* 2x2 Configuration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px 16px' }}>
        {/* Field 1: Academic Year Selection */}
        <div className="cbm-input-group" style={{ marginBottom: 0 }}>
          <label htmlFor="ay-select" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
            Academic Year <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          {permittedAcademicYears.length > 0 ? (
            <select
              id="ay-select"
              value={selectedAyId || ''}
              onChange={(e) => onAyChange(e.target.value)}
              className="cbm-select"
              style={{ height: 34, fontSize: 12.5, fontWeight: 600 }}
            >
              <option value="" disabled>-- Select Academic Year --</option>
              {permittedAcademicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name || ay.academicYear} (Quota: ₹{Number(ay.budget || ay.annualBudget || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          ) : (
            <div
              id="ay-select"
              style={{
                height: 34,
                padding: '0 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                color: 'var(--text-heading)',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{currentAy ? (currentAy.name || currentAy.academicYear) : 'Loading...'}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', fontWeight: 700 }}>
                OPEN
              </span>
            </div>
          )}
        </div>

        {/* Field 2: Date of Submission (System Date - Read Only) */}
        <div className="cbm-input-group" style={{ marginBottom: 0 }}>
          <label className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
            Submission Date <span style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>(Server Date)</span>
          </label>
          <div
            style={{
              height: 34,
              padding: '0 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border)',
              fontWeight: 500,
              color: 'var(--text-heading)',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--primary)" />
              <span>{submissionDateStr}</span>
            </div>
            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Auto</span>
          </div>
        </div>

        {/* Field 3: Category */}
        <div className="cbm-input-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="category-select" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
              Category <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            {categoriesLoading && (
              <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 600 }}>Loading...</span>
            )}
          </div>

          {!selectedAyId ? (
            <select
              id="category-select"
              disabled
              className="cbm-select"
              style={{ height: 34, fontSize: 12.5, color: 'var(--text-muted)' }}
            >
              <option value="">-- Select Year First --</option>
            </select>
          ) : categoriesLoading ? (
            <div style={{ height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 10px', color: 'var(--text-muted)', fontSize: 12 }}>
              Loading categories...
            </div>
          ) : categoriesError ? (
            <div style={{ height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', fontSize: 11.5, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
              Error loading categories
            </div>
          ) : categories && categories.length > 0 ? (
            <select
              id="category-select"
              value={selectedCategoryId || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="cbm-select"
              style={{ height: 34, fontSize: 12.5, fontWeight: 600 }}
              required
            >
              <option value="" disabled>-- Select Administrative Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.budget || cat.allocatedAmount || cat.allocated_amount ? `(₹${Number(cat.budget || cat.allocatedAmount || cat.allocated_amount).toLocaleString('en-IN')})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning-text)', fontSize: 11.5, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
              No categories configured
            </div>
          )}
        </div>

        {/* Field 4: Subcategory */}
        <div className="cbm-input-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="subcategory-select" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
              Subcategory {availableSubcategories.length > 0 && <span style={{ color: 'var(--danger)' }}>*</span>}
            </label>
            {subcategoriesLoading && (
              <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 600 }}>Loading...</span>
            )}
          </div>

          {!selectedCategoryId ? (
            <select
              id="subcategory-select"
              disabled
              className="cbm-select"
              style={{ height: 34, fontSize: 12.5, color: 'var(--text-muted)' }}
            >
              <option value="">-- Select Category First --</option>
            </select>
          ) : subcategoriesLoading ? (
            <div style={{ height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
              Loading subcategories...
            </div>
          ) : subcategoriesError ? (
            <div style={{ height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', fontSize: 11.5, display: 'flex', alignItems: 'center', padding: '0 10px' }}>
              Error loading subcategories
            </div>
          ) : availableSubcategories.length > 0 ? (
            <select
              id="subcategory-select"
              value={selectedSubCategoryId || ''}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              className="cbm-select"
              style={{ height: 34, fontSize: 12.5, fontWeight: 600 }}
              required
            >
              <option value="" disabled>-- Select Subcategory Event Type --</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          ) : (
            <div
              id="subcategory-select"
              style={{
                height: 34,
                padding: '0 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-page)',
                border: '1px solid var(--border)',
                fontSize: 12,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Unified category (No subcategories)</span>
              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: 'var(--slate-100)', color: 'var(--slate-600)', fontWeight: 600 }}>
                Direct
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Informative Category Meta Strip */}
      {currentCat && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FCFBF8',
            border: '1px solid var(--gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6,
            fontSize: 11.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={13} color="var(--primary)" />
            <strong style={{ color: 'var(--text-heading)' }}>{currentCat.name}</strong>
            <span style={{ color: 'var(--text-muted)' }}>— {currentCat.description || 'Department budget line'}</span>
          </div>
          {(currentCat.budget || currentCat.allocated_amount) && (
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Category Quota: ₹{Number(currentCat.budget || currentCat.allocated_amount).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
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
          style={{ height: 38, padding: '0 20px', fontSize: 13 }}
        >
          Continue to Proposal Details
        </Button>
      </div>
    </div>
  );
};

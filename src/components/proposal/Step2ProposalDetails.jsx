import React, { useMemo } from 'react';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Users,
  Building,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  AUDIENCE_OPTIONS,
  calculateHackathonDuration
} from '../../config/proposalFormSchemas';

export const Step2ProposalDetails = ({
  proposalIdPreview,
  categoryName,
  subCategoryName,
  schema = {},
  // Common details
  title = '',
  onTitleChange,
  programDate = '',
  onProgramDateChange,
  endDate = '',
  onEndDateChange,
  selectedAudience = '',
  selectedAudiences = [],
  onAudienceChange,
  onToggleAudience,
  // Hackathon duration manual entry
  hackathonDurationHours = '',
  onHackathonDurationHoursChange,
  // Dynamic category details
  eventData = {},
  onEventDataChange,
  // Navigation
  onBack,
  onContinue
}) => {
  const isHackathon = Boolean(schema?.isHackathon || schema?.type === 'hackathon');
  const requiresMultiDay = Boolean(schema?.requiresMultiDay);

  // Active audience selection
  const currentAudience = selectedAudience || (Array.isArray(selectedAudiences) && selectedAudiences.length > 0 ? selectedAudiences[0] : '');

  const handleAudienceSelect = (val) => {
    if (typeof onAudienceChange === 'function') {
      onAudienceChange(val);
    }
    if (typeof onToggleAudience === 'function') {
      onToggleAudience(val);
    }
  };

  // Live Hackathon Duration Calculation
  const hackathonDuration = useMemo(() => {
    if (!isHackathon) return null;
    return calculateHackathonDuration(programDate, endDate, '09:00', '17:00');
  }, [isHackathon, programDate, endDate]);

  // Only required dynamic fields (remove all optional fields and optional sections)
  const requiredDynamicFields = useMemo(() => {
    return (schema?.fields || []).filter((f) => Boolean(f.required));
  }, [schema]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    if (!title || !title.trim()) {
      errors.push('Programme / Proposal Title is required.');
    }
    if (!programDate) {
      errors.push('Start Date of Programme is required.');
    }
    if (requiresMultiDay && !endDate) {
      errors.push(`End Date of Programme is required for ${schema.name || 'this activity'}.`);
    }
    if (endDate && programDate && endDate < programDate) {
      errors.push('End Date cannot precede the Start Date.');
    }
    if (!currentAudience) {
      errors.push('Please select the Target Audience.');
    }

    // Hackathon Duration Validation
    if (isHackathon) {
      if (!hackathonDurationHours && !hackathonDuration?.isValid) {
        errors.push('Hackathon Duration is required (please enter total duration in hours).');
      } else if (hackathonDurationHours && (isNaN(Number(hackathonDurationHours)) || Number(hackathonDurationHours) <= 0)) {
        errors.push('Hackathon Duration must be a positive number of hours.');
      }
    }

    // Dynamic schema fields validation (strictly required fields only)
    for (const field of requiredDynamicFields) {
      const val = eventData[field.key];
      if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
        errors.push(`"${field.label}" is required.`);
      }
    }

    return errors;
  }, [
    title,
    programDate,
    endDate,
    requiresMultiDay,
    currentAudience,
    schema,
    requiredDynamicFields,
    eventData,
    isHackathon,
    hackathonDurationHours,
    hackathonDuration
  ]);

  const isValid = validationErrors.length === 0;

  return (
    <div className="cbm-card">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="cbm-form-ribbon" style={{ padding: '3px 8px', fontSize: 11 }}>Step 2 of 5</span>
            <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 16 }}>
              {schema.title || 'Programme Proposal Details'}
            </h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              — {subCategoryName || categoryName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-subtle)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 11
              }}
            >
              {schema.badge || schema.name || 'Proposal'}
            </span>
            {proposalIdPreview && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  backgroundColor: 'var(--slate-100)',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace'
                }}
                title="System Generated Sequence Preview"
              >
                <Lock size={10} /> {proposalIdPreview}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Core Programme Identification & Schedule (Compact Shared Section) */}
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
            {/* Programme Title - Full Width */}
            <div className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label htmlFor="prog-title-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                Programme / Proposal Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="prog-title-input"
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Industry Guest Lecture on Cloud Architecture / National Hackathon 2026"
                required
                className="cbm-input"
                style={{ height: 32, fontSize: 12.5 }}
              />
            </div>

            {/* Start Date & End Date Side by Side */}
            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="prog-start-date-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                Start Date <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="prog-start-date-input"
                type="date"
                value={programDate}
                onChange={(e) => onProgramDateChange(e.target.value)}
                required
                className="cbm-input"
                style={{ height: 32, fontSize: 12.5 }}
              />
            </div>

            <div className="cbm-input-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="prog-end-date-input" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                  End Date {requiresMultiDay ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                </label>
                {!requiresMultiDay && (
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>(Optional if 1-day)</span>
                )}
              </div>
              <input
                id="prog-end-date-input"
                type="date"
                value={endDate}
                min={programDate || undefined}
                onChange={(e) => onEndDateChange(e.target.value)}
                required={requiresMultiDay}
                className="cbm-input"
                style={{ height: 32, fontSize: 12.5 }}
              />
            </div>

            {/* Intended Target Audience (Dropdown) - Full Width */}
            <div className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label htmlFor="prog-audience-select" className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Users size={12} /> Intended Target Audience <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="prog-audience-select"
                value={currentAudience}
                onChange={(e) => handleAudienceSelect(e.target.value)}
                required
                className="cbm-select"
                style={{ height: 32, fontSize: 12.5 }}
              >
                <option value="" disabled>-- Select Intended Target Audience --</option>
                {AUDIENCE_OPTIONS.map((aud) => (
                  <option key={aud} value={aud}>{aud}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact Hackathon Duration Specification if applicable */}
          {isHackathon && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Timer size={14} color="#0284C7" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0369A1' }}>
                  Duration (Hours) <span style={{ color: 'var(--danger)' }}>*</span>:
                </span>
                <input
                  id="hackathon-duration-input"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="Hours (e.g. 24)"
                  value={hackathonDurationHours}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('-')) return;
                    onHackathonDurationHoursChange(val);
                  }}
                  className="cbm-input"
                  style={{ height: 28, width: 110, fontSize: 12, fontWeight: 600, color: '#0369A1', padding: '0 8px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { label: '12h', hours: '12' },
                  { label: '24h', hours: '24' },
                  { label: '36h', hours: '36' },
                  { label: '48h', hours: '48' }
                ].map((preset) => (
                  <button
                    key={preset.hours}
                    type="button"
                    onClick={() => onHackathonDurationHoursChange(preset.hours)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: 3,
                      fontSize: 10.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: hackathonDurationHours === preset.hours ? '1px solid #0284C7' : '1px solid #BAE6FD',
                      backgroundColor: hackathonDurationHours === preset.hours ? '#0284C7' : '#FFFFFF',
                      color: hackathonDurationHours === preset.hours ? '#FFFFFF' : '#0369A1'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Programme-Specific Form Fields (Strictly Required Fields Only) */}
        {requiredDynamicFields.length > 0 && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building size={13} color="var(--primary)" />
                {schema.name} Specific Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '8px 12px' }}>
              {requiredDynamicFields.map((field) => {
                const val = eventData[field.key] ?? (field.defaultValue || '');

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="cbm-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                        {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <textarea
                        id={`field-${field.key}`}
                        value={val}
                        onChange={(e) => onEventDataChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={2}
                        required
                        className="cbm-textarea"
                        style={{ fontSize: 12.5, minHeight: 48, padding: '6px 10px' }}
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key} className="cbm-input-group" style={{ marginBottom: 0 }}>
                      <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                        {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <select
                        id={`field-${field.key}`}
                        value={val}
                        onChange={(e) => onEventDataChange(field.key, e.target.value)}
                        required
                        className="cbm-select"
                        style={{ height: 32, fontSize: 12.5 }}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="cbm-input-group" style={{ marginBottom: 0 }}>
                    <label htmlFor={`field-${field.key}`} className="cbm-label" style={{ fontSize: 11.5, marginBottom: 2 }}>
                      {field.label} <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id={`field-${field.key}`}
                      type={field.type || 'text'}
                      value={val}
                      min={field.min}
                      onChange={(e) => onEventDataChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required
                      className="cbm-input"
                      style={{ height: 32, fontSize: 12.5 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation Errors Notice */}
        {!isValid && validationErrors.length > 0 && (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              color: 'var(--warning-text)',
              fontSize: 11.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <AlertTriangle size={13} />
              <span>Please complete the required fields: {validationErrors.join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          style={{ height: 38, padding: '0 18px', fontSize: 13 }}
        >
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!isValid}
          icon={ArrowRight}
          style={{ height: 38, padding: '0 20px', fontSize: 13 }}
        >
          Continue to Budget
        </Button>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  UserCheck,
  Building,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  AUDIENCE_OPTIONS,
  PROGRAMME_LEVEL_OPTIONS,
  calculateHackathonDuration,
  validateScheduleSequence
} from '../../config/proposalFormSchemas';

export const Step2ProposalDetails = ({
  proposalIdPreview,
  categoryName,
  subCategoryName,
  schema,
  // Common details
  title,
  onTitleChange,
  programDate,
  onProgramDateChange,
  endDate,
  onEndDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  venue,
  onVenueChange,
  programmeLevel,
  onProgrammeLevelChange,
  selectedAudiences = [],
  onToggleAudience,
  coordinatorName,
  onCoordinatorNameChange,
  coordinatorDesignation,
  onCoordinatorDesignationChange,
  coordinatorContact,
  onCoordinatorContactChange,
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

  // Live Hackathon Duration Calculation
  const hackathonDuration = useMemo(() => {
    return calculateHackathonDuration(programDate, endDate, startTime, endTime);
  }, [programDate, endDate, startTime, endTime]);

  // Schedule sequence validation (end not before start, end time > start time on same day, etc.)
  const scheduleValidation = useMemo(() => {
    return validateScheduleSequence(programDate, endDate, startTime, endTime);
  }, [programDate, endDate, startTime, endTime]);

  // Comprehensive Form Validation
  const validationErrors = useMemo(() => {
    const errors = [];

    // Common fields validation
    if (!title || !title.trim()) {
      errors.push('Programme / Proposal Title is required.');
    }
    if (!programDate) {
      errors.push('Start Date of Programme is required.');
    }
    if (requiresMultiDay && !endDate) {
      errors.push(`End Date of Programme is required for ${schema.name || 'this activity'}.`);
    }
    if (!startTime || !endTime) {
      errors.push('Session start and end times are required.');
    }
    if (!scheduleValidation.isValid) {
      errors.push(scheduleValidation.error);
    }
    if (!venue || !venue.trim()) {
      errors.push('Programme Venue / Location is required.');
    }
    if (!programmeLevel || !programmeLevel.trim()) {
      errors.push('Programme Level is required.');
    }
    if (!selectedAudiences || selectedAudiences.length === 0) {
      errors.push('Please select at least one Target Audience group.');
    }
    if (!coordinatorName || !coordinatorName.trim()) {
      errors.push('Faculty Coordinator Name is required.');
    }
    if (!coordinatorDesignation || !coordinatorDesignation.trim()) {
      errors.push('Coordinator Designation is required.');
    }
    if (!coordinatorContact || !coordinatorContact.trim()) {
      errors.push('Coordinator Contact Phone / Extension is required.');
    }

    // Hackathon Duration Validation
    if (isHackathon) {
      if (!hackathonDurationHours && !hackathonDuration?.isValid) {
        errors.push('Hackathon Duration is required (please enter total duration in hours).');
      } else if (hackathonDurationHours && (isNaN(Number(hackathonDurationHours)) || Number(hackathonDurationHours) <= 0)) {
        errors.push('Hackathon Duration must be a positive number of hours.');
      }
    }

    // Dynamic schema fields validation (only fields marked required: true)
    if (schema?.fields) {
      for (const field of schema.fields) {
        if (field.required) {
          const val = eventData[field.key];
          if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
            errors.push(`"${field.label}" is required.`);
          }
        }
      }
    }

    return errors;
  }, [
    title,
    programDate,
    endDate,
    startTime,
    endTime,
    scheduleValidation,
    requiresMultiDay,
    venue,
    programmeLevel,
    selectedAudiences,
    coordinatorName,
    coordinatorDesignation,
    coordinatorContact,
    schema,
    eventData,
    isHackathon,
    hackathonDurationHours,
    hackathonDuration
  ]);

  const isValid = validationErrors.length === 0;

  return (
    <div className="cbm-card" style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="cbm-form-ribbon">Step 2 of 5</span>
              <h2 className="cbm-section-title" style={{ margin: 0, fontSize: 18 }}>
                {schema.title || 'Programme Proposal Details'}
              </h2>
            </div>
            <p className="cbm-section-subtitle" style={{ marginTop: 4 }}>
              {schema.subtitle || `Form dynamically configured for ${subCategoryName || categoryName}.`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Programme Type:
            </span>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--gold-subtle)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 12
              }}
            >
              {schema.badge || schema.name}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* SECTION: PROPOSAL ID PREVIEW */}
        <div className="cbm-input-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="proposal-id-preview" className="cbm-label">
              Proposal ID Preview <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400 }}>(Institutional Numbering Convention)</span>
            </label>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} /> Assigned by System
            </span>
          </div>
          <div
            id="proposal-id-preview"
            style={{
              height: 42,
              padding: '0 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border)',
              fontWeight: 700,
              color: 'var(--primary)',
              fontSize: 13,
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{proposalIdPreview}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
              Read-only preview
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Official continuous sequence number will be assigned atomically upon submission without collisions.
          </span>
        </div>

        {/* SECTION A: CORE PROGRAMME IDENTIFICATION & SCHEDULE (MANDATORY COMMON SECTION) */}
        <div style={{ padding: '20px 22px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--primary)" />
              Core Programme Identification & Schedule
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mandatory Shared Section
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {/* Programme Title */}
            <div className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="prog-title-input" className="cbm-label">
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
                style={{ height: 42, fontSize: 13.5 }}
              />
            </div>

            {/* Start Date */}
            <div className="cbm-input-group">
              <label htmlFor="prog-start-date-input" className="cbm-label">
                Start Date of Programme <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="prog-start-date-input"
                type="date"
                value={programDate}
                onChange={(e) => onProgramDateChange(e.target.value)}
                required
                className="cbm-input"
                style={{ height: 42 }}
              />
            </div>

            {/* End Date */}
            <div className="cbm-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="prog-end-date-input" className="cbm-label">
                  End Date of Programme {requiresMultiDay ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                </label>
                {!requiresMultiDay && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional (if multi-day)</span>
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
                style={{ height: 42 }}
              />
            </div>

            {/* Timings: Start Time & End Time */}
            <div className="cbm-input-group">
              <label htmlFor="prog-time-start" className="cbm-label">
                Session Start Time <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-time-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  required
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            <div className="cbm-input-group">
              <label htmlFor="prog-time-end" className="cbm-label">
                Session End Time <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-time-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  required
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            {/* Programme Venue */}
            <div className="cbm-input-group">
              <label htmlFor="prog-venue-input" className="cbm-label">
                Programme Venue / Location <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-venue-input"
                  type="text"
                  value={venue}
                  onChange={(e) => onVenueChange(e.target.value)}
                  placeholder="e.g. CC3 Seminar Hall / Main Auditorium / CS Lab 4"
                  required
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            {/* Programme Level */}
            <div className="cbm-input-group">
              <label htmlFor="prog-level-select" className="cbm-label">
                Programme Level <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Award size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <select
                  id="prog-level-select"
                  value={programmeLevel}
                  onChange={(e) => onProgrammeLevelChange(e.target.value)}
                  required
                  className="cbm-select"
                  style={{ height: 42, paddingLeft: 34 }}
                >
                  {PROGRAMME_LEVEL_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Sequence Error Alert */}
          {!scheduleValidation.isValid && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              role="alert"
            >
              <AlertTriangle size={16} />
              <span>{scheduleValidation.error}</span>
            </div>
          )}

          {/* Interactive Hackathon Duration Specification */}
          {isHackathon && (
            <div
              style={{
                marginTop: 18,
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F0F9FF',
                border: '1.5px solid #BAE6FD',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Timer size={19} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0369A1' }}>
                      Hackathon Duration Specification
                    </h4>
                    <span style={{ fontSize: 11.5, color: '#0284C7' }}>
                      Enter total duration in hours, select a standard duration preset, or sync from scheduled dates/times.
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {hackathonDurationHours && (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: '#E0F2FE',
                        color: '#0369A1',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      Manually Specified: {hackathonDurationHours} Hours
                    </span>
                  )}
                  {((hackathonDurationHours && Number(hackathonDurationHours) >= 24) || hackathonDuration?.isOvernight) && (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      Overnight Hackathon
                    </span>
                  )}
                  {((hackathonDurationHours && Number(hackathonDurationHours) >= 24) || hackathonDuration?.isMultiDay) && (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      Multi-Day Event
                    </span>
                  )}
                </div>
              </div>

              {/* Input & Action Controls Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14, alignItems: 'center' }}>
                {/* Manual Input */}
                <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="hackathon-duration-input" className="cbm-label" style={{ fontSize: 12 }}>
                    Hackathon Duration (Total Hours) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="hackathon-duration-input"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="e.g. 24 or 36"
                      value={hackathonDurationHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('-')) return;
                        onHackathonDurationHoursChange(val);
                      }}
                      className="cbm-input"
                      style={{
                        height: 40,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0369A1',
                        backgroundColor: '#FFFFFF',
                        borderColor: '#BAE6FD'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="cbm-label" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Quick Presets:
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { label: '12h', hours: '12' },
                      { label: '24h (1 Day)', hours: '24' },
                      { label: '36h', hours: '36' },
                      { label: '48h (2 Days)', hours: '48' }
                    ].map((preset) => (
                      <button
                        key={preset.hours}
                        type="button"
                        onClick={() => onHackathonDurationHoursChange(preset.hours)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: hackathonDurationHours === preset.hours ? '1px solid #0284C7' : '1px solid #BAE6FD',
                          backgroundColor: hackathonDurationHours === preset.hours ? '#0284C7' : '#FFFFFF',
                          color: hackathonDurationHours === preset.hours ? '#FFFFFF' : '#0369A1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-Calculate / Sync from Schedule Option */}
                {hackathonDuration?.isValid && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className="cbm-label" style={{ fontSize: 12 }}>
                      Calculated from Schedule:
                    </span>
                    <button
                      type="button"
                      onClick={() => onHackathonDurationHoursChange(String(hackathonDuration.hours))}
                      className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      style={{
                        height: 38,
                        fontSize: 11.5,
                        backgroundColor: '#FFFFFF',
                        borderColor: '#BAE6FD',
                        color: '#0369A1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                      title="Apply calculated duration based on start and end dates/times"
                    >
                      <Timer size={13} />
                      <span>Sync: {hackathonDuration.displayText}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Intended Target Audience Checkbox Pills */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="cbm-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} /> Intended Target Audience <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <span style={{ fontSize: 11, color: selectedAudiences.length > 0 ? 'var(--success-text)' : 'var(--danger)', fontWeight: 600 }}>
                {selectedAudiences.length > 0 ? `✓ ${selectedAudiences.length} Selected` : 'Require at least one selection'}
              </span>
            </div>
            <div className="cbm-pill-group" style={{ marginTop: 6 }}>
              {AUDIENCE_OPTIONS.map((aud) => {
                const isSelected = selectedAudiences.includes(aud);
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => onToggleAudience(aud)}
                    className={`cbm-pill-btn ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}</span>
                    <span>{aud}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION B: FACULTY COORDINATOR DETAILS (MANDATORY COMMON SECTION) */}
        <div style={{ padding: '20px 22px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={16} color="var(--primary)" />
              Faculty Coordinator Details
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mandatory Shared Section
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            <div className="cbm-input-group">
              <label htmlFor="coord-name-input" className="cbm-label">
                Faculty Coordinator Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="coord-name-input"
                type="text"
                value={coordinatorName}
                onChange={(e) => onCoordinatorNameChange(e.target.value)}
                placeholder="e.g. Dr. Arun Kumar P"
                required
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>

            <div className="cbm-input-group">
              <label htmlFor="coord-desig-input" className="cbm-label">
                Designation <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="coord-desig-input"
                type="text"
                value={coordinatorDesignation}
                onChange={(e) => onCoordinatorDesignationChange(e.target.value)}
                placeholder="e.g. Associate Professor / Assistant Professor"
                required
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>

            <div className="cbm-input-group">
              <label htmlFor="coord-contact-input" className="cbm-label">
                Contact Phone / Ext. <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="coord-contact-input"
                type="text"
                value={coordinatorContact}
                onChange={(e) => onCoordinatorContactChange(e.target.value)}
                placeholder="e.g. +91 98421 12345 / Ext 521"
                required
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>
          </div>
        </div>

        {/* SECTION C: DYNAMIC PROGRAMME-SPECIFIC FORM FIELDS */}
        {schema?.fields && schema.fields.length > 0 && (
          <div
            style={{
              padding: '22px 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--gold-border)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building size={16} color="var(--primary)" />
                  {schema.name} Specific Form Specifications
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Fields dynamically generated for {subCategoryName ? `${subCategoryName} (${categoryName})` : categoryName}.
                </p>
              </div>
              <span className="cbm-form-ribbon">Programme-Specific</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
              {schema.fields.map((field) => {
                const val = eventData[field.key] ?? (field.defaultValue || '');

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor={`field-${field.key}`} className="cbm-label">
                          {field.label} {field.required ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                        </label>
                        {!field.required && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            (Optional)
                          </span>
                        )}
                      </div>
                      <textarea
                        id={`field-${field.key}`}
                        value={val}
                        onChange={(e) => onEventDataChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 3}
                        required={field.required}
                        className="cbm-textarea"
                      />
                      {field.helper && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{field.helper}</span>
                      )}
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key} className="cbm-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor={`field-${field.key}`} className="cbm-label">
                          {field.label} {field.required ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                        </label>
                        {!field.required && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            (Optional)
                          </span>
                        )}
                      </div>
                      <select
                        id={`field-${field.key}`}
                        value={val}
                        onChange={(e) => onEventDataChange(field.key, e.target.value)}
                        required={field.required}
                        className="cbm-select"
                        style={{ height: 40 }}
                      >
                        <option value="">-- Select {field.label} --</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {field.helper && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{field.helper}</span>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="cbm-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor={`field-${field.key}`} className="cbm-label">
                        {field.label} {field.required ? <span style={{ color: 'var(--danger)' }}>*</span> : null}
                      </label>
                      {!field.required && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          (Optional)
                        </span>
                      )}
                    </div>
                    <input
                      id={`field-${field.key}`}
                      type={field.type || 'text'}
                      value={val}
                      min={field.min}
                      onChange={(e) => onEventDataChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="cbm-input"
                      style={{ height: 40 }}
                    />
                    {field.helper && (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{field.helper}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation Errors Summary (if any) */}
        {!isValid && validationErrors.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              color: 'var(--warning-text)',
              fontSize: 12.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <AlertTriangle size={15} />
              <span>Please complete the required details before proceeding:</span>
            </div>
            <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
              {validationErrors.map((err, idx) => (
                <li key={idx} style={{ lineHeight: 1.4 }}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Step Navigation Actions */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          icon={ArrowLeft}
          style={{ height: 42, padding: '0 20px', fontSize: 13.5 }}
        >
          Back to Configuration
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          disabled={!isValid}
          icon={ArrowRight}
          style={{ height: 42, padding: '0 24px', fontSize: 13.5 }}
        >
          Continue to Budget Details
        </Button>
      </div>
    </div>
  );
};

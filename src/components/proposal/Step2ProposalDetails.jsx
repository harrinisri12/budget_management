import React from 'react';
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
  Plus,
  Trash2,
  Building,
  GraduationCap
} from 'lucide-react';
import { Button } from '../common/Button';
import { AUDIENCE_OPTIONS, PROGRAMME_LEVEL_OPTIONS } from '../../config/proposalFormSchemas';

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
  // Dynamic category details
  eventData = {},
  onEventDataChange,
  // Repeatable events (Releases / Presidential)
  repeatableEvents = [],
  onAddRepeatableEvent,
  onRemoveRepeatableEvent,
  onRepeatableEventChange,
  // Navigation
  onBack,
  onContinue
}) => {
  const isMultiDay = schema.type === 'workshop' || schema.type === 'orientation' || schema.type === 'generic';

  // Validation
  const validateForm = () => {
    if (!title.trim()) return false;
    if (!programDate) return false;

    // Check required fields in the dynamic schema
    if (schema.fields) {
      for (const field of schema.fields) {
        if (field.required) {
          const val = eventData[field.key];
          if (!val || (typeof val === 'string' && !val.trim())) {
            return false;
          }
        }
      }
    }

    // If repeatable events are required (Releases / Presidential), check at least 1 event exists
    if (schema.hasRepeatableEvents) {
      if (!repeatableEvents || repeatableEvents.length === 0) return false;
      for (const ev of repeatableEvents) {
        if (!ev.eventName || !ev.eventName.trim()) return false;
      }
    }

    return true;
  };

  const isValid = validateForm();

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
              Event Type:
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* FIELD: PROPOSAL ID PREVIEW */}
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
            Official continuous sequence number will be reserved atomically upon submission.
          </span>
        </div>

        {/* SECTION: COMMON PROGRAMME DETAILS */}
        <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="var(--primary)" />
            Core Programme Identification & Schedule
          </h3>

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
                placeholder="e.g. Industry Guest Lecture on Cloud Architecture / Two-Day Workshop on Generative AI"
                required
                className="cbm-input"
                style={{ height: 42, fontSize: 13.5 }}
              />
            </div>

            {/* Programme Date / Start Date */}
            <div className="cbm-input-group">
              <label htmlFor="prog-date-input" className="cbm-label">
                {isMultiDay ? 'Start Date of Programme' : 'Date of Programme'} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="prog-date-input"
                type="date"
                value={programDate}
                onChange={(e) => onProgramDateChange(e.target.value)}
                required
                className="cbm-input"
                style={{ height: 42 }}
              />
            </div>

            {/* End Date (for multi-day programmes) */}
            {isMultiDay && (
              <div className="cbm-input-group">
                <label htmlFor="prog-end-date-input" className="cbm-label">
                  End Date of Programme <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(If multi-day)</span>
                </label>
                <input
                  id="prog-end-date-input"
                  type="date"
                  value={endDate}
                  min={programDate || undefined}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="cbm-input"
                  style={{ height: 42 }}
                />
              </div>
            )}

            {/* Timings: Start Time & End Time */}
            <div className="cbm-input-group">
              <label htmlFor="prog-time-start" className="cbm-label">
                Session Start Time
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-time-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            <div className="cbm-input-group">
              <label htmlFor="prog-time-end" className="cbm-label">
                Session End Time
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-time-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            {/* Programme Venue */}
            <div className="cbm-input-group">
              <label htmlFor="prog-venue-input" className="cbm-label">
                Programme Venue / Location
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  id="prog-venue-input"
                  type="text"
                  value={venue}
                  onChange={(e) => onVenueChange(e.target.value)}
                  placeholder="e.g. CC3 Seminar Hall / Main Auditorium / CS Lab 4"
                  className="cbm-input"
                  style={{ height: 42, paddingLeft: 34 }}
                />
              </div>
            </div>

            {/* Programme Level */}
            <div className="cbm-input-group">
              <label htmlFor="prog-level-select" className="cbm-label">
                Programme Level
              </label>
              <div style={{ position: 'relative' }}>
                <Award size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <select
                  id="prog-level-select"
                  value={programmeLevel}
                  onChange={(e) => onProgrammeLevelChange(e.target.value)}
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

          {/* Intended Audience Pills */}
          <div style={{ marginTop: 16 }}>
            <label className="cbm-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} /> Intended Target Audience <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>(Select applicable groups)</span>
            </label>
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

        {/* SECTION: FACULTY COORDINATOR DETAILS */}
        <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCheck size={16} color="var(--primary)" />
            Faculty Coordinator Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            <div className="cbm-input-group">
              <label htmlFor="coord-name-input" className="cbm-label">
                Faculty Coordinator Name
              </label>
              <input
                id="coord-name-input"
                type="text"
                value={coordinatorName}
                onChange={(e) => onCoordinatorNameChange(e.target.value)}
                placeholder="e.g. Dr. Arun Kumar P"
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>

            <div className="cbm-input-group">
              <label htmlFor="coord-desig-input" className="cbm-label">
                Designation
              </label>
              <input
                id="coord-desig-input"
                type="text"
                value={coordinatorDesignation}
                onChange={(e) => onCoordinatorDesignationChange(e.target.value)}
                placeholder="e.g. Associate Professor / Assistant Professor"
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>

            <div className="cbm-input-group">
              <label htmlFor="coord-contact-input" className="cbm-label">
                Contact Phone / Ext.
              </label>
              <input
                id="coord-contact-input"
                type="text"
                value={coordinatorContact}
                onChange={(e) => onCoordinatorContactChange(e.target.value)}
                placeholder="e.g. +91 98421 12345 / Ext 521"
                className="cbm-input"
                style={{ height: 40 }}
              />
            </div>
          </div>
        </div>

        {/* SECTION: DYNAMIC CATEGORY-SPECIFIC FORM FIELDS */}
        {schema.fields && schema.fields.length > 0 && (
          <div
            style={{
              padding: '20px 22px',
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
                  Fields dynamically tailored for {subCategoryName || categoryName}.
                </p>
              </div>
              <span className="cbm-form-ribbon">Specialized Schema</span>
            </div>

            {/* If Partial Guest Lecture: separate Host section header */}
            {schema.type === 'partial_guest' && (
              <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: 4, backgroundColor: 'var(--bg-page)', fontSize: 12, color: 'var(--text-muted)' }}>
                ℹ️ <strong>Institutional Requirement:</strong> Resource person details and internal host faculty details are tracked separately in the ledger.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
              {schema.fields.map((field) => {
                const val = eventData[field.key] || '';
                const isHostField = field.group === 'host';

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label htmlFor={`field-${field.key}`} className="cbm-label">
                          {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                        </label>
                        {!field.required && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Optional</span>}
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

                return (
                  <div
                    key={field.key}
                    className="cbm-input-group"
                    style={{
                      backgroundColor: isHostField ? '#FCFBF7' : 'transparent',
                      padding: isHostField ? '10px 12px' : '0',
                      borderRadius: isHostField ? 'var(--radius-sm)' : '0',
                      border: isHostField ? '1px dashed var(--gold-border)' : 'none'
                    }}
                  >
                    <label htmlFor={`field-${field.key}`} className="cbm-label">
                      {isHostField && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[HOST] </span>}
                      {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <input
                      id={`field-${field.key}`}
                      type={field.type || 'text'}
                      value={val}
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

        {/* SECTION: REPEATABLE EVENTS SECTION (For Releases / Presidential Event Programmes) */}
        {schema.hasRepeatableEvents && (
          <div
            style={{
              padding: '20px 22px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GraduationCap size={16} color="var(--primary)" />
                  Repeatable Programme Events Register
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  Add multiple itemised event entries conducted under this programme release.
                </p>
              </div>

              <button
                type="button"
                onClick={onAddRepeatableEvent}
                className="cbm-btn cbm-btn-outline"
                style={{ height: 34, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Add Event Entry
              </button>
            </div>

            {repeatableEvents.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px dashed var(--border)',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>No event entries added yet.</p>
                <button
                  type="button"
                  onClick={onAddRepeatableEvent}
                  className="cbm-btn cbm-btn-primary cbm-btn-sm"
                >
                  <Plus size={14} /> Add First Event
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {repeatableEvents.map((eventItem, idx) => (
                  <div
                    key={eventItem.id || idx}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                        Event #{idx + 1}
                      </span>
                      {repeatableEvents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveRepeatableEvent(eventItem.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11.5,
                            fontWeight: 600
                          }}
                          aria-label={`Remove Event #${idx + 1}`}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
                      <div className="cbm-input-group">
                        <label className="cbm-label">
                          Event Name / Competition Title <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={eventItem.eventName || ''}
                          onChange={(e) => onRepeatableEventChange(eventItem.id, 'eventName', e.target.value)}
                          placeholder="e.g. Code Relay / Web Debugging / Paper Presentation"
                          required
                          className="cbm-input"
                          style={{ height: 38 }}
                        />
                      </div>

                      <div className="cbm-input-group">
                        <label className="cbm-label">Event Date</label>
                        <input
                          type="date"
                          value={eventItem.eventDate || ''}
                          onChange={(e) => onRepeatableEventChange(eventItem.id, 'eventDate', e.target.value)}
                          className="cbm-input"
                          style={{ height: 38 }}
                        />
                      </div>

                      <div className="cbm-input-group">
                        <label className="cbm-label">Session Venue / Lab</label>
                        <input
                          type="text"
                          value={eventItem.venue || ''}
                          onChange={(e) => onRepeatableEventChange(eventItem.id, 'venue', e.target.value)}
                          placeholder="e.g. Lab 5 / Seminar Hall 2"
                          className="cbm-input"
                          style={{ height: 38 }}
                        />
                      </div>

                      <div className="cbm-input-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="cbm-label">
                          Event Description / Rules / Highlights
                        </label>
                        <textarea
                          value={eventItem.eventDescription || ''}
                          onChange={(e) => onRepeatableEventChange(eventItem.id, 'eventDescription', e.target.value)}
                          placeholder="Brief description of the round format, timing, criteria, or student incharge..."
                          rows={2}
                          className="cbm-textarea"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

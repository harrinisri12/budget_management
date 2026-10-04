// Centralized Event Form Configuration for Kongu Budget Management System

export const FIELD_GROUPS = {
  guestFields: {
    id: 'guestFields',
    title: 'Guest & Speaker Information',
    fields: [
      {
        key: 'guestName',
        label: 'Guest Name',
        type: 'text',
        placeholder: 'e.g. Dr. A. Sharma',
        required: true
      },
      {
        key: 'guestDesignation',
        label: 'Guest Designation',
        type: 'text',
        placeholder: 'e.g. Senior Principal Research Scientist',
        required: true
      },
      {
        key: 'guestOrg',
        label: 'Guest Organization',
        type: 'text',
        placeholder: 'e.g. ISRO Satellite Centre / Google R&D',
        required: true
      },
      {
        key: 'guestDetails',
        label: 'Guest Details / Session Summary',
        type: 'textarea',
        placeholder: 'Enter guest bio, travel requirements, or event topic details...',
        required: false,
        rows: 2
      }
    ]
  }
};

// Map Sub Categories / Event types to required field groups
export const EVENT_FORM_CONFIG = {
  'Guest Lecture': {
    fieldGroupIds: ['guestFields']
  },
  'Inauguration': {
    fieldGroupIds: ['guestFields']
  },
  'Valedictory': {
    fieldGroupIds: ['guestFields']
  },
  'Renaissance': {
    fieldGroupIds: []
  },
  'Crecita': {
    fieldGroupIds: []
  },
  'Workshop': {
    fieldGroupIds: []
  },
  'Partial Delivery': {
    fieldGroupIds: []
  }
};

/**
 * Helper to get active configuration for a given subcategory.
 * Config-driven fallback ensures new events automatically load their required fields.
 */
export const getEventConfig = (subCategory) => {
  if (!subCategory || !EVENT_FORM_CONFIG[subCategory]) {
    return { fieldGroupIds: [] };
  }
  return EVENT_FORM_CONFIG[subCategory];
};

/**
 * Helper to determine if a subcategory has any active event-specific fields.
 */
export const hasEventSpecificFields = (subCategory) => {
  const config = getEventConfig(subCategory);
  return config.fieldGroupIds && config.fieldGroupIds.length > 0;
};

/**
 * Comprehensive Dynamic Form Schemas for Kongu Engineering College CSE Budget Management
 * Maps categories and subcategories to specialized form schemas based on institutional event types:
 * - Guest Lecture
 * - Workshop
 * - Releases / Event-Based Programmes (Repeatable events)
 * - Valedictory
 * - Inaugural
 * - Partial Guest Lecture (Resource person + separate Host details)
 * - Orientation
 * - President / Presidential Event (Repeatable events)
 * - Senior–Junior Interaction
 * - Generic Extensible Fallback
 */

export const AUDIENCE_OPTIONS = [
  'Students (UG)',
  'Students (PG)',
  'Faculty Members',
  'Research Scholars',
  'Industry Delegates',
  'External Participants'
];

export const PROGRAMME_LEVEL_OPTIONS = [
  'Department',
  'Institution',
  'Association (CSEA)',
  'Coding Club (CCC)',
  'State Level',
  'National Level',
  'International Level'
];

export const FUNDING_SOURCE_OPTIONS = [
  'Department Budget Allocation',
  'CSEA Association Quota',
  'CCC Coding Club Fund',
  'Management Special Allocation',
  'External Sponsorship / Registration Fees',
  'Research Seed Grant',
  'Faculty Professional Development Quota'
];

export const COMMON_EXPENSE_SUGGESTIONS = [
  'Remuneration / Honorarium for Resource Person',
  'Travel Allowance (TA) / Conveyance',
  'Refreshments, Working Lunch & Tea',
  'Momento, Shawl & Institutional Souvenir',
  'Certificate Printing & Stationery',
  'Banner, Stage Backdrop & Photography',
  'Prizes, Medals & Cash Awards',
  'Workshop Kits / Handout Materials',
  'Software License / Cloud Compute Credits',
  'Miscellaneous / Contingency Expenses'
];

export const EVENT_SCHEMAS = {
  guest_lecture: {
    type: 'guest_lecture',
    name: 'Guest Lecture',
    title: 'Guest Lecture Programme Details',
    subtitle: 'Enter resource person details, lecture topic, and schedule information.',
    badge: 'Expert Speaker',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: true,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'guestName',
        label: 'Guest / Speaker Name',
        type: 'text',
        placeholder: 'e.g. Dr. A. Sharma / Er. S. Karthikeyan',
        required: true,
        helper: 'Full name of the invited resource person including prefix'
      },
      {
        key: 'guestDesignation',
        label: 'Guest Designation',
        type: 'text',
        placeholder: 'e.g. Senior Principal Scientist / Engineering Director',
        required: true,
        helper: 'Official title or academic rank of the guest'
      },
      {
        key: 'guestOrg',
        label: 'Company / Organisation',
        type: 'text',
        placeholder: 'e.g. Google R&D India / ISRO Satellite Centre / IIT Madras',
        required: true,
        helper: 'Current affiliation or corporate employer'
      },
      {
        key: 'lectureTopic',
        label: 'Lecture Topic / Title',
        type: 'text',
        placeholder: 'e.g. Scalable Distributed Systems Architecture in Production',
        required: true,
        helper: 'Official title of the technical guest presentation'
      },
      {
        key: 'guestProfileUrl',
        label: 'Guest LinkedIn / Profile URL (Optional)',
        type: 'url',
        placeholder: 'https://linkedin.com/in/...',
        required: false
      },
      {
        key: 'purpose',
        label: 'Purpose & Session Highlights',
        type: 'textarea',
        placeholder: 'Describe the key takeaways, curriculum alignment, and technical highlights of this guest session...',
        required: true,
        rows: 3
      },
      {
        key: 'otherDetails',
        label: 'Additional Arrangements & Travel Requirements',
        type: 'textarea',
        placeholder: 'Accommodation, local conveyance, or specialized AV requirements...',
        required: false,
        rows: 2
      }
    ]
  },

  workshop: {
    type: 'workshop',
    name: 'Workshop',
    title: 'Hands-on Technical Workshop Details',
    subtitle: 'Enter workshop syllabus, trainer profile, and lab software requirements.',
    badge: 'Hands-on Training',
    defaultFundingSource: 'Department Budget Allocation',
    requiresGuestDetails: true,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'resourcePersonName',
        label: 'Resource Person / Trainer Name',
        type: 'text',
        placeholder: 'e.g. Er. Vigneshwaran K',
        required: true
      },
      {
        key: 'resourcePersonDesignation',
        label: 'Trainer Designation',
        type: 'text',
        placeholder: 'e.g. Chief Technical Officer / Lead DevOps Engineer',
        required: true
      },
      {
        key: 'resourcePersonOrg',
        label: 'Company / Training Organisation',
        type: 'text',
        placeholder: 'e.g. RedHat Solutions / Cloud Native Computing Foundation',
        required: true
      },
      {
        key: 'topic',
        label: 'Workshop Core Topic',
        type: 'text',
        placeholder: 'e.g. Kubernetes Cluster Deployment & Microservices CI/CD',
        required: true
      },
      {
        key: 'prerequisites',
        label: 'Student Prerequisites & Lab Software Required',
        type: 'text',
        placeholder: 'e.g. Docker Desktop, Ubuntu 22.04 LTS, VS Code, Minikube',
        required: false,
        helper: 'Software tools, licenses, or configurations needed in the laboratory'
      },
      {
        key: 'description',
        label: 'Hands-on Modules & Workshop Syllabus',
        type: 'textarea',
        placeholder: 'Outline the hands-on lab exercises, practical deliverables, and session breakdown...',
        required: true,
        rows: 3
      },
      {
        key: 'otherDetails',
        label: 'Certification & Material Distribution Details',
        type: 'textarea',
        placeholder: 'Details on digital badges, participant certificates, or cloud compute lab credits...',
        required: false,
        rows: 2
      }
    ]
  },

  repeatable_events: {
    type: 'repeatable_events',
    name: 'Releases / Event-Based Programmes',
    title: 'Event-Based Programme & Activities Register',
    subtitle: 'Add itemised event schedules, student competitions, and project release modules dynamically.',
    badge: 'Multi-Event Programme',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: true,
    fields: [
      {
        key: 'programmeTheme',
        label: 'Central Theme / Milestone',
        type: 'text',
        placeholder: 'e.g. Annual Department Technical Release / Project Expo 2026',
        required: false
      },
      {
        key: 'purpose',
        label: 'Programme Overview & Highlights',
        type: 'textarea',
        placeholder: 'Comprehensive description of the release event, activities planned, and expected outcomes...',
        required: true,
        rows: 3
      }
    ]
  },

  valedictory: {
    type: 'valedictory',
    name: 'Valedictory Function',
    title: 'Valedictory Programme Details',
    subtitle: 'Review year-round achievements, certificate distribution, and annual activity summary.',
    badge: 'Closing Ceremony',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'highlights',
        label: 'Annual Report Summary & Activity Highlights',
        type: 'textarea',
        placeholder: 'Summarize the academic year activities, achievements, total students reached, and symposium milestones...',
        required: true,
        rows: 3
      },
      {
        key: 'awardsDetails',
        label: 'Awards, Medals & Prize Distribution Details',
        type: 'textarea',
        placeholder: 'List of honors to be presented: Best Outgoing Student, Coding Contest Champions, Star Contributors...',
        required: false,
        rows: 2
      },
      {
        key: 'specialInvitees',
        label: 'Presiding Dignitaries / Chief Guests (If any)',
        type: 'text',
        placeholder: 'e.g. Principal, Head of Department, Executive Patron',
        required: false
      },
      {
        key: 'otherDetails',
        label: 'Valedictory Programme Agenda & Remarks',
        type: 'textarea',
        placeholder: 'Program flow, vote of thanks, and student memento distribution details...',
        required: false,
        rows: 2
      }
    ]
  },

  inaugural: {
    type: 'inaugural',
    name: 'Inaugural Function',
    title: 'Inaugural Programme Details',
    subtitle: 'Record the induction of student office-bearers and roadmap of planned department initiatives.',
    badge: 'Opening Ceremony',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'highlights',
        label: 'Inauguration Highlights & Annual Roadmap',
        type: 'textarea',
        placeholder: 'Describe the induction ceremony, proposed annual activity calendar, and flagship objectives...',
        required: true,
        rows: 3
      },
      {
        key: 'officeBearersList',
        label: 'Student Office Bearers Induction List',
        type: 'textarea',
        placeholder: 'Names, register numbers, and posts of inducted student office bearers (President, Secretary, Treasurer)...',
        required: false,
        rows: 2
      },
      {
        key: 'presidingOfficer',
        label: 'Presiding Officer / Institutional Dignitaries',
        type: 'text',
        placeholder: 'e.g. Dr. Department Head, Principal, Dean Academics',
        required: false
      },
      {
        key: 'otherDetails',
        label: 'Session Outline & Inauguration Protocol',
        type: 'textarea',
        placeholder: 'Inaugural address, badge pinning, and formal orientation agenda...',
        required: false,
        rows: 2
      }
    ]
  },

  partial_guest: {
    type: 'partial_guest',
    name: 'Partial Guest Lecture / Delivery',
    title: 'Partial Guest Delivery & Host Mapping',
    subtitle: 'Record industry expert curriculum delivery alongside separate host faculty coordinator credentials.',
    badge: 'Curriculum Delivery',
    defaultFundingSource: 'Department Budget Allocation',
    requiresGuestDetails: true,
    requiresHostDetails: true,
    hasRepeatableEvents: false,
    fields: [
      // Resource Person Fields
      {
        key: 'guestName',
        label: 'Resource Person / Expert Name',
        type: 'text',
        placeholder: 'e.g. Dr. M. Balasubramanian',
        required: true
      },
      {
        key: 'guestDesignation',
        label: 'Expert Designation',
        type: 'text',
        placeholder: 'e.g. Staff Software Architect / Principal Research Scientist',
        required: true
      },
      {
        key: 'guestOrg',
        label: 'Company / Organization',
        type: 'text',
        placeholder: 'e.g. Amazon Web Services (AWS) India',
        required: true
      },
      {
        key: 'lectureTopic',
        label: 'Syllabus Topic / Module Covered',
        type: 'text',
        placeholder: 'e.g. Unit IV: Fault Tolerance & Paxos Consensus in Distributed Systems',
        required: true
      },
      // Host Faculty Credentials (stored separately)
      {
        key: 'hostName',
        label: 'Internal Host Faculty Name',
        type: 'text',
        placeholder: 'e.g. Dr. Arun Kumar P',
        required: true,
        group: 'host'
      },
      {
        key: 'hostDesignation',
        label: 'Host Faculty Designation',
        type: 'text',
        placeholder: 'e.g. Associate Professor / Department Faculty',
        required: true,
        group: 'host'
      },
      {
        key: 'hostCode',
        label: 'Host Employee / Reference Code',
        type: 'text',
        placeholder: 'e.g. KEC-CSE-FAC-014',
        required: true,
        group: 'host',
        helper: 'Official institutional employee reference code'
      },
      {
        key: 'subjectCodeName',
        label: 'Course Code & Subject Title',
        type: 'text',
        placeholder: 'e.g. 20CST62 - Advanced Operating Systems',
        required: true
      },
      {
        key: 'targetClass',
        label: 'Target Class & Section',
        type: 'text',
        placeholder: 'e.g. III Year B.E. CSE Sections A, B & C',
        required: true
      },
      {
        key: 'purpose',
        label: 'Session Objectives & Curriculum Relevance',
        type: 'textarea',
        placeholder: 'Outline the course outcome mapping, industry perspective, and student engagement structure...',
        required: true,
        rows: 3
      }
    ]
  },

  orientation: {
    type: 'orientation',
    name: 'Orientation / Induction',
    title: 'Orientation Programme Details',
    subtitle: 'Student cohort orientation, departmental tour, and institutional guidelines briefing.',
    badge: 'Cohort Orientation',
    defaultFundingSource: 'Department Budget Allocation',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'targetCohort',
        label: 'Target Student Group / Cohort',
        type: 'text',
        placeholder: 'e.g. I Year B.E. CSE Freshmen / Lateral Entry Batch 2026',
        required: true
      },
      {
        key: 'leadFacilitator',
        label: 'Lead Facilitator / Faculty Mentor',
        type: 'text',
        placeholder: 'e.g. Dr. Priya S & First-Year Mentor Committee',
        required: false
      },
      {
        key: 'purpose',
        label: 'Orientation Objectives & Session Scope',
        type: 'textarea',
        placeholder: 'Briefing topics: Autonomous curriculum structure, lab facilities, professional clubs, and code of conduct...',
        required: true,
        rows: 3
      },
      {
        key: 'kitDetails',
        label: 'Handout Materials / Orientation Kit Details',
        type: 'textarea',
        placeholder: 'Distribution of departmental lab manuals, student ID tags, or starter guides...',
        required: false,
        rows: 2
      }
    ]
  },

  presidential: {
    type: 'presidential',
    name: 'President / Presidential Event',
    title: 'Presidential Event & Activities Register',
    subtitle: 'Multi-session executive event with dynamically configurable programme segments.',
    badge: 'Executive Event',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: true,
    fields: [
      {
        key: 'presidentialAddress',
        label: 'Presidential Address Theme',
        type: 'text',
        placeholder: 'e.g. Strategic Academic Plan & Industry Collaboration Horizon',
        required: false
      },
      {
        key: 'purpose',
        label: 'Event Highlights & Executive Summary',
        type: 'textarea',
        placeholder: 'Scope of presidential event, participating delegations, and agenda highlights...',
        required: true,
        rows: 3
      }
    ]
  },

  senior_junior: {
    type: 'senior_junior',
    name: 'Senior–Junior Interaction',
    title: 'Senior–Junior Interaction Programme Details',
    subtitle: 'Peer-to-peer mentoring, placement roadmap guidance, and student technical sharing.',
    badge: 'Peer Mentoring',
    defaultFundingSource: 'CSEA Association Quota',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'seniorParticipants',
        label: 'Senior Student / Alum Mentors Details',
        type: 'textarea',
        placeholder: 'Names, graduating batches, and placement companies (e.g. K. Rahul - Microsoft, S. Divya - Zoho Corp)...',
        required: true,
        rows: 2
      },
      {
        key: 'juniorGroup',
        label: 'Target Junior Student Group',
        type: 'text',
        placeholder: 'e.g. II Year & III Year B.E. CSE Students (Batches 2027 & 2028)',
        required: true
      },
      {
        key: 'purpose',
        label: 'Mentoring Topics & Session Highlights',
        type: 'textarea',
        placeholder: 'Areas covered: Coding contest preparation, competitive placement interview experiences, hackathons, and internship hunt...',
        required: true,
        rows: 3
      },
      {
        key: 'interactiveFormat',
        label: 'Interaction Format',
        type: 'text',
        placeholder: 'e.g. Open Q&A Session followed by Round-Table Mock Coding Interviews',
        required: false
      }
    ]
  },

  generic: {
    type: 'generic',
    name: 'General Activity',
    title: 'Programme Proposal Details',
    subtitle: 'Enter event objectives, schedule, audience profile, and coordinator details.',
    badge: 'Department Activity',
    defaultFundingSource: 'Department Budget Allocation',
    requiresGuestDetails: false,
    requiresHostDetails: false,
    hasRepeatableEvents: false,
    fields: [
      {
        key: 'purpose',
        label: 'Programme Objectives & Highlights',
        type: 'textarea',
        placeholder: 'Describe the key goals, pedagogical value, and technical outcomes of this event...',
        required: true,
        rows: 3
      },
      {
        key: 'expectedOutcomes',
        label: 'Expected Outcomes & Deliverables',
        type: 'textarea',
        placeholder: 'Tangible student deliverables, attendance metrics, or technical competencies gained...',
        required: false,
        rows: 2
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Any lab reservations, audiovisual setup, or administrative approvals needed...',
        required: false,
        rows: 2
      }
    ]
  }
};

/**
 * Normalizes text for schema matching
 */
function cleanTerm(text) {
  if (!text) return '';
  return String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Dynamically resolves the best form schema based on category and subcategory strings
 */
export function getProposalSchema(categoryName = '', subCategoryName = '') {
  const cat = cleanTerm(categoryName);
  const sub = cleanTerm(subCategoryName);

  // 1. Partial Guest Lecture check
  if (sub.includes('partial') || cat.includes('partial')) {
    return EVENT_SCHEMAS.partial_guest;
  }

  // 2. Guest Lecture check
  if (
    sub.includes('guestlecture') ||
    sub.includes('guesttalk') ||
    sub.includes('invitedtalk') ||
    sub.includes('guest') ||
    (cat.includes('guest') && !sub)
  ) {
    return EVENT_SCHEMAS.guest_lecture;
  }

  // 3. Workshop check
  if (sub.includes('workshop') || sub.includes('handson') || cat.includes('workshop')) {
    return EVENT_SCHEMAS.workshop;
  }

  // 4. Valedictory check
  if (sub.includes('valedict') || cat.includes('valedict')) {
    return EVENT_SCHEMAS.valedictory;
  }

  // 5. Inaugural check
  if (sub.includes('inaugur') || cat.includes('inaugur')) {
    return EVENT_SCHEMAS.inaugural;
  }

  // 6. Senior-Junior Interaction check
  if (
    sub.includes('senior') ||
    sub.includes('junior') ||
    sub.includes('seniorjunior') ||
    sub.includes('interaction')
  ) {
    return EVENT_SCHEMAS.senior_junior;
  }

  // 7. Orientation / Induction check
  if (sub.includes('orientation') || sub.includes('induction') || cat.includes('orientation')) {
    return EVENT_SCHEMAS.orientation;
  }

  // 8. President / Presidential Event check
  if (sub.includes('president') || cat.includes('president')) {
    return EVENT_SCHEMAS.presidential;
  }

  // 9. Releases / Event-Based Programmes check
  if (
    sub.includes('release') ||
    sub.includes('renaissance') ||
    sub.includes('crecita') ||
    sub.includes('symposium') ||
    sub.includes('contest') ||
    sub.includes('hackathon') ||
    cat.includes('release')
  ) {
    return EVENT_SCHEMAS.repeatable_events;
  }

  // Fallback to configurable Generic schema
  return EVENT_SCHEMAS.generic;
}

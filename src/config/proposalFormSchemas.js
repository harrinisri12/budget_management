/**
 * Dynamic Proposal Form Schemas for Kongu Engineering College CSE Budget Management
 * Fully configurable schemas mapping Academic Year, Main Categories, and Subcategories
 * to tailored forms with appropriate fields, validation rules, scheduling details, and requirements.
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

/**
 * Calculates duration in hours between start and end date/time, supporting multi-day and overnight events.
 */
export function calculateHackathonDuration(startDate, endDate, startTime, endTime) {
  if (!startDate || !startTime) return null;
  const effectiveEnd = endDate || startDate;
  if (!endTime) return null;

  const startDt = new Date(`${startDate}T${startTime}`);
  const endDt = new Date(`${effectiveEnd}T${endTime}`);

  if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return null;

  const diffMs = endDt.getTime() - startDt.getTime();
  if (diffMs <= 0) {
    return {
      isValid: false,
      hours: 0,
      displayText: 'End date and time must follow start date and time',
      isOvernight: false,
      isMultiDay: false
    };
  }

  const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  const isMultiDay = effectiveEnd !== startDate;
  const isOvernight = isMultiDay || (endTime < startTime);

  let durationLabel = `${totalHours} Hour${totalHours === 1 ? '' : 's'}`;
  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const remHours = Math.round((totalHours % 24) * 10) / 10;
    durationLabel += ` (${days} Day${days > 1 ? 's' : ''}${remHours > 0 ? ` ${remHours} hr${remHours > 1 ? 's' : ''}` : ''})`;
  }

  return {
    isValid: true,
    hours: totalHours,
    durationLabel,
    displayText: durationLabel,
    isOvernight,
    isMultiDay
  };
}

/**
 * Validates date and time sequence for any proposal schedule.
 * Returns { isValid: boolean, error: string | null }
 */
export function validateScheduleSequence(startDate, endDate, startTime, endTime) {
  if (!startDate) {
    return { isValid: false, error: 'Programme start date is required.' };
  }
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Session start and end times are required.' };
  }

  if (endDate && endDate < startDate) {
    return { isValid: false, error: 'End date cannot precede the start date.' };
  }

  const effectiveEnd = endDate || startDate;
  if (effectiveEnd === startDate) {
    // Single day: end time must be after start time
    if (endTime <= startTime) {
      return { isValid: false, error: 'Session end time must follow start time on the same day.' };
    }
  } else {
    // Multi-day
    const startDt = new Date(`${startDate}T${startTime}`);
    const endDt = new Date(`${effectiveEnd}T${endTime}`);
    if (endDt.getTime() <= startDt.getTime()) {
      return { isValid: false, error: 'Final end date and time must follow the start date and time.' };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Standard optional activity fields present across event proposals
 */
const COMMON_OPTIONAL_EVENT_FIELDS = [
  {
    key: 'purpose',
    label: 'Programme Objectives & Highlights',
    type: 'textarea',
    placeholder: 'Outline the key objectives, milestones, or pedagogical highlights (Optional)...',
    required: false,
    rows: 3,
    helper: 'Optional — remove or leave empty if not applicable'
  },
  {
    key: 'expectedOutcomes',
    label: 'Expected Outcomes & Deliverables',
    type: 'textarea',
    placeholder: 'Tangible deliverables, attendance targets, or student learning outcomes (Optional)...',
    required: false,
    rows: 2,
    helper: 'Optional — remove or leave empty if not applicable'
  },
  {
    key: 'otherDetails',
    label: 'Special Requirements / Administrative Notes',
    type: 'textarea',
    placeholder: 'Special lab setup, audiovisual arrangements, or administrative coordination (Optional)...',
    required: false,
    rows: 2,
    helper: 'Optional — remove or leave empty if not applicable'
  }
];

export const EVENT_SCHEMAS = {
  // 1. Alumni
  alumni: {
    type: 'alumni',
    name: 'Alumni',
    title: 'Alumni Interaction Programme Details',
    subtitle: 'Alumni connect, career guidance, and industry mentorship sessions.',
    badge: 'Alumni Connect',
    defaultFundingSource: 'CSEA Association Quota',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'alumniName',
        label: 'Alumnus / Visiting Alumni Name(s)',
        type: 'text',
        placeholder: 'e.g. Er. S. Prakash (Batch of 2018)',
        required: false,
        helper: 'Name and batch year of visiting alumnus/alumna'
      },
      {
        key: 'alumniDesignationOrg',
        label: 'Current Designation & Company',
        type: 'text',
        placeholder: 'e.g. Lead SRE at Atlassian / Founder, TechStart Labs',
        required: false
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 2. Guest Lecture
  guest_lecture: {
    type: 'guest_lecture',
    name: 'Guest Lecture',
    title: 'Guest Lecture Programme Details',
    subtitle: 'Enter resource person details, lecture topic, and technical session schedule.',
    badge: 'Expert Speaker',
    defaultFundingSource: 'CSEA Association Quota',
    isEvent: true,
    requiresMultiDay: false,
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
        label: 'Guest Profile / LinkedIn URL',
        type: 'url',
        placeholder: 'https://linkedin.com/in/...',
        required: false,
        helper: 'Optional profile link for institutional records'
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 3. Workshop
  workshop: {
    type: 'workshop',
    name: 'Workshop',
    title: 'Technical Workshop Details',
    subtitle: 'Hands-on training, workshop duration, trainer profile, and lab arrangements.',
    badge: 'Hands-on Training',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'workshopTopic',
        label: 'Workshop Title / Technical Topic',
        type: 'text',
        placeholder: 'e.g. Kubernetes Cluster Deployment & Microservices CI/CD',
        required: true
      },
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
        key: 'workshopDuration',
        label: 'Workshop Duration & Session Plan',
        type: 'text',
        placeholder: 'e.g. 2 Days (4 Hands-on Sessions, 12 Total Hours)',
        required: true,
        helper: 'Number of days, sessions, or total planned contact hours'
      },
      {
        key: 'prerequisites',
        label: 'Student Prerequisites & Required Lab Software',
        type: 'text',
        placeholder: 'e.g. Docker Desktop, Ubuntu 22.04 LTS, VS Code, Minikube',
        required: false,
        helper: 'Software tools, licenses, or configurations needed in the laboratory'
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 4. Hackathon
  hackathon: {
    type: 'hackathon',
    name: 'Hackathon',
    title: 'Hackathon Event & Operational Details',
    subtitle: 'Capture complete hackathon schedule, duration, problem statement, and team dynamics.',
    badge: 'Coding Hackathon',
    defaultFundingSource: 'CCC Coding Club Fund',
    isEvent: true,
    requiresMultiDay: true,
    isHackathon: true,
    fields: [
      {
        key: 'organizingUnit',
        label: 'Organizing Department / Club',
        type: 'text',
        placeholder: 'e.g. Computer Science and Engineering / CCC Coding Club',
        required: true,
        defaultValue: 'Computer Science and Engineering (CSE)'
      },
      {
        key: 'theme',
        label: 'Problem Statement or Central Theme',
        type: 'textarea',
        placeholder: 'e.g. AI-Powered Sustainable Campus Solutions / Web3 & Decentralized Trust / Healthcare Analytics',
        required: true,
        rows: 2,
        helper: 'Core technical domain, problem statement, or hackathon track theme'
      },
      {
        key: 'teamSizeRules',
        label: 'Team Size or Team Formation Rules',
        type: 'text',
        placeholder: 'e.g. 2 to 4 members per team (inter-department allowed)',
        required: true,
        helper: 'Minimum and maximum team members permitted'
      },
      {
        key: 'expectedTeams',
        label: 'Expected Number of Participating Teams or Participants',
        type: 'text',
        placeholder: 'e.g. 40 Teams / 160 Participants',
        required: true
      },
      {
        key: 'mentorJudgeDetails',
        label: 'Mentor / Judge / Industry Expert Details',
        type: 'textarea',
        placeholder: 'Names, designations, and affiliations of evaluators, mentors, or invited industry judges...',
        required: false,
        rows: 2,
        helper: 'Optional mentor and judging panel details'
      },
      {
        key: 'roundsSchedule',
        label: 'Competition Rounds and Schedule',
        type: 'textarea',
        placeholder: 'e.g. Round 1: Idea Pitching & Screening, Round 2: 24-Hour Code Sprint, Round 3: Live Jury Demo...',
        required: false,
        rows: 2,
        helper: 'Details for multi-round hackathons'
      },
      {
        key: 'prizesDetails',
        label: 'Prizes, Medals or Cash Awards',
        type: 'text',
        placeholder: 'e.g. 1st: ₹25,000, 2nd: ₹15,000, 3rd: ₹10,000 + Merit Certificates',
        required: false
      },
      {
        key: 'technicalResources',
        label: 'Technical Resources, Software, Equipment & Infrastructure',
        type: 'textarea',
        placeholder: 'e.g. High-speed Wi-Fi, 24/7 power backup, cloud server credits, multi-plug extension boards...',
        required: false,
        rows: 2
      },
      {
        key: 'rulesEvaluationCriteria',
        label: 'Rules, Evaluation Criteria and Deliverables',
        type: 'textarea',
        placeholder: 'e.g. Original GitHub commit history, code quality, technical novelty, viable working prototype...',
        required: false,
        rows: 2
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 5. Inauguration
  inauguration: {
    type: 'inauguration',
    name: 'Inauguration',
    title: 'Inauguration Programme Details',
    subtitle: 'Opening ceremony, chief guest induction, and annual departmental roadmap.',
    badge: 'Opening Ceremony',
    defaultFundingSource: 'CSEA Association Quota',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'chiefGuestDetails',
        label: 'Chief Guest / Dignitary Details',
        type: 'text',
        placeholder: 'e.g. Er. K. Soundararajan, VP Engineering, Infosys Technologies',
        required: false,
        helper: 'Optional chief guest name and designation'
      },
      {
        key: 'openingCeremonySchedule',
        label: 'Opening Ceremony Schedule / Protocol',
        type: 'textarea',
        placeholder: 'Prayer song, welcome address, badge pinning, presidential address, vote of thanks...',
        required: false,
        rows: 2
      },
      {
        key: 'officeBearersList',
        label: 'Student Office Bearers Induction List',
        type: 'textarea',
        placeholder: 'President, Vice President, Secretary, Joint Secretary, Treasurer student names...',
        required: false,
        rows: 2
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 6. Valedictory
  valedictory: {
    type: 'valedictory',
    name: 'Valedictory',
    title: 'Valedictory Programme Details',
    subtitle: 'Annual closing ceremony, achievement summary, and certificates/awards distribution.',
    badge: 'Closing Ceremony',
    defaultFundingSource: 'CSEA Association Quota',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'chiefGuestDetails',
        label: 'Chief Guest / Invited Dignitary Details',
        type: 'text',
        placeholder: 'e.g. Dr. K. Venkatachalam, Principal / Patron',
        required: false
      },
      {
        key: 'annualReportSummary',
        label: 'Annual Activity Highlights / Report Summary',
        type: 'textarea',
        placeholder: 'Summary of annual milestones, competitions conducted, total student beneficiaries...',
        required: false,
        rows: 2
      },
      {
        key: 'awardsDetails',
        label: 'Awards, Medals & Recognition Details',
        type: 'textarea',
        placeholder: 'Star Performers, Best Outgoing Student, Contest winners, Mementos...',
        required: false,
        rows: 2
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 7. Symposium
  symposium: {
    type: 'symposium',
    name: 'Symposium',
    title: 'Technical Symposium Details',
    subtitle: 'Departmental national symposium, technical tracks, paper presentations, and competitions.',
    badge: 'National Symposium',
    defaultFundingSource: 'CSEA Association Quota',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'symposiumTheme',
        label: 'Symposium Theme / Flagship Title',
        type: 'text',
        placeholder: 'e.g. Renaissance 2026 / Crescita Technical Conclave',
        required: true
      },
      {
        key: 'technicalTracks',
        label: 'Technical Tracks & Topic Areas',
        type: 'textarea',
        placeholder: 'e.g. Track 1: Generative AI, Track 2: Cybersecurity & Forensics, Track 3: Cloud & Edge Computing',
        required: true,
        rows: 2
      },
      {
        key: 'speakersCoordinators',
        label: 'Keynote Speakers / Session Chairs',
        type: 'text',
        placeholder: 'e.g. Invited Chairs from Premier Academic Institutions & Industry',
        required: false
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 8. Partial Delivery
  partial_delivery: {
    type: 'partial_delivery',
    name: 'Partial Delivery',
    title: 'Partial Curriculum Delivery Details',
    subtitle: 'Industry expert syllabus delivery with host faculty coordination details.',
    badge: 'Curriculum Delivery',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
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
        key: 'guestName',
        label: 'External Resource Person / Industry Expert Name',
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
        placeholder: 'e.g. Unit IV: Fault Tolerance & Consensus Protocols in Production',
        required: true
      },
      {
        key: 'hostName',
        label: 'Internal Host Faculty Name',
        type: 'text',
        placeholder: 'e.g. Dr. Arun Kumar P',
        required: true
      },
      {
        key: 'hostDesignation',
        label: 'Host Faculty Designation',
        type: 'text',
        placeholder: 'e.g. Associate Professor / Department Faculty',
        required: true
      },
      {
        key: 'hostCode',
        label: 'Host Faculty Employee Code',
        type: 'text',
        placeholder: 'e.g. KEC-CSE-FAC-014',
        required: true
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 9. Equipment
  equipment: {
    type: 'equipment',
    name: 'Equipment',
    title: 'Equipment Procurement Details',
    subtitle: 'Hardware specifications, justification, quantity, and laboratory allocation.',
    badge: 'Hardware Equipment',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'equipmentName',
        label: 'Equipment Name & Model Specification',
        type: 'text',
        placeholder: 'e.g. Dell PowerEdge R750 Rack Server / Cisco Catalyst 48-Port Switch',
        required: true
      },
      {
        key: 'technicalSpecs',
        label: 'Technical Specifications & Configuration',
        type: 'textarea',
        placeholder: 'Dual Intel Xeon Silver 4314, 128GB DDR4 ECC RAM, 2x 960GB SSD RAID 1...',
        required: true,
        rows: 2
      },
      {
        key: 'justification',
        label: 'Purpose & Departmental Justification',
        type: 'textarea',
        placeholder: 'Required for advanced PG AI/ML laboratory simulations and student capstone research projects...',
        required: true,
        rows: 2
      },
      {
        key: 'quantity',
        label: 'Quantity Required',
        type: 'number',
        placeholder: 'e.g. 2',
        required: true,
        min: 1
      },
      {
        key: 'targetLocation',
        label: 'Intended Department / Usage Location',
        type: 'text',
        placeholder: 'e.g. Advanced Computing Lab (CC-4) / Server Room',
        required: true
      },
      {
        key: 'procurementDetails',
        label: 'Procurement Requirements / Quotation Notes',
        type: 'textarea',
        placeholder: 'OEM warranty terms, AMC coverage, or vendor quotation reference (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Installation requirements, power backup, or rack mount specifications (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 10. Furniture
  furniture: {
    type: 'furniture',
    name: 'Furniture',
    title: 'Furniture Requirement Details',
    subtitle: 'Furniture specification, quantity, purpose, and room placement.',
    badge: 'Infrastructure Asset',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'furnitureType',
        label: 'Furniture Type & Description',
        type: 'text',
        placeholder: 'e.g. High-Back Ergonomic Computer Lab Chairs / Modular Faculty Workstations',
        required: true
      },
      {
        key: 'materialSpecs',
        label: 'Material, Dimensions & Specifications',
        type: 'textarea',
        placeholder: 'Heavy-duty steel base, breathable mesh back, hydraulic height adjustable, 3-year warranty...',
        required: true,
        rows: 2
      },
      {
        key: 'justification',
        label: 'Purpose & Justification',
        type: 'textarea',
        placeholder: 'Replacement of worn lab seating in Programming Lab 2 for student ergonomic comfort...',
        required: true,
        rows: 2
      },
      {
        key: 'quantity',
        label: 'Quantity Required',
        type: 'number',
        placeholder: 'e.g. 30',
        required: true,
        min: 1
      },
      {
        key: 'targetLocation',
        label: 'Intended Department / Classroom / Lab Location',
        type: 'text',
        placeholder: 'e.g. Programming Lab 2 / Faculty Cabin Block B',
        required: true
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Delivery schedule, assembly requirements, or special dimensions (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 11. Software
  software: {
    type: 'software',
    name: 'Software',
    title: 'Software Licence & Subscription Details',
    subtitle: 'Software name, subscription terms, number of seats, and pedagogical justification.',
    badge: 'Software License',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'softwareName',
        label: 'Software / Tool Name & Version',
        type: 'text',
        placeholder: 'e.g. MATLAB & Simulink Campus Suite / VMware vSphere Academic Suite',
        required: true
      },
      {
        key: 'licenseType',
        label: 'Licence or Subscription Type',
        type: 'select',
        options: [
          'Annual Subscription',
          'Perpetual License',
          'Academic Campus Multi-User License',
          'Cloud SaaS (Per Seat / User)',
          'Commercial Support for Open-Source'
        ],
        required: true
      },
      {
        key: 'numLicenses',
        label: 'Number of Users / Licences',
        type: 'number',
        placeholder: 'e.g. 100',
        required: true,
        min: 1
      },
      {
        key: 'duration',
        label: 'Duration of Licence / Subscription Period',
        type: 'text',
        placeholder: 'e.g. 1 Academic Year (June 2026 - May 2027) / Perpetual',
        required: true
      },
      {
        key: 'justification',
        label: 'Technical Justification & Curriculum Usage',
        type: 'textarea',
        placeholder: 'Required for laboratory coursework in 20CSL51 and B.E. final year project simulation...',
        required: true,
        rows: 2
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Server activation keys, network licence manager setup, or vendor support contacts (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 12. Consumables
  consumables: {
    type: 'consumables',
    name: 'Consumables',
    title: 'Consumables & Material Requisition Details',
    subtitle: 'Item details, quantity, purpose, and laboratory requisition schedule.',
    badge: 'Recurring Materials',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'itemName',
        label: 'Consumable Item or Material Name',
        type: 'text',
        placeholder: 'e.g. Printer Toner Cartridges (HP 88A) / Cat6 RJ45 Connectors & Cable Spool',
        required: true
      },
      {
        key: 'justification',
        label: 'Intended Purpose & Laboratory Utilization',
        type: 'textarea',
        placeholder: 'Routine lab testing, student record printouts, and network cabling maintenance...',
        required: true,
        rows: 2
      },
      {
        key: 'quantity',
        label: 'Quantity or Usage Estimate',
        type: 'text',
        placeholder: 'e.g. 6 Cartridges / 305m Cable Spool (1 Box)',
        required: true
      },
      {
        key: 'targetLocation',
        label: 'Department / Laboratory Requiring Materials',
        type: 'text',
        placeholder: 'e.g. Department Office / Networking Laboratory',
        required: true
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Storage conditions, delivery timeline, or supplier details (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 13. Services
  services: {
    type: 'services',
    name: 'Services',
    title: 'Services & Maintenance Details',
    subtitle: 'Service scope, duration, vendor information, and expected deliverables.',
    badge: 'Contract Service',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'serviceDescription',
        label: 'Service Description & Scope of Work',
        type: 'textarea',
        placeholder: 'e.g. Annual Maintenance Contract (AMC) for 20kVA Online UPS Systems in Server Room...',
        required: true,
        rows: 2
      },
      {
        key: 'serviceProvider',
        label: 'Service Provider / Agency Details',
        type: 'text',
        placeholder: 'e.g. M/s APC Schneider Electric India Pvt Ltd',
        required: false,
        helper: 'Authorized vendor or service company name'
      },
      {
        key: 'servicePeriod',
        label: 'Service Period or Contract Duration',
        type: 'text',
        placeholder: 'e.g. 1 Year (01 July 2026 - 30 June 2027) with quarterly visits',
        required: true
      },
      {
        key: 'justification',
        label: 'Purpose & Operational Justification',
        type: 'textarea',
        placeholder: 'Ensures uninterrupted power supply for critical departmental servers and student lab test benches...',
        required: true,
        rows: 2
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Payment milestones, SLA terms, or preventive maintenance dates (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 14. Faculty Training
  faculty_training: {
    type: 'faculty_training',
    name: 'Faculty Training',
    title: 'Faculty Training & Development Details',
    subtitle: 'FDP training programme title, provider, duration, and participant faculty count.',
    badge: 'Faculty Training',
    defaultFundingSource: 'Faculty Professional Development Quota',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      {
        key: 'trainingTitle',
        label: 'Training Programme / FDP Title',
        type: 'text',
        placeholder: 'e.g. Advanced Deep Learning & Large Language Models in Healthcare',
        required: true
      },
      {
        key: 'trainingProvider',
        label: 'Training Agency / External Provider',
        type: 'text',
        placeholder: 'e.g. IIT Madras NPTEL / AICTE ATAL Academy',
        required: true
      },
      {
        key: 'trainingDuration',
        label: 'Training Dates & Duration',
        type: 'text',
        placeholder: 'e.g. 5 Days (40 Hours contact training)',
        required: true
      },
      {
        key: 'numFaculty',
        label: 'Number of Participating Faculty Members',
        type: 'number',
        placeholder: 'e.g. 4',
        required: true,
        min: 1
      },
      {
        key: 'trainingMode',
        label: 'Training Mode',
        type: 'select',
        options: ['Offline (In-Person)', 'Online (Virtual)', 'Hybrid'],
        required: true
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 15. Support for Faculty Programs
  support_faculty: {
    type: 'support_faculty',
    name: 'Support for Faculty Programs',
    title: 'Support for Faculty Programs Requisition',
    subtitle: 'Research funding support, conference sponsorship, or faculty development assistance.',
    badge: 'Faculty Support',
    defaultFundingSource: 'Faculty Professional Development Quota',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'associatedProgram',
        label: 'Associated Programme / Initiative Title',
        type: 'text',
        placeholder: 'e.g. IEEE International Conference on Cloud Computing 2026',
        required: true
      },
      {
        key: 'supportType',
        label: 'Type of Support Required',
        type: 'select',
        options: [
          'Registration Fee Subsidy',
          'Travel Allowance (TA / DA)',
          'Research Seed Grant / Prototype Materials',
          'Journal Publication Support',
          'Patent Filing Assistance',
          'Other Faculty Support'
        ],
        required: true
      },
      {
        key: 'justification',
        label: 'Purpose, Relevance & Expected Outcome',
        type: 'textarea',
        placeholder: 'Presentation of peer-reviewed paper co-authored with student research scholars...',
        required: true,
        rows: 2
      },
      {
        key: 'supportPeriod',
        label: 'Date or Period of Support',
        type: 'text',
        placeholder: 'e.g. 15 Nov 2026 - 18 Nov 2026',
        required: true
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Paper acceptance letter reference, publisher indexing (Scopus/SCI) (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // 16. Others
  others: {
    type: 'others',
    name: 'Others',
    title: 'Activity / Requirement Details',
    subtitle: 'Flexible proposal form for custom departmental activities and requisitions.',
    badge: 'Department Activity',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'activityTitle',
        label: 'Activity or Requirement Title',
        type: 'text',
        placeholder: 'e.g. Special Department Technical Initiative',
        required: true
      },
      {
        key: 'justification',
        label: 'Description & Justification',
        type: 'textarea',
        placeholder: 'Comprehensive description of the requirement, objectives, and academic justification...',
        required: true,
        rows: 3
      },
      {
        key: 'targetLocation',
        label: 'Intended Venue or Usage Location',
        type: 'text',
        placeholder: 'e.g. Department Seminar Hall / CC-3 Laboratory',
        required: false
      },
      ...COMMON_OPTIONAL_EVENT_FIELDS
    ]
  },

  // 17. IMPRESED (Direct Category with no subcategories)
  impresed: {
    type: 'impresed',
    name: 'IMPRESED',
    title: 'Imprest Fund Requisition Details',
    subtitle: 'Departmental contingent imprest fund expenditure and petty cash requisition.',
    badge: 'Imprest Fund',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: false,
    requiresMultiDay: false,
    fields: [
      {
        key: 'purposeOfImprest',
        label: 'Purpose of Imprest Expenditure',
        type: 'textarea',
        placeholder: 'e.g. Routine emergency lab repairs, urgent electrical consumables, student competition local courier...',
        required: true,
        rows: 2
      },
      {
        key: 'utilizationPeriod',
        label: 'Expected Period of Utilization',
        type: 'text',
        placeholder: 'e.g. Semester Odd 2026-2027',
        required: true
      },
      {
        key: 'otherDetails',
        label: 'Special Requirements / Administrative Notes',
        type: 'textarea',
        placeholder: 'Any special approval references or ledger notes (Optional)...',
        required: false,
        rows: 2,
        helper: 'Optional'
      }
    ]
  },

  // Generic fallback
  generic: {
    type: 'generic',
    name: 'General Proposal',
    title: 'Programme Proposal Details',
    subtitle: 'Enter event objectives, schedule, audience profile, and coordinator details.',
    badge: 'Department Activity',
    defaultFundingSource: 'Department Budget Allocation',
    isEvent: true,
    requiresMultiDay: false,
    fields: [
      ...COMMON_OPTIONAL_EVENT_FIELDS
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

  // 1. Direct Category check when no subcategory is configured (e.g. IMPRESED)
  if (!sub && cat.includes('impres')) {
    return EVENT_SCHEMAS.impresed;
  }

  // 2. Subcategory-first Matching (Priority matching for specific subcategory selection)
  if (sub.includes('hackathon')) {
    return EVENT_SCHEMAS.hackathon;
  }

  if (sub.includes('alumni')) {
    return EVENT_SCHEMAS.alumni;
  }

  if (sub.includes('partial') || (cat.includes('partial') && !sub)) {
    return EVENT_SCHEMAS.partial_delivery;
  }

  if (
    sub.includes('guestlecture') ||
    sub.includes('guesttalk') ||
    sub.includes('invitedtalk') ||
    sub.includes('guest') ||
    (cat.includes('guest') && !sub)
  ) {
    return EVENT_SCHEMAS.guest_lecture;
  }

  if (sub.includes('workshop') || sub.includes('handson') || (cat.includes('workshop') && !sub)) {
    return EVENT_SCHEMAS.workshop;
  }

  if (sub.includes('inaugur') || (cat.includes('inaugur') && !sub)) {
    return EVENT_SCHEMAS.inauguration;
  }

  if (sub.includes('valedict') || sub.includes('validat') || (cat.includes('valedict') && !sub)) {
    return EVENT_SCHEMAS.valedictory;
  }

  if (
    sub.includes('symposium') ||
    sub.includes('renaissance') ||
    sub.includes('crescita') ||
    (cat.includes('symposium') && !sub)
  ) {
    return EVENT_SCHEMAS.symposium;
  }

  if (sub.includes('facultytraining') || (sub.includes('training') && cat.includes('research'))) {
    return EVENT_SCHEMAS.faculty_training;
  }

  if (sub.includes('supportforfaculty') || sub.includes('support') || sub.includes('facultyprogram')) {
    return EVENT_SCHEMAS.support_faculty;
  }

  if (sub.includes('equipment')) {
    return EVENT_SCHEMAS.equipment;
  }

  if (sub.includes('furniture')) {
    return EVENT_SCHEMAS.furniture;
  }

  if (sub.includes('software')) {
    return EVENT_SCHEMAS.software;
  }

  if (sub.includes('consumable')) {
    return EVENT_SCHEMAS.consumables;
  }

  if (sub.includes('service')) {
    return EVENT_SCHEMAS.services;
  }

  if (sub.includes('other')) {
    return EVENT_SCHEMAS.others;
  }

  // 3. Category Fallbacks if subcategory is generic or missing
  if (cat.includes('impres')) {
    return EVENT_SCHEMAS.impresed;
  }

  if (cat.includes('nonrecurring')) {
    return EVENT_SCHEMAS.equipment;
  }

  if (cat.includes('recurring')) {
    return EVENT_SCHEMAS.consumables;
  }

  if (cat.includes('research')) {
    return EVENT_SCHEMAS.support_faculty;
  }

  if (cat.includes('cloud') || cat.includes('coding') || cat.includes('gender')) {
    return EVENT_SCHEMAS.workshop;
  }

  return EVENT_SCHEMAS.generic;
}

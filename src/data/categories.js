// Category & Subcategory Data Structure for Kongu Engineering College CSE Budget Management

export const CATEGORIES_DATA = {
  'CSEA': {
    name: 'CSEA',
    fullName: 'Computer Science and Engineering Association',
    description: 'Primary departmental student association driving technical symposiums, workshops, guest lectures, and student activities.',
    color: '#C5A059', // Sophisticated Gold Accent
    subcategories: [
      'Guest Lecture',
      'Inauguration',
      'Valedictory',
      'Renaissance',
      'Crecita',
      'Workshop',
      'Partial Delivery'
    ]
  },
  'CCC': {
    name: 'CCC',
    fullName: 'Coding & Competitive Club',
    description: 'Specialized CSE algorithmic coding hub fostering competitive programming, hackathons, and open-source contributions.',
    color: '#121212', // Off-black
    subcategories: [
      // Extensible: Subcategories for CCC can be added here
    ]
  },
  'Research': {
    name: 'Research',
    fullName: 'Academic & Applied Research',
    description: 'Faculty and student research projects, paper publications, patents, and seed funding.',
    color: '#3F3F46', // Refined Charcoal
    subcategories: [
      // Extensible: Subcategories for Research can be added here
    ]
  },
  'Lab and Equipment': {
    name: 'Lab and Equipment',
    fullName: 'Laboratories & Technical Equipment',
    description: 'Hardware, software licenses, lab infrastructure upgrades, and networking equipment.',
    color: '#52525B', // Medium Slate Charcoal
    subcategories: [
      // Extensible: Subcategories for Lab and Equipment can be added here
    ]
  },
  'Department Maintenance': {
    name: 'Department Maintenance',
    fullName: 'Department Infrastructure & Maintenance',
    description: 'Departmental upkeep, consumables, printing quotas, stationery, and routine maintenance.',
    color: '#71717A', // Muted Zinc
    subcategories: [
      // Extensible: Subcategories for Department Maintenance can be added here
    ]
  }
};

// List of top-level category keys
export const CATEGORY_LIST = Object.keys(CATEGORIES_DATA);

// Helper function to get subcategories for a given category
export const getSubcategoriesForCategory = (categoryName) => {
  if (!categoryName) return [];
  const cat = CATEGORIES_DATA[categoryName];
  return cat ? cat.subcategories || [] : [];
};

// Category colors mapping helper
export const CATEGORY_COLOR_MAP = Object.entries(CATEGORIES_DATA).reduce((acc, [key, val]) => {
  acc[key] = val.color;
  return acc;
}, {
  'CSEA Association': '#C5A059',
  'CCC Coding Club': '#121212',
  'Lab & Equipment': '#52525B',
  'Technical Workshop': '#3F3F46',
  'Academic Research': '#71717A'
});

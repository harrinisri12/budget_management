export const INITIAL_KPIS = {
  totalBudget: 2450000,
  allocated: 1820000,
  spent: 1245000,
  remaining: 1205000
};

export const MONTHLY_SPENDING_DATA = [
  { month: 'January', budget: 350000, spending: 280000 },
  { month: 'February', budget: 380000, spending: 310000 },
  { month: 'March', budget: 420000, spending: 390000 },
  { month: 'April', budget: 400000, spending: 340000 },
  { month: 'May', budget: 450000, spending: 410000 },
  { month: 'June', budget: 450000, spending: 390000 },
];

export const CATEGORY_ALLOCATIONS = [
  { id: 'csea', name: 'CSEA Association', allocated: 450000, spent: 320000, color: '#443CDE', percentage: 24.7 },
  { id: 'ccc', name: 'CCC Coding Club', allocated: 350000, spent: 240000, color: '#635BFF', percentage: 19.2 },
  { id: 'equip', name: 'Lab & Equipment', allocated: 520000, spent: 390000, color: '#3B82F6', percentage: 28.6 },
  { id: 'workshops', name: 'Technical Workshops', allocated: 240000, spent: 165000, color: '#10B981', percentage: 13.2 },
  { id: 'maint', name: 'Department Maintenance', allocated: 160000, spent: 95000, color: '#F59E0B', percentage: 8.8 },
  { id: 'research', name: 'Academic Research', allocated: 100000, spent: 35000, color: '#8B5CF6', percentage: 5.5 },
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-901',
    date: '18 Sep 2026',
    department: 'CSE',
    category: 'CSEA Association',
    amount: 45000,
    status: 'Approved',
    description: 'National Level Technical Symposium guest honorarium & stage setup',
    requestedBy: 'Dr. Arun Kumar',
    vendor: 'Kongu Events & Hospitality'
  },
  {
    id: 'TXN-902',
    date: '17 Sep 2026',
    department: 'CSE',
    category: 'CCC Coding Club',
    amount: 12500,
    status: 'Pending',
    description: 'Inter-College Algorithmic Coding Contest cash prizes & trophies',
    requestedBy: 'Dr. Priya S',
    vendor: 'CCC Student Chapter'
  },
  {
    id: 'TXN-903',
    date: '16 Sep 2026',
    department: 'CSE',
    category: 'Lab & Equipment',
    amount: 28000,
    status: 'Approved',
    description: 'High-performance AI workstation GPU upgrade for CSE Lab 3',
    requestedBy: 'Prof. Rajesh V',
    vendor: 'Dell Technologies Ltd'
  },
  {
    id: 'TXN-904',
    date: '14 Sep 2026',
    department: 'CSE',
    category: 'Technical Workshop',
    amount: 18000,
    status: 'Approved',
    description: 'Hands-on Cloud Computing & DevOps workshop trainer honorarium',
    requestedBy: 'Dr. Karthik R',
    vendor: 'AWS Academy Partner'
  },
  {
    id: 'TXN-905',
    date: '12 Sep 2026',
    department: 'CSE',
    category: 'CSEA Association',
    amount: 35000,
    status: 'Pending',
    description: 'Industrial Guest Lecture series on Generative AI by industry leaders',
    requestedBy: 'Dr. Meena Sundaram',
    vendor: 'Tech Talks India'
  },
  {
    id: 'TXN-906',
    date: '10 Sep 2026',
    department: 'CSE',
    category: 'CCC Coding Club',
    amount: 65000,
    status: 'Approved',
    description: 'Annual Hackathon server infrastructure & cloud compute credits',
    requestedBy: 'Dr. Anitha P',
    vendor: 'Google Cloud Academic'
  },
  {
    id: 'TXN-907',
    date: '08 Sep 2026',
    department: 'CSE',
    category: 'Lab & Equipment',
    amount: 52000,
    status: 'Approved',
    description: 'Cisco L3 switches & Gigabit patch cables for CSE IoT Lab',
    requestedBy: 'Dr. Arun Kumar',
    vendor: 'Cisco Networking Systems'
  },
  {
    id: 'TXN-908',
    date: '05 Sep 2026',
    department: 'CSE',
    category: 'Department Maintenance',
    amount: 8500,
    status: 'Rejected',
    description: 'Unplanned printer ink refill outside departmental quota',
    requestedBy: 'Dr. Priya S',
    vendor: 'Local Office Mart'
  }
];

export const INITIAL_FACULTY = [
  {
    id: '1',
    name: 'Dr. Arun Kumar',
    email: 'arun@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Professor',
    employeeId: 'FAC001',
    phone: '+91 98421 12345',
    status: 'Active',
    joinedDate: '12 Aug 2018'
  },
  {
    id: '2',
    name: 'Dr. Priya S',
    email: 'priya@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Assistant Professor',
    employeeId: 'FAC002',
    phone: '+91 97890 23456',
    status: 'Active',
    joinedDate: '01 Jun 2021'
  },
  {
    id: '3',
    name: 'Dr. Karthik R',
    email: 'karthik@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Associate Professor',
    employeeId: 'FAC003',
    phone: '+91 94432 34567',
    status: 'Active',
    joinedDate: '15 Jan 2019'
  },
  {
    id: '4',
    name: 'Dr. Meena Sundaram',
    email: 'meena@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Professor',
    employeeId: 'FAC004',
    phone: '+91 99441 45678',
    status: 'Active',
    joinedDate: '10 Feb 2017'
  },
  {
    id: '5',
    name: 'Prof. Rajesh V',
    email: 'rajesh@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Associate Professor',
    employeeId: 'FAC005',
    phone: '+91 98650 56789',
    status: 'Active',
    joinedDate: '22 Jul 2020'
  },
  {
    id: '6',
    name: 'Dr. Anitha P',
    email: 'anitha@kongu.edu',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'HOD',
    employeeId: 'FAC006',
    phone: '+91 97512 67890',
    status: 'Active',
    joinedDate: '05 Mar 2016'
  }
];

export const DEPARTMENTS = [
  'Computer Science and Engineering (CSE)'
];

export const FORM_DEPARTMENTS = [
  'Computer Science and Engineering (CSE)'
];

export const DESIGNATIONS = [
  'HOD',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Lab Instructor'
];

export const CATEGORIES = [
  'All Categories',
  'CSEA Association',
  'CCC Coding Club',
  'Lab & Equipment',
  'Technical Workshop',
  'Department Maintenance',
  'Academic Research'
];

export const STATUSES = [
  'All Statuses',
  'Approved',
  'Pending',
  'Rejected'
];

export const CSE_UNITS_OVERVIEW = [
  { unit: 'CSEA Association', head: 'Dr. Arun Kumar', allocated: 450000, spent: 320000, utilization: 71.1, eventsCount: 12 },
  { unit: 'CCC Coding Club', head: 'Dr. Priya S', allocated: 350000, spent: 240000, utilization: 68.6, eventsCount: 8 },
  { unit: 'CSE Labs & Equipment', head: 'Prof. Rajesh V', allocated: 520000, spent: 390000, utilization: 75.0, eventsCount: 6 },
  { unit: 'Technical Workshops', head: 'Dr. Karthik R', allocated: 240000, spent: 165000, utilization: 68.8, eventsCount: 10 },
  { unit: 'Department Maintenance', head: 'Dr. Meena Sundaram', allocated: 160000, spent: 95000, utilization: 59.4, eventsCount: 15 },
];

export const CSEA_DETAILS = {
  name: 'CSEA Association',
  fullName: 'Computer Science and Engineering Association',
  allocated: 450000,
  spent: 320000,
  remaining: 130000,
  facultyInCharge: 'Dr. Arun Kumar (Professor)',
  studentPresident: 'K. Vignesh (4th Year CSE)',
  description: 'Primary departmental student association driving technical symposiums, workshops, guest lectures, and industry interaction for CSE students.',
  activities: [
    { title: 'National Level Technical Symposium (OPUS 2026)', date: '18 Sep 2026', amount: 45000, status: 'Approved', category: 'Symposium' },
    { title: 'Generative AI & LLM Architecture Guest Lecture', date: '12 Sep 2026', amount: 35000, status: 'Pending', category: 'Guest Lecture' },
    { title: 'Cloud Computing & Kubernetes Hands-on Workshop', date: '28 Aug 2026', amount: 28000, status: 'Approved', category: 'Workshop' },
    { title: 'CSEA Annual Inauguration & Keynote Address', date: '15 Aug 2026', amount: 32000, status: 'Approved', category: 'Association Event' }
  ]
};

export const CCC_DETAILS = {
  name: 'CCC Coding Club',
  fullName: 'Computer Science & Engineering Coding Club',
  allocated: 350000,
  spent: 240000,
  remaining: 110000,
  facultyInCharge: 'Dr. Priya S (Assistant Professor)',
  studentPresident: 'S. Nithya (3rd Year CSE)',
  description: 'Specialized CSE algorithmic coding hub fostering competitive programming, hackathons, LeetCode sprints, and open-source contributions.',
  activities: [
    { title: 'Inter-College 24-Hour Hackathon 2026', date: '10 Sep 2026', amount: 65000, status: 'Approved', category: 'Hackathon' },
    { title: 'Algorithmic Coding Contest Prize Distribution', date: '17 Sep 2026', amount: 12500, status: 'Pending', category: 'Coding Contest' },
    { title: 'ICPC & LeetCode Advanced DS/Algo Bootcamp', date: '04 Aug 2026', amount: 22000, status: 'Approved', category: 'Bootcamp' },
    { title: 'Open-Source Hacktoberfest Practice Sprint', date: '20 Jul 2026', amount: 15000, status: 'Approved', category: 'Coding Sprint' }
  ]
};

/**
 * NBA Criteria 9 Report Calculations & Transformation Utilities
 * Supports:
 * - Table No. 9.8.1: Summary of budget and actual expenditure incurred at program level
 * - Table No. 9.8.2: Multi-Year budget and actual expenditure item-wise matrix
 * - Criteria-9 Detailed Program Bill / Expense Ledger
 */

export const STANDARD_NBA_ITEMS = [
  'Laboratory equipment',
  'Software',
  'SDGs',
  'Support for faculty development',
  'R & D',
  'Industrial Training, Industry expert, Internship',
  'Miscellaneous expenses'
];

/**
 * Historical institutional reference data from NBA SAR audit records (Images 2 & 3).
 * Used as reliable historical baseline for previous financial years (CFYm1, CFYm2, CFYm3)
 * if historical proposals are not recorded in the database.
 */
export const HISTORICAL_NBA_DATA = {
  '2025-2026': {
    demanded: 2928000,
    allocated: 2928000,
    students: 1882,
    defaultItems: {
      'Laboratory equipment': { budgeted: 330000, actual: 27200 },
      'Software': { budgeted: 1213000, actual: 204535 },
      'SDGs': { budgeted: 412500, actual: 435925 },
      'Support for faculty development': { budgeted: 225000, actual: 244394 },
      'R & D': { budgeted: 0, actual: 346250 },
      'Industrial Training, Industry expert, Internship': { budgeted: 212500, actual: 165845 },
      'Miscellaneous expenses': { budgeted: 535000, actual: 297924 }
    }
  },
  '2024-2025': {
    demanded: 1153500,
    allocated: 1153500,
    actual: 1174368,
    students: 1461,
    defaultItems: {
      'Laboratory equipment': { budgeted: 166000, actual: 66360 },
      'Software': { budgeted: 300000, actual: 185472 },
      'SDGs': { budgeted: 225000, actual: 238984 },
      'Support for faculty development': { budgeted: 112500, actual: 48167 },
      'R & D': { budgeted: 0, actual: 282000 },
      'Industrial Training, Industry expert, Internship': { budgeted: 125000, actual: 75638 },
      'Miscellaneous expenses': { budgeted: 225000, actual: 277747 }
    }
  },
  '2023-2024': {
    demanded: 1745000,
    allocated: 1745000,
    actual: 11062304,
    students: 14385,
    defaultItems: {
      'Laboratory equipment': { budgeted: 1000000, actual: 9633723 },
      'Software': { budgeted: 0, actual: 518988 },
      'SDGs': { budgeted: 0, actual: 0 },
      'Support for faculty development': { budgeted: 75000, actual: 82548 },
      'R & D': { budgeted: 0, actual: 406000 },
      'Industrial Training, Industry expert, Internship': { budgeted: 137500, actual: 75643 },
      'Miscellaneous expenses': { budgeted: 532500, actual: 345402 }
    }
  },
  '2022-2023': {
    demanded: 7850000,
    allocated: 7850000,
    actual: 3466217,
    students: 4388,
    defaultItems: {
      'Laboratory equipment': { budgeted: 7300000, actual: 2349270 },
      'Software': { budgeted: 200000, actual: 163092 },
      'SDGs': { budgeted: 0, actual: 0 },
      'Support for faculty development': { budgeted: 37500, actual: 37500 },
      'R & D': { budgeted: 0, actual: 456000 },
      'Industrial Training, Industry expert, Internship': { budgeted: 37500, actual: 78175 },
      'Miscellaneous expenses': { budgeted: 275000, actual: 382180 }
    }
  }
};

/**
 * Format Indian Currency string without symbol (e.g. 78,50,000)
 */
export const formatNumberIndian = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0';
  const num = Math.round(Number(val));
  return num.toLocaleString('en-IN');
};

/**
 * Format Indian Currency with Rupee prefix
 */
export const formatCurrencyINR = (val) => {
  return `₹ ${formatNumberIndian(val)}`;
};

/**
 * Format date string into Indian standard DD.MM.YYYY
 */
export const formatDateDDMMYYYY = (rawDate) => {
  if (!rawDate) return '—';
  // If already in DD.MM.YYYY
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(rawDate)) return rawDate;

  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) {
      // Check for YYYY-MM-DD
      const parts = String(rawDate).split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}.${parts[0]}`;
      }
      return String(rawDate);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return String(rawDate);
  }
};

/**
 * Maps any departmental budget category to the canonical NBA Criteria 9 item.
 */
export const mapCategoryToNbaItem = (categoryName = '') => {
  const norm = String(categoryName).toLowerCase().trim();

  if (norm.includes('equipment') || norm.includes('hardware') || norm.includes('lab')) {
    return 'Laboratory equipment';
  }
  if (norm.includes('software') || norm.includes('license') || norm.includes('cloud')) {
    return 'Software';
  }
  if (
    norm.includes('sdg') ||
    norm.includes('association') ||
    norm.includes('csea') ||
    norm.includes('ccc') ||
    norm.includes('coding club')
  ) {
    return 'SDGs';
  }
  if (
    norm.includes('faculty') ||
    norm.includes('fdp') ||
    norm.includes('gender') ||
    norm.includes('support for faculty')
  ) {
    return 'Support for faculty development';
  }
  if (
    norm.includes('research') ||
    norm.includes('r & d') ||
    norm.includes('r&d') ||
    norm.includes('publication') ||
    norm.includes('patent')
  ) {
    return 'R & D';
  }
  if (
    norm.includes('training') ||
    norm.includes('internship') ||
    norm.includes('industry') ||
    norm.includes('expert') ||
    norm.includes('guest lecture')
  ) {
    return 'Industrial Training, Industry expert, Internship';
  }

  return 'Miscellaneous expenses';
};

/**
 * Builds the 4-year financial periods [CFY, CFYm1, CFYm2, CFYm3] based on selected/active academic year.
 */
export const getFourYearPeriods = (activeAcademicYear, allAcademicYears = []) => {
  let cfyStartYear = 2025; // standard base from reference images
  if (activeAcademicYear) {
    const raw = activeAcademicYear.academicYear || activeAcademicYear.name || '';
    const match = String(raw).match(/(\d{4})/);
    if (match) {
      cfyStartYear = parseInt(match[1], 10);
    } else if (activeAcademicYear.startYear) {
      cfyStartYear = activeAcademicYear.startYear;
    }
  }

  const periods = [
    { code: 'CFY', label: 'CFY', offset: 0, title: `For CFY ${cfyStartYear}-${cfyStartYear + 1}` },
    { code: 'CFYm1', label: 'CFYm1', offset: -1, title: `For CFYm1 ${cfyStartYear - 1}-${cfyStartYear}` },
    { code: 'CFYm2', label: 'CFYm2', offset: -2, title: `For CFYm2 ${cfyStartYear - 2}-${cfyStartYear - 1}` },
    { code: 'CFYm3', label: 'CFYm3', offset: -3, title: `For CFYm3 ${cfyStartYear - 3}-${cfyStartYear - 2}` }
  ];

  return periods.map(p => {
    const startY = cfyStartYear + p.offset;
    const endY = startY + 1;
    const ayLabel = `${startY}-${endY}`;
    const ayShortLabel = `${startY}-${String(endY).slice(2)}`;

    // Try to find matching academic year in database
    const matchedAy = allAcademicYears.find(ay => {
      const aName = ay.academicYear || ay.name || '';
      return aName.includes(String(startY)) || ay.startYear === startY;
    });

    return {
      ...p,
      startYear: startY,
      endYear: endY,
      academicYear: ayLabel,
      shortLabel: ayShortLabel,
      matchedAy: matchedAy || null
    };
  });
};

/**
 * Calculates Table No. 9.8.1:
 * Summary of budget and actual expenditure incurred at program level for CFY, CFYm1, CFYm2, CFYm3
 */
export const calculateTable981 = ({
  periods = [],
  proposals = [],
  categories = [],
  studentMetrics = {}
}) => {
  return periods.map(p => {
    const ayLabel = p.academicYear;
    const hist = HISTORICAL_NBA_DATA[ayLabel] || null;

    // Filter proposals belonging to this period
    const periodProps = proposals.filter(prop => {
      if (p.matchedAy?.id && (prop.academicYearId === p.matchedAy.id || prop.academic_year_id === p.matchedAy.id)) {
        return true;
      }
      const propAy = prop.academicYear || '';
      return propAy.includes(String(p.startYear));
    });

    // Calculate actual expenditure from settled/accepted proposals
    const computedActual = periodProps.reduce((sum, prop) => {
      const sLower = (prop.status || '').toLowerCase();
      const ssLower = (prop.settlementStatus || '').toLowerCase();
      const isSettled = sLower === 'settled' || ssLower === 'settled';
      const isAccepted = ['accepted', 'approved'].includes(sLower);

      if (isSettled) {
        return sum + (Number(prop.settlementAmount ?? prop.amount ?? 0) || 0);
      }
      if (isAccepted) {
        return sum + (Number(prop.approvedAmount ?? prop.amount ?? 0) || 0);
      }
      return sum;
    }, 0);

    // Categories allocation for this period
    const periodCategories = (p.matchedAy?.categories && p.matchedAy.categories.length > 0)
      ? p.matchedAy.categories
      : categories.filter(c => p.matchedAy?.id && (c.academic_year_id === p.matchedAy.id || c.academicYearId === p.matchedAy.id));

    const computedAllocated = periodCategories.reduce((sum, c) => {
      return sum + (Number(c.allocated_amount || c.budget || 0) || 0);
    }, 0);

    // Budget Allocated (priority: period matchedAy budget > computed categories > historical default)
    const allocatedBudget = (p.matchedAy && Number(p.matchedAy.budget || p.matchedAy.annualBudget || 0) > 0)
      ? Number(p.matchedAy.budget || p.matchedAy.annualBudget)
      : (computedAllocated > 0 ? computedAllocated : (hist?.allocated ?? 2928000));

    // Demanded Budget (user override > historical demanded > allocatedBudget)
    const demandedBudget = studentMetrics[ayLabel]?.demanded !== undefined
      ? Number(studentMetrics[ayLabel].demanded)
      : (hist?.demanded ?? allocatedBudget);

    // Actual Expenditure (if database proposals exist, use them; if historical default exists and no props, fallback)
    const actualExpenditure = computedActual > 0
      ? computedActual
      : (studentMetrics[ayLabel]?.actual !== undefined
        ? Number(studentMetrics[ayLabel].actual)
        : (hist?.actual ?? 0));

    // % Spent
    const percentSpent = allocatedBudget > 0
      ? Math.round((actualExpenditure / allocatedBudget) * 100)
      : 0;

    // Student Count
    const studentCount = studentMetrics[ayLabel]?.students !== undefined
      ? Number(studentMetrics[ayLabel].students)
      : (hist?.students ?? 1882);

    // Expenditure per student
    const expenditurePerStudent = studentCount > 0
      ? Math.round(actualExpenditure / studentCount)
      : 0;

    return {
      periodCode: p.code,
      periodLabel: p.label,
      title: p.title,
      academicYear: ayLabel,
      demandedBudget,
      allocatedBudget,
      actualExpenditure,
      percentSpent,
      studentCount,
      expenditurePerStudent,
      proposalsCount: periodProps.length
    };
  });
};

/**
 * Calculates Table No. 9.8.2:
 * Budget and actual expenditure incurred at program level (Item-wise multi-year matrix)
 */
export const calculateTable982 = ({
  periods = [],
  proposals = [],
  categories = []
}) => {
  // Build items rows
  const itemRows = STANDARD_NBA_ITEMS.map(itemName => {
    const yearData = {};

    periods.forEach(p => {
      const ayLabel = p.academicYear;
      const hist = HISTORICAL_NBA_DATA[ayLabel]?.defaultItems?.[itemName] || null;

      // Filter proposals for this year & this item
      const matchedProps = proposals.filter(prop => {
        const matchesAy = (p.matchedAy?.id && (prop.academicYearId === p.matchedAy.id || prop.academic_year_id === p.matchedAy.id)) ||
          (prop.academicYear && prop.academicYear.includes(String(p.startYear)));
        if (!matchesAy) return false;

        const mapped = mapCategoryToNbaItem(prop.category);
        return mapped === itemName;
      });

      // Sum actual expenses from proposals
      const propActualSum = matchedProps.reduce((sum, prop) => {
        const sLower = (prop.status || '').toLowerCase();
        const ssLower = (prop.settlementStatus || '').toLowerCase();
        const isSettled = sLower === 'settled' || ssLower === 'settled';
        const isAccepted = ['accepted', 'approved'].includes(sLower);

        if (isSettled) {
          return sum + (Number(prop.settlementAmount ?? prop.amount ?? 0) || 0);
        }
        if (isAccepted) {
          return sum + (Number(prop.approvedAmount ?? prop.amount ?? 0) || 0);
        }
        return sum;
      }, 0);

      // Sum budgeted from categories
      const periodCats = (p.matchedAy?.categories || categories).filter(c => {
        const matchesAy = !p.matchedAy?.id || c.academic_year_id === p.matchedAy.id || c.academicYearId === p.matchedAy.id;
        if (!matchesAy) return false;
        return mapCategoryToNbaItem(c.name) === itemName;
      });

      const catBudgetSum = periodCats.reduce((sum, c) => sum + (Number(c.allocated_amount || c.budget || 0) || 0), 0);

      // Final values: prioritize live DB, fallback to historical baseline
      const budgeted = catBudgetSum > 0 ? catBudgetSum : (hist?.budgeted ?? 0);
      const actual = propActualSum > 0 ? propActualSum : (hist?.actual ?? 0);

      yearData[p.code] = {
        budgeted,
        actual,
        proposalsCount: matchedProps.length
      };
    });

    return {
      item: itemName,
      yearData
    };
  });

  // Calculate Column Totals
  const totals = {};
  periods.forEach(p => {
    let totBudgeted = 0;
    let totActual = 0;

    itemRows.forEach(row => {
      totBudgeted += Number(row.yearData[p.code]?.budgeted || 0);
      totActual += Number(row.yearData[p.code]?.actual || 0);
    });

    totals[p.code] = {
      budgeted: totBudgeted,
      actual: totActual
    };
  });

  return {
    rows: itemRows,
    totals
  };
};

/**
 * Prepares the Detailed Criteria-9 Program Bill/Expense Ledger (Image 1)
 */
export const prepareCriteria9Ledger = ({
  proposals = [],
  activeAcademicYear = null,
  selectedCategory = 'ALL',
  selectedSubcategory = 'ALL',
  statusFilter = 'ALL'
}) => {
  const ayLabel = activeAcademicYear?.name || activeAcademicYear?.academicYear || '2025-2026';
  const ayId = activeAcademicYear?.id;

  // 1. Filter proposals
  const filtered = (proposals || []).filter(p => {
    // Academic year match
    if (ayId) {
      const matchAy = p.academicYearId === ayId || p.academic_year_id === ayId ||
        (p.academicYear && (p.academicYear === ayLabel || p.academicYear.includes(ayLabel.split('-')[0])));
      if (!matchAy) return false;
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'ALL') {
      const pCat = (p.category || '').toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      if (pCat !== sCat && !pCat.includes(sCat) && !sCat.includes(pCat)) {
        // Also check mapped NBA item
        const mapped = mapCategoryToNbaItem(p.category);
        if (mapped.toLowerCase() !== sCat) return false;
      }
    }

    // Subcategory / SDG filter
    if (selectedSubcategory && selectedSubcategory !== 'ALL') {
      const pSub = (p.subCategory || p.eventDetails?.subCategoryName || '').toLowerCase();
      if (!pSub.includes(selectedSubcategory.toLowerCase())) return false;
    }

    // Status filter
    const sLower = (p.status || '').toLowerCase();
    const ssLower = (p.settlementStatus || '').toLowerCase();
    if (statusFilter === 'SETTLED_ONLY') {
      if (sLower !== 'settled' && ssLower !== 'settled') return false;
    } else if (statusFilter === 'APPROVED_ONLY') {
      if (!['approved', 'accepted', 'settled'].includes(sLower) && ssLower !== 'settled') return false;
    }

    return true;
  });

  // Map each proposal to Image 1 row format:
  // S.No, ProgramDate, Program Detail, Bill Date, Amount, SDG Tag
  const ledgerRows = filtered.map((p, index) => {
    // 1. Program Date (Date or Range: DD.MM.YYYY to DD.MM.YYYY)
    let programDateFormatted = '';
    const progDetails = p.eventDetails?.programmeDetails || {};
    const startDate = progDetails.programDate || p.programDate;
    const endDate = progDetails.endDate;

    if (startDate && endDate && startDate !== endDate) {
      programDateFormatted = `${formatDateDDMMYYYY(startDate)} to ${formatDateDDMMYYYY(endDate)}`;
    } else if (startDate) {
      programDateFormatted = formatDateDDMMYYYY(startDate);
    } else {
      programDateFormatted = p.programDate ? formatDateDDMMYYYY(p.programDate) : '—';
    }

    // 2. Program Detail (Title)
    const programDetail = progDetails.title || p.title || 'Department Program';

    // 3. Bill Date (from settlement settledAt or document uploadedAt or proposalDate)
    const docDetails = p.eventDetails?.documentDetails || {};
    const billDateRaw = p.settledAt || docDetails.uploadedAt || p.proposalDate;
    const billDateFormatted = formatDateDDMMYYYY(billDateRaw);

    // 4. Amount (Settlement amount > Approved amount > proposed amount)
    const isSettled = (p.status || '').toLowerCase() === 'settled' || (p.settlementStatus || '').toLowerCase() === 'settled';
    const amountVal = isSettled
      ? Number(p.settlementAmount ?? p.amount ?? 0)
      : Number(p.approvedAmount ?? p.amount ?? 0);

    // 5. SDG / Subcategory Tag (matches SDG-8, SDG-9 in handwritten notes in Image 1)
    const subName = p.subCategory || progDetails.subCategoryName || docDetails.subCategoryName || '';
    let sdgTag = 'SDG-9'; // default SDG tag for computer science
    if (subName.toLowerCase().includes('interview') || subName.toLowerCase().includes('coding') || subName.toLowerCase().includes('hackathon')) {
      sdgTag = 'SDG-8';
    } else if (subName.toLowerCase().includes('orientation') || subName.toLowerCase().includes('valedictory')) {
      sdgTag = 'SDG-4';
    } else if (p.eventDetails?.sdgTag) {
      sdgTag = p.eventDetails.sdgTag;
    }

    return {
      sNo: index + 1,
      proposalId: p.proposalNumber || p.id,
      programDate: programDateFormatted,
      programDetail,
      billDate: billDateFormatted,
      amount: amountVal,
      sdgTag,
      subCategory: subName || 'Association',
      category: p.category || 'Association Expenses',
      status: p.status || 'Approved',
      settlementStatus: p.settlementStatus || 'settled',
      facultyName: p.facultyName || 'Faculty Coordinator',
      letterId: docDetails.letterId || '—'
    };
  });

  const totalAmount = ledgerRows.reduce((sum, r) => sum + r.amount, 0);

  return {
    rows: ledgerRows,
    totalAmount,
    count: ledgerRows.length,
    academicYearLabel: ayLabel
  };
};

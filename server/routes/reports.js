import express from 'express';
import XLSX from 'xlsx';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { memoryCategories, memorySubCategories } from './categories.js';

const router = express.Router();

// Helper to fetch academic year details
const getAcademicYearDetails = async (ayInput) => {
  if (!ayInput) return null;

  // Try Supabase first
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ayInput) || ayInput.startsWith('ay-');
  let query = supabaseAdmin.from('academic_years').select('*');
  if (isUuid) {
    query = query.eq('id', ayInput);
  } else {
    query = query.eq('academic_year', ayInput.trim());
  }
  const { data: ayRecord } = await query.maybeSingle();

  if (ayRecord) {
    return {
      id: ayRecord.id,
      academicYear: ayRecord.academic_year,
      budget: Number(ayRecord.budget || 0),
      isActive: Boolean(ayRecord.is_active)
    };
  }

  // Memory fallback
  const fallbackYears = [
    { id: 'ay-2026-2027-default', academicYear: '2026-2027', budget: 500000, isActive: true },
    { id: 'ay-2027-2028-default', academicYear: '2027-2028', budget: 600000, isActive: true }
  ];

  const match = fallbackYears.find(y => y.id === ayInput || y.academicYear === ayInput.trim());
  return match || { id: ayInput, academicYear: ayInput, budget: 500000, isActive: true };
};

// GET /api/reports/financial - Dynamic Report Data Generation
router.get('/financial', authenticateUser, async (req, res) => {
  try {
    const { academicYearId, academicYear, categoryId, subCategoryId, reportType = 'Complete Academic Year Report' } = req.query;

    const ayTarget = academicYearId || academicYear || '2026-2027';
    const ayDetails = await getAcademicYearDetails(ayTarget);

    // Fetch Categories for this academic year
    let categoriesList = [];
    const { data: dbCats } = await supabaseAdmin
      .from('budget_categories')
      .select('*')
      .eq('academic_year_id', ayDetails.id)
      .order('name', { ascending: true });

    if (dbCats && dbCats.length > 0) {
      categoriesList = dbCats.map(c => ({ id: c.id, name: c.name, allocatedAmount: Number(c.allocated_amount || 0) }));
    } else {
      categoriesList = memoryCategories
        .filter(c => c.academic_year_id === ayDetails.id || ayDetails.id.includes(c.academic_year_id))
        .map(c => ({ id: c.id, name: c.name, allocatedAmount: 100000 }));
    }

    // Filter category if specified
    if (categoryId && categoryId !== 'All' && categoryId !== 'All Categories') {
      categoriesList = categoriesList.filter(c => c.id === categoryId || c.name === categoryId);
    }

    // Fetch Sub-categories for this academic year
    let subCategoriesList = [];
    const { data: dbSubs } = await supabaseAdmin
      .from('budget_sub_categories')
      .select('*')
      .eq('academic_year_id', ayDetails.id);

    if (dbSubs && dbSubs.length > 0) {
      subCategoriesList = dbSubs.map(s => ({ id: s.id, categoryId: s.category_id, name: s.name }));
    } else {
      subCategoriesList = memorySubCategories
        .filter(s => s.academic_year_id === ayDetails.id || ayDetails.id.includes(s.academic_year_id))
        .map(s => ({ id: s.id, categoryId: s.category_id, name: s.name }));
    }

    if (subCategoryId && subCategoryId !== 'All' && subCategoryId !== 'All Sub-categories') {
      subCategoriesList = subCategoriesList.filter(s => s.id === subCategoryId || s.name === subCategoryId);
    }

    // Fetch Proposals for this academic year
    let proposalsList = [];
    let propQuery = supabaseAdmin
      .from('proposals')
      .select('*, profiles:faculty_id(name, email)')
      .order('created_at', { ascending: false });

    if (ayDetails.id) {
      propQuery = propQuery.eq('academic_year_id', ayDetails.id);
    }

    const { data: dbProposals } = await propQuery;

    if (dbProposals && dbProposals.length > 0) {
      proposalsList = dbProposals.map(p => ({
        id: p.proposal_number,
        academicYear: ayDetails.academicYear,
        category: p.category,
        categoryId: p.category_id,
        subCategory: p.sub_category || '',
        subCategoryId: p.sub_category_id,
        facultyName: p.profiles?.name || 'Faculty Member',
        facultyEmail: p.profiles?.email || '',
        title: p.title,
        programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        requestedAmount: Number(p.amount),
        approvedAmount: p.status === 'Approved' ? Number(p.amount) : 0,
        status: p.status
      }));
    } else {
      // Memory fallback seed data
      proposalsList = [
        {
          id: `KEC/${ayDetails.academicYear}/LAB/HARDWARE/1`,
          academicYear: ayDetails.academicYear,
          category: 'Laboratory',
          subCategory: 'Hardware',
          facultyName: 'Dr. Arun Kumar',
          facultyEmail: 'arun@kongu.edu',
          title: 'High-Performance AI Workstation Upgrade',
          programDate: '15 Oct 2026',
          proposalDate: '01 Oct 2026',
          requestedAmount: 50000,
          approvedAmount: 45000,
          status: 'Approved'
        },
        {
          id: `KEC/${ayDetails.academicYear}/LAB/MAINTENANCE/2`,
          academicYear: ayDetails.academicYear,
          category: 'Laboratory',
          subCategory: 'Maintenance',
          facultyName: 'Dr. Priya S',
          facultyEmail: 'priya@kongu.edu',
          title: 'CSE IoT Lab Networking & UPS Maintenance',
          programDate: '20 Oct 2026',
          proposalDate: '02 Oct 2026',
          requestedAmount: 30000,
          approvedAmount: 25000,
          status: 'Approved'
        },
        {
          id: `KEC/${ayDetails.academicYear}/INFRASTRUCTURE/FURNITURE/3`,
          academicYear: ayDetails.academicYear,
          category: 'Infrastructure',
          subCategory: 'Furniture',
          facultyName: 'Prof. Rajesh V',
          facultyEmail: 'rajesh@kongu.edu',
          title: 'Ergonomic Seating for Project Lab 2',
          programDate: '05 Nov 2026',
          proposalDate: '10 Oct 2026',
          requestedAmount: 40000,
          approvedAmount: 40000,
          status: 'Approved'
        },
        {
          id: `KEC/${ayDetails.academicYear}/FDP/TRAINING/4`,
          academicYear: ayDetails.academicYear,
          category: 'Faculty Development',
          subCategory: 'Training',
          facultyName: 'Dr. Karthik R',
          facultyEmail: 'karthik@kongu.edu',
          title: 'AWS Cloud Computing Certification Course',
          programDate: '12 Nov 2026',
          proposalDate: '12 Oct 2026',
          requestedAmount: 20000,
          approvedAmount: 18000,
          status: 'Approved'
        }
      ];
    }

    // Filter proposals by Category and Sub-category if requested
    if (categoryId && categoryId !== 'All' && categoryId !== 'All Categories') {
      const catObj = categoriesList.find(c => c.id === categoryId || c.name === categoryId);
      const catName = catObj?.name || categoryId;
      proposalsList = proposalsList.filter(p => p.category === catName || p.categoryId === categoryId);
    }

    if (subCategoryId && subCategoryId !== 'All' && subCategoryId !== 'All Sub-categories') {
      const subObj = subCategoriesList.find(s => s.id === subCategoryId || s.name === subCategoryId);
      const subName = subObj?.name || subCategoryId;
      proposalsList = proposalsList.filter(p => p.subCategory === subName || p.subCategoryId === subCategoryId);
    }

    // Calculate Totals
    const totalBudget = ayDetails.budget || 500000;
    const totalRequested = proposalsList.reduce((sum, p) => sum + p.requestedAmount, 0);
    const totalApproved = proposalsList.reduce((sum, p) => sum + p.approvedAmount, 0);
    const remainingBudget = Math.max(0, totalBudget - totalApproved);

    // Build Category Summaries
    const categorySummaries = categoriesList.map(cat => {
      const catProps = proposalsList.filter(p => p.category === cat.name || p.categoryId === cat.id);
      const requested = catProps.reduce((sum, p) => sum + p.requestedAmount, 0);
      const approved = catProps.reduce((sum, p) => sum + p.approvedAmount, 0);
      const allocated = cat.allocatedAmount || Math.round(totalBudget / Math.max(1, categoriesList.length));
      return {
        id: cat.id,
        category: cat.name,
        allocated,
        requested,
        approved,
        remaining: Math.max(0, allocated - approved)
      };
    });

    const reportData = {
      institution: 'Kongu Engineering College (Autonomous)',
      department: 'Computer Science and Engineering (CSE)',
      academicYear: ayDetails.academicYear,
      reportType,
      generatedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      summary: {
        totalBudget,
        totalRequested,
        totalApproved,
        remainingBudget
      },
      categorySummaries,
      proposals: proposalsList
    };

    return res.json({
      success: true,
      report: reportData
    });
  } catch (err) {
    console.error('Error generating report data:', err);
    return res.status(500).json({ success: false, error: 'Server error generating report data.' });
  }
});

// GET /api/reports/export/excel - Excel Spreadsheet Download
router.get('/export/excel', authenticateUser, async (req, res) => {
  try {
    const { academicYearId, academicYear, categoryId, subCategoryId } = req.query;

    const ayTarget = academicYearId || academicYear || '2026-2027';
    const ayDetails = await getAcademicYearDetails(ayTarget);

    // Fetch report data
    let categoriesList = [];
    const { data: dbCats } = await supabaseAdmin
      .from('budget_categories')
      .select('*')
      .eq('academic_year_id', ayDetails.id);

    if (dbCats && dbCats.length > 0) {
      categoriesList = dbCats.map(c => ({ id: c.id, name: c.name, allocatedAmount: Number(c.allocated_amount || 0) }));
    } else {
      categoriesList = memoryCategories
        .filter(c => c.academic_year_id === ayDetails.id || ayDetails.id.includes(c.academic_year_id))
        .map(c => ({ id: c.id, name: c.name, allocatedAmount: 100000 }));
    }

    let proposalsList = [];
    const { data: dbProposals } = await supabaseAdmin
      .from('proposals')
      .select('*, profiles:faculty_id(name, email)')
      .eq('academic_year_id', ayDetails.id);

    if (dbProposals && dbProposals.length > 0) {
      proposalsList = dbProposals.map(p => ({
        id: p.proposal_number,
        category: p.category,
        subCategory: p.sub_category || '',
        facultyName: p.profiles?.name || 'Faculty Member',
        facultyEmail: p.profiles?.email || '',
        title: p.title,
        programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        requestedAmount: Number(p.amount),
        approvedAmount: p.status === 'Approved' ? Number(p.amount) : 0,
        status: p.status
      }));
    } else {
      proposalsList = [
        {
          id: `KEC/${ayDetails.academicYear}/LAB/HARDWARE/1`,
          category: 'Laboratory',
          subCategory: 'Hardware',
          facultyName: 'Dr. Arun Kumar',
          facultyEmail: 'arun@kongu.edu',
          title: 'High-Performance AI Workstation Upgrade',
          programDate: '15 Oct 2026',
          requestedAmount: 50000,
          approvedAmount: 45000,
          status: 'Approved'
        },
        {
          id: `KEC/${ayDetails.academicYear}/LAB/MAINTENANCE/2`,
          category: 'Laboratory',
          subCategory: 'Maintenance',
          facultyName: 'Dr. Priya S',
          facultyEmail: 'priya@kongu.edu',
          title: 'CSE IoT Lab Networking & UPS Maintenance',
          programDate: '20 Oct 2026',
          requestedAmount: 30000,
          approvedAmount: 25000,
          status: 'Approved'
        },
        {
          id: `KEC/${ayDetails.academicYear}/INFRASTRUCTURE/FURNITURE/3`,
          category: 'Infrastructure',
          subCategory: 'Furniture',
          facultyName: 'Prof. Rajesh V',
          facultyEmail: 'rajesh@kongu.edu',
          title: 'Ergonomic Seating for Project Lab 2',
          programDate: '05 Nov 2026',
          requestedAmount: 40000,
          approvedAmount: 40000,
          status: 'Approved'
        }
      ];
    }

    if (categoryId && categoryId !== 'All' && categoryId !== 'All Categories') {
      const catObj = categoriesList.find(c => c.id === categoryId || c.name === categoryId);
      const catName = catObj?.name || categoryId;
      proposalsList = proposalsList.filter(p => p.category === catName);
    }

    const totalBudget = ayDetails.budget || 500000;
    const totalRequested = proposalsList.reduce((sum, p) => sum + p.requestedAmount, 0);
    const totalApproved = proposalsList.reduce((sum, p) => sum + p.approvedAmount, 0);
    const remainingBudget = Math.max(0, totalBudget - totalApproved);

    // Create Excel Workbook using XLSX
    const wb = XLSX.utils.book_new();

    // Sheet 1: Academic Year Summary
    const summaryData = [
      { Metric: 'Department', Value: 'Computer Science and Engineering (CSE)' },
      { Metric: 'Academic Year', Value: ayDetails.academicYear },
      { Metric: 'Total Budget Quota (₹)', Value: totalBudget },
      { Metric: 'Total Requested Amount (₹)', Value: totalRequested },
      { Metric: 'Total Approved Amount (₹)', Value: totalApproved },
      { Metric: 'Remaining Quota Balance (₹)', Value: remainingBudget },
      { Metric: 'Report Generated Date', Value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Academic Year Summary');

    // Sheet 2: Category Breakdown
    const categoryData = categoriesList.map(cat => {
      const catProps = proposalsList.filter(p => p.category === cat.name);
      const req = catProps.reduce((sum, p) => sum + p.requestedAmount, 0);
      const app = catProps.reduce((sum, p) => sum + p.approvedAmount, 0);
      return {
        'Category Name': cat.name,
        'Proposals Count': catProps.length,
        'Requested Amount (₹)': req,
        'Approved Expenditure (₹)': app,
        'Category Quota (₹)': cat.allocatedAmount || Math.round(totalBudget / Math.max(1, categoriesList.length))
      };
    });
    const wsCategory = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Breakdown');

    // Sheet 3: Proposal Details
    const proposalData = proposalsList.map(p => ({
      'Proposal ID': p.id,
      'Academic Year': ayDetails.academicYear,
      'Category': p.category,
      'Sub Category': p.subCategory,
      'Faculty Name': p.facultyName,
      'Faculty Email': p.facultyEmail,
      'Program Title': p.title,
      'Program Date': p.programDate,
      'Requested Amount (₹)': p.requestedAmount,
      'Approved Amount (₹)': p.approvedAmount,
      'Status': p.status
    }));
    const wsProposals = XLSX.utils.json_to_sheet(proposalData);
    XLSX.utils.book_append_sheet(wb, wsProposals, 'Proposals Detail');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const safeFilename = `CSE_Budget_Report_${ayDetails.academicYear.replace(/[^a-zA-Z0-9-]/g, '_')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.send(excelBuffer);
  } catch (err) {
    console.error('Error generating Excel export:', err);
    return res.status(500).json({ success: false, error: 'Server error exporting Excel report.' });
  }
});

export default router;

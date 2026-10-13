import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { CATEGORY_COLOR_MAP } from '../data/categories';
import { BudgetContext } from './BudgetContext';

const CATEGORY_COLORS = CATEGORY_COLOR_MAP || {
  'CSEA Association': '#C5A059',
  'CCC Coding Club': '#121212',
  'Lab & Equipment': '#52525B',
  'Technical Workshop': '#3F3F46',
  'Department Maintenance': '#71717A',
  'Academic Research': '#9E7A32'
};

export const BudgetProvider = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;

  const [facultyList, setFacultyList] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryAllocations, setCategoryAllocations] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [kpis, setKpis] = useState({
    totalBudget: 0,
    allocated: 0,
    spent: 0,
    remaining: 0
  });

  const [dataLoading, setDataLoading] = useState(true);
  const loading = authLoading || (isAuthenticated ? dataLoading : false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 1. Fetch Academic Years from Database / API
  const refreshAcademicYears = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/academic-years');
        if (res?.success && res.academicYears) {
          const formatted = res.academicYears.map(ay => {
            const sYear = ay.startYear || ay.start_year || (ay.name ? parseInt(ay.name.split('-')[0]) : 2026);
            const eYear = ay.endYear || ay.end_year || sYear + 1;
            const normName = ay.name || `${sYear} - ${eYear}`;
            const sDate = ay.startDate || ay.start_date || `${sYear}-06-01`;
            const eDate = ay.endDate || ay.end_date || `${eYear}-05-31`;
            const isAct = ay.status === 'ACTIVE' || ay.status === 'Active' || Boolean(ay.isActive || ay.is_active);

            return {
              id: ay.id,
              startYear: sYear,
              endYear: eYear,
              startDate: sDate,
              endDate: eDate,
              name: normName,
              academicYear: ay.academicYear || ay.academic_year || `${sYear}-${eYear}`,
              status: isAct ? 'ACTIVE' : (ay.status || 'DRAFT'),
              isActive: isAct,
              annualBudget: Number(ay.budget !== undefined ? ay.budget : (ay.annualBudget || 0)),
              budget: Number(ay.budget !== undefined ? ay.budget : (ay.annualBudget || 0)),
              categoriesCount: ay.categoriesCount !== undefined ? ay.categoriesCount : (ay.categories?.length || 0),
              categories: ay.categories || [],
              createdAt: ay.createdAt || ay.created_at,
              updatedAt: ay.updatedAt || ay.updated_at
            };
          });

          setAcademicYears(formatted);
          const active = formatted.find(ay => ay.isActive);
          if (active) setActiveAcademicYear(active);
          return formatted;
        }
      } catch (apiErr) {
        console.warn('API fetch academic years notice, trying direct Supabase query:', apiErr.message);
      }

      // Direct Supabase query
      const { data, error } = await supabase
        .from('academic_years')
        .select('*, budget_categories(id, allocated_amount, spent_amount)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching academic years from Supabase:', error.message);
        return [];
      }

      const formatted = (data || []).map(ay => {
        const rawAy = ay.academic_year || ay.name || '';
        const match = String(rawAy).match(/(\d{4})/);
        const sYear = match ? parseInt(match[1], 10) : (ay.start_year || 2026);
        const eYear = sYear + 1;
        const normName = `${sYear} - ${eYear}`;
        const sDate = ay.start_date || `${sYear}-06-01`;
        const eDate = ay.end_date || `${eYear}-05-31`;
        const isAct = ay.status === 'ACTIVE' || ay.status === 'Active' || Boolean(ay.is_active);
        const finalBudget = Number(ay.budget !== undefined ? ay.budget : (ay.annual_budget || 0));

        return {
          id: ay.id,
          startYear: sYear,
          endYear: eYear,
          startDate: sDate,
          endDate: eDate,
          name: normName,
          academicYear: ay.academic_year || `${sYear}-${eYear}`,
          status: isAct ? 'ACTIVE' : (ay.status || 'DRAFT'),
          isActive: isAct,
          annualBudget: finalBudget,
          budget: finalBudget,
          categoriesCount: (ay.budget_categories || []).length,
          categories: ay.budget_categories || [],
          createdAt: ay.created_at,
          updatedAt: ay.updated_at
        };
      });

      setAcademicYears(formatted);
      const active = formatted.find(ay => ay.isActive);
      if (active) setActiveAcademicYear(active);
      return formatted;
    } catch (err) {
      console.error('Refresh academic years error:', err);
      return [];
    }
  }, []);

  // 1b. Fetch Active Academic Year Configuration with Categories and Subcategories
  const fetchActiveAcademicYearConfig = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/academic-years/active');
        if (res?.success && res.academicYear) {
          const ay = res.academicYear;
          const match = String(ay.academicYear || ay.name || '').match(/(\d{4})/);
          const sYear = match ? parseInt(match[1], 10) : (ay.startYear || 2026);
          const eYear = sYear + 1;
          const formatted = {
            ...ay,
            startDate: ay.startDate || `${sYear}-06-01`,
            endDate: ay.endDate || `${eYear}-05-31`,
            isActive: true,
            status: 'ACTIVE'
          };
          setActiveAcademicYear(formatted);
          return formatted;
        }
      } catch (apiErr) {
        console.warn('API active year notice, trying direct Supabase query:', apiErr.message);
      }

      // Direct Supabase query
      const { data: dbActive, error: dbErr } = await supabase
        .from('academic_years')
        .select('*')
        .or('status.eq.ACTIVE,is_active.eq.true')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbErr || !dbActive) return null;

      const { data: cats } = await supabase
        .from('budget_categories')
        .select('*, subcategories(*)')
        .eq('academic_year_id', dbActive.id)
        .order('allocated_amount', { ascending: false });

      const match = String(dbActive.academic_year || dbActive.name || '').match(/(\d{4})/);
      const sYear = match ? parseInt(match[1], 10) : (dbActive.start_year || 2026);
      const eYear = sYear + 1;
      const finalBudget = Number(dbActive.budget !== undefined ? dbActive.budget : (dbActive.annual_budget || 0));

      const formatted = {
        id: dbActive.id,
        name: `${sYear} - ${eYear}`,
        academicYear: dbActive.academic_year || `${sYear}-${eYear}`,
        startDate: dbActive.start_date || `${sYear}-06-01`,
        endDate: dbActive.end_date || `${eYear}-05-31`,
        annualBudget: finalBudget,
        budget: finalBudget,
        status: 'ACTIVE',
        isActive: true,
        categories: (cats || []).map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          budget: Number(c.allocated_amount || 0),
          allocated_amount: Number(c.allocated_amount || 0),
          spent_amount: Number(c.spent_amount || 0),
          subcategories: c.subcategories || []
        }))
      };

      setActiveAcademicYear(formatted);
      return formatted;
    } catch (err) {
      console.error('Fetch active academic year config error:', err);
      return null;
    }
  }, []);

  // 1c. Fetch Academic Year Details by ID
  const fetchAcademicYearDetails = useCallback(async (id) => {
    try {
      const res = await api.get(`/api/academic-years/${id}`);
      if (res?.success && res.academicYear) {
        return res.academicYear;
      }
      return null;
    } catch (err) {
      console.warn('Fetch academic year details notice:', err.message);
      return null;
    }
  }, []);

  // 2. Fetch Directory Users from Database / API
  const refreshFaculty = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/faculty');
        if (res?.success && res.faculty) {
          setFacultyList(res.faculty);
          return res.faculty;
        }
      } catch (apiErr) {
        console.warn('API fetch faculty notice, trying direct Supabase query:', apiErr.message);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*, departments(name, code)')
        .in('role', ['faculty', 'hod', 'admin'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching faculty from Supabase:', error.message);
        return [];
      }

      const formatted = (data || []).map(f => {
        let displayRole = 'Faculty';
        if (f.role === 'hod') displayRole = 'HOD';
        if (f.role === 'admin') displayRole = 'Admin (Budget Coordinator)';

        return {
          id: f.id,
          name: f.name,
          email: f.email,
          role: f.role || 'faculty',
          displayRole,
          department: f.departments?.name || 'Computer Science and Engineering (CSE)',
          designation: f.designation || (f.role === 'hod' ? 'HOD' : f.role === 'admin' ? 'Budget Coordinator' : 'Assistant Professor'),
          employeeId: f.employee_id || '',
          phone: f.phone || '',
          status: f.status || 'Active',
          joinedDate: f.created_at ? new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
        };
      });

      setFacultyList(formatted);
      return formatted;
    } catch (err) {
      console.error('Refresh faculty error:', err);
      return [];
    }
  }, []);

  // 3. Fetch Proposals from Database / API
  const refreshProposals = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/proposals');
        if (res?.success && res.proposals) {
          setProposals(res.proposals);
          return res.proposals;
        }
      } catch (apiErr) {
        console.warn('API fetch proposals notice, trying direct Supabase query:', apiErr.message);
      }

      let query = supabase
        .from('proposals')
        .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name), academic_years:academic_year_id(id, academic_year, budget)')
        .order('created_at', { ascending: false });

      if (userId && userRole !== 'admin' && userRole !== 'hod') {
        query = query.eq('faculty_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching proposals from Supabase:', error.message);
        return [];
      }

      const formatted = (data || []).map(p => ({
        id: p.id,
        dbId: p.id,
        proposalNumber: p.proposal_number || p.id,
        proposalId: p.proposal_number || p.id,
        academicYearId: p.academic_year_id,
        academicYear: p.academic_years?.academic_year || p.academic_years?.name || p.academic_year || '',
        proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        facultyName: p.profiles?.name || 'Faculty Member',
        facultyEmail: p.profiles?.email || '',
        facultyId: p.faculty_id,
        category: p.category || p.budget_categories?.name || '',
        categoryId: p.category_id,
        subCategory: p.sub_category || '',
        subcategoryId: p.subcategory_id,
        title: p.title,
        programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        guestDetails: p.guest_details || '',
        amount: Number(p.amount || 0),
        status: p.status,
        adminRemarks: p.admin_remarks || ''
      }));

      setProposals(formatted);
      return formatted;
    } catch (err) {
      console.error('Refresh proposals error:', err);
      return [];
    }
  }, [userId, userRole]);

  // 4. Fetch Transactions from Database / API
  const refreshTransactions = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/transactions');
        if (res?.success && res.transactions) {
          setTransactions(res.transactions);
          return res.transactions;
        }
      } catch (apiErr) {
        console.warn('API fetch transactions notice, trying direct Supabase query:', apiErr.message);
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*, budget_categories(name), profiles:requested_by(name, email), departments(code, name)')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions from Supabase:', error.message);
        return [];
      }

      const formatted = (data || []).map(t => ({
        id: t.transaction_number || t.id,
        dbId: t.id,
        date: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        department: t.departments?.code || 'CSE',
        category: t.budget_categories?.name || 'General Activity',
        categoryId: t.category_id,
        amount: Number(t.amount || 0),
        status: t.status,
        description: t.description,
        requestedBy: t.profiles?.name || 'CSE Faculty',
        requestedEmail: t.profiles?.email || '',
        vendor: t.vendor || 'Kongu Procurement'
      }));

      setTransactions(formatted);
      return formatted;
    } catch (err) {
      console.error('Refresh transactions error:', err);
      return [];
    }
  }, []);

  // 5. Fetch Budget & Dashboard Analytics from Database
  const refreshBudget = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/budgets/dashboard');
        if (res?.success) {
          if (res.kpis) setKpis(res.kpis);
          if (res.categoryAllocations) setCategoryAllocations(res.categoryAllocations);
          if (res.monthlySpending) setMonthlySpending(res.monthlySpending);
          return;
        }
      } catch (apiErr) {
        console.warn('API dashboard notice, calculating directly from Supabase:', apiErr.message);
      }

      const { data: activeAy } = await supabase
        .from('academic_years')
        .select('*')
        .or('status.eq.ACTIVE,is_active.eq.true')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const activeAyId = activeAy?.id;
      const totalBudget = Number(activeAy?.budget || 0);

      let catQuery = supabase
        .from('budget_categories')
        .select('*')
        .order('allocated_amount', { ascending: false });

      if (activeAyId) {
        catQuery = catQuery.eq('academic_year_id', activeAyId);
      }

      const { data: catData } = await catQuery;
      const cats = catData || [];
      const totalAllocated = cats.reduce((sum, c) => sum + Number(c.allocated_amount || 0), 0);
      const totalSpent = cats.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);
      const remaining = Math.max(0, totalBudget - totalSpent);

      setKpis({
        totalBudget,
        allocated: totalAllocated,
        spent: totalSpent,
        remaining
      });

      const formattedAllocations = cats.map(c => ({
        id: c.id,
        name: c.name,
        allocated: Number(c.allocated_amount || 0),
        spent: Number(c.spent_amount || 0),
        color: CATEGORY_COLORS[c.name] || '#C5A059',
        percentage: totalBudget > 0 ? Number(((Number(c.allocated_amount || 0) / totalBudget) * 100).toFixed(1)) : 0
      }));

      setCategoryAllocations(formattedAllocations);
      setCategories(cats);
    } catch (err) {
      console.error('Refresh budget error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        await Promise.allSettled([
          refreshAcademicYears(),
          refreshFaculty(),
          refreshProposals(),
          refreshTransactions(),
          refreshBudget(),
          fetchActiveAcademicYearConfig()
        ]);
      } catch (err) {
        console.error('Initial data load error:', err);
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    authLoading,
    refreshAcademicYears,
    refreshFaculty,
    refreshProposals,
    refreshTransactions,
    refreshBudget,
    fetchActiveAcademicYearConfig
  ]);

  // Admin: Create Full Academic Year Configuration
  const createFullAcademicYear = async (payload) => {
    try {
      const sYear = parseInt(payload.startYear) || 2026;
      const eYear = sYear + 1;
      const cleanName = `${sYear} - ${eYear}`;
      const cleanAy = `${sYear}-${eYear}`;
      const totalBudget = Number(payload.budget !== undefined ? payload.budget : (payload.annualBudget || 0));

      const apiPayload = {
        ...payload,
        startYear: sYear,
        endYear: eYear,
        name: cleanName,
        academicYear: cleanAy,
        budget: totalBudget,
        annualBudget: totalBudget
      };

      const res = await api.post('/api/academic-years', apiPayload);

      if (res?.success && res.academicYear) {
        showToast(res.message || `Academic Year "${cleanName}" created successfully!`, 'success');
        await refreshAcademicYears();
        await fetchActiveAcademicYearConfig();
        return { success: true, academicYear: res.academicYear };
      }

      const errMsg = res?.error || 'Failed to create academic year.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch (err) {
      console.error('Error creating academic year:', err);
      const errMsg = err.message || 'Error communicating with server to create academic year.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const addAcademicYear = async (newYearData) => {
    return createFullAcademicYear(newYearData);
  };

  // Admin: Update Academic Year
  const updateAcademicYear = async (id, updateData) => {
    try {
      const sYear = updateData.startYear ? parseInt(updateData.startYear) : undefined;
      const eYear = sYear ? sYear + 1 : (updateData.endYear ? parseInt(updateData.endYear) : undefined);
      const totalBudget = updateData.budget !== undefined ? Number(updateData.budget) : (updateData.annualBudget !== undefined ? Number(updateData.annualBudget) : undefined);

      const res = await api.patch(`/api/academic-years/${id}`, {
        ...updateData,
        startYear: sYear,
        endYear: eYear,
        budget: totalBudget,
        annualBudget: totalBudget
      });

      if (res?.success) {
        showToast(res.message || 'Academic Year updated successfully.', 'success');
        await refreshAcademicYears();
        await fetchActiveAcademicYearConfig();
        return { success: true };
      }

      const errMsg = res?.error || 'Failed to update academic year.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch (err) {
      console.error('Error updating academic year:', err);
      const errMsg = err.message || 'Error updating academic year.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  // Admin: Change Academic Year Status
  const updateAcademicYearStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/api/academic-years/${id}/status`, { status: newStatus });
      if (res?.success) {
        showToast(res.message || `Academic Year status updated to ${newStatus}.`, 'success');
        await refreshAcademicYears();
        await fetchActiveAcademicYearConfig();
        return { success: true, status: newStatus };
      }

      const errMsg = res?.error || 'Failed to update academic year status.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    } catch (err) {
      console.error('Error updating academic year status:', err);
      const errMsg = err.message || 'Error updating status.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const toggleAcademicYearStatus = async (id, newIsActive) => {
    return updateAcademicYearStatus(id, newIsActive ? 'ACTIVE' : 'CLOSED');
  };

  // Admin / HOD: Delete Academic Year
  const deleteAcademicYear = async (id) => {
    try {
      const res = await api.delete(`/api/academic-years/${id}`);
      if (res?.success) {
        showToast(res.message || 'Academic Year deleted successfully from database.', 'success');
        // Optimistically remove from state
        setAcademicYears(prev => prev.filter(ay => ay.id !== id && ay.academicYear !== id));
        // Re-sync with database to ensure perfect consistency
        await refreshAcademicYears();
        await fetchActiveAcademicYearConfig();
        return { success: true };
      } else {
        const errMsg = res?.error || 'Failed to delete academic year.';
        showToast(errMsg, 'error');
        await refreshAcademicYears();
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.error('Error deleting academic year:', err);
      const errMsg = err.message || 'Error deleting academic year.';
      showToast(errMsg, 'error');
      // Re-fetch to ensure the UI state accurately reflects the database
      await refreshAcademicYears();
      return { success: false, error: errMsg };
    }
  };

  // Admin: Add User / Faculty Member
  const addFaculty = async (newFacultyData) => {
    try {
      const cleanEmail = (newFacultyData.email || '').trim().toLowerCase();
      if (!cleanEmail.endsWith('@kongu.edu')) {
        return { success: false, error: 'Please use a valid Kongu email address (@kongu.edu).' };
      }

      const assignedRole = newFacultyData.role || 'faculty';
      const cleanData = {
        ...newFacultyData,
        email: cleanEmail,
        role: assignedRole
      };

      const res = await api.post('/api/faculty', cleanData);
      if (res?.success) {
        showToast(res.message || `Account for ${newFacultyData.name} created successfully!`, 'success');
        await refreshFaculty();
        return { success: true, faculty: res.faculty };
      }
      return { success: false, error: res?.error || 'Failed to add user.' };
    } catch (err) {
      console.error('Error adding user/faculty:', err);
      const errMsg = err.message || 'Error communicating with server.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  // Admin: Delete Faculty
  const deleteFaculty = async (id) => {
    try {
      const res = await api.delete(`/api/faculty/${id}`);
      if (res?.success) {
        showToast(res.message || 'Faculty removed from roster.', 'info');
        await refreshFaculty();
        return { success: true };
      }
      return { success: false, error: res?.error };
    } catch (err) {
      console.error('Error deleting faculty:', err);
      showToast(err.message || 'Error deleting faculty', 'error');
      return { success: false, error: err.message };
    }
  };

  // Admin: Update Faculty Status
  const updateFacultyStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/api/faculty/${id}`, { status: newStatus });
      if (res?.success) {
        showToast(`Faculty status updated to ${newStatus}.`, 'success');
        await refreshFaculty();
        return { success: true };
      }
      return { success: false, error: res?.error };
    } catch (err) {
      console.error('Error updating faculty status:', err);
      showToast(err.message || 'Error updating status', 'error');
      return { success: false, error: err.message };
    }
  };

  // Helper to suggest next default Proposal ID format based on real records
  const generateProposalId = () => {
    const year = new Date().getFullYear();
    const prefix = `PROP-${year}-`;

    let maxNum = 0;
    proposals.forEach((p) => {
      const propIdStr = p.id || p.proposalId || '';
      if (propIdStr.startsWith(prefix)) {
        const numPart = parseInt(propIdStr.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });

    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `${prefix}${nextNum}`;
  };

  // Faculty: Add Proposal
  const addProposal = async (proposalData) => {
    try {
      if (!proposalData.academicYearId && !proposalData.academicYear) {
        return { success: false, error: 'Please select an Academic Year.' };
      }

      if (!proposalData.category) {
        return { success: false, error: 'Please select a Category.' };
      }

      try {
        const res = await api.post('/api/proposals', {
          proposalId: proposalData.proposalId,
          academicYearId: proposalData.academicYearId,
          academicYear: proposalData.academicYear,
          category: proposalData.category,
          subCategory: proposalData.subCategory || '',
          categoryId: proposalData.categoryId,
          subcategoryId: proposalData.subcategoryId,
          title: proposalData.title,
          programDate: proposalData.programDate,
          proposalDate: proposalData.proposalDate,
          guestDetails: proposalData.guestDetails || '',
          eventDetails: proposalData.eventDetails || {},
          amount: proposalData.amount
        });

        if (res?.success) {
          showToast(res.message || 'Proposal submitted successfully.', 'success');
          await refreshProposals();
          return { success: true, proposal: res.proposal };
        }
      } catch (apiErr) {
        console.warn('API proposal submit notice, attempting direct Supabase insert:', apiErr.message);
      }

      // Direct Supabase insert fallback for maximum resilience
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData?.session?.user?.id || userId;

      if (!currentUserId) {
        return { success: false, error: 'User session not found. Please log in again.' };
      }

      const ayClean = (proposalData.academicYear || '2026-2027').replace(/\s+/g, '');
      const catClean = (proposalData.category || 'GENERAL').replace(/[^a-zA-Z0-9]+/g, '-');
      const subClean = proposalData.subCategory ? proposalData.subCategory.replace(/[^a-zA-Z0-9]+/g, '-') : '';
      const prefix = subClean ? `KEC/${ayClean}/${catClean}/${subClean}` : `KEC/${ayClean}/${catClean}`;

      const { count } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true });

      const nextNum = String((count || 0) + 1).padStart(3, '0');
      const generatedProposalNumber = `${prefix}/${nextNum}`;

      const { data: sbProp, error: sbErr } = await supabase
        .from('proposals')
        .insert({
          proposal_number: generatedProposalNumber,
          faculty_id: currentUserId,
          academic_year_id: proposalData.academicYearId || null,
          category_id: proposalData.categoryId || null,
          subcategory_id: proposalData.subcategoryId || null,
          category: proposalData.category,
          sub_category: proposalData.subCategory || null,
          title: proposalData.title,
          proposal_date: proposalData.proposalDate || new Date().toISOString().split('T')[0],
          program_date: proposalData.programDate,
          guest_details: proposalData.guestDetails || null,
          event_details: proposalData.eventDetails || {},
          amount: Number(proposalData.amount),
          status: 'Pending'
        })
        .select()
        .single();

      if (sbErr) {
        console.error('Direct Supabase insert error:', sbErr.message);
        return { success: false, error: sbErr.message };
      }

      showToast(`Proposal submitted successfully. Proposal ID: ${generatedProposalNumber}`, 'success');
      await refreshProposals();
      return {
        success: true,
        proposal: {
          id: sbProp.id,
          proposalNumber: sbProp.proposal_number || generatedProposalNumber,
          proposalId: sbProp.proposal_number || generatedProposalNumber,
          title: sbProp.title,
          academicYear: proposalData.academicYear,
          category: sbProp.category,
          subCategory: sbProp.sub_category,
          amount: sbProp.amount,
          status: sbProp.status,
          proposalDate: sbProp.proposal_date
        }
      };
    } catch (err) {
      console.error('Error adding proposal:', err);
      showToast(err.message || 'Error submitting proposal.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Admin/HOD: Update Proposal Status
  const updateProposalStatus = async (id, newStatus, remarks = '') => {
    try {
      let targetUuid = id;
      if (typeof id === 'object' && id !== null) {
        targetUuid = id.dbId || id.id;
      } else if (typeof id === 'string') {
        const found = proposals.find(p => p.dbId === id || p.id === id || p.proposalId === id || p.proposalNumber === id);
        if (found) {
          targetUuid = found.dbId || found.id;
        }
      }

      if (!targetUuid) {
        return { success: false, error: 'Valid proposal ID is required.' };
      }

      const res = await api.patch(`/api/proposals/${encodeURIComponent(targetUuid)}/status`, {
        status: newStatus,
        remarks
      });

      if (res?.success) {
        showToast(res.message || `Proposal status updated to ${newStatus}.`, 'success');
        await refreshProposals();
        return { success: true, proposal: res.proposal };
      }
      return { success: false, error: res?.error || 'Failed to update proposal status.' };
    } catch (err) {
      console.error('Error updating proposal status:', err);
      showToast(err.message || 'Error updating status', 'error');
      return { success: false, error: err.message };
    }
  };

  // Faculty metrics calculation helper from authentic records
  const getFacultyMetrics = (facultyEmail) => {
    const cleanEmail = facultyEmail ? facultyEmail.trim().toLowerCase() : '';
    const facultyProposals = cleanEmail
      ? proposals.filter((p) => (p.facultyEmail && p.facultyEmail.trim().toLowerCase() === cleanEmail) || (user && p.facultyId === user.id))
      : proposals;

    const totalProposed = facultyProposals.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const approvedAmount = facultyProposals.filter(p => p.status === 'Approved').reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Calculate individual quota from active academic year budget divided across faculty or configured category
    const activeBudget = Number(activeAcademicYear?.budget || activeAcademicYear?.annualBudget || 0);
    const totalFacultyCount = Math.max(1, facultyList.length);
    const calculatedQuota = activeBudget > 0 ? Math.round(activeBudget / totalFacultyCount) : 150000;
    const remainingBalance = Math.max(0, calculatedQuota - approvedAmount);

    return {
      availableBalance: calculatedQuota,
      totalProposed,
      approvedAmount,
      remainingBalance,
      proposals: facultyProposals
    };
  };

  // Admin: Update Faculty Password
  const updateFacultyPassword = async (id, newPassword) => {
    try {
      const res = await api.patch(`/api/faculty/${id}/password`, { password: newPassword });
      if (res?.success) {
        showToast(res.message || 'Faculty password updated successfully.', 'success');
        return { success: true };
      }
      return { success: false, error: res?.error || 'Failed to update password.' };
    } catch (err) {
      console.error('Error updating faculty password:', err);
      showToast(err.message || 'Error updating password', 'error');
      return { success: false, error: err.message };
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        facultyList,
        academicYears,
        activeAcademicYear,
        transactions,
        proposals,
        categories,
        categoryAllocations,
        monthlySpending,
        kpis,
        toast,
        loading,
        showToast,
        createFullAcademicYear,
        addAcademicYear,
        updateAcademicYear,
        updateAcademicYearStatus,
        toggleAcademicYearStatus,
        deleteAcademicYear,
        refreshAcademicYears,
        fetchActiveAcademicYearConfig,
        fetchAcademicYearDetails,
        addFaculty,
        deleteFaculty,
        updateFacultyStatus,
        updateFacultyPassword,
        generateProposalId,
        addProposal,
        updateProposalStatus,
        getFacultyMetrics,
        refreshFaculty,
        refreshProposals,
        refreshTransactions,
        refreshBudget
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

const CATEGORY_COLORS = {
  'CSEA Association': '#443CDE',
  'CCC Coding Club': '#635BFF',
  'Lab & Equipment': '#3B82F6',
  'Technical Workshop': '#10B981',
  'Department Maintenance': '#F59E0B',
  'Academic Research': '#8B5CF6'
};

const DEFAULT_MONTHLY_SPENDING = [
  { month: 'January', budget: 350000, spending: 280000 },
  { month: 'February', budget: 380000, spending: 310000 },
  { month: 'March', budget: 420000, spending: 390000 },
  { month: 'April', budget: 400000, spending: 340000 },
  { month: 'May', budget: 450000, spending: 410000 },
  { month: 'June', budget: 450000, spending: 390000 }
];

export const BudgetProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const [facultyList, setFacultyList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryAllocations, setCategoryAllocations] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState(DEFAULT_MONTHLY_SPENDING);
  const [kpis, setKpis] = useState({
    totalBudget: 2450000,
    allocated: 1820000,
    spent: 1245000,
    remaining: 1205000
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 1. Fetch Faculty List from Database / API
  const refreshFaculty = useCallback(async () => {
    try {
      // Try API first
      try {
        const res = await api.get('/api/faculty');
        if (res?.success && res.faculty) {
          setFacultyList(res.faculty);
          return res.faculty;
        }
      } catch {
        // Fallback to direct Supabase query
        const { data, error } = await supabase
          .from('profiles')
          .select('*, departments(name, code)')
          .eq('role', 'faculty')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(f => ({
            id: f.id,
            name: f.name,
            email: f.email,
            role: f.role,
            department: f.departments?.name || 'Computer Science and Engineering (CSE)',
            designation: f.designation || 'Faculty Member',
            employeeId: f.employee_id || 'FAC000',
            phone: f.phone || '+91 98765 43210',
            status: f.status || 'Active',
            joinedDate: new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          }));
          setFacultyList(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Refresh faculty warning:', err);
    }
  }, []);

  // 2. Fetch Proposals from Database / API
  const refreshProposals = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/proposals');
        if (res?.success && res.proposals) {
          setProposals(res.proposals);
          return res.proposals;
        }
      } catch {
        // Direct Supabase query
        let query = supabase
          .from('proposals')
          .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name)')
          .order('created_at', { ascending: false });

        if (user && user.role !== 'admin') {
          query = query.eq('faculty_id', user.id);
        }

        const { data, error } = await query;
        if (!error && data) {
          const formatted = data.map(p => ({
            id: p.proposal_number,
            dbId: p.id,
            proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            facultyName: p.profiles?.name || 'Faculty Member',
            facultyEmail: p.profiles?.email || '',
            facultyId: p.faculty_id,
            category: p.budget_categories?.name || 'CSE Activity',
            categoryId: p.category_id,
            title: p.title,
            programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            guestDetails: p.guest_details || '',
            amount: Number(p.amount),
            status: p.status,
            adminRemarks: p.admin_remarks || ''
          }));
          setProposals(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Refresh proposals warning:', err);
    }
  }, [user]);

  // 3. Fetch Transactions from Database / API
  const refreshTransactions = useCallback(async () => {
    try {
      try {
        const res = await api.get('/api/transactions');
        if (res?.success && res.transactions) {
          setTransactions(res.transactions);
          return res.transactions;
        }
      } catch {
        const { data, error } = await supabase
          .from('transactions')
          .select('*, budget_categories(name), profiles:requested_by(name, email), departments(code, name)')
          .order('transaction_date', { ascending: false });

        if (!error && data) {
          const formatted = data.map(t => ({
            id: t.transaction_number || t.id,
            dbId: t.id,
            date: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            department: t.departments?.code || 'CSE',
            category: t.budget_categories?.name || 'General Activity',
            categoryId: t.category_id,
            amount: Number(t.amount),
            status: t.status,
            description: t.description,
            requestedBy: t.profiles?.name || 'CSE Faculty',
            requestedEmail: t.profiles?.email || '',
            vendor: t.vendor || 'Kongu Procurement'
          }));
          setTransactions(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Refresh transactions warning:', err);
    }
  }, []);

  // 4. Fetch Budget & Dashboard Analytics
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
      } catch {
        // Direct database calculations
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('*')
          .eq('financial_year', '2026-27')
          .maybeSingle();

        if (budgetData) setBudgets([budgetData]);

        const { data: catData } = await supabase
          .from('budget_categories')
          .select('*')
          .order('allocated_amount', { ascending: false });

        const totalBudget = Number(budgetData?.total_budget) || 2450000;
        const cats = catData || [];
        const totalAllocated = cats.reduce((sum, c) => sum + Number(c.allocated_amount || 0), 0) || 1820000;
        const totalSpent = cats.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0) || 1245000;
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
          allocated: Number(c.allocated_amount),
          spent: Number(c.spent_amount),
          color: CATEGORY_COLORS[c.name] || '#443CDE',
          percentage: totalBudget > 0 ? Number(((Number(c.allocated_amount) / totalBudget) * 100).toFixed(1)) : 0
        }));

        setCategoryAllocations(formattedAllocations);
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Refresh budget warning:', err);
    }
  }, []);

  // Load all initial data on mount / authentication change
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          await Promise.all([
            refreshFaculty(),
            refreshProposals(),
            refreshTransactions(),
            refreshBudget()
          ]);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshFaculty, refreshProposals, refreshTransactions, refreshBudget]);

  // Admin: Add Faculty
  const addFaculty = async (newFacultyData) => {
    try {
      const cleanEmail = (newFacultyData.email || '').trim().toLowerCase();
      if (!cleanEmail.endsWith('@kongu.edu')) {
        return { success: false, error: 'Please use a valid Kongu email address (@kongu.edu).' };
      }

      const res = await api.post('/api/faculty', newFacultyData);
      if (res?.success) {
        showToast(res.message || `Faculty ${newFacultyData.name} added successfully!`, 'success');
        await refreshFaculty();
        return { success: true, faculty: res.faculty };
      }
      return { success: false, error: res?.error || 'Failed to add faculty.' };
    } catch (err) {
      console.error('Error adding faculty:', err);
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

  // Automatic Proposal ID Generator
  const generateProposalId = () => {
    const year = new Date().getFullYear();
    const prefix = `PROP-${year}-`;

    let maxNum = 0;
    proposals.forEach((p) => {
      if (p.id && p.id.startsWith(prefix)) {
        const numPart = parseInt(p.id.replace(prefix, ''), 10);
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
      const res = await api.post('/api/proposals', {
        title: proposalData.title,
        category: proposalData.category,
        categoryId: proposalData.categoryId,
        programDate: proposalData.programDate,
        guestDetails: proposalData.guestDetails,
        amount: proposalData.amount
      });

      if (res?.success) {
        showToast(res.message || 'Proposal submitted successfully.', 'success');
        await refreshProposals();
        return { success: true, proposal: res.proposal };
      }
      return { success: false, error: res?.error || 'Failed to submit proposal.' };
    } catch (err) {
      console.error('Error adding proposal:', err);
      showToast(err.message || 'Error submitting proposal.', 'error');
      return { success: false, error: err.message };
    }
  };

  // Admin: Update Proposal Status
  const updateProposalStatus = async (id, newStatus, remarks = '') => {
    try {
      const res = await api.patch(`/api/proposals/${id}/status`, {
        status: newStatus,
        remarks
      });

      if (res?.success) {
        showToast(res.message || `Proposal ${id} status updated to ${newStatus}.`, 'success');
        await refreshProposals();
        return { success: true };
      }
      return { success: false, error: res?.error };
    } catch (err) {
      console.error('Error updating proposal status:', err);
      showToast(err.message || 'Error updating status', 'error');
      return { success: false, error: err.message };
    }
  };

  // Faculty metrics calculation helper
  const DEFAULT_AVAILABLE_BALANCE = 150000; // ₹1,50,000

  const getFacultyMetrics = (facultyEmail) => {
    const cleanEmail = facultyEmail ? facultyEmail.trim().toLowerCase() : '';
    const facultyProposals = cleanEmail
      ? proposals.filter((p) => (p.facultyEmail && p.facultyEmail.trim().toLowerCase() === cleanEmail) || (user && p.facultyId === user.id))
      : proposals;

    const totalProposed = facultyProposals.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const availableBalance = DEFAULT_AVAILABLE_BALANCE;
    const remainingBalance = Math.max(0, availableBalance - totalProposed);

    return {
      availableBalance,
      totalProposed,
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
        transactions,
        proposals,
        budgets,
        categories,
        categoryAllocations,
        monthlySpending,
        kpis,
        toast,
        loading,
        showToast,
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
        refreshBudget,
        DEFAULT_AVAILABLE_BALANCE
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

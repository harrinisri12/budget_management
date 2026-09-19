import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_FACULTY,
  INITIAL_TRANSACTIONS,
  INITIAL_KPIS,
  MONTHLY_SPENDING_DATA,
  CATEGORY_ALLOCATIONS,
  INITIAL_PROPOSALS
} from '../data/mockData';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [facultyList, setFacultyList] = useState(() => {
    const saved = sessionStorage.getItem('cbm_faculty_list');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = sessionStorage.getItem('cbm_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [proposals, setProposals] = useState(() => {
    const saved = sessionStorage.getItem('cbm_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addFaculty = (newFacultyData) => {
    // Validate Kongu email domain
    const email = newFacultyData.email.trim().toLowerCase();
    if (!email.endsWith('@kongu.edu')) {
      return { success: false, error: 'Please use a valid Kongu email address.' };
    }

    const newEntry = {
      ...newFacultyData,
      id: String(Date.now()),
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updatedList = [newEntry, ...facultyList];
    setFacultyList(updatedList);
    sessionStorage.setItem('cbm_faculty_list', JSON.stringify(updatedList));

    showToast(`Faculty ${newEntry.name} added successfully!`, 'success');
    return { success: true };
  };

  const deleteFaculty = (id) => {
    const target = facultyList.find((f) => f.id === id);
    const updatedList = facultyList.filter((f) => f.id !== id);
    setFacultyList(updatedList);
    sessionStorage.setItem('cbm_faculty_list', JSON.stringify(updatedList));
    if (target) {
      showToast(`Faculty ${target.name} removed from roster.`, 'info');
    }
  };

  const updateFacultyStatus = (id, newStatus) => {
    const updatedList = facultyList.map((f) => (f.id === id ? { ...f, status: newStatus } : f));
    setFacultyList(updatedList);
    sessionStorage.setItem('cbm_faculty_list', JSON.stringify(updatedList));
    showToast(`Faculty status updated to ${newStatus}.`, 'success');
  };

  // Reusable function for automatic proposal ID generation: PROP-YYYY-NNN
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

  // Submit new proposal
  const addProposal = (proposalData) => {
    const id = proposalData.id || generateProposalId();
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newEntry = {
      ...proposalData,
      id,
      proposalDate: proposalData.proposalDate || todayStr,
      status: 'Pending',
      amount: Number(proposalData.amount)
    };

    const updatedProposals = [newEntry, ...proposals];
    setProposals(updatedProposals);
    sessionStorage.setItem('cbm_proposals', JSON.stringify(updatedProposals));

    showToast(`Proposal submitted successfully. Proposal ID: ${id}`, 'success');
    return { success: true, proposal: newEntry };
  };

  // Admin update proposal status (Approved, Rejected, Under Review, Pending)
  const updateProposalStatus = (id, newStatus) => {
    const updatedProposals = proposals.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
    setProposals(updatedProposals);
    sessionStorage.setItem('cbm_proposals', JSON.stringify(updatedProposals));
    showToast(`Proposal ${id} status updated to ${newStatus}.`, 'success');
  };

  // Helper calculation for Faculty Dashboard balances
  const DEFAULT_AVAILABLE_BALANCE = 150000; // ₹1,50,000

  const getFacultyMetrics = (facultyEmail) => {
    const cleanEmail = facultyEmail ? facultyEmail.trim().toLowerCase() : '';
    const facultyProposals = cleanEmail
      ? proposals.filter((p) => p.facultyEmail && p.facultyEmail.trim().toLowerCase() === cleanEmail)
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

  return (
    <BudgetContext.Provider
      value={{
        kpis: INITIAL_KPIS,
        monthlySpending: MONTHLY_SPENDING_DATA,
        categoryAllocations: CATEGORY_ALLOCATIONS,
        facultyList,
        transactions,
        proposals,
        toast,
        showToast,
        addFaculty,
        deleteFaculty,
        updateFacultyStatus,
        generateProposalId,
        addProposal,
        updateProposalStatus,
        getFacultyMetrics,
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


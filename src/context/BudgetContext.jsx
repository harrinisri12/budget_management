import React, { createContext, useContext, useState } from 'react';
import { INITIAL_FACULTY, INITIAL_TRANSACTIONS, INITIAL_KPIS, MONTHLY_SPENDING_DATA, CATEGORY_ALLOCATIONS } from '../data/mockData';

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
    const target = facultyList.find(f => f.id === id);
    const updatedList = facultyList.filter(f => f.id !== id);
    setFacultyList(updatedList);
    sessionStorage.setItem('cbm_faculty_list', JSON.stringify(updatedList));
    if (target) {
      showToast(`Faculty ${target.name} removed from roster.`, 'info');
    }
  };

  const updateFacultyStatus = (id, newStatus) => {
    const updatedList = facultyList.map(f => f.id === id ? { ...f, status: newStatus } : f);
    setFacultyList(updatedList);
    sessionStorage.setItem('cbm_faculty_list', JSON.stringify(updatedList));
    showToast(`Faculty status updated to ${newStatus}.`, 'success');
  };

  return (
    <BudgetContext.Provider
      value={{
        kpis: INITIAL_KPIS,
        monthlySpending: MONTHLY_SPENDING_DATA,
        categoryAllocations: CATEGORY_ALLOCATIONS,
        facultyList,
        transactions,
        toast,
        showToast,
        addFaculty,
        deleteFaculty,
        updateFacultyStatus,
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

import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useBudget } from '../context/BudgetContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import {
  CalendarRange,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Check,
  X
} from 'lucide-react';

export const AcademicYearsPage = () => {
  const { academicYears, addAcademicYear, updateAcademicYear, toggleAcademicYearStatus } = useBudget();

  // Form State for Adding Academic Year
  const [newYear, setNewYear] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Modal State
  const [editingYear, setEditingYear] = useState(null);
  const [editYearStr, setEditYearStr] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle Add Academic Year
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    const trimmedYear = newYear.trim();
    if (!trimmedYear) {
      setAddError('Please enter an Academic Year (e.g. 2026-2027).');
      return;
    }

    const parsedBudget = Number(newBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setAddError('Please enter a valid positive budget amount.');
      return;
    }

    // Check duplicate in existing state
    const duplicate = (academicYears || []).some(
      ay => ay.academicYear.toLowerCase() === trimmedYear.toLowerCase()
    );
    if (duplicate) {
      setAddError(`Academic Year "${trimmedYear}" already exists. Duplicate academic years are not allowed.`);
      return;
    }

    setIsAdding(true);
    const result = await addAcademicYear({
      academicYear: trimmedYear,
      budget: parsedBudget,
      isActive: newIsActive
    });
    setIsAdding(false);

    if (result.success) {
      setNewYear('');
      setNewBudget('');
      setNewIsActive(true);
      setAddError('');
    } else {
      setAddError(result.error || 'Failed to add academic year.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (ay) => {
    setEditingYear(ay);
    setEditYearStr(ay.academicYear);
    setEditBudget(ay.budget.toString());
    setEditIsActive(ay.isActive);
    setEditError('');
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    const trimmedYear = editYearStr.trim();
    if (!trimmedYear) {
      setEditError('Academic Year cannot be empty.');
      return;
    }

    const parsedBudget = Number(editBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setEditError('Budget must be a positive number.');
      return;
    }

    // Check duplicate with other records
    const duplicate = (academicYears || []).some(
      ay => ay.id !== editingYear.id && ay.academicYear.toLowerCase() === trimmedYear.toLowerCase()
    );
    if (duplicate) {
      setEditError(`Another academic year with name "${trimmedYear}" already exists.`);
      return;
    }

    setIsUpdating(true);
    const result = await updateAcademicYear(editingYear.id, {
      academicYear: trimmedYear,
      budget: parsedBudget,
      isActive: editIsActive
    });
    setIsUpdating(false);

    if (result.success) {
      setEditingYear(null);
    } else {
      setEditError(result.error || 'Failed to update academic year.');
    }
  };

  // Filtered list
  const filteredYears = (academicYears || []).filter(ay => {
    const matchesSearch = ay.academicYear.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && ay.isActive) ||
      (statusFilter === 'Inactive' && !ay.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout pageTitle="Academic Years">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600, marginBottom: 2 }}>
              INSTITUTIONAL BUDGET CYCLES
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>Academic Years</h1>
            <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
              Define academic calendar years, allocate allocated budgets, and control activation for faculty budget proposals.
            </p>
          </div>
        </div>

        {/* ADD ACADEMIC YEAR FORM CARD */}
        <div className="cbm-card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(68, 60, 222, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarRange size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>Add Academic Year</h3>
              <p style={{ fontSize: 12.5, color: 'var(--dark-muted)' }}>
                Create a new academic cycle and set its departmental budget allocation.
              </p>
            </div>
          </div>

          {addError && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: 13.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 18
              }}
            >
              <AlertCircle size={16} />
              <span>{addError}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <label htmlFor="add-academic-year-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Academic Year <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="add-academic-year-input"
                  placeholder="e.g. 2026-2027"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="add-budget-input" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Budget (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="add-budget-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 500000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Active & Available for Proposals</span>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Plus}
                  isLoading={isAdding}
                  style={{ width: '100%', height: 44 }}
                >
                  Add Academic Year
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* ACADEMIC YEARS TABLE & LIST */}
        <div className="cbm-card" style={{ padding: 'clamp(18px, 3vw, 28px)' }}>
          {/* Controls Bar: Search & Status Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--secondary)' }} />
              <input
                type="text"
                placeholder="Search academic year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 40px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: '#FAF9FE',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)' }}>Filter:</span>
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: statusFilter === status ? 700 : 600,
                    backgroundColor: statusFilter === status ? 'var(--primary)' : 'rgba(0,0,0,0.04)',
                    color: statusFilter === status ? '#FFFFFF' : 'var(--dark-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredYears.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--dark-muted)' }}>
              No academic years found matching your search or filters.
            </div>
          ) : (
            <div className="cbm-table-container">
              <table className="cbm-table">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th style={{ textAlign: 'right' }}>Budget</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredYears.map((ay) => (
                    <tr key={ay.id}>
                      {/* Academic Year */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: ay.isActive ? 'rgba(68, 60, 222, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                              color: ay.isActive ? 'var(--primary)' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13
                            }}
                          >
                            <CalendarRange size={16} />
                          </div>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--dark)' }}>
                              {ay.academicYear}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Budget */}
                      <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, color: 'var(--dark)' }}>
                        ₹{Number(ay.budget).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td>
                        <Badge status={ay.isActive ? 'Active' : 'Inactive'} />
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => toggleAcademicYearStatus(ay.id, !ay.isActive)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              backgroundColor: ay.isActive ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                              color: ay.isActive ? '#EF4444' : '#10B981',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: 12.5,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title={ay.isActive ? 'Deactivate Academic Year' : 'Activate Academic Year'}
                          >
                            {ay.isActive ? <X size={14} /> : <Check size={14} />}
                            <span>{ay.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEdit(ay)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              backgroundColor: '#F1EFFD',
                              color: 'var(--primary)',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: 12.5,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Edit Academic Year Details"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* EDIT ACADEMIC YEAR MODAL */}
        {editingYear && (
          <Modal
            isOpen={!!editingYear}
            onClose={() => setEditingYear(null)}
            title={`Edit Academic Year (${editingYear.academicYear})`}
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {editError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label htmlFor="edit-academic-year-field" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Academic Year <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="edit-academic-year-field"
                  placeholder="e.g. 2026-2027"
                  value={editYearStr}
                  onChange={(e) => setEditYearStr(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-budget-field" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Budget (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  id="edit-budget-field"
                  type="number"
                  min="1"
                  placeholder="e.g. 500000"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--dark)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Active (Allow proposals for this year)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingYear(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isUpdating}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

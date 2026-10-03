import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useBudget } from '../context/BudgetContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import {
  CalendarRange,
  Plus,
  Edit2,
  AlertCircle,
  Search,
  Check,
  X
} from 'lucide-react';

export const AcademicYearsPage = () => {
  const { academicYears, addAcademicYear, updateAcademicYear, toggleAcademicYearStatus, loading } = useBudget();

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>Academic Year Cycles</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Define academic calendar cycles, departmental budget allocations, and active status for proposal submission.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* SECTION 1: CREATE ACADEMIC YEAR FORM */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Create Academic Year Cycle</h2>
              <p className="cbm-section-subtitle">
                Set up a new academic cycle and allocate total departmental budget quota
              </p>
            </div>
          </div>

          {addError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: 12.5,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}
              role="alert"
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{addError}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14, alignItems: 'flex-end' }}>
              <Input
                id="add-academic-year-input"
                label="Academic Year"
                placeholder="e.g. 2026-2027"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                required
              />

              <Input
                id="add-budget-input"
                label="Budget Quota (₹)"
                type="number"
                min="1"
                placeholder="e.g. 500000"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-body)',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Active for Proposals</span>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Plus}
                  isLoading={isAdding}
                  style={{ width: '100%', height: 40 }}
                >
                  Add Year
                </Button>
              </div>
            </div>
          </form>
        </section>

        <hr className="cbm-divider" />

        {/* SECTION 2: ACADEMIC YEARS REGISTER */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Academic Year Cycles Register</h2>
              <p className="cbm-section-subtitle">
                Comprehensive directory of institutional cycles, allocated balances, and submission status
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {filteredYears.length} Cycles Registered
            </div>
          </div>

          {/* Controls Bar: Search & Status Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                placeholder="Search academic year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cbm-input"
                style={{ height: 36, paddingLeft: 32, fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>Filter:</span>
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: statusFilter === status ? 600 : 500,
                    backgroundColor: statusFilter === status ? 'var(--primary)' : 'var(--bg-surface)',
                    color: statusFilter === status ? '#FFFFFF' : 'var(--text-body)',
                    border: statusFilter === status ? '1px solid var(--primary)' : '1px solid var(--border)',
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
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th style={{ textAlign: 'right' }}>Budget Allocation</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={3} />
              ) : (
                <tbody>
                  {filteredYears.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                        No academic years found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredYears.map((ay) => (
                      <tr key={ay.id}>
                        {/* Academic Year */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--slate-100)',
                                border: '1px solid var(--border)',
                                color: 'var(--slate-700)',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            >
                              <CalendarRange size={14} />
                            </div>
                            <div>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>
                                {ay.academicYear}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Budget */}
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 13.5, color: 'var(--text-heading)' }}>
                          ₹{Number(ay.budget).toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td>
                          <Badge status={ay.isActive ? 'Active' : 'Inactive'} />
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            {/* Toggle Active Status */}
                            <button
                              onClick={() => toggleAcademicYearStatus(ay.id, !ay.isActive)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface)',
                                color: ay.isActive ? 'var(--danger-text)' : 'var(--success-text)',
                                border: '1px solid ' + (ay.isActive ? 'var(--danger-border)' : 'var(--success-border)'),
                                fontWeight: 600,
                                fontSize: 11.5,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                              }}
                              title={ay.isActive ? 'Deactivate Academic Year' : 'Activate Academic Year'}
                            >
                              {ay.isActive ? <X size={12} /> : <Check size={12} />}
                              <span>{ay.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            {/* Edit Details */}
                            <button
                              onClick={() => handleOpenEdit(ay)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-body)',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: 11.5,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3
                              }}
                              title="Edit Academic Year Details"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </section>

        {/* EDIT ACADEMIC YEAR MODAL */}
        {editingYear && (
          <Modal
            isOpen={!!editingYear}
            onClose={() => setEditingYear(null)}
            title={`Edit Academic Year (${editingYear.academicYear})`}
            maxWidth="500px"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {editError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    fontSize: 12.5,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{editError}</span>
                </div>
              )}

              <Input
                id="edit-academic-year-field"
                label="Academic Year"
                placeholder="e.g. 2026-2027"
                value={editYearStr}
                onChange={(e) => setEditYearStr(e.target.value)}
                required
              />

              <Input
                id="edit-budget-field"
                label="Budget (₹)"
                type="number"
                min="1"
                placeholder="e.g. 500000"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                required
              />

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-body)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Active (Allow proposals for this academic cycle)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingYear(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
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

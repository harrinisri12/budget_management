import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2, Key, UserCheck, Shield, Award } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { PasswordInput } from '../common/PasswordInput';
import { TableSkeleton } from '../common/Skeleton';
import { AddFacultyForm } from './AddFacultyForm';
import { useBudget } from '../../context/BudgetContext';

export const FacultyList = () => {
  const navigate = useNavigate();
  const { facultyList, deleteFaculty, updateFacultyStatus, updateFacultyPassword, refreshFaculty, loading } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);

  // Add User Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalConfig, setAddModalConfig] = useState({
    initialRole: 'faculty',
    lockRole: true,
    title: 'Add New Faculty Member'
  });

  // Change Password state
  const [passwordFaculty, setPasswordFaculty] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Refresh directory on mount
  useEffect(() => {
    refreshFaculty?.();
  }, [refreshFaculty]);

  const openAddFacultyModal = () => {
    setAddModalConfig({
      initialRole: 'faculty',
      lockRole: true,
      title: 'Add New Faculty Member'
    });
    setAddModalOpen(true);
  };

  const openAddHodModal = () => {
    setAddModalConfig({
      initialRole: 'hod',
      lockRole: false,
      title: 'Add Department Head (HOD)'
    });
    setAddModalOpen(true);
  };

  const openAddAdminModal = () => {
    setAddModalConfig({
      initialRole: 'admin',
      lockRole: false,
      title: 'Add Admin / Budget Coordinator'
    });
    setAddModalOpen(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateFacultyPassword(passwordFaculty.id, newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordFaculty(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (f.name || '').toLowerCase().includes(q) ||
        (f.email || '').toLowerCase().includes(q) ||
        (f.employeeId || '').toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q) ||
        (f.designation || '').toLowerCase().includes(q);

      const normalizedRole = (f.role || 'faculty').toLowerCase();
      const matchesRole =
        roleFilter === 'All' ||
        (roleFilter === 'faculty' && normalizedRole === 'faculty') ||
        (roleFilter === 'hod' && normalizedRole === 'hod') ||
        (roleFilter === 'admin' && normalizedRole === 'admin');

      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [facultyList, searchTerm, roleFilter, statusFilter]);

  const renderRoleBadge = (role) => {
    const r = (role || 'faculty').toLowerCase();
    if (r === 'hod') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            backgroundColor: '#F3E8FF',
            color: '#6B21A8',
            border: '1px solid #E9D5FF'
          }}
        >
          <Award size={12} />
          HOD
        </span>
      );
    }
    if (r === 'admin') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            backgroundColor: 'var(--gold-subtle)',
            color: 'var(--gold-text)',
            border: '1px solid var(--gold-border)'
          }}
        >
          <Shield size={12} />
          Admin (Budget Coordinator)
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 9px',
          borderRadius: 6,
          fontSize: 11.5,
          fontWeight: 600,
          backgroundColor: '#EFF6FF',
          color: '#1D4ED8',
          border: '1px solid #DBEAFE'
        }}
      >
        <UserCheck size={12} />
        Faculty
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header & Centralized User Management CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              DEPARTMENT USER MANAGEMENT
            </span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Faculty & User Directory</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
            Manage departmental faculty roster, Head of Department (HOD), and Budget Coordinators.
          </p>
        </div>

        {/* Action Buttons for User Creation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={openAddHodModal}
          >
            Add HOD
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={openAddAdminModal}
          >
            Add Admin / Budget Coordinator
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddFacultyModal}
          >
            Add Faculty Member
          </Button>
        </div>
      </div>

      {/* Unified Faculty Directory Section */}
      <section className="cbm-section">
        <div className="cbm-section-header">
          <div>
            <h2 className="cbm-section-title">Department Personnel Directory</h2>
            <p className="cbm-section-subtitle">
              Active departmental roster, roles (HOD, Faculty, Admin), institutional email identifiers, and credentials
            </p>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing {filteredFaculty.length} of {facultyList.length} members
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 360 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search by name, email, ID, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 34, paddingLeft: 30, fontSize: 12 }}
            />
          </div>

          {/* Role Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>Role:</span>
            {[
              { label: 'All', value: 'All' },
              { label: 'Faculty', value: 'faculty' },
              { label: 'HOD', value: 'hod' },
              { label: 'Admin (Coordinator)', value: 'admin' }
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11.5,
                  fontWeight: roleFilter === r.value ? 600 : 500,
                  backgroundColor: roleFilter === r.value ? 'var(--primary)' : 'var(--bg-surface)',
                  color: roleFilter === r.value ? '#FFFFFF' : 'var(--text-body)',
                  border: roleFilter === r.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-heading)' }}>Status:</span>
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11.5,
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

        <div className="cbm-table-container">
          <table className="cbm-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Institutional Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Employee ID</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} columns={8} />
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--dark-muted)' }}>
                    No members found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              backgroundColor: f.role === 'hod' ? '#F3E8FF' : f.role === 'admin' ? 'var(--gold-subtle)' : '#EFF6FF',
                              color: f.role === 'hod' ? '#6B21A8' : f.role === 'admin' ? 'var(--gold-text)' : '#1D4ED8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              border: f.role === 'hod' ? '1px solid #E9D5FF' : f.role === 'admin' ? '1px solid var(--gold-border)' : '1px solid #DBEAFE'
                            }}
                          >
                            {(f.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--dark)' }}>{f.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--dark-muted)' }}>{f.phone || 'Phone N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gold-text)', fontWeight: 600, fontSize: 13.5 }}>{f.email}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 4,
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-heading)',
                            fontWeight: 600,
                            fontSize: 12,
                            border: '1px solid var(--border)'
                          }}
                        >
                          CSE
                        </span>
                      </td>
                      <td>
                        {renderRoleBadge(f.role)}
                      </td>
                      <td style={{ fontWeight: 500, fontSize: 13.5 }}>{f.designation}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13, color: 'var(--dark)' }}>
                        {f.employeeId}
                      </td>
                      <td>
                        <Badge status={f.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedFaculty(f)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '6px 8px',
                              color: 'var(--dark)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 500
                            }}
                            title="View Profile"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setPasswordFaculty(f);
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError('');
                            }}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid var(--gold-border)',
                              borderRadius: 6,
                              padding: '6px 8px',
                              color: 'var(--gold-text)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600
                            }}
                            title="Reset Credentials"
                          >
                            <Key size={14} style={{ color: 'var(--gold)' }} />
                            <span>Reset</span>
                          </button>

                          {/* Edit status */}
                          <button
                            onClick={() => setEditFaculty(f)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid var(--border)',
                              borderRadius: 6,
                              padding: '6px 8px',
                              color: 'var(--dark-muted)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 500
                            }}
                            title="Edit Status"
                          >
                            <Edit2 size={14} />
                            <span>Status</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${f.name} from the roster?`)) {
                                deleteFaculty(f.id);
                              }
                            }}
                            style={{
                              background: 'var(--danger-bg)',
                              border: '1px solid rgba(220, 38, 38, 0.2)',
                              borderRadius: 6,
                              padding: '6px 8px',
                              color: 'var(--danger-text)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      {/* Centralized Add Member Modal */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title={addModalConfig.title}
        >
          <AddFacultyForm
            initialRole={addModalConfig.initialRole}
            lockRole={addModalConfig.lockRole}
            onCancel={() => setAddModalOpen(false)}
            onSuccess={() => {
              setAddModalOpen(false);
              refreshFaculty?.();
            }}
          />
        </Modal>
      )}

      {/* View Faculty Detail Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={!!selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          title="Personnel Record"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  backgroundColor: 'var(--gold)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 20
                }}
              >
                {(selectedFaculty.name || 'U').charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>{selectedFaculty.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {renderRoleBadge(selectedFaculty.role)}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: 13, color: 'var(--gold-text)', fontWeight: 600 }}>{selectedFaculty.designation}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Employee ID</p>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace', marginTop: 2 }}>{selectedFaculty.employeeId}</p>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Department</p>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Computer Science and Engineering (CSE)</p>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Institutional Email</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold-text)', wordBreak: 'break-all', marginTop: 2 }}>{selectedFaculty.email}</p>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Contact Phone</p>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{selectedFaculty.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Status</p>
                <div style={{ marginTop: 4 }}>
                  <Badge status={selectedFaculty.status} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: 'var(--dark-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date Joined</p>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{selectedFaculty.joinedDate || (selectedFaculty.created_at ? new Date(selectedFaculty.created_at).toLocaleDateString() : 'N/A')}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <Button variant="outline" onClick={() => setSelectedFaculty(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Status Quick Modal */}
      {editFaculty && (
        <Modal
          isOpen={!!editFaculty}
          onClose={() => setEditFaculty(null)}
          title={`Edit Status: ${editFaculty.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 13.5, color: 'var(--dark-muted)' }}>
              Update administrative roster status for member <strong style={{ color: 'var(--dark)' }}>{editFaculty.employeeId}</strong>.
            </p>
            <div className="cbm-input-group">
              <label className="cbm-label">Status</label>
              <select
                className="cbm-select"
                defaultValue={editFaculty.status}
                id="edit-status-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <Button variant="outline" onClick={() => setEditFaculty(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const val = document.getElementById('edit-status-select').value;
                  updateFacultyStatus(editFaculty.id, val);
                  setEditFaculty(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {passwordFaculty && (
        <Modal
          isOpen={!!passwordFaculty}
          onClose={() => {
            setPasswordFaculty(null);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
          }}
          title={`Reset Password: ${passwordFaculty.name}`}
        >
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 13.5, color: 'var(--dark-muted)' }}>
              Set a new account password for employee <strong style={{ color: 'var(--dark)' }}>{passwordFaculty.employeeId}</strong> ({passwordFaculty.email}).
            </p>

            {passwordError && (
              <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(220, 38, 38, 0.2)', color: 'var(--danger-text)', fontSize: 13, fontWeight: 600 }}>
                {passwordError}
              </div>
            )}

            <PasswordInput
              label="New Password"
              placeholder="Enter at least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordFaculty(null);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

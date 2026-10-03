import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2, Key } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { PasswordInput } from '../common/PasswordInput';
import { TableSkeleton } from '../common/Skeleton';
import { useBudget } from '../../context/BudgetContext';

export const FacultyList = () => {
  const navigate = useNavigate();
  const { facultyList, deleteFaculty, updateFacultyStatus, updateFacultyPassword, loading } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);

  // Change Password state
  const [passwordFaculty, setPasswordFaculty] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
      const matchesSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [facultyList, searchTerm, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Primary CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              DEPARTMENT FACULTY ROSTER
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>CSE Faculty Directory</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage teaching faculty, designations, employee IDs, and account access credentials.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/faculty/add')}
        >
          Add Faculty Member
        </Button>
      </div>

      <hr className="cbm-divider" />

      {/* Unified Faculty Directory Section */}
      <section className="cbm-section">
        <div className="cbm-section-header">
          <div>
            <h2 className="cbm-section-title">Faculty Member Directory</h2>
            <p className="cbm-section-subtitle">
              Active departmental roster, institutional email identifiers, and status records
            </p>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing {filteredFaculty.length} of {facultyList.length} faculty members
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 400 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search by faculty name, email, employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 38, paddingLeft: 34, fontSize: 12.5 }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>Status:</span>
            {['All', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
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

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Institutional Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Employee ID</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--dark-muted)' }}>
                      No faculty members found matching your search criteria.
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
                              backgroundColor: 'var(--gold-subtle)',
                              color: 'var(--gold-text)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              border: '1px solid var(--gold-border)'
                            }}
                          >
                            {f.name.charAt(0)}
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
                            title="View Faculty Profile"
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
                            title="Delete Faculty"
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
        )}
      </section>

      {/* View Faculty Detail Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={!!selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          title="Faculty Profile Record"
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
                {selectedFaculty.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>{selectedFaculty.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--gold-text)', fontWeight: 600 }}>{selectedFaculty.designation}</p>
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
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{selectedFaculty.joinedDate || '12 Aug 2021'}</p>
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
              Update administrative roster status for faculty member <strong style={{ color: 'var(--dark)' }}>{editFaculty.employeeId}</strong>.
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


import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useBudget } from '../../context/BudgetContext';

export const FacultyList = () => {
  const navigate = useNavigate();
  const { facultyList, deleteFaculty, updateFacultyStatus } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [editFaculty, setEditFaculty] = useState(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header & Primary CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600, marginBottom: 2 }}>
            CSE DEPARTMENT FACULTY ROSTER
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>CSE Faculty Directory</h2>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/faculty/add')}
        >
          Add Faculty
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="cbm-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Search Box */}
          <div className="cbm-input-wrapper" style={{ gridColumn: 'span 2' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--secondary)' }} />
            <input
              type="text"
              placeholder="Search CSE faculty name, email, employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 44, paddingLeft: 38, fontSize: 14 }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cbm-select"
            style={{ height: 44, fontSize: 14 }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Faculty Table Card */}
      <div className="cbm-card" style={{ padding: '24px' }}>
        <div className="cbm-table-container">
          <table className="cbm-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Email</th>
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--secondary)' }}>
                    No CSE faculty members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#F1EFFD',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14
                          }}
                        >
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--dark)' }}>{f.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--secondary)' }}>{f.phone || 'Phone N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 500 }}>{f.email}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#F1EFFD',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        CSE
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{f.designation}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{f.employeeId}</td>
                    <td>
                      <Badge status={f.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedFaculty(f)}
                          style={{
                            background: '#F1EFFD',
                            border: 'none',
                            borderRadius: 6,
                            padding: 6,
                            color: 'var(--primary)',
                            cursor: 'pointer'
                          }}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit status */}
                        <button
                          onClick={() => setEditFaculty(f)}
                          style={{
                            background: '#F8F7FF',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            padding: 6,
                            color: 'var(--dark-muted)',
                            cursor: 'pointer'
                          }}
                          title="Edit Faculty"
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${f.name}?`)) {
                              deleteFaculty(f.id);
                            }
                          }}
                          style={{
                            background: 'var(--danger-bg)',
                            border: 'none',
                            borderRadius: 6,
                            padding: 6,
                            color: 'var(--danger-text)',
                            cursor: 'pointer'
                          }}
                          title="Delete Faculty"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Faculty Detail Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={!!selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          title="CSE Faculty Profile Card"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#F8F7FF', borderRadius: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 22
                }}
              >
                {selectedFaculty.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedFaculty.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{selectedFaculty.designation}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>EMPLOYEE ID</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{selectedFaculty.employeeId}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>DEPARTMENT</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Computer Science and Engineering (CSE)</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>INSTITUTION EMAIL</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>{selectedFaculty.email}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>PHONE</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{selectedFaculty.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>STATUS</p>
                <Badge status={selectedFaculty.status} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>JOINED DATE</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{selectedFaculty.joinedDate || '12 Aug 2021'}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Status Quick Modal */}
      {editFaculty && (
        <Modal
          isOpen={!!editFaculty}
          onClose={() => setEditFaculty(null)}
          title={`Edit Status for ${editFaculty.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--dark-muted)' }}>
              Update active status for employee <strong style={{ color: 'var(--dark)' }}>{editFaculty.employeeId}</strong>.
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
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
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Briefcase, BadgeCheck, Phone, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { Input } from '../common/Input';
import { PasswordInput } from '../common/PasswordInput';
import { Button } from '../common/Button';
import { useBudget } from '../../context/BudgetContext';

const FORM_DEPARTMENTS = ['Computer Science and Engineering (CSE)'];

// Exactly 3 application roles
export const APPLICATION_ROLES = [
  { value: 'faculty', label: 'Faculty' },
  { value: 'hod', label: 'HOD' },
  { value: 'admin', label: 'Admin (Budget Coordinator)' }
];

const DESIGNATIONS_BY_ROLE = {
  faculty: ['Assistant Professor', 'Associate Professor', 'Professor'],
  hod: ['Department Head / HOD'],
  admin: ['Budget Coordinator', 'Chief Budget Administrator']
};

export const AddFacultyForm = ({ initialRole = 'faculty', lockRole = false, onCancel, onSuccess }) => {
  const navigate = useNavigate();
  const { addFaculty } = useBudget();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science and Engineering (CSE)',
    role: lockRole ? 'faculty' : (initialRole || 'faculty'),
    designation: initialRole === 'hod' ? 'Department Head / HOD' : initialRole === 'admin' ? 'Budget Coordinator' : 'Assistant Professor',
    employeeId: '',
    phone: '',
    password: 'kongu@123',
    confirmPassword: 'kongu@123',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initialRole or lockRole changes
  useEffect(() => {
    const effectiveRole = lockRole ? 'faculty' : (initialRole || 'faculty');
    setFormData(prev => ({
      ...prev,
      role: effectiveRole,
      designation: effectiveRole === 'hod' ? 'Department Head / HOD' : effectiveRole === 'admin' ? 'Budget Coordinator' : 'Assistant Professor'
    }));
  }, [initialRole, lockRole]);

  // Handle role switch (when unlocked)
  const handleRoleChange = (e) => {
    if (lockRole) return;
    const newRole = e.target.value;
    const defaultDesig = newRole === 'hod' ? 'Department Head / HOD' : newRole === 'admin' ? 'Budget Coordinator' : 'Assistant Professor';
    setFormData(prev => ({
      ...prev,
      role: newRole,
      designation: defaultDesig
    }));
  };

  // Live email validation helper
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));

    if (value.trim() && !value.trim().toLowerCase().endsWith('@kongu.edu')) {
      setErrors(prev => ({ ...prev, email: 'Please use a valid Kongu email address (@kongu.edu).' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Institutional Email is required.';
    } else if (!formData.email.trim().toLowerCase().endsWith('@kongu.edu')) {
      newErrors.email = 'Please use a valid Kongu email address (@kongu.edu).';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const assignedRole = lockRole ? 'faculty' : formData.role;
      const result = await addFaculty({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        role: assignedRole,
        designation: formData.designation,
        employeeId: formData.employeeId.trim(),
        phone: formData.phone?.trim() || '',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        status: formData.status
      });

      setIsSubmitting(false);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.faculty);
        } else if (onCancel) {
          onCancel();
        } else {
          navigate('/faculty');
        }
      } else {
        setErrors({ email: result.error });
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ email: err.message || 'Failed to add user account.' });
    }
  };

  const getSubmitLabel = () => {
    if (lockRole || formData.role === 'faculty') return 'Add Faculty Member';
    if (formData.role === 'hod') return 'Add HOD';
    return 'Add Admin / Budget Coordinator';
  };

  const currentDesignations = DESIGNATIONS_BY_ROLE[formData.role] || DESIGNATIONS_BY_ROLE.faculty;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
        {/* Full Name */}
        <Input
          label="Full Name"
          required
          placeholder="Enter name (e.g. Dr. Suresh K)"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Institutional Email */}
        <Input
          label="Institutional Email"
          required
          type="email"
          placeholder="username@kongu.edu"
          icon={Mail}
          value={formData.email}
          onChange={handleEmailChange}
          error={errors.email}
          helperText="Must be an institutional @kongu.edu address"
        />

        {/* Role Selection (Locked for Add Faculty workflow, 3 options for general flow) */}
        <div className="cbm-input-group">
          <label className="cbm-label">
            Application Role <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div className="cbm-input-wrapper">
            <div style={{ position: 'absolute', left: 16, color: lockRole ? 'var(--dark-muted)' : 'var(--secondary)', pointerEvents: 'none' }}>
              {lockRole ? <Lock size={18} /> : <ShieldCheck size={18} />}
            </div>
            {lockRole ? (
              <input
                type="text"
                readOnly
                disabled
                value="Faculty (Auto-assigned)"
                className="cbm-input"
                style={{
                  paddingLeft: 44,
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-heading)',
                  cursor: 'not-allowed',
                  fontWeight: 600
                }}
              />
            ) : (
              <select
                className="cbm-select"
                style={{ paddingLeft: 44 }}
                value={formData.role}
                onChange={handleRoleChange}
              >
                {APPLICATION_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            )}
          </div>
          {lockRole ? (
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Role is automatically locked to Faculty for this workflow.
            </p>
          ) : (
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
              Select one of the 3 supported application roles.
            </p>
          )}
        </div>

        {/* Department (Only CSE) */}
        <div className="cbm-input-group">
          <label className="cbm-label">
            Department <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div className="cbm-input-wrapper">
            <div style={{ position: 'absolute', left: 16, color: 'var(--secondary)', pointerEvents: 'none' }}>
              <Building size={18} />
            </div>
            <select
              className="cbm-select"
              style={{ paddingLeft: 44 }}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              {FORM_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Designation */}
        <div className="cbm-input-group">
          <label className="cbm-label">
            Designation <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div className="cbm-input-wrapper">
            <div style={{ position: 'absolute', left: 16, color: 'var(--secondary)', pointerEvents: 'none' }}>
              <Briefcase size={18} />
            </div>
            <select
              className="cbm-select"
              style={{ paddingLeft: 44 }}
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            >
              {currentDesignations.map(desig => (
                <option key={desig} value={desig}>{desig}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee ID */}
        <Input
          label="Employee / Faculty ID"
          required
          placeholder={formData.role === 'admin' ? 'e.g. ADM005' : formData.role === 'hod' ? 'e.g. HOD001' : 'e.g. FAC007'}
          icon={BadgeCheck}
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          error={errors.employeeId}
        />

        {/* Phone Number */}
        <Input
          label="Phone Number"
          placeholder="Enter phone number (+91...)"
          icon={Phone}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        {/* Default Password */}
        <PasswordInput
          label="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          helperText="Default initial password: kongu@123"
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
        />

        {/* Status */}
        <div className="cbm-input-group">
          <label className="cbm-label">Status</label>
          <select
            className="cbm-select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Buttons Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          marginTop: 10
        }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCancel || (() => navigate('/faculty'))}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          icon={CheckCircle2}
        >
          {getSubmitLabel()}
        </Button>
      </div>
    </form>
  );
};

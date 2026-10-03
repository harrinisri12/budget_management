import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ArrowLeft, ShieldCheck, User, Mail, Building, Briefcase, BadgeCheck, Phone, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';

const ADMIN_DEPARTMENTS = ['Computer Science and Engineering (CSE)'];
const ADMIN_ROLES = [
  'CSE Budget Administrator',
  'Department Head / HOD',
  'System Administrator',
  'Associate Budget Officer'
];

export const AddAdminPage = () => {
  const navigate = useNavigate();
  const { showToast } = useBudget();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science and Engineering (CSE)',
    role: 'CSE Budget Administrator',
    employeeId: '',
    phone: '',
    password: 'kongu@123',
    confirmPassword: 'kongu@123',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      newErrors.name = 'Administrator Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Administrator Email is required.';
    } else if (!formData.email.trim().toLowerCase().endsWith('@kongu.edu')) {
      newErrors.email = 'Please use a valid Kongu email address (@kongu.edu).';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee / Admin ID is required.';
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
      // Simulate submission without altering database schema
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsSubmitting(false);
      showToast?.(`Administrator ${formData.name.trim()} added successfully!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setIsSubmitting(false);
      setErrors({ email: err.message || 'Failed to add administrator.' });
    }
  };

  return (
    <DashboardLayout pageTitle="Add Administrator">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--dark)',
            fontWeight: 600,
            fontSize: 13.5,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Card Form Container */}
        <div className="cbm-card" style={{ padding: 'clamp(18px, 3vw, 32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)' }}>Add New Administrator</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Register a new administrator account with administrative privileges
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20 }}>
              {/* Admin Name */}
              <Input
                label="Administrator Name"
                required
                placeholder="Enter full name (e.g. Dr. R. Malathi)"
                icon={User}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />

              {/* Admin Email */}
              <Input
                label="Administrator Email"
                required
                type="email"
                placeholder="adminname@kongu.edu"
                icon={Mail}
                value={formData.email}
                onChange={handleEmailChange}
                error={errors.email}
                helperText="Must be an institutional @kongu.edu address"
              />

              {/* Department */}
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
                    {ADMIN_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role / Designation */}
              <div className="cbm-input-group">
                <label className="cbm-label">
                  Role / Designation <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="cbm-input-wrapper">
                  <div style={{ position: 'absolute', left: 16, color: 'var(--secondary)', pointerEvents: 'none' }}>
                    <Briefcase size={18} />
                  </div>
                  <select
                    className="cbm-select"
                    style={{ paddingLeft: 44 }}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {ADMIN_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee ID */}
              <Input
                label="Employee / Admin ID"
                required
                placeholder="Enter ID (e.g. ADM005)"
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
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon={CheckCircle2}
              >
                Add Admin
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

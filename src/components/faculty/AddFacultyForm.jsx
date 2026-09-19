import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Briefcase, BadgeCheck, Phone, CheckCircle2 } from 'lucide-react';
import { Input } from '../common/Input';
import { PasswordInput } from '../common/PasswordInput';
import { Button } from '../common/Button';
import { FORM_DEPARTMENTS, DESIGNATIONS } from '../../data/mockData';
import { useBudget } from '../../context/BudgetContext';

export const AddFacultyForm = ({ onCancel }) => {
  const navigate = useNavigate();
  const { addFaculty } = useBudget();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science and Engineering (CSE)',
    designation: 'Assistant Professor',
    employeeId: `FAC00${Math.floor(Math.random() * 90 + 10)}`,
    phone: '',
    password: 'kongu@123',
    confirmPassword: 'kongu@123',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live email validation helper
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));

    if (value.trim() && !value.trim().toLowerCase().endsWith('@kongu.edu')) {
      setErrors(prev => ({ ...prev, email: 'Please use a valid Kongu email address.' }));
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Faculty Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Faculty Email is required.';
    } else if (!formData.email.trim().toLowerCase().endsWith('@kongu.edu')) {
      newErrors.email = 'Please use a valid Kongu email address.';
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

    setTimeout(() => {
      const result = addFaculty({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        designation: formData.designation,
        employeeId: formData.employeeId,
        phone: formData.phone || '+91 98765 43210',
        status: formData.status
      });

      setIsSubmitting(false);

      if (result.success) {
        if (onCancel) {
          onCancel();
        } else {
          navigate('/faculty');
        }
      } else {
        setErrors({ email: result.error });
      }
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Faculty Name */}
        <Input
          label="Faculty Name"
          required
          placeholder="Enter faculty name (e.g. Dr. Suresh K)"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        {/* Faculty Email */}
        <Input
          label="Faculty Email"
          required
          type="email"
          placeholder="facultyname@kongu.edu"
          icon={Mail}
          value={formData.email}
          onChange={handleEmailChange}
          error={errors.email}
          helperText="Must be an institutional @kongu.edu address"
        />

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
              {DESIGNATIONS.map(desig => (
                <option key={desig} value={desig}>{desig}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee ID */}
        <Input
          label="Employee ID"
          required
          placeholder="Enter employee ID (e.g. FAC007)"
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
          helperText="Default password: kongu@123"
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
          Add Faculty
        </Button>
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle, ArrowRight } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'CSEA Association',
  'CCC Coding Club',
  'Lab & Equipment',
  'Technical Workshop',
  'Department Maintenance',
  'Academic Research'
];

export const NewProposalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateProposalId, addProposal, getFacultyMetrics, categories } = useBudget();

  const categoryOptions = categories && categories.length > 0
    ? categories.map((c) => c.name)
    : DEFAULT_CATEGORIES;

  // Faculty balance metrics
  const metrics = getFacultyMetrics(user?.email);
  const currentAvailableBalance = metrics.remainingBalance; // Or baseline 150000

  // Automatically generated ID and Current Date
  const [proposalId] = useState(() => generateProposalId());
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);
  const [proposalDateStr] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));

  // Form fields
  const [category, setCategory] = useState(categoryOptions[0] || 'CSEA Association');
  const [title, setTitle] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [guestDetails, setGuestDetails] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live financial calculations
  const parsedAmount = Number(proposedAmount) || 0;
  const remainingBalance = currentAvailableBalance - parsedAmount;
  const isOverBudget = parsedAmount > currentAvailableBalance;

  // Format program date for display e.g. 2026-09-25 -> 25 Sep 2026
  const formatDisplayDate = (dateIso) => {
    if (!dateIso) return '';
    const d = new Date(dateIso);
    return isNaN(d.getTime())
      ? dateIso
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter the Program / Proposal Title.');
      return;
    }
    if (!programDate) {
      setError('Please select the Date of Program.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Please enter a valid proposed amount greater than ₹0.');
      return;
    }
    if (isOverBudget) {
      setError('Insufficient available balance. Proposed amount exceeds your remaining balance.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addProposal({
        id: proposalId,
        proposalDate: proposalDateStr,
        facultyName: user?.name || 'Faculty Member',
        facultyEmail: user?.email || 'faculty@kongu.edu',
        category,
        title: title.trim(),
        programDate,
        guestDetails: guestDetails.trim() || 'None',
        amount: parsedAmount
      });

      setIsSubmitting(false);

      if (result.success) {
        navigate('/faculty/proposals');
      } else {
        setError(result.error || 'Failed to submit proposal. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Error submitting proposal.');
    }
  };

  return (
    <FacultyLayout pageTitle="New Budget Proposal">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>New Budget Proposal</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
            Submit a proposal for an upcoming CSE department activity.
          </p>
        </div>

        {/* Form & Summary Container */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, alignItems: 'start' }}>
          {/* Main Form Card */}
          <div className="cbm-card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Error Alert */}
              {error && (
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Automatic Metadata Fields (Read-Only) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Proposal ID <span style={{ color: 'var(--primary)', fontSize: 11 }}>(Auto-Generated)</span>
                  </label>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: '#F8F7FD',
                      border: '1px solid var(--border)',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      fontSize: 14.5
                    }}
                  >
                    {proposalId || 'Generating...'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                    Date of Proposal <span style={{ color: 'var(--secondary)', fontSize: 11 }}>(Auto System Date)</span>
                  </label>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      backgroundColor: '#F8F7FD',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      color: 'var(--dark)',
                      fontSize: 14
                    }}
                  >
                    {proposalDateStr}
                  </div>
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Category <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: 'var(--dark)',
                    outline: 'none'
                  }}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Program / Proposal Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  placeholder="Enter program title e.g. CSEA Technical Symposium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Date of Program */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Date of Program <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  min={todayIso}
                  value={programDate}
                  onChange={(e) => setProgramDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14.5,
                    fontWeight: 500,
                    color: 'var(--dark)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Guest Details (Optional) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)' }}>Guest Details</label>
                  <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>Optional</span>
                </div>
                <textarea
                  placeholder="Enter guest name, designation, organization, etc. e.g. Dr. Arun Kumar, Senior Software Engineer, ABC Technologies"
                  value={guestDetails}
                  onChange={(e) => setGuestDetails(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14,
                    color: 'var(--dark)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Proposed Amount */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 6 }}>
                  Proposed Amount (₹) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter amount in ₹ e.g. 35000"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                  required
                />
              </div>

              {/* Live Financial Calculation Box */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: 14,
                  backgroundColor: isOverBudget ? 'rgba(239, 68, 68, 0.06)' : 'rgba(68, 60, 222, 0.05)',
                  border: isOverBudget ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(68, 60, 222, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Live Financial Calculation
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--dark)' }}>
                  <span>Available Balance:</span>
                  <span style={{ fontWeight: 700 }}>₹{currentAvailableBalance.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--dark)' }}>
                  <span>Proposed Amount:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{parsedAmount.toLocaleString('en-IN')}</span>
                </div>

                <div
                  style={{
                    borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    fontWeight: 800,
                    color: isOverBudget ? '#EF4444' : '#10B981'
                  }}
                >
                  <span>Remaining Balance:</span>
                  <span>₹{remainingBalance.toLocaleString('en-IN')}</span>
                </div>

                {isOverBudget && (
                  <div style={{ fontSize: 12.5, color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertCircle size={16} /> Insufficient available balance.
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isOverBudget || isSubmitting}
                icon={ArrowRight}
                style={{ height: 50, fontSize: 16, marginTop: 8 }}
              >
                Submit Proposal
              </Button>
            </form>
          </div>

          {/* Live Proposal Summary Card */}
          <div className="cbm-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>
              Proposal Summary Preview
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--dark-muted)', marginBottom: 20 }}>
              Live summary automatically updated as you fill in details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposal ID</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{proposalId}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Date of Proposal</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{proposalDateStr}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>{category}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Program Title</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>{title || '—'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Date of Program</span>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{formatDisplayDate(programDate) || '—'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Guest Details</span>
                <p style={{ fontSize: 13.5, color: 'var(--dark-muted)', marginTop: 2 }}>{guestDetails.trim() || 'None'}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Available Balance</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>₹{currentAvailableBalance.toLocaleString('en-IN')}</p>
              </div>

              <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposed Amount</span>
                <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>₹{parsedAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Remaining Balance</span>
                <p style={{ fontSize: 16, fontWeight: 800, color: isOverBudget ? '#EF4444' : '#10B981', marginTop: 2 }}>
                  ₹{remainingBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
};

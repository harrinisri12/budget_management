import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Save, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { LegalModal } from '../components/common/LegalModal';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useBudget();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  const handleSave = (e) => {
    e.preventDefault();
    showToast?.('Administrative system preferences saved successfully.', 'success');
  };

  const openLegal = (tab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <DashboardLayout pageTitle="System Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 840 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              ADMINISTRATIVE PREFERENCES
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>System Settings & Profile</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage administrative account parameters and institutional compliance guidelines.
          </p>
        </div>

        <hr className="cbm-divider" />

        <form onSubmit={handleSave} className="cbm-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--gold-border)' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>Administrator Profile</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Kongu Engineering College CSE Budget Officer credentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
              <Input
                label="Administrator Full Name"
                defaultValue={user?.name || 'Dr. Suresh Kumar'}
              />
              <Input
                label="Institutional Email"
                defaultValue={user?.email || 'admin@kongu.edu'}
                disabled
                helperText="Email address is governed by Kongu domain policy."
              />
              <Input
                label="Academic Department"
                defaultValue="Computer Science and Engineering (CSE)"
                disabled
              />
              <Input
                label="Institution Name"
                defaultValue="Kongu Engineering College"
                disabled
              />
            </div>

            <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => openLegal('privacy')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                >
                  Privacy Policy
                </button>
                <span style={{ color: 'var(--border)' }}>|</span>
                <button
                  type="button"
                  onClick={() => openLegal('terms')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                >
                  Terms of Governance
                </button>
              </div>

              <Button type="submit" variant="primary" icon={Save}>
                Save Preferences
              </Button>
            </div>
          </div>
        </form>

        <LegalModal
          isOpen={legalModalOpen}
          onClose={() => setLegalModalOpen(false)}
          defaultTab={legalTab}
        />
      </div>
    </DashboardLayout>
  );
};


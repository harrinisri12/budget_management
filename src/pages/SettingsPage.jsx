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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              ADMINISTRATIVE PREFERENCES
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>System Settings & Profile</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
            Manage administrative account parameters and institutional compliance guidelines.
          </p>
        </div>

        <form onSubmit={handleSave} className="cbm-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--gold-border)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Administrator Profile</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Kongu Engineering College CSE Budget Officer credentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
              <Input
                label="Administrator Full Name"
                defaultValue={user?.name || 'Administrator'}
              />
              <Input
                label="Institutional Email"
                defaultValue={user?.email || ''}
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

            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, fontSize: 12.5 }}>
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

              <Button type="submit" variant="primary" icon={Save} style={{ height: 38, padding: '0 18px', fontSize: 13 }}>
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


import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout pageTitle="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>CSE System Settings & Profile</h2>
          <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Manage administrative account settings and CSE fiscal parameters</p>
        </div>

        <div className="cbm-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>CSE Administrator Profile</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Administrator Name" defaultValue={user?.name || 'CSE Chief Budget Administrator'} />
            <Input label="Institutional Email" defaultValue={user?.email || 'admin@kongu.edu'} disabled helperText="Email address is governed by Kongu domain policy." />
            <Input label="Department" defaultValue="Computer Science and Engineering (CSE)" disabled />
            <Input label="Institution Name" defaultValue="Kongu Engineering College" disabled />

            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={Save} onClick={() => alert('CSE Settings saved successfully!')}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

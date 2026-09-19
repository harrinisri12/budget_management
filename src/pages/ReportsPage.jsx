import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ReportsPage = () => {
  const reports = [
    { name: 'CSE Department Budget Audit FY 2026-27', type: 'PDF / Excel', date: '15 Sep 2026', size: '2.4 MB' },
    { name: 'CSEA Association Symposium Financial Statement', type: 'PDF Audit', date: '01 Sep 2026', size: '1.8 MB' },
    { name: 'CCC Coding Club Hackathon & Prize Audit', type: 'CSV Format', date: '20 Aug 2026', size: '1.1 MB' },
    { name: 'CSE High-Performance GPU Lab Maintenance', type: 'Official PDF', date: '10 Aug 2026', size: '2.9 MB' }
  ];

  return (
    <DashboardLayout pageTitle="CSE Reports & Audits">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>CSE Department Financial Reports</h2>
          <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Generate and download CSE departmental budget statements for institutional audits</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {reports.map((r, i) => (
            <div key={i} className="cbm-card cbm-card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1EFFD', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</h4>
                  <span style={{ fontSize: 12, color: 'var(--secondary)' }}>{r.type} • {r.size}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--dark-muted)' }}>Generated: {r.date}</span>
                <Button variant="outline" style={{ height: 36, fontSize: 12, padding: '0 12px' }} onClick={() => alert(`Downloading ${r.name}...`)}>
                  <Download size={14} /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';

export const ReportsPage = () => {
  const { showToast } = useBudget();

  const reports = [
    { name: 'CSE Department Budget Audit FY 2026-27', type: 'PDF / Excel Format', date: '15 Sep 2026', size: '2.4 MB', code: 'AUD-CSE-26-01' },
    { name: 'CSEA Association Symposium Financial Statement', type: 'PDF Audit Dossier', date: '01 Sep 2026', size: '1.8 MB', code: 'CSEA-STMT-09' },
    { name: 'CCC Coding Club Hackathon & Prize Audit', type: 'CSV Spreadsheet', date: '20 Aug 2026', size: '1.1 MB', code: 'CCC-AUD-08' },
    { name: 'CSE High-Performance GPU Lab Maintenance', type: 'Institutional PDF', date: '10 Aug 2026', size: '2.9 MB', code: 'LAB-MAINT-26' }
  ];

  const handleDownload = (reportName) => {
    showToast?.(`Preparing download: ${reportName}...`, 'info');
  };

  return (
    <DashboardLayout pageTitle="CSE Reports & Audits">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              OFFICIAL FINANCIAL AUDITS & DOSSIERS
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>CSE Department Financial Reports</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Generate and download CSE departmental budget statements for institutional audits and accreditation.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* Audit Documents Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Institutional Audit Documents</h2>
              <p className="cbm-section-subtitle">
                Accreditation filings, quarterly balance sheets, and laboratory maintenance audit statements
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {reports.length} Statements Ready
            </div>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Audit Code</th>
                  <th>Document Title & Description</th>
                  <th>File Type</th>
                  <th>File Size</th>
                  <th>Generated Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', color: 'var(--slate-700)', fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>
                        {r.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        {r.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-body)', fontWeight: 500, fontSize: 12.5 }}>
                      {r.type}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {r.size}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                      {r.date}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        style={{ height: 32, fontSize: 12, padding: '0 10px', gap: 4 }}
                        onClick={() => handleDownload(r.name)}
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};


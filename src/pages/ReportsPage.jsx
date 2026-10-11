import React, { useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Download, FileSpreadsheet, Building } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';

export const ReportsPage = () => {
  const { categories, proposals, transactions, facultyList, activeAcademicYear, showToast } = useBudget();
  const ayLabel = activeAcademicYear?.name || activeAcademicYear?.academicYear || 'Current Session';
  const ayId = activeAcademicYear?.id;

  // Filter proposals & categories for active academic year
  const activeProposals = useMemo(() => {
    return (proposals || []).filter(p => {
      if (!ayId && !activeAcademicYear) return true;
      return (
        (ayId && (p.academicYearId === ayId || p.academic_year_id === ayId)) ||
        (p.academicYear && (p.academicYear === ayLabel || p.academicYear === activeAcademicYear?.academicYear || p.academicYear === activeAcademicYear?.name))
      );
    });
  }, [proposals, ayId, ayLabel, activeAcademicYear]);

  const activeCategories = useMemo(() => {
    if (activeAcademicYear?.categories && activeAcademicYear.categories.length > 0) {
      return activeAcademicYear.categories;
    }
    return (categories || []).filter(c => !ayId || c.academic_year_id === ayId || c.academicYearId === ayId);
  }, [categories, ayId, activeAcademicYear]);

  // Actual faculty members (strictly faculty and hod roles per schema requirements)
  const facultyMembers = useMemo(() => {
    return (facultyList || []).filter(f => {
      const role = (f.role || '').toLowerCase();
      return role === 'faculty' || role === 'hod';
    });
  }, [facultyList]);

  // Utility to download CSV
  const triggerDownload = (filename, csvContent) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast?.(`Downloaded ${filename} successfully.`, 'success');
  };

  // Report 1: Category Budget Allocation Worksheet
  const downloadCategoryAllocationReport = () => {
    const headers = ['Category / Unit', 'Allocated Quota (INR)', 'Disbursed Amount (INR)', 'Remaining Balance (INR)', 'Utilization %', 'Proposals Count'];
    const rows = activeCategories.map(cat => {
      const allocated = Number(cat.allocated_amount || cat.budget || 0);
      const catProps = activeProposals.filter(p =>
        (p.categoryId === cat.id) ||
        (p.category && p.category.toLowerCase() === (cat.name || '').toLowerCase())
      );
      const spentFromProps = catProps.filter(p => p.status === 'Approved').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const spent = spentFromProps > 0 ? spentFromProps : Number(cat.spent_amount || 0);
      const remaining = Math.max(0, allocated - spent);
      const util = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0';
      return [
        `"${(cat.name || '').replace(/"/g, '""')}"`,
        allocated,
        spent,
        remaining,
        `${util}%`,
        catProps.length
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`KEC_CSE_Budget_Allocation_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  // Report 2: Comprehensive Proposals Audit Dossier
  const downloadProposalsAuditReport = () => {
    const headers = ['Proposal ID', 'Program Title', 'Category', 'Subcategory', 'Faculty Name', 'Faculty Email', 'Proposed Amount (INR)', 'Status', 'Proposal Date', 'Program Date', 'Academic Year', 'Admin Remarks'];
    const rows = activeProposals.map(p => {
      return [
        `"${(p.proposalNumber || p.proposalId || p.id || '').toString().replace(/"/g, '""')}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.subCategory || p.sub_category || '').replace(/"/g, '""')}"`,
        `"${(p.facultyName || p.faculty_name || '').replace(/"/g, '""')}"`,
        `"${(p.facultyEmail || p.faculty_email || '').replace(/"/g, '""')}"`,
        Number(p.amount || 0),
        `"${p.status || 'Pending'}"`,
        `"${p.proposalDate || p.proposal_date || ''}"`,
        `"${p.programDate || p.program_date || ''}"`,
        `"${p.academicYear || ayLabel}"`,
        `"${(p.adminRemarks || p.admin_remarks || '').replace(/"/g, '""')}"`
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`KEC_CSE_Proposals_Audit_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  // Report 3: Financial Transactions Ledger
  const downloadTransactionsLedgerReport = () => {
    const headers = ['Transaction ID', 'Date', 'Description', 'Category', 'Amount (INR)', 'Type', 'Status', 'Requested By', 'Vendor', 'Reference'];
    const rows = (transactions || []).map(t => {
      return [
        `"${(t.id || t.transaction_number || t.dbId || '').toString().replace(/"/g, '""')}"`,
        `"${t.date || t.transaction_date || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        Number(t.amount || 0),
        `"${t.type || 'Expense'}"`,
        `"${t.status || 'Completed'}"`,
        `"${(t.requestedBy || '').replace(/"/g, '""')}"`,
        `"${(t.vendor || '').replace(/"/g, '""')}"`,
        `"${(t.reference || t.proposalId || '').toString().replace(/"/g, '""')}"`
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`KEC_CSE_Transactions_Ledger_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  // Report 4: Faculty Roster & Activity Summary
  const downloadFacultyRosterReport = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Designation', 'Department', 'Status', 'Proposals Submitted', 'Total Approved (INR)'];
    const rows = facultyMembers.map(f => {
      const facProps = (proposals || []).filter(p =>
        (p.facultyEmail && f.email && p.facultyEmail.toLowerCase() === f.email.toLowerCase()) ||
        (p.facultyId && f.id && p.facultyId === f.id)
      );
      const approvedSum = facProps.filter(p => p.status === 'Approved').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return [
        `"${(f.employeeId || f.employee_id || '').toString().replace(/"/g, '""')}"`,
        `"${(f.name || '').replace(/"/g, '""')}"`,
        `"${(f.email || '').replace(/"/g, '""')}"`,
        `"${(f.displayRole || (f.role === 'hod' ? 'HOD' : 'Faculty')).toUpperCase()}"`,
        `"${(f.designation || '').replace(/"/g, '""')}"`,
        `"${(f.department || 'Computer Science and Engineering (CSE)').replace(/"/g, '""')}"`,
        `"${f.status || 'Active'}"`,
        facProps.length,
        approvedSum
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`KEC_CSE_Faculty_Roster_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  const reports = [
    {
      code: 'AUD-CSE-01',
      name: `CSE Department Budget Allocation Statement (${ayLabel})`,
      description: 'Departmental category quotas, disbursed allocations, remaining balances, and utilization ratios.',
      recordsCount: `${activeCategories.length} Categories`,
      type: 'CSV Spreadsheet',
      action: downloadCategoryAllocationReport
    },
    {
      code: 'AUD-CSE-02',
      name: `Department Activity Proposals & Approvals Dossier (${ayLabel})`,
      description: 'All submitted, approved, pending, and rejected faculty proposals with budget breakdowns and remarks.',
      recordsCount: `${activeProposals.length} Proposals`,
      type: 'CSV Spreadsheet',
      action: downloadProposalsAuditReport
    },
    {
      code: 'AUD-CSE-03',
      name: 'Financial Ledger & Expenditure Audit Statement',
      description: 'Real-time transaction history, disbursements, reference proposal numbers, and date ledger.',
      recordsCount: `${(transactions || []).length} Transactions`,
      type: 'CSV Spreadsheet',
      action: downloadTransactionsLedgerReport
    },
    {
      code: 'AUD-CSE-04',
      name: 'Faculty Member Roster & Grant Summary',
      description: 'Official department faculty roster, designations, roles, total proposals logged, and approved funds.',
      recordsCount: `${facultyMembers.length} Faculty Members`,
      type: 'CSV Spreadsheet',
      action: downloadFacultyRosterReport
    }
  ];

  return (
    <DashboardLayout pageTitle="CSE Reports & Audits">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Building size={16} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.05em' }}>
              OFFICIAL FINANCIAL AUDITS & EXPORTS • {ayLabel}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>CSE Department Financial Reports</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Generate and export official departmental financial audit statements, proposal dossiers, and budget quota ledgers.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* Audit Documents Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Institutional Audit Documents & Dossiers</h2>
              <p className="cbm-section-subtitle">
                Accreditation filings, quarterly balance sheets, proposals records, and laboratory maintenance statements
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
                  <th>Format</th>
                  <th>Database Records</th>
                  <th style={{ textAlign: 'right' }}>Export Action</th>
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
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.description}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-body)', fontWeight: 500, fontSize: 12.5 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <FileSpreadsheet size={14} style={{ color: 'var(--primary)' }} />
                        <span>{r.type}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12.5, fontWeight: 600 }}>
                      {r.recordsCount}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                        onClick={r.action}
                      >
                        <Download size={13} />
                        <span>Export CSV</span>
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



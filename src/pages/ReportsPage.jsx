import React, { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Download,
  FileSpreadsheet,
  Building,
  Printer,
  Table as TableIcon,
  Grid,
  FileText,
  Layers
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useBudget } from '../context/BudgetContext';
import {
  getFourYearPeriods,
  calculateTable981,
  calculateTable982,
  prepareCriteria9Ledger,
  formatNumberIndian,
  STANDARD_NBA_ITEMS
} from '../utils/reportCalculations';
import {
  exportCriteria9LedgerToExcel,
  exportCriteria9LedgerToCsv,
  exportTable981ToExcel,
  exportTable982ToExcel
} from '../utils/reportExport';
import { exportProposalsToExcel } from '../utils/excelExport';
import { Criteria9BillLedger } from '../components/reports/Criteria9BillLedger';
import { Table981Summary } from '../components/reports/Table981Summary';
import { Table982Matrix } from '../components/reports/Table982Matrix';

export const ReportsPage = () => {
  const {
    categories,
    proposals,
    academicYears,
    activeAcademicYear,
    facultyList,
    showToast
  } = useBudget();

  // Tab State: 'LEDGER' (Image 1), 'TABLE_981' (Image 3), 'TABLE_982' (Image 2), 'CONSOLIDATED', 'RAW_AUDITS'
  const [activeTab, setActiveTab] = useState('LEDGER');

  // Selected Academic Year ID (defaults to activeAcademicYear)
  const [selectedAyId, setSelectedAyId] = useState(() => activeAcademicYear?.id || '');

  // Filters for Criteria 9 Detailed Ledger
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Student metrics override (stored in localStorage for persistence)
  const [studentMetrics, setStudentMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem('cbm_nba_student_metrics');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateMetrics = useCallback((ayLabel, metrics) => {
    setStudentMetrics((prev) => {
      const updated = {
        ...prev,
        [ayLabel]: {
          ...(prev[ayLabel] || {}),
          ...metrics
        }
      };
      try {
        localStorage.setItem('cbm_nba_student_metrics', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save metrics to localStorage:', e);
      }
      return updated;
    });
    showToast?.(`Updated metrics for ${ayLabel}.`, 'success');
  }, [showToast]);

  // Currently selected academic year object
  const currentAy = useMemo(() => {
    if (!selectedAyId && activeAcademicYear) return activeAcademicYear;
    return (academicYears || []).find((ay) => ay.id === selectedAyId) || activeAcademicYear || {
      name: '2025 - 2026',
      academicYear: '2025-2026',
      startYear: 2025
    };
  }, [selectedAyId, academicYears, activeAcademicYear]);

  const ayLabel = currentAy?.academicYear || currentAy?.name || '2025-2026';

  // 4 Financial Year Periods (CFY, CFYm1, CFYm2, CFYm3)
  const fourYearPeriods = useMemo(() => {
    return getFourYearPeriods(currentAy, academicYears || []);
  }, [currentAy, academicYears]);

  // Compute Table 9.8.1 Data (Summary of Budget and Actual Expenditure)
  const table981Data = useMemo(() => {
    return calculateTable981({
      periods: fourYearPeriods,
      proposals: proposals || [],
      categories: categories || [],
      studentMetrics
    });
  }, [fourYearPeriods, proposals, categories, studentMetrics]);

  // Compute Table 9.8.2 Data (Multi-Year Matrix)
  const table982Data = useMemo(() => {
    return calculateTable982({
      periods: fourYearPeriods,
      proposals: proposals || [],
      categories: categories || []
    });
  }, [fourYearPeriods, proposals, categories]);

  // Compute Criteria-9 Detailed Program Bill Ledger (Reference Image 1)
  const ledgerData = useMemo(() => {
    return prepareCriteria9Ledger({
      proposals: proposals || [],
      activeAcademicYear: currentAy,
      selectedCategory,
      selectedSubcategory,
      statusFilter
    });
  }, [proposals, currentAy, selectedCategory, selectedSubcategory, statusFilter]);

  // Category options for dropdown
  const categoryOptions = useMemo(() => {
    const set = new Set();
    (categories || []).forEach((c) => {
      if (c.name) set.add(c.name);
    });
    (proposals || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    STANDARD_NBA_ITEMS.forEach((item) => set.add(item));
    return Array.from(set);
  }, [categories, proposals]);

  // Subcategory options based on selected category
  const subcategoryOptions = useMemo(() => {
    const set = new Set();
    (proposals || []).forEach((p) => {
      const sub = p.subCategory || p.eventDetails?.subCategoryName;
      if (sub) set.add(sub);
    });
    return Array.from(set);
  }, [proposals]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (activeTab === 'LEDGER') {
      exportCriteria9LedgerToExcel({
        rows: ledgerData.rows,
        totalAmount: ledgerData.totalAmount,
        academicYearLabel: ayLabel,
        categoryTitle: selectedCategory !== 'ALL' ? selectedCategory : 'Department Association'
      });
      showToast?.('Exported Criteria-9 Ledger to Excel.', 'success');
    } else if (activeTab === 'TABLE_981') {
      exportTable981ToExcel(table981Data);
      showToast?.('Exported Table 9.8.1 to Excel.', 'success');
    } else if (activeTab === 'TABLE_982') {
      exportTable982ToExcel({
        periods: fourYearPeriods,
        rows: table982Data.rows,
        totals: table982Data.totals
      });
      showToast?.('Exported Table 9.8.2 Matrix to Excel.', 'success');
    } else if (activeTab === 'CONSOLIDATED') {
      // Export all in sequential files or ledger
      exportCriteria9LedgerToExcel({
        rows: ledgerData.rows,
        totalAmount: ledgerData.totalAmount,
        academicYearLabel: ayLabel,
        categoryTitle: 'Consolidated Criteria-9'
      });
      showToast?.('Exported Consolidated Criteria-9 Report to Excel.', 'success');
    }
  };

  const handleExportCsv = () => {
    exportCriteria9LedgerToCsv({
      rows: ledgerData.rows,
      totalAmount: ledgerData.totalAmount,
      academicYearLabel: ayLabel,
      categoryTitle: selectedCategory !== 'ALL' ? selectedCategory : 'Association Expenses'
    });
    showToast?.('Exported Criteria-9 Ledger CSV.', 'success');
  };

  // Legacy CSV Exports for RAW_AUDITS Tab
  const triggerLegacyDownload = (filename, csvContent) => {
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

  const downloadCategoryAllocationReport = () => {
    const headers = ['Category / Unit', 'Allocated Quota (INR)', 'Disbursed Amount (INR)', 'Remaining Balance (INR)', 'Utilization %', 'Proposals Count'];
    const rows = (categories || []).map((cat) => {
      const allocated = Number(cat.allocated_amount || cat.budget || 0);
      const spent = Number(cat.spent_amount || 0);
      const remaining = Math.max(0, allocated - spent);
      const util = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : '0';
      return [`"${(cat.name || '').replace(/"/g, '""')}"`, allocated, spent, remaining, `${util}%`, 0];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerLegacyDownload(`KEC_CSE_Budget_Allocation_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  const downloadProposalsAuditReport = () => {
    const headers = ['Proposal ID', 'Program Title', 'Category', 'Subcategory', 'Faculty Name', 'Amount (INR)', 'Status', 'Program Date'];
    const rows = (proposals || []).map((p) => {
      return [
        `"${p.proposalNumber || p.id}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.subCategory || '').replace(/"/g, '""')}"`,
        `"${(p.facultyName || '').replace(/"/g, '""')}"`,
        Number(p.settlementAmount ?? p.amount ?? 0),
        `"${p.status || 'Approved'}"`,
        `"${p.programDate || ''}"`
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    triggerLegacyDownload(`KEC_CSE_Proposals_Audit_${ayLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`, csv);
  };

  return (
    <DashboardLayout pageTitle="CSE Reports & NBA Criteria-9">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Top Header */}
        <div className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Building size={15} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.05em' }}>
              NATIONAL BOARD OF ACCREDITATION (NBA) • SAR CRITERION 9
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.01em' }}>
                Department Budget Allocation & Expenditure Reports
              </h1>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, marginBottom: 0 }}>
                Official Self Assessment Report (SAR) Criteria 9 tables, multi-year utilization matrices, and itemized bill ledgers.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>CFY Incurred Expenses</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'monospace' }}>
                  ₹ {formatNumberIndian(table981Data[0]?.actualExpenditure || ledgerData.totalAmount)}
                </span>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Program Bills Logged</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--gold-text)' }}>
                  {ledgerData.count} Invoices
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="nba-report-tabs no-print">
          <button
            type="button"
            className={`nba-tab-btn ${activeTab === 'LEDGER' ? 'active' : ''}`}
            onClick={() => setActiveTab('LEDGER')}
          >
            <FileText size={14} />
            <span>Criteria-9 Bill Ledger (Image 1)</span>
          </button>

          <button
            type="button"
            className={`nba-tab-btn ${activeTab === 'TABLE_981' ? 'active' : ''}`}
            onClick={() => setActiveTab('TABLE_981')}
          >
            <TableIcon size={14} />
            <span>Table 9.8.1: Summary (Image 3)</span>
          </button>

          <button
            type="button"
            className={`nba-tab-btn ${activeTab === 'TABLE_982' ? 'active' : ''}`}
            onClick={() => setActiveTab('TABLE_982')}
          >
            <Grid size={14} />
            <span>Table 9.8.2: 4-Year Matrix (Image 2)</span>
          </button>

          <button
            type="button"
            className={`nba-tab-btn ${activeTab === 'CONSOLIDATED' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONSOLIDATED')}
          >
            <Layers size={14} />
            <span>Full SAR Institutional Dossier</span>
          </button>

          <button
            type="button"
            className={`nba-tab-btn ${activeTab === 'RAW_AUDITS' ? 'active' : ''}`}
            onClick={() => setActiveTab('RAW_AUDITS')}
          >
            <FileSpreadsheet size={14} />
            <span>CSV Data Audits</span>
          </button>
        </div>

        {/* Global Filter & Action Toolbar */}
        <div className="nba-filter-panel no-print">
          <div className="nba-filter-controls">
            {/* Academic Year Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                Academic Year (CFY)
              </label>
              <select
                className="nba-filter-select"
                value={selectedAyId}
                onChange={(e) => setSelectedAyId(e.target.value)}
              >
                {(academicYears || []).map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name || ay.academicYear} {ay.isActive ? '• (Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter (Active for Ledger view) */}
            {(activeTab === 'LEDGER' || activeTab === 'CONSOLIDATED') && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                  Expenditure Category
                </label>
                <select
                  className="nba-filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="ALL">All Categories / Full Department</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subcategory / SDG Filter */}
            {activeTab === 'LEDGER' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                  Subcategory / SDG
                </label>
                <select
                  className="nba-filter-select"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="ALL">All Subcategories</option>
                  {subcategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            {activeTab === 'LEDGER' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                  Settlement Status
                </label>
                <select
                  className="nba-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Proposals & Invoices</option>
                  <option value="SETTLED_ONLY">Settled Invoices Only</option>
                  <option value="APPROVED_ONLY">Approved & Settled</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Export Buttons */}
          <div className="nba-action-btns">
            <Button
              variant="outline"
              style={{ height: 34, fontSize: 12, padding: '0 12px', gap: 6 }}
              onClick={handlePrint}
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </Button>

            {activeTab !== 'RAW_AUDITS' && (
              <>
                <Button
                  variant="primary"
                  style={{ height: 34, fontSize: 12, padding: '0 12px', gap: 6 }}
                  onClick={handleExportExcel}
                >
                  <FileSpreadsheet size={13} />
                  <span>Export Excel (.xlsx)</span>
                </Button>

                <Button
                  variant="outline"
                  style={{ height: 34, fontSize: 12, padding: '0 12px', gap: 6 }}
                  onClick={handleExportCsv}
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ==========================================================================
            RENDER SELECTED TAB
            ========================================================================== */}

        {/* TAB 1: Criteria-9 Detailed Program Bill Ledger (Reference Image 1) */}
        {activeTab === 'LEDGER' && (
          <Criteria9BillLedger
            ledgerData={ledgerData}
            academicYearLabel={ayLabel}
            categoryTitle={selectedCategory !== 'ALL' ? `${selectedCategory} Expenses` : 'Association Expenses'}
            subTitle={selectedCategory === 'ALL' || selectedCategory.toLowerCase().includes('association') || selectedCategory.toLowerCase().includes('sdg')
              ? 'Sustainable Development Goals (SDG)'
              : `${selectedCategory} Ledger`}
          />
        )}

        {/* TAB 2: Table 9.8.1 Summary (Reference Image 3 & Image 2 top) */}
        {activeTab === 'TABLE_981' && (
          <Table981Summary
            tableData={table981Data}
            onUpdateMetrics={handleUpdateMetrics}
          />
        )}

        {/* TAB 3: Table 9.8.2 Multi-Year Matrix (Reference Image 2 bottom) */}
        {activeTab === 'TABLE_982' && (
          <Table982Matrix
            periods={fourYearPeriods}
            matrixData={table982Data}
          />
        )}

        {/* TAB 4: Consolidated Institutional SAR Dossier (All 3 Views Combined) */}
        {activeTab === 'CONSOLIDATED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Table981Summary
              tableData={table981Data}
              onUpdateMetrics={handleUpdateMetrics}
              editable={false}
            />

            <Table982Matrix
              periods={fourYearPeriods}
              matrixData={table982Data}
            />

            <Criteria9BillLedger
              ledgerData={ledgerData}
              academicYearLabel={ayLabel}
              categoryTitle="Association Expenses"
              subTitle="Sustainable Development Goals (SDG)"
            />
          </div>
        )}

        {/* TAB 5: Raw CSV Audits & Department Dossiers (Legacy Utility) */}
        {activeTab === 'RAW_AUDITS' && (
          <section className="cbm-section no-print">
            <div className="cbm-section-header">
              <div>
                <h2 className="cbm-section-title">Institutional Raw Data Files & Audit Ledgers</h2>
                <p className="cbm-section-subtitle">
                  Raw tabular exports for college auditor filings, proposals dossiers, and budget quota statements
                </p>
              </div>
            </div>

            <div className="cbm-table-container">
              <table className="cbm-table">
                <thead>
                  <tr>
                    <th>Audit Code</th>
                    <th>Document Title & Description</th>
                    <th>Format</th>
                    <th style={{ textAlign: 'right' }}>Export Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>
                        EXCEL-01
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        Official Proposals &amp; Settlements Register ({ayLabel})
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Official 9-column Microsoft Excel spreadsheet containing Reference Number, Category, Subcategory, Faculty Name, Event Name, Proposed Amount, Settlement Amount, Proposal Status, and Settlement Status.
                      </div>
                    </td>
                    <td>Microsoft Excel (.xlsx)</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                        onClick={() => {
                          const res = exportProposalsToExcel(proposals, ayLabel, { facultyList });
                          if (res?.success) showToast?.(`Exported ${res.count} records to ${res.filename}.`, 'success');
                        }}
                      >
                        <FileSpreadsheet size={13} /> Export Excel
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>
                        NBA-SAR-01
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        Criteria-9 Detailed Bill Ledger ({ayLabel})
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Itemized program dates, titles, bill dates, and settlement expenditure ledger.
                      </div>
                    </td>
                    <td>SpreadsheetML (.xlsx) / CSV</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                        onClick={handleExportCsv}
                      >
                        <Download size={13} /> Export CSV
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>
                        NBA-SAR-02
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        Category Budget Allocation Statement ({ayLabel})
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Allocated quotas, disbursed amounts, and balance ledger.
                      </div>
                    </td>
                    <td>CSV Spreadsheet</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                        onClick={downloadCategoryAllocationReport}
                      >
                        <Download size={13} /> Export CSV
                      </Button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace' }}>
                        NBA-SAR-03
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                        Proposals & Approvals Dossier ({ayLabel})
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Submitted, approved, and settled proposals list with amounts and remarks.
                      </div>
                    </td>
                    <td>CSV Spreadsheet</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="primary"
                        style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                        onClick={downloadProposalsAuditReport}
                      >
                        <Download size={13} /> Export CSV
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

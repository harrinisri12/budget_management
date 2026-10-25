import React, { useState } from 'react';
import { formatNumberIndian } from '../../utils/reportCalculations';
import { Edit3, Check, RotateCcw } from 'lucide-react';

export const Table981Summary = ({
  tableData = [],
  onUpdateMetrics,
  editable = true
}) => {
  const [editingYear, setEditingYear] = useState(null);
  const [editForm, setEditForm] = useState({ demanded: '', students: '' });

  const startEdit = (row) => {
    setEditingYear(row.academicYear);
    setEditForm({
      demanded: row.demandedBudget,
      students: row.studentCount
    });
  };

  const saveEdit = (row) => {
    if (onUpdateMetrics) {
      onUpdateMetrics(row.academicYear, {
        demanded: Number(editForm.demanded),
        students: Number(editForm.students)
      });
    }
    setEditingYear(null);
  };

  const cancelEdit = () => {
    setEditingYear(null);
  };

  return (
    <div className="nba-report-document" id="table981-summary-doc">
      {/* Official Section Headings matching Image 3 */}
      <div className="nba-nba-criteria-header">
        <h2 className="nba-main-criteria-title">
          3 Budget Allocation, Utilization, and Public Accounting at Institute level (12)
        </h2>
        <h3 className="nba-sub-criteria-title">
          Program Specific Budget Allocation, Utilization (08)
        </h3>
        <p className="nba-criteria-note">
          (Total budget at program level: CFYm1, CFYm2 & CFYm3 CFY=Current Financial Year. CFYm1=Current Financial Year Minus 1. CFYm2=Current Financial Year Minus 2. CFYm3=Current Financial Year Minus 3.)
        </p>
        <div className="nba-table-name-badge">
          Table No.9.8.1: Summary of budget and actual expenditure incurred at program level.
        </div>
      </div>

      {/* 4-Year Summary Cards matching Image 3 and Image 2 top */}
      <div className="nba-summary-tables-container">
        {tableData.map((row) => {
          const isEditing = editingYear === row.academicYear;

          return (
            <div key={row.academicYear} className="nba-year-summary-card">
              <div className="nba-year-header-strip">
                <span className="nba-year-label">{row.title}</span>
                {editable && (
                  <div className="nba-edit-actions no-print">
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          type="button"
                          className="nba-mini-btn save"
                          onClick={() => saveEdit(row)}
                          title="Save Changes"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          type="button"
                          className="nba-mini-btn cancel"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="nba-mini-btn edit"
                        onClick={() => startEdit(row)}
                        title="Edit Demanded / Student Strength"
                      >
                        <Edit3 size={12} /> Adjust Parameters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <table className="nba-formal-table">
                <thead>
                  <tr>
                    <th colSpan={2} style={{ width: '32%', textAlign: 'center' }}>
                      Total Budget in {row.periodLabel}:
                    </th>
                    <th colSpan={2} style={{ width: '32%', textAlign: 'center' }}>
                      Actual expenditure in {row.periodLabel}:
                    </th>
                    <th rowSpan={2} style={{ width: '18%', textAlign: 'center' }}>
                      Total No. of students in {row.periodLabel}:
                    </th>
                    <th rowSpan={2} style={{ width: '18%', textAlign: 'center' }}>
                      Expenditure per student
                    </th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'center', width: '16%' }}>Demanded</th>
                    <th style={{ textAlign: 'center', width: '16%' }}>Actual Allocated</th>
                    <th style={{ textAlign: 'center', width: '20%' }}>Actual Expenditure</th>
                    <th style={{ textAlign: 'center', width: '12%' }}>%Spent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* Demanded */}
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {isEditing ? (
                        <input
                          type="number"
                          className="nba-inline-input"
                          value={editForm.demanded}
                          onChange={(e) => setEditForm({ ...editForm, demanded: e.target.value })}
                        />
                      ) : (
                        formatNumberIndian(row.demandedBudget)
                      )}
                    </td>

                    {/* Actual Allocated */}
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatNumberIndian(row.allocatedBudget)}
                    </td>

                    {/* Actual Expenditure */}
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {formatNumberIndian(row.actualExpenditure)}
                    </td>

                    {/* % Spent */}
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>
                      <span className={`nba-pct-badge ${row.percentSpent > 100 ? 'high' : 'normal'}`}>
                        {row.percentSpent}%
                      </span>
                    </td>

                    {/* Total Students */}
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {isEditing ? (
                        <input
                          type="number"
                          className="nba-inline-input"
                          value={editForm.students}
                          onChange={(e) => setEditForm({ ...editForm, students: e.target.value })}
                        />
                      ) : (
                        formatNumberIndian(row.studentCount)
                      )}
                    </td>

                    {/* Expenditure per student */}
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
                      ₹ {formatNumberIndian(row.expenditurePerStudent)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Verification Signatures */}
      <div className="nba-signoff-block">
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Compiled By</div>
          <div className="nba-sign-role">SAR Criterion 9 Committee</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Verified By</div>
          <div className="nba-sign-role">Budget Officer / HOD</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Forwarded By</div>
          <div className="nba-sign-role">Principal</div>
        </div>
      </div>
    </div>
  );
};

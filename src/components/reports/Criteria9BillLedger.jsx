import React from 'react';
import { formatNumberIndian } from '../../utils/reportCalculations';
import logoSvg from '../../assets/logo.svg';

export const Criteria9BillLedger = ({
  ledgerData,
  academicYearLabel = '2025-2026',
  categoryTitle = 'Association Expenses',
  subTitle = 'Sustainable Development Goals (SDG)'
}) => {
  const { rows = [], totalAmount = 0 } = ledgerData || {};

  return (
    <div className="nba-report-document" id="criteria9-bill-ledger-doc">
      {/* Official Institutional Header matching Image 1 */}
      <div className="nba-doc-header">
        <div className="nba-doc-brand">
          <div className="nba-logo-container">
            <img src={logoSvg} alt="KEC Logo" className="nba-logo-img" />
          </div>
          <div className="nba-header-text">
            <h1 className="nba-college-name">KONGU ENGINEERING COLLEGE</h1>
            <p className="nba-college-tagline">(Autonomous) • PERUNDURAI, ERODE - 638 060</p>
            <p className="nba-college-motto">“TRANSFORM YOURSELF”</p>
          </div>
        </div>

        <div className="nba-doc-titles">
          <h2 className="nba-dept-title">DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</h2>
          <div className="nba-criteria-badge">CRITERIA-9</div>
          <h3 className="nba-expense-title">
            {categoryTitle} {academicYearLabel}
          </h3>
          <p className="nba-subtitle">{subTitle}</p>
        </div>
      </div>

      {/* Table matching Reference Image 1 */}
      <div className="nba-table-wrapper">
        <table className="nba-audit-table">
          <thead>
            <tr>
              <th style={{ width: '5%', textAlign: 'center' }}>S.No</th>
              <th style={{ width: '22%', textAlign: 'left' }}>ProgramDate</th>
              <th style={{ width: '38%', textAlign: 'left' }}>Program Detail</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Bill Date</th>
              <th style={{ width: '12%', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '8%', textAlign: 'center' }} className="nba-tag-col">SDG</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                  No program expense or settled bills recorded for the selected period and category.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.sNo}>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.sNo}</td>
                  <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>{row.programDate}</td>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {row.programDetail}
                    </div>
                    {row.facultyName && (
                      <div className="nba-subtext">Coordinator: {row.facultyName}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{row.billDate}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatNumberIndian(row.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }} className="nba-tag-col">
                    <span className="nba-sdg-pill">{row.sdgTag || 'SDG-9'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="nba-total-row">
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>
                Total Incurred Expenditure:
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                {rows.length} {rows.length === 1 ? 'Record' : 'Records'}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: 13.5 }}>
                ₹ {formatNumberIndian(totalAmount)}
              </td>
              <td className="nba-tag-col"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Official Verification Sign-off Footer */}
      <div className="nba-signoff-block">
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Prepared By</div>
          <div className="nba-sign-role">Faculty Coordinator</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Verified By</div>
          <div className="nba-sign-role">Budget Coordinator</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Approved By</div>
          <div className="nba-sign-role">Head of Department (CSE)</div>
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

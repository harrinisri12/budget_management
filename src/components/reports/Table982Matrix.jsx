import React from 'react';
import { formatNumberIndian } from '../../utils/reportCalculations';

export const Table982Matrix = ({
  periods = [],
  matrixData = {}
}) => {
  const { rows = [], totals = {} } = matrixData;

  return (
    <div className="nba-report-document" id="table982-matrix-doc">
      {/* Title matching Image 2 */}
      <div className="nba-matrix-header">
        <h2 className="nba-table-name-badge" style={{ fontSize: 13, marginBottom: 12 }}>
          Table No.9.8.2: Budget and actual expenditure incurred at program level.
        </h2>
      </div>

      <div className="nba-table-wrapper">
        <table className="nba-audit-table nba-matrix-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: '22%', textAlign: 'left', verticalAlign: 'middle' }}>
                Items
              </th>
              {periods.map((p) => (
                <th
                  key={p.code}
                  colSpan={2}
                  style={{ textAlign: 'center', borderBottom: '1px solid #A1A1AA' }}
                >
                  {p.shortLabel || p.academicYear}
                </th>
              ))}
            </tr>
            <tr>
              {periods.map((p) => (
                <React.Fragment key={p.code}>
                  <th style={{ textAlign: 'right', fontSize: 11, width: '9.5%' }}>
                    Budgeted in {p.code}
                  </th>
                  <th style={{ textAlign: 'right', fontSize: 11, width: '10%' }}>
                    {p.code === 'CFY' ? 'Actual expenses in CFY (till ...)' : `Actual Expenses in ${p.code}`}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.item} className={idx % 2 === 1 ? 'nba-zebra-row' : ''}>
                <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                  {r.item}
                </td>
                {periods.map((p) => {
                  const d = r.yearData[p.code] || { budgeted: 0, actual: 0 };
                  return (
                    <React.Fragment key={p.code}>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {formatNumberIndian(d.budgeted)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 500 }}>
                        {formatNumberIndian(d.actual)}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="nba-total-row">
              <td style={{ fontWeight: 700, textAlign: 'left' }}>
                Total
              </td>
              {periods.map((p) => {
                const t = totals[p.code] || { budgeted: 0, actual: 0 };
                return (
                  <React.Fragment key={p.code}>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatNumberIndian(t.budgeted)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                      {formatNumberIndian(t.actual)}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Verification Block */}
      <div className="nba-signoff-block">
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Prepared By</div>
          <div className="nba-sign-role">Budget Officer</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Verified By</div>
          <div className="nba-sign-role">Head of Department (CSE)</div>
        </div>
        <div className="nba-signee">
          <div className="nba-sign-line"></div>
          <div className="nba-sign-title">Approved By</div>
          <div className="nba-sign-role">Principal</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { Badge } from '../components/common/Badge';
import { CSEA_DETAILS } from '../data/mockData';
import { Users, Calendar, Trophy, Sparkles, Award } from 'lucide-react';

export const CSEAPage = () => {
  return (
    <DashboardLayout pageTitle="CSEA Association">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Unit Title Header */}
        <div className="cbm-card" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(68, 60, 222, 0.3)'
              }}
            >
              <Users size={28} />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                CSE DEPARTMENT STUDENT ASSOCIATION
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>
                {CSEA_DETAILS.fullName} ({CSEA_DETAILS.name})
              </h2>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', lineHeight: 1.6, maxWidth: 850 }}>
            {CSEA_DETAILS.description}
          </p>

          <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>FACULTY IN-CHARGE: </span>
              <strong style={{ color: 'var(--dark)' }}>{CSEA_DETAILS.facultyInCharge}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>STUDENT PRESIDENT: </span>
              <strong style={{ color: 'var(--dark)' }}>{CSEA_DETAILS.studentPresident}</strong>
            </div>
          </div>
        </div>

        {/* CSEA Budget KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          <StatCard
            title="Allocated Budget"
            amount={CSEA_DETAILS.allocated}
            supportingText="Annual CSEA FY 2026-27 Quota"
            icon={Trophy}
            color="#443CDE"
          />
          <StatCard
            title="Amount Spent"
            amount={CSEA_DETAILS.spent}
            supportingText="71.1% of allocated funds utilized"
            icon={Calendar}
            color="#10B981"
          />
          <StatCard
            title="Remaining Balance"
            amount={CSEA_DETAILS.remaining}
            supportingText="Available for Q4 activities"
            icon={Award}
            color="#F59E0B"
          />
        </div>

        {/* Recent Activities & Events Table */}
        <div className="cbm-card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>CSEA Key Activities & Expenditure</h3>
            <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Recent symposiums, workshops, and guest lectures hosted by CSEA</p>
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Activity Event Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Expense Disbursed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CSEA_DETAILS.activities.map((act, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                        <span>{act.title}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: '#F1EFFD', color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>
                        {act.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--dark-muted)' }}>{act.date}</td>
                    <td style={{ fontWeight: 700 }}>₹{act.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <Badge status={act.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CSE_UNITS_OVERVIEW } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { Download, Sparkles } from 'lucide-react';

export const BudgetOverviewPage = () => {
  return (
    <DashboardLayout pageTitle="CSE Budget Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>CSE Department Unit Allocations</h2>
            <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Annual budget quotas and utilization ratios across CSE activity units & labs</p>
          </div>
          <button className="cbm-btn cbm-btn-outline" onClick={() => alert('Downloading CSE department budget quota sheet...')}>
            <Download size={16} /> Export CSE Quota Sheet
          </button>
        </div>

        {/* Table Card */}
        <div className="cbm-card" style={{ padding: 24 }}>
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>CSE Activity Unit / Category</th>
                  <th>Faculty In-Charge</th>
                  <th>Allocated Quota</th>
                  <th>Amount Spent</th>
                  <th>Utilization %</th>
                  <th>Events / Assets</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CSE_UNITS_OVERVIEW.map((item) => (
                  <tr key={item.unit}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--primary)' }}>
                        <Sparkles size={16} />
                        <span>{item.unit}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.head}</td>
                    <td style={{ fontWeight: 700 }}>₹{item.allocated.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--dark-muted)' }}>₹{item.spent.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, width: 80, borderRadius: 3, backgroundColor: '#F1EFFD', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.utilization}%`, backgroundColor: item.utilization > 70 ? 'var(--warning)' : 'var(--primary)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{item.utilization}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.eventsCount}</td>
                    <td>
                      <Badge status="Active" />
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

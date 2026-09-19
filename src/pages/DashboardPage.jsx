import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { BudgetChart } from '../components/dashboard/BudgetChart';
import { AllocationCard } from '../components/dashboard/AllocationCard';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { useBudget } from '../context/BudgetContext';
import { Wallet, PieChart, TrendingUp, DollarSign } from 'lucide-react';

export const DashboardPage = () => {
  const { kpis } = useBudget();

  return (
    <DashboardLayout pageTitle="CSE Department Budget Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
          <StatCard
            title="Total CSE Budget"
            amount={kpis.totalBudget}
            supportingText="CSE Annual Academic FY 2026-27"
            icon={Wallet}
            color="#443CDE"
          />

          <StatCard
            title="Allocated"
            amount={kpis.allocated}
            supportingText="74.3% of Total CSE Budget allocated"
            icon={PieChart}
            color="#635BFF"
          />

          <StatCard
            title="Spent"
            amount={kpis.spent}
            supportingText="68.4% of Allocated spent"
            icon={TrendingUp}
            color="#10B981"
          />

          <StatCard
            title="Remaining"
            amount={kpis.remaining}
            supportingText="Unallocated + Unspent CSE balance"
            icon={DollarSign}
            color="#F59E0B"
          />
        </div>

        {/* Charts and Allocations Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <BudgetChart />
          </div>
          <div>
            <AllocationCard />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div>
          <TransactionTable />
        </div>
      </div>
    </DashboardLayout>
  );
};

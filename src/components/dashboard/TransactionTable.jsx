import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Eye, FileDown } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TableSkeleton } from '../common/Skeleton';
import { TransactionDetailModal } from './TransactionDetailModal';
import { useBudget } from '../../context/BudgetContext';

const STATUS_OPTIONS = ['All Statuses', 'Approved', 'Pending', 'Rejected'];

export const TransactionTable = () => {
  const { transactions, categories, loading } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const categoryFilterOptions = useMemo(() => {
    const fromCats = categories && categories.length > 0 ? categories.map(c => c.name) : [];
    const fromTxns = transactions.map(t => t.category).filter(Boolean);
    const unique = Array.from(new Set([...fromCats, ...fromTxns]));
    return ['All Categories', ...unique];
  }, [categories, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch =
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'All Categories' || txn.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All Statuses' || txn.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    }).sort((a, b) => {
      if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Table Title & Filter Controls Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)' }}>Transaction Journal & Audit Trail</span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Financial disbursements and departmental expenditure records</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => alert('Exporting CSE departmental audit report (CSV)...')}
              className="cbm-btn cbm-btn-outline cbm-btn-sm"
            >
              <FileDown size={14} />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: 10 }}>
          {/* Search Box */}
          <div className="cbm-input-wrapper">
            <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search ID, purpose, faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 36, paddingLeft: 32, fontSize: 12.5 }}
            />
          </div>

          {/* Activity Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cbm-select"
            style={{ height: 36, fontSize: 12.5 }}
          >
            {categoryFilterOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="cbm-select"
            style={{ height: 36, fontSize: 12.5 }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort Button */}
          <button
            onClick={() => toggleSort('amount')}
            className="cbm-btn cbm-btn-outline"
            style={{ height: 36, fontSize: 12.5, justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={14} /> Amount
            </span>
            <span>{sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="cbm-table-container">
        <table className="cbm-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer' }}>
                Date {sortField === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Department</th>
              <th>Category</th>
              <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                Amount {sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{txn.date}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: 3,
                          backgroundColor: 'var(--slate-100)',
                          color: 'var(--slate-700)',
                          border: '1px solid var(--border)',
                          fontWeight: 600,
                          fontSize: 11
                        }}
                      >
                        CSE
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                      {txn.category}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {txn.requestedBy}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Badge status={txn.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-body)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                          e.currentTarget.style.borderColor = 'var(--slate-300)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <Eye size={13} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
};

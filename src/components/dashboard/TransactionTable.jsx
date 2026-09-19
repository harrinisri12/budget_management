import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Eye, FileDown } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TransactionDetailModal } from './TransactionDetailModal';
import { CATEGORIES, STATUSES } from '../../data/mockData';
import { useBudget } from '../../context/BudgetContext';

export const TransactionTable = () => {
  const { transactions } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesSearch =
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

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
    <div className="cbm-card" style={{ padding: '24px' }}>
      {/* Table Title & Filter Controls Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>Recent CSE Transactions</h3>
            <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Real-time CSE department disbursements & activity requests</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => alert('Exporting CSE PDF audit log...')}
              className="cbm-btn cbm-btn-outline"
              style={{ height: 40, fontSize: 13, padding: '0 14px' }}
            >
              <FileDown size={16} />
              <span>Export CSE Audit</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search Box */}
          <div className="cbm-input-wrapper">
            <Search size={16} style={{ position: 'absolute', left: 14, color: 'var(--secondary)' }} />
            <input
              type="text"
              placeholder="Search CSEA, CCC, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 42, paddingLeft: 38, fontSize: 13.5 }}
            />
          </div>

          {/* Activity Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cbm-select"
            style={{ height: 42, fontSize: 13.5 }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="cbm-select"
            style={{ height: 42, fontSize: 13.5 }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort Button */}
          <button
            onClick={() => toggleSort('amount')}
            className="cbm-btn cbm-btn-outline"
            style={{ height: 42, fontSize: 13.5, justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ArrowUpDown size={16} /> Sort by Amount
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
              <th>Activity / Category</th>
              <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer' }}>
                Amount {sortField === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 36, color: 'var(--secondary)' }}>
                  No matching CSE transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td style={{ fontWeight: 600, color: 'var(--dark)' }}>{txn.date}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: '#F1EFFD',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      CSE
                    </span>
                  </td>
                  <td style={{ color: 'var(--dark-muted)', fontWeight: 600 }}>{txn.category}</td>
                  <td style={{ fontWeight: 700, color: 'var(--dark)' }}>
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <Badge status={txn.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTxn(txn)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
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

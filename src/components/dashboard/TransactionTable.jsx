import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Eye, FileDown } from 'lucide-react';
import { Badge } from '../common/Badge';
import { TableSkeleton } from '../common/Skeleton';
import { TransactionDetailModal } from './TransactionDetailModal';
import { useBudget } from '../../context/BudgetContext';

const STATUS_OPTIONS = ['All Statuses', 'Approved', 'Pending', 'Under Review', 'Rejected'];

export const TransactionTable = () => {
  const { transactions, proposals, categories, loading } = useBudget();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedItem, setSelectedItem] = useState(null);

  // Normalize genuine departmental activity records from real proposals and transactions
  const activityItems = useMemo(() => {
    // If real transaction records exist, use them; otherwise use genuine proposals
    if (transactions && transactions.length > 0) {
      return transactions.map(t => ({
        id: t.id || t.transaction_number,
        dbId: t.dbId || t.id,
        date: t.date || (t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
        department: t.department || 'CSE',
        category: t.category || 'General Activity',
        categoryId: t.categoryId || t.category_id,
        subCategory: t.subCategory || t.sub_category || '',
        amount: Number(t.amount || 0),
        status: t.status || 'Pending',
        description: t.description || t.title || '',
        title: t.title || t.description || '',
        requestedBy: t.requestedBy || t.facultyName || 'CSE Faculty',
        requestedEmail: t.requestedEmail || t.facultyEmail || '',
        vendor: t.vendor || 'Kongu Procurement',
        programDate: t.programDate || '',
        guestDetails: t.guestDetails || '',
        adminRemarks: t.adminRemarks || ''
      }));
    }

    if (proposals && proposals.length > 0) {
      return proposals.map(p => ({
        id: p.proposalNumber || p.proposalId || p.id,
        dbId: p.dbId || p.id,
        date: p.proposalDate || p.date || (p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''),
        department: 'CSE',
        category: p.category || 'General Activity',
        categoryId: p.categoryId || p.category_id,
        subCategory: p.subCategory || p.sub_category || '',
        amount: Number(p.amount || 0),
        status: p.status || 'Pending',
        description: p.title || '',
        title: p.title || '',
        requestedBy: p.facultyName || p.requestedBy || 'CSE Faculty',
        requestedEmail: p.facultyEmail || '',
        vendor: p.guestDetails || 'Kongu Procurement',
        programDate: p.programDate || '',
        guestDetails: p.guestDetails || '',
        adminRemarks: p.adminRemarks || ''
      }));
    }

    return [];
  }, [transactions, proposals]);

  const categoryFilterOptions = useMemo(() => {
    const fromCats = categories && categories.length > 0 ? categories.map(c => c.name) : [];
    const fromItems = activityItems.map(t => t.category).filter(Boolean);
    const unique = Array.from(new Set([...fromCats, ...fromItems]));
    return ['All Categories', ...unique];
  }, [categories, activityItems]);

  const filteredItems = useMemo(() => {
    return activityItems.filter(item => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (item.description && item.description.toLowerCase().includes(search)) ||
        (item.title && item.title.toLowerCase().includes(search)) ||
        (item.category && item.category.toLowerCase().includes(search)) ||
        (item.requestedBy && item.requestedBy.toLowerCase().includes(search)) ||
        (item.id && item.id.toLowerCase().includes(search));

      const matchesCat =
        selectedCategory === 'All Categories' || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All Statuses' || item.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    }).sort((a, b) => {
      if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [activityItems, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportCsv = () => {
    const isTransactionMode = Boolean(transactions && transactions.length > 0);
    const headers = isTransactionMode
      ? ['Transaction ID', 'Date', 'Description', 'Department', 'Category', 'Subcategory', 'Amount (INR)', 'Status', 'Requested By', 'Vendor']
      : ['Proposal ID', 'Date', 'Program Title', 'Department', 'Category', 'Subcategory', 'Proposed Amount (INR)', 'Status', 'Faculty Name', 'Faculty Email', 'Program Date', 'Admin Remarks'];

    const rows = filteredItems.map(item => {
      if (isTransactionMode) {
        return [
          `"${(item.id || '').toString().replace(/"/g, '""')}"`,
          `"${item.date || ''}"`,
          `"${(item.description || item.title || '').replace(/"/g, '""')}"`,
          `"${(item.department || 'CSE').replace(/"/g, '""')}"`,
          `"${(item.category || '').replace(/"/g, '""')}"`,
          `"${(item.subCategory || '').replace(/"/g, '""')}"`,
          Number(item.amount || 0),
          `"${item.status || ''}"`,
          `"${(item.requestedBy || '').replace(/"/g, '""')}"`,
          `"${(item.vendor || '').replace(/"/g, '""')}"`
        ];
      }
      return [
        `"${(item.id || '').toString().replace(/"/g, '""')}"`,
        `"${item.date || ''}"`,
        `"${(item.title || item.description || '').replace(/"/g, '""')}"`,
        `"${(item.department || 'CSE').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.subCategory || '').replace(/"/g, '""')}"`,
        Number(item.amount || 0),
        `"${item.status || ''}"`,
        `"${(item.requestedBy || '').replace(/"/g, '""')}"`,
        `"${(item.requestedEmail || '').replace(/"/g, '""')}"`,
        `"${(item.programDate || '').replace(/"/g, '""')}"`,
        `"${(item.adminRemarks || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${isTransactionMode ? 'KEC_CSE_Transactions_Audit' : 'KEC_CSE_Proposals_Audit'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Table Title & Filter Controls Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)' }}>Department Activity & Proposals</span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Proposals submitted, evaluated, and disbursed for the academic year</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={exportCsv}
              className="cbm-btn cbm-btn-outline cbm-btn-sm"
            >
              <FileDown size={14} />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 10 }}>
          {/* Search Box */}
          <div className="cbm-input-wrapper">
            <Search size={14} style={{ position: 'absolute', left: 11, color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search ID, purpose, faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 38, paddingLeft: 32, fontSize: 13 }}
            />
          </div>

          {/* Activity Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cbm-select"
            style={{ height: 38, fontSize: 13 }}
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
            style={{ height: 38, fontSize: 13 }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort Button */}
          <button
            onClick={() => toggleSort('amount')}
            className="cbm-btn cbm-btn-outline"
            style={{ height: 38, fontSize: 13, justifyContent: 'space-between' }}
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
          <tbody>
            {loading ? (
              <TableSkeleton rows={4} columns={6} />
            ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--text-muted)' }}>
                    No recent departmental activity found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.date}</td>
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
                      {item.category}
                      {item.subCategory && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                          • {item.subCategory}
                        </span>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {item.requestedBy}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Badge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedItem(item)}
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
        </table>
      </div>

      {/* Activity Details Modal */}
      <TransactionDetailModal
        transaction={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Calendar, Building, Tag, User, Store, FileText, CheckCircle } from 'lucide-react';

export const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Audit Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top banner */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 12,
            backgroundColor: '#F8F7FF',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600 }}>TRANSACTION ID</span>
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{transaction.id}</p>
          </div>
          <Badge status={transaction.status} />
        </div>

        {/* Amount display */}
        <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px dashed var(--border)' }}>
          <span style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600 }}>DISBURSED AMOUNT</span>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--dark)' }}>
            ₹{transaction.amount?.toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>TRANSACTION DATE</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{transaction.date}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Building size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>DEPARTMENT</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{transaction.department}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Tag size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>BUDGET CATEGORY</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{transaction.category}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <User size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>REQUESTED BY</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{transaction.requestedBy}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Store size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>VENDOR / SUPPLIER</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{transaction.vendor}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 600 }}>APPROVAL LEVEL</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Chief Financial Officer</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: '#F8F7FF', padding: 14, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--dark)' }}>
            <FileText size={16} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>PURPOSE & JUSTIFICATION</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--dark-muted)', lineHeight: 1.5 }}>
            {transaction.description}
          </p>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button onClick={onClose} className="cbm-btn cbm-btn-outline" style={{ height: 42 }}>
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};

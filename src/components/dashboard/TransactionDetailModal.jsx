import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Calendar, Building, Tag, User, Store, FileText, CheckCircle2 } from 'lucide-react';

export const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  if (!transaction) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Record Details" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top Header Information */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TRANSACTION NUMBER</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>{transaction.id}</p>
          </div>
          <Badge status={transaction.status} />
        </div>

        {/* Amount Display */}
        <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>DISBURSED EXPENDITURE</span>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>
            ₹{transaction.amount?.toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Calendar size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>DATE</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{transaction.date}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Building size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>DEPARTMENT</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{transaction.department}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Tag size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>CATEGORY</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{transaction.category}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <User size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>REQUESTED BY</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{transaction.requestedBy}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Store size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>VENDOR / SUPPLIER</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{transaction.vendor}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <CheckCircle2 size={15} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>APPROVAL LEVEL</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>HOD / Budget Officer</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: 'var(--bg-page)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--text-heading)' }}>
            <FileText size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>PURPOSE & JUSTIFICATION</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {transaction.description}
          </p>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button onClick={onClose} className="cbm-btn cbm-btn-outline cbm-btn-sm">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

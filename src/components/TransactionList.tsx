'use client';

import { formatRupiah, formatDateShort } from '@/lib/utils';
import CategoryIcon from './CategoryIcon';

interface TransactionData {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  accountId?: number | null;
  accountName?: string | null;
  type: string;
  amount: string;
  description: string | null;
  date: string;
}

interface TransactionListProps {
  transactions: TransactionData[];
  onEdit?: (transaction: TransactionData) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  showActions = true,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="empty-state-title">Belum ada transaksi</div>
        <div className="empty-state-text">
          Mulai catat pengeluaran dan pemasukan Anda hari ini
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((tx, index) => (
        <div
          key={tx.id}
          className="transaction-item animate-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className={`transaction-icon ${tx.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryIcon name={tx.categoryName} icon={tx.categoryIcon} type={tx.type} size={20} />
          </div>
          <div className="transaction-info">
            <div className="transaction-category">
              {tx.categoryName || 'Tanpa Kategori'}
              {tx.accountName && (
                <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {' • '}{tx.accountName}
                </span>
              )}
            </div>
            <div className="transaction-desc">
              {tx.description || '—'}
            </div>
          </div>
          <div className="transaction-right">
            <div className={`transaction-amount ${tx.type}`}>
              {tx.type === 'income' ? '+' : '-'}{' '}
              {formatRupiah(parseFloat(tx.amount))}
            </div>
            <div className="transaction-date">{formatDateShort(tx.date)}</div>
          </div>
          {showActions && (
            <div className="transaction-actions">
              <button
                className="btn btn-ghost btn-icon"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(tx);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                className="btn btn-danger btn-icon"
                title="Hapus"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(tx.id);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

'use client';

import { formatRupiah, formatDateShort } from '@/lib/utils';

interface TransactionData {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
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
        <div className="empty-state-icon">📭</div>
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
          <div className={`transaction-icon ${tx.type}`}>
            {tx.categoryIcon || (tx.type === 'income' ? '💰' : '💸')}
          </div>
          <div className="transaction-info">
            <div className="transaction-category">
              {tx.categoryName || 'Tanpa Kategori'}
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
                ✏️
              </button>
              <button
                className="btn btn-danger btn-icon"
                title="Hapus"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(tx.id);
                }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

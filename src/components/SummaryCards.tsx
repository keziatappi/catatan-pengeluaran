'use client';

import { formatRupiah } from '@/lib/utils';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
}: SummaryCardsProps) {
  return (
    <div className="summary-grid">
      <div className="summary-card income">
        <div className="summary-card-label">
          <span className="summary-card-label-icon">↑</span>
          Pemasukan
        </div>
        <div className="summary-card-value">
          {formatRupiah(totalIncome)}
        </div>
      </div>
      <div className="summary-card expense">
        <div className="summary-card-label">
          <span className="summary-card-label-icon">↓</span>
          Pengeluaran
        </div>
        <div className="summary-card-value">
          {formatRupiah(totalExpense)}
        </div>
      </div>
      <div className="summary-card balance">
        <div className="summary-card-label">
          <span className="summary-card-label-icon">💎</span>
          Saldo
        </div>
        <div className="summary-card-value">
          {formatRupiah(balance)}
        </div>
      </div>
    </div>
  );
}

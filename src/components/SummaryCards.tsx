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
        <div className="summary-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="summary-card-label-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </span>
          Pemasukan
        </div>
        <div className="summary-card-value">
          {formatRupiah(totalIncome)}
        </div>
      </div>
      <div className="summary-card expense">
        <div className="summary-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="summary-card-label-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </span>
          Pengeluaran
        </div>
        <div className="summary-card-value">
          {formatRupiah(totalExpense)}
        </div>
      </div>
      <div className="summary-card balance">
        <div className="summary-card-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="summary-card-label-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </span>
          Saldo
        </div>
        <div className="summary-card-value">
          {formatRupiah(balance)}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMonthName } from '@/lib/utils';
import SummaryCards from '@/components/SummaryCards';
import Chart from '@/components/Chart';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import ReceiptScanner from '@/components/ReceiptScanner';

interface TransactionData {
  id: number;
  categoryName: string | null;
  categoryIcon: string | null;
  type: string;
  amount: string;
  description: string | null;
  date: string;
  categoryId: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyData: { month: number; year: number; income: number; expense: number }[];
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, txRes] = await Promise.all([
        fetch(`/api/summary?month=${month}&year=${year}`),
        fetch(`/api/transactions?limit=8`),
      ]);

      const summaryData = await summaryRes.json();
      const txData = await txRes.json();

      setSummary(summaryData);
      setRecentTransactions(txData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan keuangan Anda</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowScanner(true)}>
            📸 Scan Struk
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="month-selector" style={{ marginBottom: 24 }}>
        <button className="month-selector-btn" onClick={prevMonth}>
          ←
        </button>
        <span className="month-selector-text">
          {getMonthName(month - 1)} {year}
        </span>
        <button className="month-selector-btn" onClick={nextMonth}>
          →
        </button>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="loading-dots">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards
            totalIncome={summary?.totalIncome || 0}
            totalExpense={summary?.totalExpense || 0}
            balance={summary?.balance || 0}
          />

          {/* Chart */}
          {summary?.monthlyData && <Chart monthlyData={summary.monthlyData} />}

          {/* Recent Transactions */}
          <div className="section-header">
            <h2 className="section-title">Transaksi Terakhir</h2>
            <a href="/transactions" className="section-link">
              Lihat Semua →
            </a>
          </div>
          <TransactionList
            transactions={recentTransactions}
            showActions={false}
          />
        </>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSaved={fetchData}
      />

      {/* Receipt Scanner Modal */}
      <ReceiptScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSaved={fetchData}
      />
    </div>
  );
}

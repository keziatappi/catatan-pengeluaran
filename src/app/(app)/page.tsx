'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMonthName, formatRupiah } from '@/lib/utils';
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

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

function getCardBrand(name: string) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('bni')) {
    return {
      gradient: 'linear-gradient(135deg, #005e6a, #008f9c)',
      subtitle: 'BNI Taplus Debit',
      cardNumber: '4358 0928 4429 2323',
      expiry: '08/29',
    };
  }
  if (lowercaseName.includes('mandiri')) {
    return {
      gradient: 'linear-gradient(135deg, #1c355e, #2e5590)',
      subtitle: 'Mandiri Gold Debit',
      cardNumber: '5412 8820 0968 4122',
      expiry: '11/28',
    };
  }
  if (lowercaseName.includes('bri')) {
    return {
      gradient: 'linear-gradient(135deg, #0f4c81, #1e70b8)',
      subtitle: 'BRI BritAma Debit',
      cardNumber: '6011 4455 0968 1083',
      expiry: '04/30',
    };
  }
  if (lowercaseName.includes('gopay')) {
    return {
      gradient: 'linear-gradient(135deg, #00aed6, #00c1e8)',
      subtitle: 'GoPay E-Wallet',
      cardNumber: '0812-3456-7890',
      expiry: 'PERMANENT',
    };
  }
  if (lowercaseName.includes('shopeepay')) {
    return {
      gradient: 'linear-gradient(135deg, #ee4d2d, #f1684c)',
      subtitle: 'ShopeePay E-Wallet',
      cardNumber: '0812-9876-5432',
      expiry: 'PERMANENT',
    };
  }
  return {
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    subtitle: 'Dompet Tunai',
    cardNumber: 'CASH-ID-4820-1992',
    expiry: 'NO EXPIRY',
  };
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, txRes, accountsRes] = await Promise.all([
        fetch(`/api/summary?month=${month}&year=${year}`),
        fetch(`/api/transactions?limit=8`),
        fetch('/api/accounts'),
      ]);

      const summaryData = await summaryRes.json();
      const txData = await txRes.json();
      const accountsData = await accountsRes.json();

      setSummary(summaryData);
      setRecentTransactions(txData.data || []);
      setAccounts(accountsData || []);
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

          {/* Rekening & E-Wallet Deck Section */}
          {accounts.length > 0 && (
            <div className="deck-section animate-in">
              {/* Left Column: Stacked Cards Deck */}
              <div className="deck-container">
                <div className="deck-title-row">
                  <h2 className="deck-title">Rekening & E-Wallet Saya</h2>
                  <a href="/transactions" className="deck-link">
                    Lihat Semua →
                  </a>
                </div>
                
                <div className="cards-stack-wrapper">
                  {accounts.map((account, idx) => {
                    const N = accounts.length;
                    const relativeIndex = (idx - activeCardIndex + N) % N;
                    const isVisible = relativeIndex < 3;
                    const zIndex = 10 - relativeIndex;
                    const translateY = relativeIndex * -16;
                    const scale = 1 - relativeIndex * 0.05;
                    const opacity = relativeIndex === 0 ? 1 : relativeIndex === 1 ? 0.85 : relativeIndex === 2 ? 0.6 : 0;
                    
                    const brand = getCardBrand(account.name);
                    
                    return (
                      <div
                        key={account.id}
                        className="wallet-card"
                        style={{
                          background: brand.gradient,
                          transform: `translateY(${translateY}px) scale(${scale})`,
                          opacity: opacity,
                          zIndex: zIndex,
                          pointerEvents: isVisible ? 'auto' : 'none',
                          display: isVisible ? 'flex' : 'none',
                        }}
                        onClick={() => {
                          setActiveCardIndex(idx);
                        }}
                      >
                        <div className="card-top">
                          <span className="card-label">{brand.subtitle}</span>
                          <button
                            className="card-plus-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowForm(true);
                            }}
                            title="Tambah Transaksi"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="card-balance">
                          {formatRupiah(account.balance)}
                        </div>
                        
                        <div className="card-bottom">
                          <span className="card-number">{brand.cardNumber}</span>
                          <div className="card-meta">
                            <span style={{ fontWeight: 600 }}>{account.type.toUpperCase()}</span>
                            <span>{brand.expiry}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Direct Selection Pills */}
                <div className="account-pills">
                  {accounts.map((account, idx) => (
                    <button
                      key={account.id}
                      className={`account-pill ${activeCardIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveCardIndex(idx)}
                    >
                      <span>{account.type === 'bank' ? '🏦' : account.type === 'e-wallet' ? '📱' : '💵'}</span>
                      {account.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Account Details */}
              <div className="card details-card">
                <h3 className="details-title">Detail Rekening</h3>
                {accounts[activeCardIndex] && (
                  <div className="details-list">
                    <div className="details-row">
                      <span className="details-label">Nama Rekening</span>
                      <span className="details-value">{accounts[activeCardIndex].name}</span>
                    </div>
                    <div className="details-row">
                      <span className="details-label">Jenis Saldo</span>
                      <span className="details-value" style={{ textTransform: 'capitalize' }}>
                        {accounts[activeCardIndex].type === 'bank' ? 'Bank' : accounts[activeCardIndex].type === 'e-wallet' ? 'E-Wallet' : 'Tunai / Cash'}
                      </span>
                    </div>
                    <div className="details-row">
                      <span className="details-label">Saldo Saat Ini</span>
                      <span className="details-value" style={{ color: accounts[activeCardIndex].balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                        {formatRupiah(accounts[activeCardIndex].balance)}
                      </span>
                    </div>
                    <div className="details-row">
                      <span className="details-label">Nomor Rekening/ID</span>
                      <span className="details-value" style={{ fontFamily: 'monospace' }}>
                        {getCardBrand(accounts[activeCardIndex].name).cardNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

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

function getCardBrand(name: string, type?: string) {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('bni')) {
    return {
      gradient: 'linear-gradient(135deg, #005e6a, #008f9c)',
      subtitle: 'BNI Taplus Debit',
      cardNumber: '4358 0928 4429 2323',
      expiry: '08/29',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: '900', fontStyle: 'italic', fontSize: '16px', color: '#ff6600', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#005e6a', background: '#ffffff', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal', fontSize: '12px', marginRight: '4px', fontWeight: 'bold' }}>BNI</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('mandiri')) {
    return {
      gradient: 'linear-gradient(135deg, #1c355e, #2e5590)',
      subtitle: 'Mandiri Gold Debit',
      cardNumber: '5412 8820 0968 4122',
      expiry: '11/28',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold', fontSize: '15px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#ffc72c', fontSize: '14px' }}>❖</span>
          <span>mandiri</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('bri')) {
    return {
      gradient: 'linear-gradient(135deg, #0f4c81, #1e70b8)',
      subtitle: 'BRI BritAma Debit',
      cardNumber: '6011 4455 0968 1083',
      expiry: '04/30',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: '900', fontStyle: 'italic', fontSize: '16px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#00529c', background: '#ffffff', padding: '1px 5px', borderRadius: '3px', fontStyle: 'normal', fontSize: '12px', marginRight: '4px', fontWeight: 'bold' }}>BRI</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('gopay')) {
    return {
      gradient: 'linear-gradient(135deg, #00aed6, #00c1e8)',
      subtitle: 'GoPay E-Wallet',
      cardNumber: '0812-3456-7890',
      expiry: 'PERMANENT',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: '800', fontSize: '16px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#00aed6' }}>go</span><span>pay</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('shopeepay')) {
    return {
      gradient: 'linear-gradient(135deg, #ee4d2d, #f1684c)',
      subtitle: 'ShopeePay E-Wallet',
      cardNumber: '0812-9876-5432',
      expiry: 'PERMANENT',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>
          <span style={{ background: '#ffffff', color: '#ee4d2d', padding: '0px 4px', borderRadius: '3px', fontSize: '10px', fontWeight: '900' }}>S</span>
          <span>ShopeePay</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('tunai') || type === 'cash') {
    return {
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      subtitle: 'Dompet Tunai',
      cardNumber: 'CASH-ID-4820-1992',
      expiry: 'NO EXPIRY',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>
          <span>💵</span>
          <span style={{ letterSpacing: '0.05em' }}>TUNAI</span>
        </div>
      )
    };
  }
  
  // Custom Dynamic Card layout based on account type
  const isBank = type === 'bank';
  const isWallet = type === 'e-wallet';
  
  return {
    gradient: isBank 
      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
      : isWallet
        ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
        : 'linear-gradient(135deg, #64748b, #475569)',
    subtitle: isBank ? 'Rekening Bank' : isWallet ? 'Dompet Digital' : 'Dompet Tunai',
    cardNumber: '•••• •••• •••• 9924',
    expiry: '12/30',
    logo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>
        <span>{isBank ? '🏦' : isWallet ? '📱' : '💳'}</span>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</span>
      </div>
    )
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

  // Form rekening baru
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'bank' | 'e-wallet' | 'cash'>('bank');
  const [accountError, setAccountError] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  const handleAddAccount = async () => {
    if (!newAccountName.trim() || !newAccountType) {
      setAccountError('Nama dan tipe harus diisi');
      return;
    }

    setAccountLoading(true);
    setAccountError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccountName.trim(),
          type: newAccountType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menambahkan rekening');
      }

      // Refresh list rekening
      const refreshedRes = await fetch('/api/accounts');
      const refreshedData = await refreshedRes.json();
      setAccounts(refreshedData);
      
      // Pilih rekening baru
      const newAcc = refreshedData.find(
        (a: any) => a.name.toLowerCase() === newAccountName.trim().toLowerCase()
      );
      if (newAcc) {
        const idx = refreshedData.indexOf(newAcc);
        if (idx !== -1) setActiveCardIndex(idx);
      } else {
        setActiveCardIndex(refreshedData.length - 1);
      }

      setNewAccountName('');
      setNewAccountType('bank');
      setShowAccountForm(false);
    } catch (err: any) {
      setAccountError(err.message || 'Terjadi kesalahan');
    } finally {
      setAccountLoading(false);
    }
  };

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
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span className="deck-link" onClick={() => {
                      setAccountError('');
                      setShowAccountForm(true);
                    }}>
                      ➕ Tambah
                    </span>
                    <a href="/transactions" className="deck-link">
                      Lihat Semua →
                    </a>
                  </div>
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
                    
                    const brand = getCardBrand(account.name, account.type);
                    
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
                          <div>
                            {brand.logo}
                            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              {brand.subtitle}
                            </div>
                          </div>
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
                        {getCardBrand(accounts[activeCardIndex].name, accounts[activeCardIndex].type).cardNumber}
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

      {/* Account Form Modal */}
      {showAccountForm && (
        <div className="modal-overlay" onClick={() => setShowAccountForm(false)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah Rekening</h2>
              <button className="modal-close" onClick={() => setShowAccountForm(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {accountError && (
                <div className="login-error" style={{ marginBottom: 16 }}>
                  ⚠️ {accountError}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Nama Rekening / E-Wallet</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Bank BNI, GoPay, Cash Pribadi"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select
                  className="form-select"
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as any)}
                >
                  <option value="bank">🏦 Bank / Rekening</option>
                  <option value="e-wallet">📱 E-Wallet</option>
                  <option value="cash">💵 Tunai / Cash</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAccountForm(false)} disabled={accountLoading}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleAddAccount} disabled={accountLoading}>
                {accountLoading ? <span className="loading-spinner" /> : '➕ Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

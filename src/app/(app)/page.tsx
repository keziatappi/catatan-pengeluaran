'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMonthName, formatRupiah } from '@/lib/utils';
import TransactionForm from '@/components/TransactionForm';
import ReceiptScanner from '@/components/ReceiptScanner';
import CategoryIcon from '@/components/CategoryIcon';

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
  accountNumber?: string | null;
  balance: number;
}

interface UserInfo {
  id: number;
  username: string;
  name: string;
}

function getCardBrand(name: string, type?: string, accountNumber?: string | null) {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes('bni')) {
    return {
      gradient: 'linear-gradient(135deg, #005e6a, #008f9c)',
      subtitle: 'BNI Taplus Debit',
      cardNumber: accountNumber || '4358 0928 4429 2323',
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
      cardNumber: accountNumber || '5412 8820 0968 4122',
      expiry: '11/28',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 'bold', fontSize: '15px', color: '#ffffff', letterSpacing: '-0.5px' }}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="#ffc72c" style={{ flexShrink: 0 }}><path d="M8 0l2.35 5.65L16 8l-5.65 2.35L8 16l-2.35-5.65L0 8l5.65-2.35z" /></svg>
          <span>mandiri</span>
        </div>
      )
    };
  }
  if (lowercaseName.includes('bri')) {
    return {
      gradient: 'linear-gradient(135deg, #0f4c81, #1e70b8)',
      subtitle: 'BRI BritAma Debit',
      cardNumber: accountNumber || '6011 4455 0968 1083',
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
      cardNumber: accountNumber || '0812-3456-7890',
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
      cardNumber: accountNumber || '0812-9876-5432',
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
      cardNumber: accountNumber || 'CASH-ID-4820-1992',
      expiry: 'NO EXPIRY',
      logo: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
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
    cardNumber: accountNumber || '•••• •••• •••• 9924',
    expiry: '12/30',
    logo: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', fontSize: '15px', color: '#ffffff' }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {isBank ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v4" /><path d="M12 14v4" /><path d="M16 14v4" /></svg>
          ) : isWallet ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
          )}
        </span>
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
  const [user, setUser] = useState<UserInfo | null>(null);

  // Form rekening baru
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'bank' | 'e-wallet' | 'cash'>('bank');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  // States untuk popup Glassmorphism (re-bound as inline absolute panel overlay inside right column deck)
  const [showCardPopup, setShowCardPopup] = useState(true); // Active by default to show current active card's trans
  const [popupTransactions, setPopupTransactions] = useState<any[]>([]);
  const [popupLoading, setPopupLoading] = useState(false);
  const [selectedPopupAccount, setSelectedPopupAccount] = useState<Account | null>(null);

  const getGlassTint = (name: string, type: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('bni')) return 'rgba(0, 94, 106, 0.45)';
    if (lowercaseName.includes('mandiri')) return 'rgba(28, 53, 94, 0.45)';
    if (lowercaseName.includes('bri')) return 'rgba(15, 76, 129, 0.45)';
    if (lowercaseName.includes('gopay')) return 'rgba(0, 174, 214, 0.45)';
    if (lowercaseName.includes('shopeepay')) return 'rgba(238, 77, 45, 0.45)';
    if (lowercaseName.includes('tunai') || type === 'cash') return 'rgba(5, 150, 105, 0.45)';
    if (type === 'bank') return 'rgba(59, 130, 246, 0.45)';
    if (type === 'e-wallet') return 'rgba(139, 92, 246, 0.45)';
    return 'rgba(30, 41, 59, 0.45)';
  };

  const handleCardClick = async (account: Account) => {
    setSelectedPopupAccount(account);
    setShowCardPopup(true);
    setPopupLoading(true);
    setPopupTransactions([]);
    try {
      const res = await fetch(`/api/transactions?accountId=${account.id}&limit=3`);
      const data = await res.json();
      if (res.ok) {
        setPopupTransactions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching popup transactions:', err);
    } finally {
      setPopupLoading(false);
    }
  };

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
          accountNumber: newAccountNumber.trim() || null,
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
        if (idx !== -1) {
          setActiveCardIndex(idx);
          handleCardClick(newAcc);
        }
      } else {
        const lastAcc = refreshedData[refreshedData.length - 1];
        setActiveCardIndex(refreshedData.length - 1);
        handleCardClick(lastAcc);
      }

      setNewAccountName('');
      setNewAccountType('bank');
      setNewAccountNumber('');
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
      const [summaryRes, txRes, accountsRes, userRes] = await Promise.all([
        fetch(`/api/summary?month=${month}&year=${year}`),
        fetch(`/api/transactions?limit=8`),
        fetch('/api/accounts'),
        fetch('/api/auth/me'),
      ]);

      const summaryData = await summaryRes.json();
      const txData = await txRes.json();
      const accountsData = await accountsRes.json();
      const userData = await userRes.json();

      setSummary(summaryData);
      setRecentTransactions(txData.data || []);
      setAccounts(accountsData || []);
      if (userData.user) setUser(userData.user);

      // Auto-load first account transactions for inline glass popup on mount
      if (accountsData && accountsData.length > 0) {
        const initialAccount = accountsData[0];
        setSelectedPopupAccount(initialAccount);
        setPopupLoading(true);
        const popRes = await fetch(`/api/transactions?accountId=${initialAccount.id}&limit=3`);
        const popData = await popRes.json();
        setPopupTransactions(popData.data || []);
        setPopupLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper untuk inisial nama
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Dinamis Kategori summary dari pengeluaran terkini
  const getCategorySummary = () => {
    const categorySummary = { food: 0, clothes: 0, other: 0, total: 0 };
    recentTransactions.forEach(tx => {
      if (tx.type === 'expense') {
        const amount = parseFloat(tx.amount || '0');
        const cat = (tx.categoryName || '').toLowerCase();
        if (cat.includes('makan') || cat.includes('minum') || cat.includes('food')) {
          categorySummary.food += amount;
        } else if (cat.includes('pakaian') || cat.includes('belanja') || cat.includes('clothes') || cat.includes('baju')) {
          categorySummary.clothes += amount;
        } else {
          categorySummary.other += amount;
        }
        categorySummary.total += amount;
      }
    });

    if (categorySummary.total === 0) {
      categorySummary.food = 950000;
      categorySummary.clothes = 420000;
      categorySummary.other = 480000;
      categorySummary.total = 1850000;
    }
    return categorySummary;
  };

  const catSummary = getCategorySummary();
  const foodPercent = (catSummary.food / catSummary.total) * 100;
  const clothesPercent = (catSummary.clothes / catSummary.total) * 100;
  const otherPercent = (catSummary.other / catSummary.total) * 100;

  // Circumference for r=36 is 226.2. Draw segment strokes.
  const circ = 226.2;
  const strokeFood = (foodPercent / 100) * circ;
  const strokeClothes = (clothesPercent / 100) * circ;
  const strokeOther = (otherPercent / 100) * circ;

  return (
    <div className="page-container" style={{ maxWidth: '1400px' }}>
      
      {loading ? (
        <div className="loading-page">
          <div className="loading-dots">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        </div>
      ) : (
        <div className="dashboard-grid-layout animate-in">
          
          {/* KOLOM KIRI (UTAMA) */}
          <div className="dashboard-left-col">
            
            {/* Top Greeting & Search */}
            <div className="greeting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
              <div className="search-payment-wrapper" style={{ margin: '0 auto 0 80px', width: '100%', maxWidth: '380px' }}>
                <span className="search-payment-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  className="search-payment-input" 
                  placeholder="Search payment"
                  onClick={() => window.location.href = '/transactions'}
                  style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="greeting-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="greeting-user-name" style={{ fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>
                    Hi {user?.name || 'Stefan'}!
                  </span>
                  <div className="greeting-user-avatar" style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    color: '#ffffff',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(56, 189, 248, 0.25)',
                    userSelect: 'none'
                  }}>
                    {user ? getInitials(user.name) : 'ST'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Title & Total Saldo Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="page-title" style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '4px' }}>My Dashboard</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Total Saldo</span>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', letterSpacing: '-0.02em' }}>
                    {formatRupiah(accounts.reduce((sum, acc) => sum + acc.balance, 0)).replace('Rp ', 'Rp')}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowScanner(true)} style={{ borderRadius: '16px', fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Scan Struk
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} style={{ borderRadius: '16px', fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Transaksi
                </button>
              </div>
            </div>

            {/* Revenue Flow Card */}
            <div className="revenue-flow-card">
              <div className="chart-header" style={{ marginBottom: '24px' }}>
                <h3 className="chart-title" style={{ fontSize: '18px', fontWeight: '700' }}>Revenue Flow</h3>
                <a href="/transactions" className="deck-link" style={{ fontSize: '13px' }}>
                  View All &gt;
                </a>
              </div>

              {/* Monthly patterned bar chart matching fintech mockup */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 10px', gap: '16px' }}>
                {(summary?.monthlyData || []).map((item, idx) => {
                  const maxVal = Math.max(...(summary?.monthlyData || []).map(d => Math.max(d.income, d.expense)), 1);
                  const incomeHeight = (item.income / maxVal) * 100;
                  const expenseHeight = (item.expense / maxVal) * 100;
                  const netValue = item.income - item.expense;
                  const height = Math.max((Math.abs(netValue) / maxVal) * 80, 10);
                  
                  // Highlight July / index 4 (or current active selection) in solid purple, others in patterned teal
                  const isActive = idx === 4; 
                  
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '12px' }}>
                      <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        maxHeight: '160px',
                        height: `${height}%`,
                        borderRadius: '20px',
                        overflow: 'visible',
                        background: isActive 
                          ? 'var(--accent-primary)' 
                          : 'rgba(255, 255, 255, 0.08)',
                        border: isActive 
                          ? '1px solid var(--accent-primary)' 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isActive ? '0 10px 20px rgba(139, 92, 246, 0.3)' : 'none',
                        cursor: 'pointer'
                      }}
                      className="revenue-bar-hover"
                      >
                        {/* Diagonal stripes pattern for non-active bars */}
                        {!isActive && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '19px',
                            background: 'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1) 4px, transparent 4px, transparent 8px)'
                          }} />
                        )}

                        {/* Top Indicator Dot for active month */}
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#ffffff'
                          }} />
                        )}

                        {/* Active hover indicator popup tooltip */}
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            top: '-36px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            color: 'var(--text-primary)'
                          }}>
                            +{formatRupiah(netValue).replace('Rp ', 'Rp')}
                          </div>
                        )}
                      </div>
                      
                      <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.6 }}>
                        {getMonthName(item.month - 1).slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Available & Summaries */}
            <div className="dashboard-bottom-grid">
              
              {/* Card: Available categories */}
              <div className="available-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="chart-title" style={{ fontSize: '16px', fontWeight: '700' }}>Kategori Pengeluaran</h3>
                  <a href="/transactions" className="deck-link" style={{ fontSize: '12px' }}>
                    View All &gt;
                  </a>
                </div>

                <div className="available-doughnut-wrapper">
                  {/* SVG Doughnut chart */}
                  <div style={{ width: '110px', height: '110px' }}>
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      {/* Segment 3 (Other: teal) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="11"
                        strokeDasharray={circ}
                        strokeDashoffset="0"
                      />
                      {/* Segment 2 (Clothes: yellow) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="11"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeOther}
                      />
                      {/* Segment 1 (Food: purple) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="36"
                        fill="transparent"
                        stroke="var(--accent-primary)"
                        strokeWidth="11"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeOther + strokeClothes}
                      />
                      
                      {/* Inner text values */}
                      <text x="50" y="47" textAnchor="middle" fontSize="8" fontWeight="800" fill="var(--text-primary)">
                        {formatRupiah(catSummary.total).replace('Rp ', 'Rp')}
                      </text>
                      <text x="50" y="58" textAnchor="middle" fontSize="4.5" opacity="0.6" fill="var(--text-secondary)" fontWeight="600">
                        Total Pengeluaran
                      </text>
                    </svg>
                  </div>

                  <div className="available-chart-legend">
                    <div className="legend-row">
                      <div className="legend-dot" style={{ background: 'var(--accent-primary)' }} />
                      <div className="legend-info">
                        <span className="legend-name">Makanan & Minum</span>
                        <span className="legend-val">{formatRupiah(catSummary.food).replace('Rp ', 'Rp')}</span>
                      </div>
                    </div>
                    <div className="legend-row">
                      <div className="legend-dot" style={{ background: '#f59e0b' }} />
                      <div className="legend-info">
                        <span className="legend-name">Belanja & Baju</span>
                        <span className="legend-val">{formatRupiah(catSummary.clothes).replace('Rp ', 'Rp')}</span>
                      </div>
                    </div>
                    <div className="legend-row">
                      <div className="legend-dot" style={{ background: '#10b981' }} />
                      <div className="legend-info">
                        <span className="legend-name">Lain-lain</span>
                        <span className="legend-val">{formatRupiah(catSummary.other).replace('Rp ', 'Rp')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column: Income & Expense cards */}
              <div className="balance-summary-col">
                <div className="summary-widget-card">
                  <span className="summary-widget-title">Pemasukan Bulan Ini</span>
                  <span className="summary-widget-value" style={{ color: 'var(--color-income)' }}>
                    {formatRupiah(summary?.totalIncome || 0).replace('Rp ', 'Rp')}
                  </span>
                  <span className="summary-widget-subtitle">Periode {getMonthName(month - 1)} {year}</span>
                  <div className="summary-widget-badge income">
                    +12%
                  </div>
                </div>

                <div className="summary-widget-card">
                  <span className="summary-widget-title">Pengeluaran Bulan Ini</span>
                  <span className="summary-widget-value" style={{ color: 'var(--color-expense)' }}>
                    {formatRupiah(summary?.totalExpense || 0).replace('Rp ', 'Rp')}
                  </span>
                  <span className="summary-widget-subtitle">Periode {getMonthName(month - 1)} {year}</span>
                  <div className="summary-widget-badge expense">
                    +9%
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* KOLOM KANAN (SIDEBAR KARTU - DIKEMAS DALAM SATU FRAME WIDGET) */}
          <div className="dashboard-right-col">
            <div className="right-sidebar-frame">
              <div className="deck-title-row">
                <h2 className="deck-title" style={{ fontSize: '18px', fontWeight: '700' }}>My Card</h2>
                <a href="/accounts" className="deck-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View All &gt;
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
                  
                  const brand = getCardBrand(account.name, account.type, account.accountNumber);
                  
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
                        handleCardClick(account);
                      }}
                    >
                      <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="card-balance-label" style={{ fontSize: '13px', opacity: 0.8, fontWeight: 500 }}>Total Balance</span>
                        <button
                          className="card-plus-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccountError('');
                            setShowAccountForm(true);
                          }}
                          title="Tambah Rekening"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="card-balance-amount" style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', marginTop: '8px', color: '#ffffff' }}>
                        {formatRupiah(account.balance).replace('Rp ', 'Rp')}
                      </div>

                      <div className="card-bottom-row" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {account.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Glassmorphic Transaction Panel (Inline Absolute Overlay) */}
              {showCardPopup && selectedPopupAccount && (
                <div 
                  className="glass-overlap-panel"
                  style={{
                    background: `linear-gradient(135deg, ${getGlassTint(selectedPopupAccount.name, selectedPopupAccount.type)}, rgba(30, 41, 59, 0.7))`
                  }}
                >
                  {/* Card Number, Expiry & Close Button */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: 'inherit', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                        {getCardBrand(selectedPopupAccount.name, selectedPopupAccount.type, selectedPopupAccount.accountNumber).cardNumber}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.05em' }}>
                        {getCardBrand(selectedPopupAccount.name, selectedPopupAccount.type, selectedPopupAccount.accountNumber).expiry}
                      </div>
                    </div>
                    
                    <button
                      className="glass-panel-close"
                      onClick={() => setShowCardPopup(false)}
                      title="Tutup Detail"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="glass-divider" />

                  {/* Transactions Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 className="glass-widget-title" style={{ fontSize: '15px', fontWeight: '700', color: 'inherit' }}>Transactions</h3>
                      <a 
                        href={`/transactions?accountId=${selectedPopupAccount.id}`} 
                        style={{ fontSize: '12px', fontWeight: '600', opacity: 0.8, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        View All &gt;
                      </a>
                    </div>

                    {popupLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                        <div className="loading-dots">
                          <div className="loading-dot" style={{ background: 'currentColor' }} />
                          <div className="loading-dot" style={{ background: 'currentColor' }} />
                          <div className="loading-dot" style={{ background: 'currentColor' }} />
                        </div>
                      </div>
                    ) : popupTransactions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', opacity: 0.6, fontSize: '13px', color: 'inherit' }}>
                        Belum ada transaksi di rekening ini
                      </div>
                    ) : (
                      <div className="glass-tx-list">
                        {popupTransactions.map((tx: any) => {
                          const isExpense = tx.type === 'expense';
                          const amountFormatted = `${isExpense ? '- ' : '+ '}${formatRupiah(parseFloat(tx.amount))}`;
                          
                          const getTxLogo = (description: string, categoryIcon: string | null, isExpense: boolean) => {
                            const desc = (description || '').toLowerCase();
                            if (desc.includes('figma')) {
                              return (
                                <div style={{ 
                                  width: '36px', 
                                  height: '36px', 
                                  borderRadius: '50%', 
                                  background: 'rgba(10, 207, 131, 0.15)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  border: '1px solid rgba(10, 207, 131, 0.3)',
                                  flexShrink: 0
                                }}>
                                  <div style={{ display: 'flex', position: 'relative', width: '12px', height: '18px' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '6px', borderRadius: '3px 0 0 3px', background: '#F24E1E' }} />
                                    <div style={{ position: 'absolute', left: '6px', top: 0, width: '6px', height: '6px', borderRadius: '3px', background: '#FF7262' }} />
                                    <div style={{ position: 'absolute', left: 0, top: '6px', width: '6px', height: '6px', borderRadius: '3px 0 0 3px', background: '#A259FF' }} />
                                    <div style={{ position: 'absolute', left: '6px', top: '6px', width: '6px', height: '6px', borderRadius: '3px', background: '#1ABCFE' }} />
                                    <div style={{ position: 'absolute', left: 0, top: '12px', width: '6px', height: '6px', borderRadius: '3px', background: '#0ACF83' }} />
                                  </div>
                                </div>
                              );
                            }
                            if (desc.includes('grammarly')) {
                              return (
                                <div style={{ 
                                  width: '36px', 
                                  height: '36px', 
                                  borderRadius: '50%', 
                                  background: 'rgba(16, 185, 129, 0.15)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  flexShrink: 0
                                }}>
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L15 9" />
                                  </svg>
                                </div>
                              );
                            }
                            if (desc.includes('blender')) {
                              return (
                                <div style={{ 
                                  width: '36px', 
                                  height: '36px', 
                                  borderRadius: '50%', 
                                  background: 'rgba(234, 88, 12, 0.15)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: '#ea580c',
                                  border: '1px solid rgba(234, 88, 12, 0.3)',
                                  flexShrink: 0
                                }}>
                                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6.5-5.5h-2v-1h2v1zm-11 0h-2v-1h2v1z" />
                                  </svg>
                                </div>
                              );
                            }
                            return (
                              <div style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                background: isExpense ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: isExpense ? '#ef4444' : '#22c55e',
                                border: isExpense ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                                flexShrink: 0
                              }}>
                                <CategoryIcon name={tx.categoryName} icon={tx.categoryIcon} type={tx.type} size={20} />
                              </div>
                            );
                          };

                          return (
                            <div key={tx.id} className="glass-tx-item" style={{ padding: '6px 0' }}>
                              <div className="glass-tx-icon">
                                {getTxLogo(tx.description || '', tx.categoryIcon, isExpense)}
                              </div>
                              <div className="glass-tx-info" style={{ marginLeft: '12px' }}>
                                <div className="glass-tx-name" style={{ fontSize: '14px', fontWeight: '600', color: 'inherit' }}>
                                  {tx.description || tx.categoryName || 'Transaksi'}
                                </div>
                              </div>
                              <div className={`glass-tx-amount ${isExpense ? 'expense' : 'income'}`} style={{ fontSize: '14px', fontWeight: '700' }}>
                                {amountFormatted.replace('Rp ', 'Rp')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
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
              <button className="modal-close" onClick={() => setShowAccountForm(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {accountError && (
                <div className="login-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  {accountError}
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
                  <option value="bank">Bank / Rekening</option>
                  <option value="e-wallet">E-Wallet</option>
                  <option value="cash">Tunai / Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Rekening / E-Wallet (opsional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={newAccountType === 'bank' ? 'Contoh: 0928442923' : newAccountType === 'e-wallet' ? 'Contoh: 081234567890' : 'Contoh: ID-1992'}
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAccountForm(false)} disabled={accountLoading}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleAddAccount} disabled={accountLoading}>
                {accountLoading ? <span className="loading-spinner" /> : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

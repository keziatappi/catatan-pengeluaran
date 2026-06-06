'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/lib/utils';

interface Account {
  id: number;
  name: string;
  type: string;
  accountNumber?: string | null;
  balance: number;
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
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="2" />
            <path d="M6 12h.01M18 12h.01" />
          </svg>
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
        <span>
          {isBank ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M2 11h20M12 2L2 11h20L12 2z" />
            </svg>
          ) : isWallet ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          )}
        </span>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{name}</span>
      </div>
    )
  };
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'e-wallet' | 'cash'>('bank');
  const [accountNumber, setAccountNumber] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (res.ok) {
        setAccounts(data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenAdd = () => {
    setAccountName('');
    setAccountType('bank');
    setAccountNumber('');
    setFormError('');
    setShowAddForm(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setCurrentAccount(acc);
    setAccountName(acc.name);
    setAccountType(acc.type as any);
    setAccountNumber(acc.accountNumber || '');
    setFormError('');
    setShowEditForm(true);
  };

  const handleOpenDelete = (acc: Account) => {
    setCurrentAccount(acc);
    setShowDeleteConfirm(true);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setFormError('Nama rekening/e-wallet harus diisi');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName.trim(),
          type: accountType,
          accountNumber: accountNumber.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menambahkan rekening');
      }

      await fetchAccounts();
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    if (!accountName.trim()) {
      setFormError('Nama rekening/e-wallet harus diisi');
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      const res = await fetch(`/api/accounts/${currentAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName.trim(),
          type: accountType,
          accountNumber: accountNumber.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah rekening');
      }

      await fetchAccounts();
      setShowEditForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentAccount) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/accounts/${currentAccount.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus rekening');
      }

      await fetchAccounts();
      setShowDeleteConfirm(false);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Rekening & E-Wallet</h1>
          <p className="page-subtitle">Kelola semua rekening bank, e-wallet, dan dompet tunai Anda</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Rekening
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
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3 className="empty-state-title">Belum ada Rekening</h3>
          <p className="empty-state-text">Silakan tambahkan rekening baru untuk mulai mengelola saldo Anda.</p>
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Rekening
          </button>
        </div>
      ) : (
        <div className="accounts-dashboard-grid animate-in" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px',
          marginTop: '16px'
        }}>
          {accounts.map((account) => {
            const brand = getCardBrand(account.name, account.type, account.accountNumber);
            const isTunai = account.name.toLowerCase() === 'tunai';
            
            return (
              <div 
                key={account.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'border-color var(--transition-fast)'
                }}
                className="account-grid-item"
              >
                {/* Visual Card (Styled mimicking Dashboard Stack card) */}
                <div 
                  className="wallet-card-static" 
                  style={{
                    background: brand.gradient,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '180px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
                    pointerEvents: 'none'
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                    <div>
                      {brand.logo}
                      <div style={{ fontSize: '10px', opacity: 0.7, marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {brand.subtitle}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {account.type}
                    </span>
                  </div>

                  <div style={{ fontSize: '24px', fontWeight: '800', margin: '12px 0', zIndex: 2 }}>
                    {formatRupiah(account.balance)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', opacity: 0.9 }}>
                      {brand.cardNumber}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>
                      {brand.expiry}
                    </span>
                  </div>
                </div>

                {/* CRUD Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto' }}>
                  {!isTunai ? (
                    <>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleOpenEdit(account)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm btn-danger" 
                        onClick={() => handleOpenDelete(account)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        Hapus
                      </button>
                    </>
                  ) : (
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-tertiary)', 
                      fontStyle: 'italic', 
                      padding: '6px 0' 
                    }}>
                      🔒 Rekening bawaan (tidak dapat diedit/dihapus)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Tambah Rekening / E-Wallet</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <form onSubmit={handleAddAccount}>
              <div className="modal-body">
                {formError && (
                  <div className="login-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Rekening / E-Wallet</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Bank Mandiri, GoPay Utama, Cash"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipe</label>
                  <select
                    className="form-select"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
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
                    placeholder={accountType === 'bank' ? 'Contoh: 124000987654' : accountType === 'e-wallet' ? 'Contoh: 08123456789' : 'Contoh: ID-TUNAI'}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} disabled={formLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="loading-spinner" /> : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && currentAccount && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Ubah Rekening / E-Wallet</h2>
              <button className="modal-close" onClick={() => setShowEditForm(false)}>✕</button>
            </div>
            <form onSubmit={handleEditAccount}>
              <div className="modal-body">
                {formError && (
                  <div className="login-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Rekening / E-Wallet</label>
                  <input
                    type="text"
                    className="form-input"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipe</label>
                  <select
                    className="form-select"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
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
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)} disabled={formLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="loading-spinner" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && currentAccount && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Hapus Rekening</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '16px 28px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '12px' }}>
                Apakah Anda yakin ingin menghapus rekening &quot;{currentAccount.name}&quot;?
              </p>
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--color-danger)',
                lineHeight: 1.5,
                textAlign: 'left',
                marginBottom: '20px'
              }}>
                <strong>Peringatan Penting:</strong> Menghapus rekening ini akan secara otomatis memindahkan semua transaksi terkait ke rekening bawaan <strong>Tunai</strong> agar riwayat pencatatan Anda tetap utuh.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                Batal
              </button>
              <button className="btn btn-primary btn-danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? <span className="loading-spinner" /> : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

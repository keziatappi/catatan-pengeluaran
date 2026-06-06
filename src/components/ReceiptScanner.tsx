'use client';

import { useState, useEffect, useRef } from 'react';
import CategoryIcon from './CategoryIcon';

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
}

interface ScannedItem {
  name: string;
  price: number;
}

interface ScannedData {
  merchant: string;
  date: string;
  totalAmount: number;
  items: ScannedItem[];
  suggestedCategoryId: number;
}

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ReceiptScanner({
  isOpen,
  onClose,
  onSaved,
}: ReceiptScannerProps) {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Scanned / Review state
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [originalTotal, setOriginalTotal] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories & accounts on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.filter((c: Category) => c.type === 'expense'));
        })
        .catch(() => {});

      fetch('/api/accounts')
        .then((res) => res.json())
        .then((data) => {
          setAccounts(data);
          const tunaiAcc = data.find((a: any) => a.name.toLowerCase() === 'tunai');
          if (tunaiAcc) {
            setAccountId(tunaiAcc.id);
          } else if (data.length > 0) {
            setAccountId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const resetScanner = () => {
    setStep('upload');
    setImage(null);
    setError('');
    setMerchant('');
    setDate('');
    setCategoryId(null);
    const tunaiAcc = accounts.find((a) => a.name.toLowerCase() === 'tunai');
    setAccountId(tunaiAcc ? tunaiAcc.id : (accounts[0]?.id || null));
    setItems([]);
    setOriginalTotal(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setError('');
    };
    reader.onerror = () => {
      setError('Gagal membaca file gambar');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const handleScan = async () => {
    if (!image) return;

    setStep('scanning');
    setError('');

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memproses struk');
      }

      const data: ScannedData = await res.json();

      setMerchant(data.merchant || '');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setItems(data.items || []);
      setOriginalTotal(data.totalAmount || 0);

      // Verify if suggested category ID is valid
      const isValidCat = categories.some((c) => c.id === data.suggestedCategoryId);
      setCategoryId(isValidCat ? data.suggestedCategoryId : null);

      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memindai struk');
      setStep('upload');
    }
  };

  // Edit item actions
  const handleItemNameChange = (index: number, newName: string) => {
    const updated = [...items];
    updated[index].name = newName;
    setItems(updated);
  };

  const handleItemPriceChange = (index: number, value: string) => {
    const updated = [...items];
    const price = parseFloat(value) || 0;
    updated[index].price = price;
    setItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setItems([...items, { name: 'Item baru', price: 0 }]);
  };

  const calculatedTotal = items.reduce((sum, item) => sum + item.price, 0);

  // Saving actions
  const saveTransaction = async (amount: number, description: string, selectedCategoryId: number) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'expense',
        amount,
        categoryId: selectedCategoryId,
        accountId,
        description,
        date,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Gagal menyimpan transaksi');
    }
  };

  const handleSaveTotalOnly = async () => {
    if (!categoryId) {
      setError('Pilih kategori terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const desc = `${merchant} (Scan Struk)`;
      await saveTransaction(calculatedTotal, desc, categoryId);

      onSaved();
      onClose();
      resetScanner();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItemized = async () => {
    if (!categoryId) {
      setError('Pilih kategori terlebih dahulu');
      return;
    }

    if (items.length === 0) {
      setError('Tidak ada item untuk disimpan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save items sequentially
      for (const item of items) {
        if (item.price > 0) {
          const desc = `${merchant} - ${item.name}`;
          await saveTransaction(item.price, desc, categoryId);
        }
      }

      onSaved();
      onClose();
      resetScanner();
    } catch (err: any) {
      setError(`Gagal menyimpan beberapa item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: step === 'review' ? '680px' : '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 'upload' && 'Scan Struk Belanja'}
            {step === 'scanning' && 'Menganalisis Gambar...'}
            {step === 'review' && 'Review Hasil Scan'}
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="login-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {error}
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="scanner-upload-container">
              {!image ? (
                <div
                  className="scanner-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerCameraInput}
                >
                  <div className="scanner-dropzone-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, color: '#10b981' }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <p className="scanner-dropzone-text">
                    Tap di sini untuk <strong>Membuka Kamera</strong>
                  </p>
                  <p className="scanner-dropzone-sub">Atau seret gambar struk ke sini</p>
                  
                  <div style={{ width: '100%', marginTop: 20 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Pilih dari Galeri / File
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div className="scanner-preview-wrapper">
                  <img src={image} alt="Preview Struk" className="scanner-image-preview" />
                  <div className="scanner-preview-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setImage(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Ganti Gambar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleScan} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Mulai Scan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SCANNING */}
          {step === 'scanning' && (
            <div className="scanner-loading-container">
              <div className="loading-page">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
              <p className="scanner-loading-text">
                Gemini sedang membaca struk Anda...
              </p>
              <p className="scanner-loading-sub">
                Mengekstrak nama toko, tanggal, item, dan mencocokkan kategori.
              </p>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 'review' && (
            <div className="scanner-review-layout">
              <div className="scanner-review-fields">
                {/* Merchant & Date */}
                <div className="scanner-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Nama Toko / Merchant</label>
                    <input
                      type="text"
                      className="form-input"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="Contoh: Indomaret"
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Tanggal Transaksi</label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Account / Wallet Selection */}
                <div className="form-group">
                  <label className="form-label">Bayar Menggunakan</label>
                  <select
                    className="form-select"
                    value={accountId || ''}
                    onChange={(e) => setAccountId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="" disabled>Pilih Rekening / E-Wallet</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === 'bank' ? 'Bank' : acc.type === 'e-wallet' ? 'E-Wallet' : 'Tunai'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div className="form-group">
                  <label className="form-label">Pilih Kategori Pengeluaran</label>
                  <div className="category-grid" style={{ maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`category-item ${categoryId === cat.id ? 'selected' : ''}`}
                        onClick={() => setCategoryId(cat.id)}
                      >
                        <span className="category-item-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CategoryIcon name={cat.name} icon={cat.icon} type={cat.type} size={16} />
                        </span>
                        <span className="category-item-name">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item List */}
                <div className="form-group">
                  <div className="scanner-items-header">
                    <label className="form-label" style={{ marginBottom: 0 }}>Rincian Item</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleAddItem}
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Tambah Item
                    </button>
                  </div>

                  <div className="scanner-items-list">
                    {items.map((item, idx) => (
                      <div key={idx} className="scanner-item-row animate-in">
                        <input
                          type="text"
                          className="form-input scanner-item-name-input"
                          value={item.name}
                          onChange={(e) => handleItemNameChange(idx, e.target.value)}
                          placeholder="Nama item"
                        />
                        <div className="scanner-item-price-wrapper">
                          <span className="scanner-currency">Rp</span>
                          <input
                            type="number"
                            className="form-input scanner-item-price-input"
                            value={item.price || ''}
                            onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                            placeholder="Harga"
                          />
                        </div>
                        <button
                          type="button"
                          className="scanner-item-delete"
                          onClick={() => handleDeleteItem(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <p className="scanner-empty-items">Tidak ada item rincian.</p>
                    )}
                  </div>
                </div>

                {/* Total amount summary */}
                <div className="scanner-totals-box">
                  <div className="scanner-total-row">
                    <span>Total Rincian:</span>
                    <strong className="scanner-total-value">
                      Rp {new Intl.NumberFormat('id-ID').format(calculatedTotal)}
                    </strong>
                  </div>
                  {originalTotal > 0 && originalTotal !== calculatedTotal && (
                    <div className="scanner-total-diff-warning" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>Total rincian berbeda dengan total struk yang terbaca (Rp {new Intl.NumberFormat('id-ID').format(originalTotal)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 'review' ? (
            <>
              <button className="btn btn-secondary" onClick={resetScanner} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Ulangi
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSaveTotalOnly}
                disabled={loading || !categoryId}
              >
                Simpan Total Saja
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveItemized}
                disabled={loading || !categoryId || items.length === 0}
              >
                {loading ? <span className="loading-spinner" /> : 'Simpan Rincian'}
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Batal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

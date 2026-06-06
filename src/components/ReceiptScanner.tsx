'use client';

import { useState, useEffect, useRef } from 'react';

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

  // Fetch categories on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.filter((c: Category) => c.type === 'expense'));
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
            {step === 'upload' && '📸 Scan Struk Belanja'}
            {step === 'scanning' && '🤖 Menganalisis Gambar...'}
            {step === 'review' && '📋 Review Hasil Scan'}
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="login-error" style={{ marginBottom: 16 }}>
              ⚠️ {error}
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
                  <div className="scanner-dropzone-icon">📸</div>
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
                      style={{ width: '100%' }}
                    >
                      🖼️ Pilih dari Galeri / File
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
                    <button className="btn btn-secondary btn-sm" onClick={() => setImage(null)}>
                      🗑️ Ganti Gambar
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleScan}>
                      🚀 Mulai Scan
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
                        <span className="category-item-icon">{cat.icon}</span>
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
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={handleAddItem}
                    >
                      ➕ Tambah Item
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
                    <div className="scanner-total-diff-warning">
                      ⚠️ Total rincian berbeda dengan total struk yang terbaca (Rp {new Intl.NumberFormat('id-ID').format(originalTotal)})
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
              <button className="btn btn-secondary" onClick={resetScanner} disabled={loading}>
                🔄 Ulangi
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleSaveTotalOnly}
                disabled={loading || !categoryId}
              >
                💾 Simpan Total Saja
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveItemized}
                disabled={loading || !categoryId || items.length === 0}
              >
                {loading ? <span className="loading-spinner" /> : '📋 Simpan Rincian'}
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

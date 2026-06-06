'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: {
    id: number;
    categoryId: number;
    type: string;
    amount: string;
    description: string;
    date: string;
  } | null;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSaved,
  editData,
}: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then(setCategories)
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setType(editData.type as 'expense' | 'income');
      setAmount(editData.amount);
      setCategoryId(editData.categoryId);
      setDescription(editData.description || '');
      setDate(editData.date);
    } else {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategoryId(null);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  const handleSubmit = async () => {
    if (!amount || !categoryId || !date) {
      setError('Jumlah, kategori, dan tanggal harus diisi');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus berupa angka positif');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = editData
        ? `/api/transactions/${editData.id}`
        : '/api/transactions';
      const method = editData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: numAmount,
          categoryId,
          description,
          date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan');
      }

      onSaved();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const formatDisplayAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="login-error" style={{ marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Tipe Transaksi</label>
            <div className="type-toggle">
              <button
                className={`type-toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => {
                  setType('expense');
                  setCategoryId(null);
                }}
              >
                ↓ Pengeluaran
              </button>
              <button
                className={`type-toggle-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => {
                  setType('income');
                  setCategoryId(null);
                }}
              >
                ↑ Pemasukan
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Jumlah (Rp)</label>
            <div className="form-input-icon-wrapper">
              <span className="form-input-icon">Rp</span>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            {amount && (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Rp {formatDisplayAmount(amount)}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <div className="category-grid">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-item ${categoryId === cat.id ? 'selected' : ''}`}
                  onClick={() => setCategoryId(cat.id)}
                >
                  <span className="category-item-icon">{cat.icon}</span>
                  <span className="category-item-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Keterangan (opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tulis keterangan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner" />
            ) : editData ? (
              '💾 Simpan'
            ) : (
              '➕ Tambah'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

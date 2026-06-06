'use client';

import { useState, useEffect, useCallback } from 'react';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import DeleteConfirm from '@/components/DeleteConfirm';

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

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<{
    id: number;
    categoryId: number;
    type: string;
    amount: string;
    description: string;
    date: string;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (filterType) params.set('type', filterType);
      if (filterCategory) params.set('categoryId', filterCategory);
      if (filterStartDate) params.set('startDate', filterStartDate);
      if (filterEndDate) params.set('endDate', filterEndDate);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();

      setTransactions(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterCategory, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleEdit = (tx: TransactionData) => {
    setEditData({
      id: tx.id,
      categoryId: tx.categoryId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description || '',
      date: tx.date,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/transactions/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteId(null);
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = () => {
    setEditData(null);
    fetchTransactions();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditData(null);
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const hasFilters = filterType || filterCategory || filterStartDate || filterEndDate;

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Kelola semua catatan keuangan Anda</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
        >
          ➕ Tambah Transaksi
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Semua Kategori</option>
          {categories
            .filter((c) => !filterType || c.type === filterType)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
        </select>

        <input
          type="date"
          className="form-input"
          placeholder="Dari tanggal"
          value={filterStartDate}
          onChange={(e) => {
            setFilterStartDate(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="date"
          className="form-input"
          placeholder="Sampai tanggal"
          value={filterEndDate}
          onChange={(e) => {
            setFilterEndDate(e.target.value);
            setPage(1);
          }}
        />

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            ✕ Reset
          </button>
        )}
      </div>

      {/* Transaction List */}
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
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
            showActions={true}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span style={{ color: 'var(--text-tertiary)', padding: '0 4px' }}>
                        ...
                      </span>
                    )}
                    <button
                      className={`pagination-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSaved={handleSaved}
        editData={editData}
      />

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}

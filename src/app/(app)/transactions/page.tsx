'use client';

import { useState, useEffect, useCallback } from 'react';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import DeleteConfirm from '@/components/DeleteConfirm';
import ReceiptScanner from '@/components/ReceiptScanner';

interface TransactionData {
  id: number;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  accountId?: number | null;
  accountName?: string | null;
  type: string;
  amount: string;
  description: string | null;
  date: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
}

interface Account {
  id: number;
  name: string;
  type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editData, setEditData] = useState<{
    id: number;
    categoryId: number;
    accountId?: number | null;
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

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data);
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
      if (filterAccount) params.set('accountId', filterAccount);
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
  }, [page, filterType, filterCategory, filterAccount, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, [fetchCategories, fetchAccounts]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleEdit = (tx: TransactionData) => {
    setEditData({
      id: tx.id,
      categoryId: tx.categoryId,
      accountId: tx.accountId,
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
    setFilterAccount('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const hasFilters = filterType || filterCategory || filterAccount || filterStartDate || filterEndDate;

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Kelola semua catatan keuangan Anda</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowScanner(true)}
          >
            📸 Scan Struk
          </button>
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

        <select
          className="form-select"
          value={filterAccount}
          onChange={(e) => {
            setFilterAccount(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Semua Rekening</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.type === 'bank' ? '🏦' : acc.type === 'e-wallet' ? '📱' : '💵'} {acc.name}
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

      {/* Receipt Scanner Modal */}
      <ReceiptScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSaved={fetchTransactions}
      />
    </div>
  );
}

'use client';

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-body">
          <div className="delete-confirm">
            <div className="delete-confirm-icon">⚠️</div>
            <h3 className="modal-title" style={{ marginBottom: 8 }}>Hapus Transaksi?</h3>
            <div className="delete-confirm-text">
              Transaksi yang sudah dihapus tidak bisa dikembalikan.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                style={{ background: 'var(--color-danger)' }}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? <span className="loading-spinner" /> : '🗑️ Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

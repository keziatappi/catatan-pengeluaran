export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month];
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatCompactRupiah(amount: number): string {
  if (amount === 0) return '0';
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 1).replace('.', ',')}M`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 1).replace('.', ',')}jt`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 1).replace('.', ',')}rb`;
  }
  return `${amount}`;
}


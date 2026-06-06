'use client';

import { formatRupiah, getMonthName } from '@/lib/utils';

interface MonthlyDataItem {
  month: number;
  year: number;
  income: number;
  expense: number;
}

interface ChartProps {
  monthlyData: MonthlyDataItem[];
}

export default function Chart({ monthlyData }: ChartProps) {
  const maxValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    1
  );

  const getBarHeight = (value: number) => {
    return Math.max((value / maxValue) * 100, 2);
  };

  return (
    <div className="card chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Tren 6 Bulan Terakhir</h3>
        <div className="chart-legend">
          <div className="chart-legend-item">
            <div
              className="chart-legend-dot"
              style={{ background: 'var(--color-income)' }}
            />
            Pemasukan
          </div>
          <div className="chart-legend-item">
            <div
              className="chart-legend-dot"
              style={{ background: 'var(--color-expense)' }}
            />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className="chart-bars">
        {monthlyData.map((item, index) => (
          <div key={index} className="chart-bar-group">
            <div className="chart-bar-wrapper">
              <div
                className="chart-bar income"
                style={{ height: `${getBarHeight(item.income)}%` }}
              >
                <div className="chart-bar-tooltip">
                  ↑ {formatRupiah(item.income)}
                </div>
              </div>
              <div
                className="chart-bar expense"
                style={{ height: `${getBarHeight(item.expense)}%` }}
              >
                <div className="chart-bar-tooltip">
                  ↓ {formatRupiah(item.expense)}
                </div>
              </div>
            </div>
            <span className="chart-bar-label">
              {getMonthName(item.month - 1).slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

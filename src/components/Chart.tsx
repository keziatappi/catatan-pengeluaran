'use client';

import { formatRupiah, getMonthName, formatCompactRupiah } from '@/lib/utils';

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
  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    1
  );
  const scaleMax = maxVal * 1.15;

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

      <div className="chart-container-wrapper">
        {/* Chart Plot Area */}
        <div className="chart-plot-area">
          {/* Grid Lines */}
          <div className="chart-grid-lines">
            <div className="chart-grid-line" />
            <div className="chart-grid-line" />
            <div className="chart-grid-line" />
            <div className="chart-grid-line baseline" />
          </div>

          {/* Chart Bars */}
          <div className="chart-bars">
            {monthlyData.map((item, index) => {
              const getBarHeight = (value: number) => {
                return Math.max((value / scaleMax) * 100, 2);
              };

              const heightIncome = getBarHeight(item.income);
              const heightExpense = getBarHeight(item.expense);
              const isClose = Math.abs(heightIncome - heightExpense) < 12;

              const incomeLabelBottom = isClose && heightIncome < heightExpense ? 'calc(100% + 16px)' : 'calc(100% + 4px)';
              const expenseLabelBottom = isClose && heightExpense <= heightIncome ? 'calc(100% + 16px)' : 'calc(100% + 4px)';

              return (
                <div key={index} className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    {/* Income Bar */}
                    <div
                      className="chart-bar income"
                      style={{ height: `${heightIncome}%` }}
                    >
                      {item.income > 0 && (
                        <div className="chart-bar-value income" style={{ bottom: incomeLabelBottom }}>
                          {formatCompactRupiah(item.income)}
                        </div>
                      )}
                    </div>

                    {/* Expense Bar */}
                    <div
                      className="chart-bar expense"
                      style={{ height: `${heightExpense}%` }}
                    >
                      {item.expense > 0 && (
                        <div className="chart-bar-value expense" style={{ bottom: expenseLabelBottom }}>
                          {formatCompactRupiah(item.expense)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="chart-bar-label" style={{ marginTop: '8px' }}>
                    {getMonthName(item.month - 1).slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


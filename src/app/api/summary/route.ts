import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { transactions, users } from '@/db/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

function getUserId(request: NextRequest): number | null {
  const userId = request.headers.get('x-user-id');
  return userId ? parseInt(userId) : null;
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0); // Last day of month
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // Get totals by type
    const totals = await db
      .select({
        type: transactions.type,
        total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDateStr)
        )
      )
      .groupBy(transactions.type);

    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach((t) => {
      if (t.type === 'income') totalIncome = parseFloat(t.total);
      if (t.type === 'expense') totalExpense = parseFloat(t.total);
    });

    // Get daily breakdown for chart
    const dailyData = await db
      .select({
        date: transactions.date,
        type: transactions.type,
        total: sql<string>`SUM(${transactions.amount}::numeric)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDateStr)
        )
      )
      .groupBy(transactions.date, transactions.type)
      .orderBy(transactions.date);

    // Get monthly breakdown for yearly chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const mStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const mEndStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(mEnd.getDate()).padStart(2, '0')}`;

      const mTotals = await db
        .select({
          type: transactions.type,
          total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.date, mStart),
            lte(transactions.date, mEndStr)
          )
        )
        .groupBy(transactions.type);

      let mIncome = 0;
      let mExpense = 0;
      mTotals.forEach((t) => {
        if (t.type === 'income') mIncome = parseFloat(t.total);
        if (t.type === 'expense') mExpense = parseFloat(t.total);
      });

      monthlyData.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        income: mIncome,
        expense: mExpense,
      });
    }

    // Get start of current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const startOfWeekStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get weekly expense
    const weeklyTotals = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startOfWeekStr),
          lte(transactions.date, todayStr)
        )
      );
    const totalWeeklyExpense = parseFloat(weeklyTotals[0]?.total || '0');

    // Get user limits
    const userLimits = await db
      .select({
        weeklyLimit: users.weeklyLimit,
        monthlyLimit: users.monthlyLimit,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const weeklyLimit = userLimits[0]?.weeklyLimit ? parseFloat(userLimits[0].weeklyLimit) : null;
    const monthlyLimit = userLimits[0]?.monthlyLimit ? parseFloat(userLimits[0].monthlyLimit) : null;

    return NextResponse.json({
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      dailyData,
      monthlyData,
      totalWeeklyExpense,
      weeklyLimit,
      monthlyLimit,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Gagal mengambil ringkasan' }, { status: 500 });
  }
}

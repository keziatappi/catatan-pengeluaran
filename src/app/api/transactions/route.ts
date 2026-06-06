import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { transactions, categories } from '@/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

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
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions = [eq(transactions.userId, userId)];

    if (type && (type === 'income' || type === 'expense')) {
      conditions.push(eq(transactions.type, type));
    }
    if (startDate) {
      conditions.push(gte(transactions.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(transactions.date, endDate));
    }
    if (categoryId) {
      conditions.push(eq(transactions.categoryId, parseInt(categoryId)));
    }

    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: transactions.id,
          userId: transactions.userId,
          categoryId: transactions.categoryId,
          categoryName: categories.name,
          categoryIcon: categories.icon,
          type: transactions.type,
          amount: transactions.amount,
          description: transactions.description,
          date: transactions.date,
          createdAt: transactions.createdAt,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(whereClause)
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(whereClause),
    ]);

    const total = Number(countResult[0].count);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Gagal mengambil transaksi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { categoryId, type, amount, description, date } = body;

    if (!categoryId || !type || !amount || !date) {
      return NextResponse.json(
        { error: 'Kategori, tipe, jumlah, dan tanggal harus diisi' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'Tipe harus income atau expense' },
        { status: 400 }
      );
    }

    const result = await db.insert(transactions).values({
      userId,
      categoryId: parseInt(categoryId),
      type,
      amount: String(amount),
      description: description || null,
      date,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 });
  }
}

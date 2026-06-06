import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { accounts, transactions } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

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
    // Ambil semua rekening user
    let userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    // Jika rekening masih kosong (user baru/lama belum punya data rekening), lakukan inisialisasi default
    if (userAccounts.length === 0) {
      const defaultAccounts = [
        { name: 'Tunai', type: 'cash', userId },
      ];

      await db.insert(accounts).values(defaultAccounts);

      // Ambil kembali data rekening setelah disisipkan
      userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));

      // Hubungkan semua transaksi lama yang tidak ber-rekening (null) ke rekening 'Tunai'
      const tunaiAccount = userAccounts.find(acc => acc.name === 'Tunai');
      if (tunaiAccount) {
        await db
          .update(transactions)
          .set({ accountId: tunaiAccount.id })
          .where(
            and(
              eq(transactions.userId, userId),
              sql`${transactions.accountId} IS NULL`
            )
          );
      }
    }

    // Hitung total pemasukan & pengeluaran per rekening
    const txSums = await db
      .select({
        accountId: transactions.accountId,
        type: transactions.type,
        total: sql<string>`COALESCE(SUM(${transactions.amount}::numeric), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .groupBy(transactions.accountId, transactions.type);

    const accountsWithBalance = userAccounts.map(account => {
      const incomeSum = txSums
        .filter(t => t.accountId === account.id && t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.total || '0'), 0);
      const expenseSum = txSums
        .filter(t => t.accountId === account.id && t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.total || '0'), 0);

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        accountNumber: account.accountNumber,
        balance: incomeSum - expenseSum,
      };
    });

    return NextResponse.json(accountsWithBalance);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Gagal mengambil data rekening' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, accountNumber } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan tipe rekening/e-wallet harus diisi' },
        { status: 400 }
      );
    }

    if (type !== 'bank' && type !== 'e-wallet' && type !== 'cash') {
      return NextResponse.json(
        { error: 'Tipe harus berupa bank, e-wallet, atau cash' },
        { status: 400 }
      );
    }

    const result = await db.insert(accounts).values({
      userId,
      name,
      type,
      accountNumber: accountNumber || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Gagal membuat rekening' }, { status: 500 });
  }
}

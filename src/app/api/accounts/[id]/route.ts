import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { accounts, transactions } from '@/db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';

function getUserId(request: NextRequest): number | null {
  const userId = request.headers.get('x-user-id');
  return userId ? parseInt(userId) : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, accountNumber } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nama dan tipe rekening/e-wallet harus diisi' },
        { status: 400 }
      );
    }

    // Ambil data rekening yang ada
    const existing = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, parseInt(id)), eq(accounts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Rekening tidak ditemukan' }, { status: 404 });
    }

    // Proteksi: Rekening default 'Tunai' tidak boleh diubah namanya menjadi selain Tunai atau tipe cash
    if (existing[0].name.toLowerCase() === 'tunai') {
      if (name.toLowerCase() !== 'tunai' || type !== 'cash') {
        return NextResponse.json(
          { error: 'Rekening Tunai bawaan tidak dapat diubah nama atau tipenya' },
          { status: 400 }
        );
      }
    }

    const result = await db
      .update(accounts)
      .set({
        name,
        type,
        accountNumber: accountNumber || null,
      })
      .where(and(eq(accounts.id, parseInt(id)), eq(accounts.userId, userId)))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Gagal mengupdate rekening' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const accountIdInt = parseInt(id);

    // Ambil data rekening yang ada
    const existing = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountIdInt), eq(accounts.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Rekening tidak ditemukan' }, { status: 404 });
    }

    // Proteksi: Rekening default 'Tunai' tidak boleh dihapus
    if (existing[0].name.toLowerCase() === 'tunai') {
      return NextResponse.json(
        { error: 'Rekening Tunai bawaan tidak dapat dihapus' },
        { status: 400 }
      );
    }

    // Temukan rekening 'Tunai' milik user untuk tujuan migrasi transaksi
    const tunaiAccount = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.name, 'Tunai')))
      .limit(1);

    if (tunaiAccount.length === 0) {
      return NextResponse.json(
        { error: 'Gagal memigrasi transaksi: Rekening Tunai bawaan tidak ditemukan' },
        { status: 500 }
      );
    }

    const tunaiId = tunaiAccount[0].id;

    // Migrasikan transaksi dari rekening yang dihapus ke rekening Tunai
    await db
      .update(transactions)
      .set({ accountId: tunaiId })
      .where(and(eq(transactions.userId, userId), eq(transactions.accountId, accountIdInt)));

    // Hapus rekening
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, accountIdInt), eq(accounts.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Gagal menghapus rekening' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { transactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
    const { categoryId, type, amount, description, date } = body;

    // Verify ownership
    const existing = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    const result = await db
      .update(transactions)
      .set({
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        type: type || undefined,
        amount: amount ? String(amount) : undefined,
        description: description !== undefined ? description : undefined,
        date: date || undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.userId, userId)))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Gagal mengupdate transaksi' }, { status: 500 });
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

    const existing = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    await db
      .delete(transactions)
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}

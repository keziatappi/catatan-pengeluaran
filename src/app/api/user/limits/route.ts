import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    const user = await db
      .select({
        weeklyLimit: users.weeklyLimit,
        monthlyLimit: users.monthlyLimit,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      weeklyLimit: user[0].weeklyLimit ? parseFloat(user[0].weeklyLimit) : null,
      monthlyLimit: user[0].monthlyLimit ? parseFloat(user[0].monthlyLimit) : null,
    });
  } catch (error) {
    console.error('Error fetching limits:', error);
    return NextResponse.json({ error: 'Gagal mengambil batas pengeluaran' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const weeklyLimit = body.weeklyLimit;
    const monthlyLimit = body.monthlyLimit;

    // Validate inputs
    const updatedWeeklyLimit = weeklyLimit === null || weeklyLimit === '' ? null : String(parseFloat(String(weeklyLimit)));
    const updatedMonthlyLimit = monthlyLimit === null || monthlyLimit === '' ? null : String(parseFloat(String(monthlyLimit)));

    if (updatedWeeklyLimit !== null && isNaN(parseFloat(updatedWeeklyLimit))) {
      return NextResponse.json({ error: 'Batas mingguan tidak valid' }, { status: 400 });
    }
    if (updatedMonthlyLimit !== null && isNaN(parseFloat(updatedMonthlyLimit))) {
      return NextResponse.json({ error: 'Batas bulanan tidak valid' }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        weeklyLimit: updatedWeeklyLimit,
        monthlyLimit: updatedMonthlyLimit,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      weeklyLimit: updatedWeeklyLimit ? parseFloat(updatedWeeklyLimit) : null,
      monthlyLimit: updatedMonthlyLimit ? parseFloat(updatedMonthlyLimit) : null,
    });
  } catch (error) {
    console.error('Error updating limits:', error);
    return NextResponse.json({ error: 'Gagal memperbarui batas pengeluaran' }, { status: 500 });
  }
}

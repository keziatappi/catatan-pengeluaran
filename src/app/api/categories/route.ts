import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
    return NextResponse.json(allCategories);
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

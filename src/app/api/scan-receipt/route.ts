import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

function getUserId(request: NextRequest): number | null {
  const userId = request.headers.get('x-user-id');
  return userId ? parseInt(userId) : null;
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API Key belum diatur di server. Silakan hubungi admin.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Gambar struk tidak ditemukan' }, { status: 400 });
    }

    // Extract base64 and mime type if it's a data URL
    let base64Data = image;
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // Fetch expense categories to let Gemini match them
    const expenseCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.type, 'expense'));

    const categoriesListString = expenseCategories
      .map(c => `ID ${c.id}: ${c.name}`)
      .join('\n');

    const prompt = `
Anda adalah asisten pembaca struk belanja otomatis yang sangat akurat.
Tugas Anda adalah menganalisis gambar struk belanja ini dan mengekstrak informasi terstruktur berikut:
1. Nama merchant/toko (merchant)
2. Tanggal transaksi (date) dalam format YYYY-MM-DD. Jika tidak ditemukan atau tidak jelas, gunakan tanggal hari ini (${new Date().toISOString().split('T')[0]}).
3. Total pengeluaran (totalAmount) sebagai angka numerik murni.
4. Daftar item belanja (items) yang dibeli, setiap item memiliki nama (name) dan harga (price).
5. ID Kategori terdekat yang paling cocok untuk seluruh pengeluaran ini dari daftar kategori berikut:
${categoriesListString}

Berikan respons Anda dalam format JSON dengan struktur berikut:
{
  "merchant": "Nama Toko",
  "date": "YYYY-MM-DD",
  "totalAmount": 150000,
  "items": [
    { "name": "Item A", "price": 50000 },
    { "name": "Item B", "price": 100000 }
  ],
  "suggestedCategoryId": <ID Kategori terpilih dari daftar>
}

Pastikan Anda hanya mengembalikan JSON yang valid tanpa teks tambahan.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                merchant: { type: 'STRING' },
                date: { type: 'STRING', description: 'Format YYYY-MM-DD' },
                totalAmount: { type: 'NUMBER' },
                items: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING' },
                      price: { type: 'NUMBER' },
                    },
                    required: ['name', 'price'],
                  },
                },
                suggestedCategoryId: {
                  type: 'INTEGER',
                  description: 'ID kategori yang paling cocok',
                },
              },
              required: ['merchant', 'date', 'totalAmount', 'items', 'suggestedCategoryId'],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      return NextResponse.json(
        { error: `Gagal memproses gambar dengan Gemini API: ${response.statusText}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const textContent = candidate?.content?.parts?.[0]?.text;

    if (!textContent) {
      return NextResponse.json(
        { error: 'Gemini tidak mengembalikan hasil analisis yang valid.' },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(textContent);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Error in scan-receipt route:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat memindai struk: ${error.message || error}` },
      { status: 500 }
    );
  }
}

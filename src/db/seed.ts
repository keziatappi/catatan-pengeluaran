import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { hash } from 'bcryptjs';
import { users, categories } from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed users
  const password1 = await hash('adittiocici1203', 12);
  const password2 = await hash('adittiocici1203', 12);

  await db.insert(users).values([
    { username: 'kavinsky', password: password1, name: 'Adit Kavinsky' },
    { username: 'covey', password: password2, name: 'Cici Covey' },
  ]).onConflictDoNothing();

  console.log('✅ Users seeded');

  // Seed categories
  await db.insert(categories).values([
    // Expense categories
    { name: 'Makanan & Minuman', type: 'expense', icon: '🍔' },
    { name: 'Transportasi', type: 'expense', icon: '🚗' },
    { name: 'Belanja', type: 'expense', icon: '🛒' },
    { name: 'Tagihan & Utilitas', type: 'expense', icon: '💡' },
    { name: 'Hiburan', type: 'expense', icon: '🎮' },
    { name: 'Kesehatan', type: 'expense', icon: '🏥' },
    { name: 'Pendidikan', type: 'expense', icon: '📚' },
    { name: 'Rumah Tangga', type: 'expense', icon: '🏠' },
    { name: 'Pakaian', type: 'expense', icon: '👕' },
    { name: 'Lainnya', type: 'expense', icon: '📦' },
    // Income categories
    { name: 'Gaji', type: 'income', icon: '💰' },
    { name: 'Freelance', type: 'income', icon: '💻' },
    { name: 'Investasi', type: 'income', icon: '📈' },
    { name: 'Bonus', type: 'income', icon: '🎁' },
    { name: 'Penjualan', type: 'income', icon: '🏷️' },
    { name: 'Lainnya', type: 'income', icon: '💵' },
  ]).onConflictDoNothing();

  console.log('✅ Categories seeded');
  console.log('🎉 Seeding completed!');
}

seed().catch(console.error);

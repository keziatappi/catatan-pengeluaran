import { SignJWT, jwtVerify } from 'jose';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-me');
const COOKIE_NAME = 'auth-token';

export interface JWTPayload {
  userId: number;
  username: string;
  name: string;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<JWTPayload | null> {
  const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (user.length === 0) return null;

  const isValid = await compare(password, user[0].password);
  if (!isValid) return null;

  return {
    userId: user[0].id,
    username: user[0].username,
    name: user[0].name,
  };
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

export { COOKIE_NAME };

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '@/models/User';
import { connectDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const SESSION_COOKIE = 'session-token';

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: { userId: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifySession(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = verifySession(token);
    await connectDb();
    const user = await User.findById(decoded.userId).lean();
    if (!user || Array.isArray(user)) return null;
    return {
      id: (user as any)._id.toString(),
      email: (user as any).email,
      role: (user as any).role,
      name: (user as any).name
    };
  } catch (err) {
    return null;
  }
}

export function requireRole(user: { role: string } | null, roles: string[]) {
  if (!user) throw new Error('Non authentifié');
  if (!roles.includes(user.role)) throw new Error('Accès refusé');
}

import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';

// Simple seed route: POST { email, password, name } creates admin if not existing
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const body = await req.json();
  const { email, password, name } = body;
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password, name requis' }, { status: 400 });
  }

  await connectDb();
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ message: 'Utilisateur existe déjà' });

  const passwordHash = await hashPassword(password);
  const created = await User.create({ email, passwordHash, name, role: 'admin', status: 'active' });
  return NextResponse.json({ ok: true, userId: created._id });
}
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { User } from '@/models/User';
import { setSessionCookie, signSession, verifyPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!rateLimit(`login:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Trop de tentatives, réessayez' }, { status: 429 });
    }

    const body = await req.json();
    const { email, password } = body;

    console.log('Login attempt:', { email, passwordLength: password?.length });

    await connectDb();
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('User found:', user ? { email: user.email, hasPasswordHash: !!user.passwordHash } : 'NOT FOUND');
    
    if (!user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    
    const ok = await verifyPassword(password, user.passwordHash);
    console.log('Password verification:', ok);
    
    if (!ok) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const token = signSession({ userId: user._id.toString(), role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    const message = err instanceof Error ? err.message : 'Serveur indisponible';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

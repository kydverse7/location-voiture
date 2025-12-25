import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  const payload = await req.json();
  await sendNotification(payload);
  return NextResponse.json({ ok: true });
}

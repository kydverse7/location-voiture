import { NextResponse } from 'next/server';
import { saveFile, getPresignedUrl } from '@/lib/storage';
import { rateLimit } from '@/lib/rateLimit';
import { getCurrentUser, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`upload:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes upload' }, { status: 429 });
  }
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.startsWith('application/json')) {
    const { name, type } = await req.json();
    const presigned = await getPresignedUrl(name, type);
    if (presigned) return NextResponse.json(presigned);
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveFile(file.name, buffer, file.type);
  return NextResponse.json({ url: stored });
}

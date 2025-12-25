import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Location } from '@/models/Location';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { recordAudit } from '@/services/auditService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  await connectDb();
  const { nouvelleFin, montantSup } = await req.json();
  const { id } = await params;
  const loc = await Location.findById(id);
  if (!loc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const before = loc.toObject();
  loc.finPrevueAt = new Date(nouvelleFin);
  loc.prolongations.push({ nouvelleFin, montantSup, date: new Date() } as any);
  loc.montantTotal = (loc.montantTotal ?? 0) + (montantSup ?? 0);
  await loc.save();
  await recordAudit(user!.id, 'location:prolong', 'Location', id, before, loc);
  return NextResponse.json({ location: loc });
}

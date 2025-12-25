import { NextResponse } from 'next/server';
import { generateContractPdf, streamToBuffer } from '@/lib/pdf';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin', 'agent']);
  const body = await req.json();
  const pdf = generateContractPdf({
    client: body.client,
    vehicle: body.vehicle,
    dates: body.dates,
    montant: body.montant ?? 0
  });
  const buffer = await streamToBuffer(pdf);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="contrat.pdf"'
    }
  });
}

import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { Expense } from '@/models/Expense';
import { getCurrentUser, requireRole } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  requireRole(user, ['admin']);
  await connectDb();
  const expenses = await Expense.find().sort({ date: -1 }).lean();
  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  requireRole(user, ['admin']);
  await connectDb();
  const body = await req.json();
  if (!body.type || typeof body.montant !== 'number') {
    return NextResponse.json({ error: 'type et montant requis' }, { status: 400 });
  }
  const created = await Expense.create(body);
  return NextResponse.json({ expense: created }, { status: 201 });
}
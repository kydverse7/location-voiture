import { headers } from 'next/headers';
import { AuditLog } from '@/models/AuditLog';
import { connectDb } from '@/lib/db';

export async function recordAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  await connectDb();
  const hdrs = await headers();
  await AuditLog.create({
    actor: actorId,
    action,
    entityType,
    entityId,
    before,
    after,
    ip: hdrs.get('x-forwarded-for') ?? undefined,
    userAgent: hdrs.get('user-agent') ?? undefined
  });
}

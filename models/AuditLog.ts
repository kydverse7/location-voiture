import { Schema, model, models, Types } from 'mongoose';

const AuditLogSchema = new Schema(
  {
    actor: { type: Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
    ip: String,
    userAgent: String
  },
  { timestamps: true }
);

export const AuditLog = models.AuditLog || model('AuditLog', AuditLogSchema);

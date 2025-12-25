import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    phone: String,
    role: { type: String, enum: ['admin', 'agent'], required: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    permissions: [{ type: String }],
    lastLoginAt: Date
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);

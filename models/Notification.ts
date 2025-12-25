import { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema(
  {
    type: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
    canal: { type: String, enum: ['reservation', 'retard', 'rappel_retour', 'interne'], required: true },
    payload: Schema.Types.Mixed,
    to: String,
    statut: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    sentAt: Date
  },
  { timestamps: true }
);

export const Notification = models.Notification || model('Notification', NotificationSchema);

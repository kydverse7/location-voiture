import { Notification } from '@/models/Notification';
import { connectDb } from './db';

type NotificationType = 'whatsapp' | 'sms' | 'email';

type NotificationPayload = {
  to: string;
  subject?: string;
  message: string;
  type: NotificationType;
  canal: 'reservation' | 'retard' | 'rappel_retour' | 'interne';
};

export async function sendNotification(payload: NotificationPayload) {
  await connectDb();
  // Mock sending: log + store
  // eslint-disable-next-line no-console
  console.log(`[NOTIF ${payload.type}]`, payload.to, payload.message);
  await Notification.create({
    type: payload.type,
    canal: payload.canal,
    payload,
    to: payload.to,
    statut: 'sent',
    sentAt: new Date()
  });
}

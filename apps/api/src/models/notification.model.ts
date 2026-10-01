import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from '@tebeya/shared';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'event_published',
        'event_updated',
        'event_cancelled',
        'seat_opened',
        'event_reminder',
        'account_verified',
        'payment_marked',
      ],
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

notificationSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.userId = obj.userId.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', notificationSchema);

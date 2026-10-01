import mongoose, { Schema, Document, Model } from 'mongoose';
import { BookingStatus, AttendanceStatus, PayoutStatus } from '@tebeya/shared';

export interface IBookingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: BookingStatus;
  attendance: AttendanceStatus;
  acknowledgedDoubleBooking: boolean;
  payoutAmount: number;
  payoutStatus: PayoutStatus;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'CateringEvent',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'waitlisted', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    attendance: {
      type: String,
      enum: ['pending', 'present', 'absent', 'late'],
      default: 'pending',
      index: true,
    },
    acknowledgedDoubleBooking: { type: Boolean, default: false },
    payoutAmount: { type: Number, default: 0, min: 0 },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index preventing duplicate active/historical bookings
bookingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

bookingSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.userId = obj.userId.toString();
  obj.eventId = obj.eventId.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const Booking: Model<IBookingDocument> =
  mongoose.models.Booking || mongoose.model<IBookingDocument>('Booking', bookingSchema);

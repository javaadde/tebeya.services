import mongoose, { Schema, Document, Model } from 'mongoose';
import { EventSlot, EventStatus } from '@tebeya/shared';

export interface ICateringEventDocument extends Document {
  title: string;
  imageUrl?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slot: EventSlot;
  venue: {
    text: string;
    lat?: number;
    lng?: number;
  };
  headcount: number;
  filledCount: number;
  payPerPerson: number;
  status: EventStatus;
  notes?: string;
  dressCode?: string;
  contactPerson?: {
    name: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const cateringEventSchema = new Schema<ICateringEventDocument>(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true }, // Format: HH:mm
    endTime: { type: String, required: true }, // Format: HH:mm
    slot: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner', 'custom'],
      required: true,
      index: true,
    },
    venue: {
      text: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    headcount: { type: Number, required: true, min: 1 },
    filledCount: { type: Number, default: 0, min: 0 },
    payPerPerson: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    notes: { type: String },
    dressCode: { type: String },
    contactPerson: {
      name: { type: String },
      phone: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

cateringEventSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const CateringEvent: Model<ICateringEventDocument> =
  mongoose.models.CateringEvent ||
  mongoose.model<ICateringEventDocument>('CateringEvent', cateringEventSchema);

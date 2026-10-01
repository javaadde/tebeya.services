import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminOtpDocument extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const adminOtpSchema = new Schema<IAdminOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // MongoDB automatic TTL expiry
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminOtp: Model<IAdminOtpDocument> =
  mongoose.models.AdminOtp || mongoose.model<IAdminOtpDocument>('AdminOtp', adminOtpSchema);

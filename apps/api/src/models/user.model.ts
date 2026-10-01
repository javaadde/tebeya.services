import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, UserStatus } from '@tebeya/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  profileImageUrl?: string;
  idProofUrl?: string;
  address?: {
    text: string;
    lat?: number;
    lng?: number;
    confirmed: boolean;
  };
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    phoneVerified: { type: Boolean, default: false },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['staff', 'admin'], default: 'staff', index: true },
    status: {
      type: String,
      enum: ['pending_verification', 'active', 'suspended'],
      default: 'pending_verification',
      index: true,
    },
    profileImageUrl: { type: String },
    idProofUrl: { type: String },
    address: {
      text: { type: String, default: '' },
      lat: { type: Number },
      lng: { type: Number },
      confirmed: { type: Boolean, default: false },
    },
    fcmTokens: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  delete obj.passwordHash;
  return obj;
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

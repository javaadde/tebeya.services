import mongoose, { Schema, Document, Model } from 'mongoose';
import { InviteCodeStatus } from '@tebeya/shared';

export interface IInviteCodeDocument extends Document {
  code: string;
  createdBy: mongoose.Types.ObjectId;
  lockedPhoneOrEmail?: string;
  expiresAt: Date;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  status: InviteCodeStatus;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const inviteCodeSchema = new Schema<IInviteCodeDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lockedPhoneOrEmail: { type: String, trim: true },
    expiresAt: { type: Date, required: true },
    usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    usedAt: { type: Date },
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'revoked'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

inviteCodeSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const InviteCode: Model<IInviteCodeDocument> =
  mongoose.models.InviteCode ||
  mongoose.model<IInviteCodeDocument>('InviteCode', inviteCodeSchema);

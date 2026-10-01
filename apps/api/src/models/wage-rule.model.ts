import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWageRuleDocument extends Document {
  basePay: number;
  freeKm: number;
  perKmRate: number;
  updatedAt: Date;
  toSafeJSON(): Record<string, unknown>;
}

const wageRuleSchema = new Schema<IWageRuleDocument>(
  {
    basePay: { type: Number, required: true, default: 750 },
    freeKm: { type: Number, required: true, default: 15 },
    perKmRate: { type: Number, required: true, default: 10 },
  },
  {
    timestamps: true,
  }
);

wageRuleSchema.methods.toSafeJSON = function (): Record<string, unknown> {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const WageRule: Model<IWageRuleDocument> =
  mongoose.models.WageRule || mongoose.model<IWageRuleDocument>('WageRule', wageRuleSchema);

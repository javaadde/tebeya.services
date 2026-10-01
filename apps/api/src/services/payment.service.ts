import { Booking } from '../models/booking.model.js';
import { WageRule } from '../models/wage-rule.model.js';
import { EarningsSummary, WageRule as IWageRule } from '@tebeya/shared';

export class PaymentService {
  static async getEarningsSummary(userId: string): Promise<EarningsSummary> {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const bookings = await Booking.find({ userId, status: 'confirmed' }).populate<{
      eventId: { date: string };
    }>('eventId');

    let totalEventsWorked = 0;
    let totalEarnings = 0;
    let currentMonthEarnings = 0;
    let pendingPayouts = 0;

    for (const b of bookings) {
      if (b.attendance === 'present') {
        totalEventsWorked += 1;
        totalEarnings += b.payoutAmount;

        if (b.eventId && b.eventId.date.startsWith(currentMonthPrefix)) {
          currentMonthEarnings += b.payoutAmount;
        }

        if (b.payoutStatus === 'pending') {
          pendingPayouts += b.payoutAmount;
        }
      }
    }

    return {
      totalEventsWorked,
      totalEarnings,
      currentMonthEarnings,
      pendingPayouts,
    };
  }

  static async markBookingsPaid(bookingIds: string[]): Promise<{ markedCount: number }> {
    const res = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { payoutStatus: 'paid' }
    );
    return { markedCount: res.modifiedCount };
  }

  static async getWageRule(): Promise<IWageRule> {
    let rule = await WageRule.findOne();
    if (!rule) {
      rule = await WageRule.create({
        basePay: 750,
        freeKm: 15,
        perKmRate: 10,
      });
    }
    return rule.toSafeJSON() as any;
  }

  static async updateWageRule(updates: Partial<{
    basePay: number;
    freeKm: number;
    perKmRate: number;
  }>): Promise<IWageRule> {
    let rule = await WageRule.findOne();
    if (!rule) {
      rule = await WageRule.create({
        basePay: updates.basePay ?? 750,
        freeKm: updates.freeKm ?? 15,
        perKmRate: updates.perKmRate ?? 10,
      });
    } else {
      if (updates.basePay !== undefined) rule.basePay = updates.basePay;
      if (updates.freeKm !== undefined) rule.freeKm = updates.freeKm;
      if (updates.perKmRate !== undefined) rule.perKmRate = updates.perKmRate;
      await rule.save();
    }
    return rule.toSafeJSON() as any;
  }
}

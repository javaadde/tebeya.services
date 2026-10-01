import { Booking } from '../models/booking.model.js';
import { CateringEvent } from '../models/event.model.js';
import { AppError } from '../utils/errors.js';
import { AttendanceStatus, RosterItem } from '@tebeya/shared';

export class RosterService {
  static async getEventRoster(eventId: string): Promise<{
    eventId: string;
    headcount: number;
    filledCount: number;
    waitlistCount: number;
    roster: RosterItem[];
  }> {
    const event = await CateringEvent.findById(eventId);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Event not found', 404);
    }

    const bookings = await Booking.find({ eventId })
      .populate('userId', 'name phone profileImageUrl')
      .sort({ createdAt: 1 });

    const waitlistCount = bookings.filter((b) => b.status === 'waitlisted').length;

    const roster: RosterItem[] = bookings.map((b: any) => ({
      bookingId: b._id.toString(),
      user: {
        id: b.userId?._id?.toString() || b.userId?.toString(),
        name: b.userId?.name || 'Unknown',
        phone: b.userId?.phone || '',
        profileImageUrl: b.userId?.profileImageUrl,
      },
      status: b.status,
      attendance: b.attendance,
      payoutAmount: b.payoutAmount,
      payoutStatus: b.payoutStatus,
      createdAt: b.createdAt.toISOString(),
    }));

    return {
      eventId: event._id.toString(),
      headcount: event.headcount,
      filledCount: event.filledCount,
      waitlistCount,
      roster,
    };
  }

  static async markAttendance(
    eventId: string,
    attendees: Array<{ bookingId: string; attendance: AttendanceStatus }>
  ): Promise<{ updatedCount: number }> {
    let updatedCount = 0;
    for (const item of attendees) {
      const res = await Booking.updateOne(
        { _id: item.bookingId, eventId },
        { attendance: item.attendance }
      );
      if (res.modifiedCount > 0) {
        updatedCount += 1;
      }
    }
    return { updatedCount };
  }

  static async exportRosterCsv(eventId: string): Promise<string> {
    const rosterData = await this.getEventRoster(eventId);
    const header = 'Staff Name,Phone Number,Status,Attendance,Payout Amount,Payout Status\n';
    const rows = rosterData.roster.map((r) =>
      `"${r.user.name}","${r.user.phone}","${r.status}","${r.attendance}",${r.payoutAmount},"${r.payoutStatus}"`
    );
    return header + rows.join('\n');
  }
}

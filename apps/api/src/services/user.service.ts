import { User, IUserDocument } from '../models/user.model.js';
import { Booking } from '../models/booking.model.js';
import { AppError } from '../utils/errors.js';
import { UserStatus } from '@tebeya/shared';

export class UserService {
  static async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User profile not found', 404);
    }
    return user.toSafeJSON();
  }

  static async updateProfile(
    userId: string,
    updates: {
      name?: string;
      profileImageUrl?: string;
      idProofUrl?: string;
      address?: { text: string; lat?: number; lng?: number; confirmed: boolean };
    }
  ): Promise<Record<string, unknown>> {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    return user.toSafeJSON();
  }

  static async listStaff(filters?: {
    status?: UserStatus;
    search?: string;
  }): Promise<Record<string, unknown>[]> {
    const query: any = { role: 'staff' };
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const staff = await User.find(query).sort({ createdAt: -1 });

    // Enhance with attendance statistics
    const results = await Promise.all(
      staff.map(async (s) => {
        const noShowCount = await Booking.countDocuments({
          userId: s._id,
          attendance: 'absent',
        });
        const completedCount = await Booking.countDocuments({
          userId: s._id,
          attendance: 'present',
        });

        const safe = s.toSafeJSON();
        return {
          ...safe,
          noShowCount,
          completedCount,
        };
      })
    );

    return results;
  }

  static async getStaffDetail(id: string): Promise<Record<string, unknown>> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Staff member not found', 404);
    }

    const bookings = await Booking.find({ userId: id })
      .populate('eventId')
      .sort({ createdAt: -1 });

    return {
      ...user.toSafeJSON(),
      history: bookings.map((b) => b.toSafeJSON()),
    };
  }

  static async updateStaffStatus(
    id: string,
    data: { status?: UserStatus; phoneVerified?: boolean }
  ): Promise<Record<string, unknown>> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Staff member not found', 404);
    }
    return user.toSafeJSON();
  }
}

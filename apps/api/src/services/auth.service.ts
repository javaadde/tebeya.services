import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model.js';
import { InviteCode, IInviteCodeDocument } from '../models/invite-code.model.js';
import { AppError } from '../utils/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AuthResponse } from '@tebeya/shared';

export class AuthService {
  static async validateInvite(code: string): Promise<IInviteCodeDocument> {
    const invite = await InviteCode.findOne({ code: code.toUpperCase() });
    if (!invite) {
      throw new AppError('INVITE_NOT_FOUND', 'Invite code does not exist', 404);
    }

    if (invite.status === 'used') {
      throw new AppError('INVITE_ALREADY_USED', 'This invite code has already been redeemed', 400);
    }

    if (invite.status === 'revoked') {
      throw new AppError('INVITE_REVOKED', 'This invite code has been revoked by an admin', 400);
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      throw new AppError('INVITE_EXPIRED', 'This invite code has expired', 400);
    }

    return invite;
  }

  static async registerStaff(data: {
    inviteCode: string;
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const invite = await this.validateInvite(data.inviteCode);

    // If locked to a phone or email, enforce it
    if (invite.lockedPhoneOrEmail) {
      const lock = invite.lockedPhoneOrEmail.toLowerCase().trim();
      const emailMatches = data.email.toLowerCase() === lock;
      const phoneMatches = data.phone.trim() === lock;
      if (!emailMatches && !phoneMatches) {
        throw new AppError(
          'INVITE_LOCKED',
          'This invite code was issued for a different phone number or email address',
          403
        );
      }
    }

    // Check duplicate email or phone
    const existing = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phone: data.phone }],
    });
    if (existing) {
      throw new AppError('USER_ALREADY_EXISTS', 'Email or phone number is already registered', 409);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: 'staff',
      status: 'pending_verification',
      phoneVerified: false,
    });

    // Mark invite redeemed atomically
    invite.status = 'used';
    invite.usedBy = user._id;
    invite.usedAt = new Date();
    await invite.save();

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };

    return {
      user: user.toSafeJSON() as any,
      tokens,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended', 403);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const tokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };

    return {
      user: user.toSafeJSON() as any,
      tokens,
    };
  }

  static async refreshToken(refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshTokenStr);
      const user = await User.findById(payload.userId);
      if (!user || user.status === 'suspended') {
        throw new AppError('UNAUTHORIZED', 'Invalid session', 401);
      }

      const newPayload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      };

      return {
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      };
    } catch {
      throw new AppError('INVALID_TOKEN', 'Invalid or expired refresh token', 401);
    }
  }
}

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../models/user.model.js';
import { InviteCode, IInviteCodeDocument } from '../models/invite-code.model.js';
import { AdminOtp } from '../models/admin-otp.model.js';
import { EmailService } from './email.service.js';
import { isAuthorizedAdminEmail } from '../config/env.js';
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

  static async sendAdminOtp(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // Verify against allowed admin_web_controll_emails
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      throw new AppError(
        'UNAUTHORIZED_ADMIN_EMAIL',
        'This email address is not authorized for Admin Portal access',
        403
      );
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Invalidate prior codes and store new OTP
    await AdminOtp.deleteMany({ email: cleanEmail });
    await AdminOtp.create({
      email: cleanEmail,
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send email via Nodemailer
    await EmailService.sendAdminOtpEmail(cleanEmail, otp);

    return {
      message: 'A 6-digit one-time password has been sent to your authorized email address.',
    };
  }

  static async verifyAdminOtp(email: string, otp: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    // Verify against allowed admin_web_controll_emails
    if (!isAuthorizedAdminEmail(cleanEmail)) {
      throw new AppError(
        'UNAUTHORIZED_ADMIN_EMAIL',
        'This email address is not authorized for Admin Portal access',
        403
      );
    }

    const record = await AdminOtp.findOne({
      email: cleanEmail,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new AppError(
        'OTP_EXPIRED',
        'The one-time password has expired or is invalid. Please request a new code.',
        400
      );
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        await AdminOtp.deleteOne({ _id: record._id });
        throw new AppError(
          'OTP_MAX_ATTEMPTS',
          'Too many failed attempts. Please request a new code.',
          400
        );
      }
      await record.save();
      throw new AppError('INVALID_OTP', 'Invalid one-time password code', 400);
    }

    // OTP verified successfully - consume it immediately
    await AdminOtp.deleteOne({ _id: record._id });

    // Find or provision admin account
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(randomPassword, salt);
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);

      user = await User.create({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: `+91 00000 ${randomSuffix}`,
        passwordHash,
        role: 'admin',
        status: 'active',
        phoneVerified: true,
      });
    } else {
      if (user.role !== 'admin') {
        user.role = 'admin';
        user.status = 'active';
        await user.save();
      }
    }

    if (user.status === 'suspended') {
      throw new AppError('ACCOUNT_SUSPENDED', 'Your admin account has been suspended', 403);
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
}

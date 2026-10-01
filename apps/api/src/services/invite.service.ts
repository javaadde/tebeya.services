import crypto from 'crypto';
import mongoose from 'mongoose';
import { InviteCode, IInviteCodeDocument } from '../models/invite-code.model.js';
import { AppError } from '../utils/errors.js';
import { InviteCodeStatus } from '@tebeya/shared';

export class InviteService {
  static async generateInviteCodes(
    createdBy: string,
    count = 1,
    expiresInHours = 48,
    lockedPhoneOrEmail?: string
  ): Promise<IInviteCodeDocument[]> {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const createdCodes: IInviteCodeDocument[] = [];

    for (let i = 0; i < count; i++) {
      const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `TB-${randomStr}`;

      const invite = await InviteCode.create({
        code,
        createdBy: new mongoose.Types.ObjectId(createdBy),
        expiresAt,
        lockedPhoneOrEmail,
        status: 'active',
      });
      createdCodes.push(invite);
    }

    return createdCodes;
  }

  static async listInviteCodes(filters?: {
    status?: InviteCodeStatus;
  }): Promise<Record<string, unknown>[]> {
    const query: any = {};
    if (filters?.status) {
      query.status = filters.status;
    }

    const invites = await InviteCode.find(query)
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email phone')
      .sort({ createdAt: -1 });

    return invites.map((inv: any) => ({
      ...inv.toSafeJSON(),
      createdByName: inv.createdBy?.name,
      usedByName: inv.usedBy?.name,
    }));
  }

  static async revokeInviteCode(id: string): Promise<Record<string, unknown>> {
    const invite = await InviteCode.findById(id);
    if (!invite) {
      throw new AppError('INVITE_NOT_FOUND', 'Invite code not found', 404);
    }
    if (invite.status === 'used') {
      throw new AppError('INVITE_ALREADY_USED', 'Cannot revoke an already used invite code', 400);
    }

    invite.status = 'revoked';
    await invite.save();
    return invite.toSafeJSON();
  }
}

import crypto from 'crypto';
import mongoose from 'mongoose';
import { InviteCode, IInviteCodeDocument } from '../models/invite-code.model.js';
import { AppError } from '../utils/errors.js';
import { InviteCodeStatus } from '@tebeya/shared';

// Clean uppercase alphanumeric characters without confusing glyphs, hyphens, or underscores
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCleanCode(length = 6): string {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return result;
}

export class InviteService {
  static async generateInviteCodes(
    createdBy: string,
    count = 1,
    expiresInMinutes = 2
  ): Promise<IInviteCodeDocument[]> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const createdCodes: IInviteCodeDocument[] = [];

    for (let i = 0; i < count; i++) {
      let code = generateCleanCode(6);
      while (await InviteCode.exists({ code })) {
        code = generateCleanCode(6);
      }

      const invite = await InviteCode.create({
        code,
        createdBy: new mongoose.Types.ObjectId(createdBy),
        expiresAt,
        status: 'active',
      });
      createdCodes.push(invite);
    }

    return createdCodes;
  }

  static async listInviteCodes(filters?: {
    status?: InviteCodeStatus;
  }): Promise<Record<string, unknown>[]> {
    // Purge expired codes from database immediately
    await InviteCode.deleteMany({ expiresAt: { $lt: new Date() } });

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

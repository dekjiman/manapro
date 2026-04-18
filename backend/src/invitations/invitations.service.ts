import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { db } from '../db';
import {
  invitations,
  tenants,
  tenantMembers,
  users,
  subscriptionPlans,
} from '../db/schema';
import { eq, and, count } from 'drizzle-orm';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationsService {
  constructor(private emailService: EmailService) {}

  async getByToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.tokenHash, tokenHash));

    if (!invitation) {
      throw new BadRequestException('Invitation tidak valid');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation sudah expired');
    }

    if (invitation.status === 'accepted') {
      throw new BadRequestException('Invitation sudah digunakan');
    }

    // Get tenant name
    const [tenant] = await db
      .select({ id: tenants.id, name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, invitation.tenantId));

    return {
      tenantId: invitation.tenantId,
      tenantName: tenant?.name || '',
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
    };
  }

  async inviteMember(
    tenantId: string,
    inviterId: string,
    email: string,
    role: string = 'member',
  ) {
    // Check if inviter is owner or admin
    const [member] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.userId, inviterId),
          eq(tenantMembers.tenantId, tenantId),
        ),
      );
    if (!member || !member.role || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Tidak memiliki izin untuk invite member');
    }

    // Check if email already has a pending invitation
    const [existingInvite] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.tenantId, tenantId),
          eq(invitations.status, 'pending'),
        ),
      );
    const [existingMember] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(
            tenantMembers.userId,
            (
              await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.email, email))
            )[0]?.id,
          ),
          eq(tenantMembers.tenantId, tenantId),
        ),
      );
    if (existingInvite || existingMember) {
      throw new BadRequestException(
        'Email sudah diinvite atau sudah menjadi member',
      );
    }

    // Check limit
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    const memberCount = await db
      .select({ count: count() })
      .from(tenantMembers)
      .where(eq(tenantMembers.tenantId, tenantId));
    if (tenant && memberCount[0].count >= (tenant.maxMembers || 0)) {
      throw new BadRequestException('Jumlah member sudah mencapai batas paket');
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await db
      .insert(invitations)
      .values({
        email,
        tenantId,
        role,
        token,
        tokenHash,
        expiresAt,
      })
      .returning();

    // Send email
    const acceptUrl = `${process.env.FRONTEND_URL}/invitations/accept?token=${token}`;
    await this.emailService.sendInvitationEmail(email, tenant.name, acceptUrl);

    return invitation;
  }

  async getInvitations(tenantId: string, status?: string) {
    const conditions = [eq(invitations.tenantId, tenantId)];
    if (status) {
      conditions.push(eq(invitations.status, status as any));
    }

    return await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        createdAt: invitations.createdAt,
        uses: invitations.uses,
      })
      .from(invitations)
      .where(and(...conditions));
  }

  async cancelInvitation(invitationId: string, tenantId: string) {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.tenantId, tenantId)
        )
      );

    if (!invitation) {
      throw new BadRequestException('Invitation tidak ditemukan');
    }

    await db
      .update(invitations)
      .set({ status: 'cancelled' })
      .where(eq(invitations.id, invitationId));

    return { message: 'Invitation dibatalkan' };
  }

  async deleteInvitation(invitationId: string, tenantId: string) {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.tenantId, tenantId)
        )
      );

    if (!invitation) {
      throw new BadRequestException('Invitation tidak ditemukan');
    }

    // Only allow deletion of cancelled or expired invitations
    if (invitation.status === 'pending') {
      throw new BadRequestException('Undangan masih aktif. Batalkan terlebih dahulu.');
    }

    if (invitation.status === 'accepted') {
      throw new BadRequestException('Undangan sudah digunakan.');
    }

    await db.delete(invitations).where(eq(invitations.id, invitationId));

    return { message: 'Invitation dihapus' };
  }

  async resendInvitation(invitationId: string, tenantId: string) {
    const [result] = await db
      .select({
        email: invitations.email,
        tenantName: tenants.name,
        status: invitations.status,
      })
      .from(invitations)
      .innerJoin(tenants, eq(invitations.tenantId, tenants.id))
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.tenantId, tenantId)
        )
      );

    if (!result) {
      throw new BadRequestException('Invitation tidak ditemukan');
    }

    if (result.status === 'accepted') {
      throw new BadRequestException('Invitation sudah digunakan');
    }

    if (result.status === 'cancelled') {
      throw new BadRequestException('Invitation sudah dibatalkan');
    }

    // Generate new token and reset expiry
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await db
      .update(invitations)
      .set({
        token,
        tokenHash,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .where(eq(invitations.id, invitationId));

    // Send email
    const acceptUrl = `${process.env.FRONTEND_URL}/invitations/accept?token=${token}`;
    await this.emailService.sendInvitationEmail(result.email, result.tenantName, acceptUrl);

    return { message: 'Invitation dikirim ulang' };
  }

  async acceptInvitation(token: string, userId: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.tokenHash, tokenHash));

    if (!invitation) {
      throw new BadRequestException('Invitation tidak valid');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation sudah expired');
    }

    if (invitation.status === 'accepted') {
      throw new BadRequestException('Invitation sudah digunakan');
    }

    if (invitation.uses && invitation.uses >= (invitation.maxUses || 1)) {
      throw new BadRequestException('Invitation sudah tidak dapat digunakan');
    }

    // Check if user email matches invitation email (case-insensitive, trimmed)
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new BadRequestException('User tidak ditemukan');
    }

    const normalizedUserEmail = user.email.toLowerCase().trim();
    const normalizedInviteEmail = invitation.email.toLowerCase().trim();
    if (normalizedUserEmail !== normalizedInviteEmail) {
      throw new BadRequestException('Email tidak cocok dengan invitation');
    }

    // Atomic update: increment uses and set status
    const result = await db
      .update(invitations)
      .set({
        status: 'accepted',
        uses: (invitation.uses || 0) + 1,
      })
      .where(
        and(
          eq(invitations.id, invitation.id),
          eq(invitations.status, 'pending'),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw new BadRequestException('Invitation sedang digunakan');
    }

    // Add user to tenant
    await db.insert(tenantMembers).values({
      userId,
      tenantId: invitation.tenantId,
      role: invitation.role,
    });

    return { message: 'Invitation diterima' };
  }
}

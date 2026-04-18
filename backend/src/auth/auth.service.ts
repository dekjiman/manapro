import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { db } from '../db';
import {
  passwordResets,
  users,
  userVerifications,
  tenantMembers,
  tenants,
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '../email/email.service';
import { InvitationsService } from '../invitations/invitations.service';

const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private invitationsService: InvitationsService,
  ) {}

  private validatePassword(password: string): void {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Password minimal ${MIN_PASSWORD_LENGTH} karakter`,
      );
    }
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async validateUser(email: string, password: string): Promise<any> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.isActive === false) {
      return null;
    }

    if (user.isVerified === false) {
      throw new UnauthorizedException('Email belum diverifikasi');
    }

    if (await bcrypt.compare(password, user.password)) {
      const { password: _, languagePref, ...rest } = user;
      return { ...rest, language_pref: languagePref || 'id' };
    }
    return null;
  }

  async login(email: string, password: string) {
    this.validatePassword(password);

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi salah');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(data: { name: string; email: string; password: string; invitationToken?: string }) {
    this.validatePassword(data.password);

    const [exists] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (exists) {
      throw new UnauthorizedException('Email atau kata sandi salah');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // If invited via invitation token, auto-verify user
    const isVerified = !!data.invitationToken;

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        isVerified,
        isActive: true,
      })
      .returning();

    // If invited via invitation token, auto-accept the invitation
    let invitedTenantIds: string[] = [];
    if (data.invitationToken) {
      try {
        await this.invitationsService.acceptInvitation(data.invitationToken, user.id);

        // Get user's tenants after accepting invitation to include in response
        const userTenants = await db
          .select({ tenantId: tenantMembers.tenantId })
          .from(tenantMembers)
          .where(eq(tenantMembers.userId, user.id));

        invitedTenantIds = userTenants.map(t => t.tenantId);
      } catch (invErr) {
        console.error('Failed to accept invitation during registration:', invErr);
        // Don't fail registration if invitation acceptance fails
      }
    } else {
      // Send verification email only if not invited
      const verificationToken = this.generateVerificationToken();
      const verificationTokenHash = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

      await db.insert(userVerifications).values({
        userId: user.id,
        token: verificationToken,
        tokenHash: verificationTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'email',
      });

      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          verificationToken,
        );
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    }

    const { password: _pwd, languagePref, isVerified: userIsVerified, isActive, ...rest } = user;
    const response = {
      user: { ...rest, isVerified: userIsVerified, language_pref: languagePref || 'id' },
    };

    // If invited, auto-login by including tokens
    if (data.invitationToken) {
      response['accessToken'] = this.jwtService.sign({ sub: user.id, email: user.email });
      response['refreshToken'] = this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: '7d' });
      response['tenant_ids'] = invitedTenantIds;
      response['current_tenant_id'] = invitedTenantIds[0] || null;
    }

    return response;
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [verification] = await db
      .select()
      .from(userVerifications)
      .where(eq(userVerifications.tokenHash, tokenHash));

    if (!verification) {
      throw new BadRequestException('Token tidak valid');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Token sudah expired');
    }

    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, verification.userId));

    await db
      .delete(userVerifications)
      .where(eq(userVerifications.id, verification.id));

    return { message: 'Email berhasil diverifikasi' };
  }

  async refreshToken(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        divisi: users.divisi,
        jabatan: users.jabatan,
        phone: users.phone,
        languagePref: users.languagePref,
        isVerified: users.isVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi salah');
    }
    const { languagePref, isVerified, isActive, ...rest } = user as any;
    return {
      ...rest,
      language_pref: languagePref || 'id',
      isVerified,
      isActive,
    };
  }

  async createPasswordReset(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return { message: 'Jika email terdaftar, link reset akan dikirim' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResets).values({
      email,
      token,
      expiresAt,
    });

    return { message: 'Jika email terdaftar, link reset akan dikirim' };
  }

  async resetPassword(token: string, newPassword: string) {
    this.validatePassword(newPassword);

    const [reset] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, token));
    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Token tidak valid atau sudah expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, reset.email));
    await db.delete(passwordResets).where(eq(passwordResets.token, token));

    return { message: 'Password berhasil direset' };
  }
}

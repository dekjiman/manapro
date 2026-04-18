import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login dengan email dan password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  async register(
    @Body() body: { name: string; email: string; password: string; invitationToken?: string },
  ) {
    const result = await this.authService.register(body);
    return { user: result.user };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: { email: string }) {
    const result = await this.authService.createPasswordReset(body.email);
    if (typeof result === 'object' && result !== null && 'token' in result) {
      await this.emailService.sendPasswordResetEmail(
        body.email,
        (result as { token: string }).token,
      );
    }
    return { message: 'Jika email terdaftar, link reset akan dikirim' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification' })
  async resendVerification(@Body() body: { email: string }) {
    return {
      message: 'Jika email belum diverifikasi, link verifikasi akan dikirim',
    };
  }
}

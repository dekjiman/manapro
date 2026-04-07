import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login dengan email dan password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  async register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body)
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshToken(user.id)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id)
  }
}

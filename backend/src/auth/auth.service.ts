import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, languagePref, ...rest } = user
      return { ...rest, language_pref: languagePref || 'id' }
    }
    return null
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi salah')
    }

    const payload = { sub: user.id, email: user.email }
    return {
      user,
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (exists) {
      throw new UnauthorizedException('Email sudah terdaftar')
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    })

    const { password: _, languagePref, ...rest } = user
    const payload = { sub: user.id, email: user.email }
    return {
      user: { ...rest, language_pref: languagePref || 'id' },
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    }
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan')
    }
    const payload = { sub: user.id, email: user.email }
    return {
      accessToken: this.jwtService.sign(payload),
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenantMembers: {
          include: { tenant: true },
        },
      },
    })
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan')
    }
    const { password, languagePref, ...rest } = user
    return {
      ...rest,
      language_pref: languagePref || 'id',
    }
  }
}

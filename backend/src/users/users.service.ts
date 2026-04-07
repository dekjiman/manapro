import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private toResponse(user: any) {
    const { languagePref, createdAt, ...rest } = user
    return {
      ...rest,
      language_pref: languagePref || 'id',
      created_at: createdAt,
    }
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        divisi: true,
        jabatan: true,
        phone: true,
        languagePref: true,
        createdAt: true,
      },
    })
    return users.map(u => this.toResponse(u))
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        divisi: true,
        jabatan: true,
        phone: true,
        languagePref: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('User tidak ditemukan')
    return this.toResponse(user)
  }

  async update(id: string, data: any) {
    // Map snake_case to camelCase for Prisma
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.avatar !== undefined) updateData.avatar = data.avatar
    if (data.divisi !== undefined) updateData.divisi = data.divisi
    if (data.jabatan !== undefined) updateData.jabatan = data.jabatan
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.language_pref !== undefined) updateData.languagePref = data.language_pref

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        divisi: true,
        jabatan: true,
        phone: true,
        languagePref: true,
        createdAt: true,
      },
    })
    return this.toResponse(user)
  }
}

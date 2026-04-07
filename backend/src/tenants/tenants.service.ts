import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    const memberships = await this.prisma.tenantMember.findMany({
      where: { userId },
      include: { tenant: true },
    })
    return memberships.map(m => ({ ...m.tenant, role: m.role }))
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, divisi: true, jabatan: true } } } } },
    })
    if (!tenant) throw new NotFoundException('Tenant tidak ditemukan')
    return tenant
  }

  async create(data: { name: string; slug: string; ownerId: string; plan?: string }) {
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        plan: data.plan || 'free',
      },
    })
    await this.prisma.tenantMember.create({
      data: { userId: data.ownerId, tenantId: tenant.id, role: 'owner' },
    })
    return tenant
  }

  async update(id: string, data: any) {
    // Map snake_case (frontend) to camelCase (Prisma)
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.logo_url !== undefined) updateData.logoUrl = data.logo_url
    if (data.plan !== undefined) updateData.plan = data.plan
    if (data.max_members !== undefined) updateData.maxMembers = data.max_members
    if (data.max_projects !== undefined) updateData.maxProjects = data.max_projects
    if (data.custom_branding !== undefined) updateData.customBranding = data.custom_branding
    if (data.audit_log !== undefined) updateData.auditLog = data.audit_log
    if (data.storage_limit_mb !== undefined) updateData.storageLimitMb = data.storage_limit_mb
    if (data.primary_color !== undefined) updateData.primaryColor = data.primary_color

    return this.prisma.tenant.update({ where: { id }, data: updateData })
  }

  async addMember(tenantId: string, userId: string, role: string = 'member') {
    return this.prisma.tenantMember.create({
      data: { userId, tenantId, role },
    })
  }

  async removeMember(tenantId: string, userId: string) {
    return this.prisma.tenantMember.delete({
      where: { userId_tenantId: { userId, tenantId } },
    })
  }

  async updateMemberRole(tenantId: string, userId: string, role: string) {
    return this.prisma.tenantMember.update({
      where: { userId_tenantId: { userId, tenantId } },
      data: { role },
    })
  }

  async getMembers(tenantId: string) {
    return this.prisma.tenantMember.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, name: true, email: true, avatar: true, divisi: true, jabatan: true } } },
    })
  }
}

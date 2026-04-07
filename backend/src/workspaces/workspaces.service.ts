import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.workspace.findMany({
      where: { tenantId },
      include: { members: true, projects: true },
    })
  }

  async findOne(id: string) {
    const ws = await this.prisma.workspace.findUnique({
      where: { id },
      include: { members: true, projects: true },
    })
    if (!ws) throw new NotFoundException('Workspace tidak ditemukan')
    return ws
  }

  async create(tenantId: string, ownerId: string, name: string) {
    const ws = await this.prisma.workspace.create({
      data: { tenantId, ownerId, name },
    })
    await this.prisma.workspaceMember.create({
      data: { workspaceId: ws.id, userId: ownerId },
    })
    return ws
  }

  async update(id: string, data: any) {
    return this.prisma.workspace.update({ where: { id }, data })
  }

  async delete(id: string) {
    return this.prisma.workspace.delete({ where: { id } })
  }
}

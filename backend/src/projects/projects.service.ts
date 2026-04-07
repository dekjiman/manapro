import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findByTenant(tenantId: string) {
    return this.prisma.project.findMany({ where: { tenantId } })
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.project.findMany({ where: { workspaceId } })
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { columns: { orderBy: { position: 'asc' } }, tasks: true },
    })
    if (!project) throw new NotFoundException('Project tidak ditemukan')
    return project
  }

  async create(data: any) {
    return this.prisma.project.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.project.update({ where: { id }, data })
  }

  async delete(id: string) {
    return this.prisma.project.delete({ where: { id } })
  }
}

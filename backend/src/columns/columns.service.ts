import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string) {
    return this.prisma.column.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
      include: { tasks: { orderBy: { position: 'asc' } } },
    })
  }

  async create(data: { projectId: string; name: string; color?: string; position: number }) {
    return this.prisma.column.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.column.update({ where: { id }, data })
  }

  async delete(id: string) {
    return this.prisma.column.delete({ where: { id } })
  }

  async reorder(projectId: string, columnIds: string[]) {
    const updates = columnIds.map((id, index) =>
      this.prisma.column.update({ where: { id }, data: { position: index } })
    )
    return this.prisma.$transaction(updates)
  }
}

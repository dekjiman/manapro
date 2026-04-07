import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findByColumn(columnId: string) {
    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    })
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ columnId: 'asc' }, { position: 'asc' }],
    })
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { comments: true, attachments: true, assignee: { select: { id: true, name: true, email: true, avatar: true } } },
    })
    if (!task) throw new NotFoundException('Task tidak ditemukan')
    return task
  }

  async create(data: any) {
    return this.prisma.task.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({ where: { id }, data })
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } })
  }

  async move(taskId: string, columnId: string, position: number) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { columnId, position },
    })
  }

  async reorder(columnId: string, taskIds: string[]) {
    const updates = taskIds.map((id, index) =>
      this.prisma.task.update({ where: { id }, data: { position: index } })
    )
    return this.prisma.$transaction(updates)
  }
}

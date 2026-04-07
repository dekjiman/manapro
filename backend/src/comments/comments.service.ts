import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async create(taskId: string, userId: string, content: string, mentions: string[] = []) {
    return this.prisma.comment.create({
      data: { taskId, userId, content, mentions },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async delete(id: string) {
    return this.prisma.comment.delete({ where: { id } })
  }
}

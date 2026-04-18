import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { tasks, comments, attachments, users } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';

@Injectable()
export class TasksService {
  async findByColumn(columnId: string) {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.columnId, columnId))
      .orderBy(asc(tasks.position));
  }

  async findByProject(projectId: string) {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(asc(tasks.columnId), asc(tasks.position));
  }

  async findOne(id: string) {
    const [task] = await db
      .select({
        id: tasks.id,
        columnId: tasks.columnId,
        projectId: tasks.projectId,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
        dueDate: tasks.dueDate,
        labels: tasks.labels,
        position: tasks.position,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        comments: comments,
        attachments: attachments,
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(tasks)
      .leftJoin(comments, eq(tasks.id, comments.taskId))
      .leftJoin(attachments, eq(tasks.id, attachments.taskId))
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, id));

    if (!task) throw new NotFoundException('Task tidak ditemukan');
    return task;
  }

  async create(data: any) {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async update(id: string, data: any) {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async delete(id: string) {
    const [task] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return task;
  }

  async move(taskId: string, columnId: string, position: number) {
    const [task] = await db
      .update(tasks)
      .set({ columnId, position })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async reorder(columnId: string, taskIds: string[]) {
    return await db.transaction(async (tx) => {
      const results: any[] = [];
      for (let index = 0; index < taskIds.length; index++) {
        const result = await tx
          .update(tasks)
          .set({ position: index })
          .where(eq(tasks.id, taskIds[index]))
          .returning();
        results.push(result[0]);
      }
      return results;
    });
  }
}

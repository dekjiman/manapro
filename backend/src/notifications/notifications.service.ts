import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { notifications } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  async findByUser(userId: string, page: number = 1, limit: number = 20) {
    const offsetValue = (page - 1) * limit;

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offsetValue);

    const totalResult = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    const total = Number(totalResult[0]?.count ?? 0);

    return {
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );
    return result[0].count;
  }

  async create(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    projectId: string;
    taskId?: string;
  }) {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async markAsRead(id: string) {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllAsRead(userId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );
  }
}

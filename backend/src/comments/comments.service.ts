import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { comments, users, notifications, tenantMembers } from '../db/schema';
import { eq, desc, asc, and, inArray, count } from 'drizzle-orm';

@Injectable()
export class CommentsService {
  async findByTask(taskId: string, page: number = 1, limit: number = 20) {
    const offsetValue = (page - 1) * limit;
    
    const result = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        userId: comments.userId,
        content: comments.content,
        mentions: comments.mentions,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(asc(comments.createdAt))
      .limit(limit)
      .offset(offsetValue);

    const totalResult = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.taskId, taskId));

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

  async create(
    taskId: string,
    userId: string,
    content: string,
    projectId: string,
  ) {
    const mentions = this.extractMentions(content);
    
    const [insertedComment] = await db
      .insert(comments)
      .values({ taskId, userId, content, mentions })
      .returning();
      
    const [comment] = await db
      .select({
        id: comments.id,
        taskId: comments.taskId,
        userId: comments.userId,
        content: comments.content,
        mentions: comments.mentions,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, insertedComment.id));

    if (mentions && mentions.length > 0) {
      await this.createMentionNotifications(
        mentions,
        userId,
        comment,
        projectId,
      );
    }

    return comment;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    return matches.map((m) => m.substring(1));
  }

  private async createMentionNotifications(
    mentionedUsernames: string[],
    authorId: string,
    comment: any,
    projectId: string,
  ) {
    const author = await db.query.users.findFirst({
      where: eq(users.id, authorId),
    });

    const mentionedUsers = await db.query.users.findMany({
      where: inArray(users.name, mentionedUsernames),
    });

    const notificationData = mentionedUsers.map((user) => ({
      type: 'comment_mention' as const,
      title: 'Anda disebutkan dalam komentar',
      message: `${author?.name} menyebutkan Anda dalam komentar: "${comment.content.substring(0, 50)}..."`,
      userId: user.id,
      projectId,
      taskId: comment.taskId,
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }

  async delete(id: string) {
    const [comment] = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }
}

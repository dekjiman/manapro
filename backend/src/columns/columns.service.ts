import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { columns, tasks } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class ColumnsService {
  async findByProject(projectId: string) {
    return await db
      .select({
        id: columns.id,
        projectId: columns.projectId,
        name: columns.name,
        position: columns.position,
        color: columns.color,
        createdAt: columns.createdAt,
        updatedAt: columns.updatedAt,
        tasks: tasks,
      })
      .from(columns)
      .leftJoin(tasks, eq(columns.id, tasks.columnId))
      .where(eq(columns.projectId, projectId))
      .orderBy(asc(columns.position), asc(tasks.position));
  }

  async create(data: {
    projectId: string;
    name: string;
    color?: string;
    position: number;
  }) {
    const [column] = await db.insert(columns).values(data).returning();
    return column;
  }

  async update(id: string, data: any) {
    const [column] = await db
      .update(columns)
      .set(data)
      .where(eq(columns.id, id))
      .returning();
    return column;
  }

  async delete(id: string) {
    const [column] = await db
      .delete(columns)
      .where(eq(columns.id, id))
      .returning();
    return column;
  }

  async reorder(projectId: string, columnIds: string[]) {
    return await db.transaction(async (tx) => {
      const results: any[] = [];
      for (let index = 0; index < columnIds.length; index++) {
        const result = await tx
          .update(columns)
          .set({ position: index })
          .where(eq(columns.id, columnIds[index]))
          .returning();
        results.push(result[0]);
      }
      return results;
    });
  }
}

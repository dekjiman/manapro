import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../db';
import { projects, columns, tasks } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class ProjectsService {
  async findByTenant(tenantId: string) {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.tenantId, tenantId));
  }

  async findByWorkspace(workspaceId: string) {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));
  }

  async findOne(id: string) {
    const [project] = await db
      .select({
        id: projects.id,
        tenantId: projects.tenantId,
        workspaceId: projects.workspaceId,
        name: projects.name,
        description: projects.description,
        startDate: projects.startDate,
        dueDate: projects.dueDate,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        columns: columns,
        tasks: tasks,
      })
      .from(projects)
      .leftJoin(columns, eq(projects.id, columns.projectId))
      .leftJoin(tasks, eq(projects.id, tasks.projectId))
      .where(eq(projects.id, id))
      .orderBy(asc(columns.position));

    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  async create(data: any) {
    // Validate required fields
    const tenantId = data.tenant_id || data.tenantId;
    const workspaceId = data.workspace_id || data.workspaceId;

    if (!tenantId) throw new BadRequestException('tenantId is required');
    if (!workspaceId) throw new BadRequestException('workspaceId is required');
    if (!data.name) throw new BadRequestException('name is required');

    // Convert date strings to Date objects if needed
    const startDate = data.start_date || data.startDate
      ? new Date(data.start_date || data.startDate)
      : undefined;
    const dueDate = data.due_date || data.dueDate
      ? new Date(data.due_date || data.dueDate)
      : undefined;

    const [project] = await db.insert(projects).values({
      tenantId,
      workspaceId,
      name: data.name,
      description: data.description,
      startDate,
      dueDate,
      status: data.status || 'active',
    }).returning();
    return project;
  }

  async update(id: string, data: any) {
    const [project] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async delete(id: string) {
    const [project] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }
}

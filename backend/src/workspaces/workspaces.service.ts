import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { db } from '../db';
import { workspaces, workspaceMembers, projects } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class WorkspacesService {
  async findByTenant(tenantId: string) {
    const wsList = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.tenantId, tenantId));
    const result: any[] = [];
    for (const ws of wsList) {
      const members = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, ws.id));
      const wsProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, ws.id));
      result.push({ ...ws, members, projects: wsProjects });
    }
    return result;
  }

  async findOne(id: string) {
    const [ws] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    if (!ws) throw new NotFoundException('Workspace tidak ditemukan');
    const members = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, id));
    const wsProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, id));
    return { ...ws, members, projects: wsProjects };
  }

  async create(tenantId: string, ownerId: string, name: string) {
    // Check if workspace with same name already exists in this tenant
    const existing = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.tenantId, tenantId), eq(workspaces.name, name)));

    if (existing.length > 0) {
      throw new ConflictException('Workspace dengan nama ini sudah ada');
    }

    const [ws] = await db
      .insert(workspaces)
      .values({ tenantId, ownerId, name })
      .returning();
    await db
      .insert(workspaceMembers)
      .values({ workspaceId: ws.id, userId: ownerId });
    return ws;
  }

  async update(id: string, data: any) {
    const [ws] = await db
      .update(workspaces)
      .set(data)
      .where(eq(workspaces.id, id))
      .returning();
    return ws;
  }

  async delete(id: string) {
    const [ws] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning();
    return ws;
  }
}

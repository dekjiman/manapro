import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import { tenants, tenantMembers, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TenantsService {
  async findMember(tenantId: string, userId: string) {
    const [member] = await db
      .select()
      .from(tenantMembers)
      .where(
        and(
          eq(tenantMembers.tenantId, tenantId),
          eq(tenantMembers.userId, userId)
        )
      );
    return member;
  }

  async findByUser(userId: string) {
    const memberships = await db
      .select({
        tenant: tenants,
        role: tenantMembers.role,
      })
      .from(tenantMembers)
      .innerJoin(tenants, eq(tenantMembers.tenantId, tenants.id))
      .where(eq(tenantMembers.userId, userId));
    return memberships.map((m) => ({ ...m.tenant, role: m.role }));
  }

  async findOne(id: string) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!tenant) throw new NotFoundException('Tenant tidak ditemukan');

    const members = await db
      .select({
        id: tenantMembers.id,
        role: tenantMembers.role,
        joinedAt: tenantMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          divisi: users.divisi,
          jabatan: users.jabatan,
        },
      })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(eq(tenantMembers.tenantId, id));

    return { ...tenant, members };
  }

  async create(data: {
    name: string;
    slug: string;
    ownerId: string;
    plan?: string;
  }) {
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
        plan: data.plan || 'free',
      })
      .returning();
    await db.insert(tenantMembers).values({
      userId: data.ownerId,
      tenantId: tenant.id,
      role: 'owner',
    });
    return tenant;
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.logo_url !== undefined) updateData.logoUrl = data.logo_url;
    if (data.plan !== undefined) updateData.plan = data.plan;
    if (data.max_members !== undefined)
      updateData.maxMembers = data.max_members;
    if (data.max_projects !== undefined)
      updateData.maxProjects = data.max_projects;
    if (data.custom_branding !== undefined)
      updateData.customBranding = data.custom_branding;
    if (data.audit_log !== undefined) updateData.auditLog = data.audit_log;
    if (data.storage_limit_mb !== undefined)
      updateData.storageLimitMb = data.storage_limit_mb;
    if (data.primary_color !== undefined)
      updateData.primaryColor = data.primary_color;

    const [tenant] = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, id))
      .returning();
    return tenant;
  }

  async addMember(tenantId: string, userId: string, role: string = 'member') {
    const [member] = await db
      .insert(tenantMembers)
      .values({ userId, tenantId, role })
      .returning();
    return member;
  }

  async removeMember(tenantId: string, userId: string) {
    const [member] = await db
      .delete(tenantMembers)
      .where(
        and(
          eq(tenantMembers.userId, userId),
          eq(tenantMembers.tenantId, tenantId),
        ),
      )
      .returning();
    return member;
  }

  async updateMemberRole(tenantId: string, userId: string, role: string) {
    const [member] = await db
      .update(tenantMembers)
      .set({ role })
      .where(
        and(
          eq(tenantMembers.userId, userId),
          eq(tenantMembers.tenantId, tenantId),
        ),
      )
      .returning();
    return member;
  }

  async getMembers(tenantId: string) {
    return await db
      .select({
        id: tenantMembers.id,
        role: tenantMembers.role,
        joinedAt: tenantMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
          divisi: users.divisi,
          jabatan: users.jabatan,
        },
      })
      .from(tenantMembers)
      .innerJoin(users, eq(tenantMembers.userId, users.id))
      .where(eq(tenantMembers.tenantId, tenantId));
  }
}

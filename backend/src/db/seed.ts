import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('Seeding database...');

  // Insert subscription plans
  await db
    .insert(schema.subscriptionPlans)
    .values([
      {
        name: 'Free',
        price: '0.00',
        maxMembers: 3,
        maxWorkspaces: 2,
        maxProjects: 2,
        customBranding: false,
        auditLog: false,
        storageLimitMb: 100,
        features: ['Basic task management', 'Up to 3 members'],
      },
      {
        name: 'Pro',
        price: '29.99',
        maxMembers: 50,
        maxWorkspaces: 10,
        maxProjects: 50,
        customBranding: true,
        auditLog: true,
        storageLimitMb: 1000,
        features: [
          'Advanced task management',
          'Unlimited members',
          'Custom branding',
          'Audit logs',
        ],
      },
      {
        name: 'Enterprise',
        price: '99.99',
        maxMembers: 200,
        maxWorkspaces: 50,
        maxProjects: 200,
        customBranding: true,
        auditLog: true,
        storageLimitMb: 5000,
        features: [
          'All Pro features',
          'Priority support',
          'Advanced analytics',
        ],
      },
    ])
    .onConflictDoNothing();

  console.log('Subscription plans inserted');

  // Create user sramadhan@gmail.com
  const hashedPassword = await bcrypt.hash('password123', 12);

  const [user] = await db
    .insert(schema.users)
    .values({
      name: 'S Ramadhan',
      email: 'sramadhan@gmail.com',
      password: hashedPassword,
      isVerified: true,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        password: hashedPassword,
        isVerified: true,
        isActive: true,
      },
    })
    .returning();

  console.log('User created:', user.email);

  // Create a demo tenant
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: 'Manapro Demo',
      slug: 'manapro-demo',
      ownerId: user.id,
      plan: 'free',
    })
    .onConflictDoNothing()
    .returning();

  console.log('Tenant created:', tenant?.name);

  if (tenant) {
    // Add user as tenant owner
    await db
      .insert(schema.tenantMembers)
      .values({
        userId: user.id,
        tenantId: tenant.id,
        role: 'owner',
      })
      .onConflictDoNothing();

    // Create a demo workspace
    const [workspace] = await db
      .insert(schema.workspaces)
      .values({
        tenantId: tenant.id,
        name: 'Workspace Utama',
        ownerId: user.id,
      })
      .returning();

    console.log('Workspace created:', workspace.name);

    // Create a demo project
    const [project] = await db
      .insert(schema.projects)
      .values({
        tenantId: tenant.id,
        workspaceId: workspace.id,
        name: 'Proyek Demo',
        status: 'active',
      })
      .returning();

    console.log('Project created:', project.name);

    // Create demo columns
    const columns = [
      { name: 'To Do', position: 0, color: '#94A3B8' },
      { name: 'In Progress', position: 1, color: '#3B82F6' },
      { name: 'Done', position: 2, color: '#22C55E' },
    ];

    for (const col of columns) {
      const [column] = await db
        .insert(schema.columns)
        .values({
          projectId: project.id,
          ...col,
        })
        .returning();

      console.log('Column created:', column.name);
    }
  }

  console.log('Seed completed!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  pool.end();
  process.exit(1);
});

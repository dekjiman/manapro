import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  decimal,
  varchar,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { customType } from 'drizzle-orm/pg-core';

const textArray = customType<{ data: string[] }>({
  dataType() {
    return 'text[]';
  },
});

// ========== USER ==========
export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  divisi: text('divisi'),
  jabatan: text('jabatan'),
  phone: text('phone'),
  languagePref: text('languagePref').default('id'),
  isVerified: boolean('isVerified').default(false),
  isActive: boolean('isActive').default(true),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== USER VERIFICATION ==========
export const userVerifications = pgTable('UserVerification', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull().unique(),
  tokenHash: text('tokenHash').notNull(),
  type: text('type').notNull(), // email, phone
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== TENANT (Multi-tenant) ==========
export const tenants = pgTable('Tenant', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logoUrl'),
  ownerId: uuid('ownerId')
    .notNull()
    .references(() => users.id),
  plan: text('plan').default('free'),
  maxMembers: integer('maxMembers').default(3),
  maxProjects: integer('maxProjects').default(2),
  customBranding: boolean('customBranding').default(false),
  auditLog: boolean('auditLog').default(false),
  storageLimitMb: integer('storageLimitMb').default(100),
  primaryColor: text('primaryColor'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== SUBSCRIPTION PLAN ==========
export const subscriptionPlans = pgTable('SubscriptionPlan', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  maxMembers: integer('maxMembers').notNull(),
  maxWorkspaces: integer('maxWorkspaces').notNull(),
  maxProjects: integer('maxProjects').notNull(),
  customBranding: boolean('customBranding').default(false),
  auditLog: boolean('auditLog').default(false),
  storageLimitMb: integer('storageLimitMb').notNull(),
  features: jsonb('features'), // array of features
  createdAt: timestamp('createdAt').defaultNow(),
});

export const tenantMembers = pgTable(
  'TenantMember',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    tenantId: uuid('tenantId')
      .notNull()
      .references(() => tenants.id),
    role: text('role').default('member'), // owner, admin, member, viewer
    joinedAt: timestamp('joinedAt').defaultNow(),
  },
  (table) => ({
    uniqueUserTenant: unique().on(table.userId, table.tenantId),
  }),
);

// ========== WORKSPACE ==========
export const workspaces = pgTable('Workspace', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  name: text('name').notNull(),
  ownerId: uuid('ownerId')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const workspaceMembers = pgTable(
  'WorkspaceMember',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspaceId')
      .notNull()
      .references(() => workspaces.id),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id),
    joinedAt: timestamp('joinedAt').defaultNow(),
  },
  (table) => ({
    uniqueWorkspaceUser: unique().on(table.workspaceId, table.userId),
  }),
);

// ========== PROJECT ==========
export const projects = pgTable('Project', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  workspaceId: uuid('workspaceId')
    .notNull()
    .references(() => workspaces.id),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('startDate'),
  dueDate: timestamp('dueDate'),
  status: text('status').default('active'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== COLUMN (Kanban) ==========
export const columns = pgTable('Column', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('projectId')
    .notNull()
    .references(() => projects.id),
  name: text('name').notNull(),
  position: integer('position').notNull(),
  color: text('color').default('#94A3B8'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== TASK ==========
export const tasks = pgTable('Task', {
  id: uuid('id').primaryKey().defaultRandom(),
  columnId: uuid('columnId')
    .notNull()
    .references(() => columns.id),
  projectId: uuid('projectId')
    .notNull()
    .references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').default('medium'),
  assigneeId: uuid('assigneeId').references(() => users.id),
  dueDate: timestamp('dueDate'),
  labels: textArray('labels').default([]),
  position: integer('position').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== COMMENT ==========
export const comments = pgTable('Comment', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('taskId')
    .notNull()
    .references(() => tasks.id),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  mentions: textArray('mentions').default([]),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== ATTACHMENT ==========
export const attachments = pgTable('Attachment', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('taskId')
    .notNull()
    .references(() => tasks.id),
  fileName: text('fileName').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileSize: integer('fileSize').notNull(),
  mimeType: text('mimeType').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== NOTIFICATION ==========
export const notifications = pgTable('Notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // task_assigned, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  projectId: uuid('projectId').notNull(), // should reference projects.id?
  taskId: uuid('taskId').references(() => tasks.id),
  isRead: boolean('isRead').default(false),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== ACTIVITY LOG ==========
export const activityLogs = pgTable('ActivityLog', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(), // created, updated, etc.
  entityType: text('entityType').notNull(), // task, project, etc.
  entityName: text('entityName').notNull(),
  projectId: uuid('projectId')
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== FINANCIAL RECORD ==========
export const financialRecords = pgTable('FinancialRecord', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('projectId')
    .notNull()
    .references(() => projects.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // income, expense
  taxIdRef: text('taxIdRef'),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== SUBSCRIPTION ==========
export const subscriptions = pgTable('Subscription', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  plan: text('plan').notNull(),
  status: text('status').default('active'), // active, past_due, etc.
  billingCycle: text('billingCycle').default('monthly'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currentPeriodStart: timestamp('currentPeriodStart').notNull(),
  currentPeriodEnd: timestamp('currentPeriodEnd').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ========== INVOICE ==========
export const invoices = pgTable('Invoice', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'), // paid, pending, overdue
  dueDate: timestamp('dueDate').notNull(),
  paidAt: timestamp('paidAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== INVITATION ==========
export const invitations = pgTable('Invitation', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  tenantId: uuid('tenantId')
    .notNull()
    .references(() => tenants.id),
  role: text('role').notNull(), // admin, member, viewer
  token: text('token').notNull().unique(),
  tokenHash: text('tokenHash').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  status: text('status').default('pending'), // pending, accepted, expired
  maxUses: integer('maxUses').default(1),
  uses: integer('uses').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
});

// ========== PASSWORD RESET ==========
export const passwordResets = pgTable('PasswordReset', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

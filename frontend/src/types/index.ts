// ========== TENANT & MULTI-TENANCY ==========

export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  owner_id: string
  plan: 'free' | 'pro' | 'enterprise'
  settings: TenantSettings
  created_at: string
}

export interface TenantSettings {
  max_members: number
  max_projects: number
  custom_branding: boolean
  audit_log: boolean
  storage_limit_mb: number
  primary_color: string | null
}

export interface TenantMember {
  user_id: string
  tenant_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joined_at: string
}

export interface Subscription {
  id: string
  tenant_id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled' | 'trial'
  billing_cycle: 'monthly' | 'yearly'
  price: number
  current_period_start: string
  current_period_end: string
}

export interface Invoice {
  id: string
  tenant_id: string
  amount: number
  tax: number
  total: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  paid_at: string | null
  created_at: string
}

export interface InviteLink {
  id: string
  tenant_id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  token: string
  expires_at: string
  used: boolean
}

// ========== CORE ENTITIES ==========

export interface User {
  id: string
  name: string
  email: string
  current_tenant_id: string | null
  tenant_ids: string[]
  avatar: string
  divisi: string
  jabatan: string
  phone: string
  language_pref: 'id' | 'en'
}

export interface Workspace {
  id: string
  tenant_id: string
  name: string
  owner_id: string
  members: string[]
  created_at: string
}

export interface Project {
  id: string
  tenant_id: string
  workspace_id: string
  name: string
  description: string
  start_date: string
  due_date: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
}

export interface Column {
  id: string
  project_id: string
  name: string
  position: number
  color: string
}

export interface Task {
  id: string
  column_id: string
  project_id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee_id: string | null
  due_date: string
  labels: string[]
  position: number
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  mentions: string[]
  created_at: string
}

// ========== NOTIFICATIONS & ACTIVITY ==========

export interface Notification {
  id: string
  type: 'task_assigned' | 'task_updated' | 'task_moved' | 'task_deleted' | 'comment_added' | 'member_joined' | 'mention'
  title: string
  message: string
  user_id: string
  project_id: string
  task_id: string | null
  is_read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: 'created' | 'updated' | 'moved' | 'deleted' | 'commented' | 'assigned'
  entity_type: 'task' | 'project' | 'workspace' | 'comment'
  entity_name: string
  project_id: string
  created_at: string
}

// ========== PLAN FEATURES ==========

export interface PlanFeatures {
  name: string
  price: number
  price_yearly: number
  max_members: number
  max_projects: number
  storage_mb: number
  kanban: boolean
  calendar: boolean
  gantt: boolean
  financial: boolean
  automation: boolean
  custom_branding: boolean
  audit_log: boolean
  offline_mode: 'none' | 'basic' | 'full'
  api_access: boolean
  priority_support: boolean
}

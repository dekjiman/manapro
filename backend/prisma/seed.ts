import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.comment.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.financialRecord.deleteMany()
  await prisma.task.deleteMany()
  await prisma.column.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.tenantMember.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const password = await bcrypt.hash('password123', 12)

  const budi = await prisma.user.create({
    data: { id: 'u1', name: 'Budi Santoso', email: 'budi@manapro.id', password, divisi: 'Manajemen', jabatan: 'Direktur', phone: '+6281234567890' }
  })

  const siti = await prisma.user.create({
    data: { id: 'u2', name: 'Siti Rahayu', email: 'siti@manapro.id', password, divisi: 'Desain', jabatan: 'Desainer Grafis', phone: '+6281234567891' }
  })

  const ahmad = await prisma.user.create({
    data: { id: 'u3', name: 'Ahmad Rizki', email: 'ahmad@manapro.id', password, divisi: 'Operasional', jabatan: 'Staff Operasional', phone: '+6281234567892' }
  })

  const dewi = await prisma.user.create({
    data: { id: 'u4', name: 'Dewi Lestari', email: 'dewi@manapro.id', password, divisi: 'Produksi', jabatan: 'Kepala Produksi', phone: '+6281234567893' }
  })

  console.log('✅ Users created')

  // Create Tenants
  const tenant1 = await prisma.tenant.create({
    data: { id: 't1', name: 'Toko Budi Online', slug: 'toko-budi', ownerId: budi.id, plan: 'pro', maxMembers: 20, maxProjects: 20 }
  })

  const tenant2 = await prisma.tenant.create({
    data: { id: 't2', name: 'Kerajinan Kulit Bali', slug: 'kerajinan-bali', ownerId: siti.id, plan: 'free', maxMembers: 3, maxProjects: 2 }
  })

  const tenant3 = await prisma.tenant.create({
    data: { id: 't3', name: 'PT Maju Jaya', slug: 'maju-jaya', ownerId: budi.id, plan: 'enterprise', maxMembers: 999, maxProjects: 999, customBranding: true, auditLog: true }
  })

  console.log('✅ Tenants created')

  // Create Tenant Members
  await prisma.tenantMember.createMany({
    data: [
      { userId: budi.id, tenantId: tenant1.id, role: 'owner' },
      { userId: siti.id, tenantId: tenant1.id, role: 'admin' },
      { userId: ahmad.id, tenantId: tenant1.id, role: 'member' },
      { userId: dewi.id, tenantId: tenant1.id, role: 'member' },
      { userId: siti.id, tenantId: tenant2.id, role: 'owner' },
      { userId: ahmad.id, tenantId: tenant2.id, role: 'member' },
      { userId: dewi.id, tenantId: tenant2.id, role: 'viewer' },
      { userId: budi.id, tenantId: tenant3.id, role: 'owner' },
      { userId: siti.id, tenantId: tenant3.id, role: 'member' },
    ]
  })

  console.log('✅ Tenant members created')

  // Create Workspaces
  const ws1 = await prisma.workspace.create({
    data: { id: 'w1', tenantId: tenant1.id, name: 'Rebranding Toko', ownerId: budi.id }
  })

  const ws2 = await prisma.workspace.create({
    data: { id: 'w2', tenantId: tenant1.id, name: 'Website E-Commerce', ownerId: budi.id }
  })

  const ws3 = await prisma.workspace.create({
    data: { id: 'w3', tenantId: tenant2.id, name: 'Produk Lebaran', ownerId: siti.id }
  })

  const ws4 = await prisma.workspace.create({
    data: { id: 'w4', tenantId: tenant3.id, name: 'Proyek Q2 2026', ownerId: budi.id }
  })

  console.log('✅ Workspaces created')

  // Create Projects
  const p1 = await prisma.project.create({
    data: { id: 'p1', tenantId: tenant1.id, workspaceId: ws1.id, name: 'Rebranding Toko 2026', description: 'Proyek rebranding untuk memperbarui identitas visual toko online', status: 'active' }
  })

  const p2 = await prisma.project.create({
    data: { id: 'p2', tenantId: tenant1.id, workspaceId: ws2.id, name: 'Website E-Commerce', description: 'Pembuatan website toko online dengan fitur pembayaran', status: 'active' }
  })

  const p3 = await prisma.project.create({
    data: { id: 'p3', tenantId: tenant2.id, workspaceId: ws3.id, name: 'Produk Koleksi Lebaran', description: 'Produksi tas dan dompet untuk koleksi Lebaran 2026', status: 'active' }
  })

  console.log('✅ Projects created')

  // Create Columns for Project 1
  const cols1 = await Promise.all([
    prisma.column.create({ data: { id: 'col1', projectId: p1.id, name: 'To Do', position: 0, color: '#94A3B8' } }),
    prisma.column.create({ data: { id: 'col2', projectId: p1.id, name: 'In Progress', position: 1, color: '#3B82F6' } }),
    prisma.column.create({ data: { id: 'col3', projectId: p1.id, name: 'Review', position: 2, color: '#F59E0B' } }),
    prisma.column.create({ data: { id: 'col4', projectId: p1.id, name: 'Done', position: 3, color: '#10B981' } }),
  ])

  // Create Columns for Project 2
  await Promise.all([
    prisma.column.create({ data: { id: 'col5', projectId: p2.id, name: 'Backlog', position: 0, color: '#94A3B8' } }),
    prisma.column.create({ data: { id: 'col6', projectId: p2.id, name: 'To Do', position: 1, color: '#94A3B8' } }),
    prisma.column.create({ data: { id: 'col7', projectId: p2.id, name: 'In Progress', position: 2, color: '#3B82F6' } }),
    prisma.column.create({ data: { id: 'col8', projectId: p2.id, name: 'Done', position: 3, color: '#10B981' } }),
  ])

  // Create Columns for Project 3
  await Promise.all([
    prisma.column.create({ data: { id: 'col9', projectId: p3.id, name: 'To Do', position: 0, color: '#94A3B8' } }),
    prisma.column.create({ data: { id: 'col10', projectId: p3.id, name: 'In Progress', position: 1, color: '#3B82F6' } }),
    prisma.column.create({ data: { id: 'col11', projectId: p3.id, name: 'Done', position: 2, color: '#10B981' } }),
  ])

  console.log('✅ Columns created')

  // Create Tasks
  await prisma.task.createMany({
    data: [
      { id: 't1', columnId: 'col1', projectId: p1.id, title: 'Desain Logo Baru', description: 'Buat 3 opsi logo untuk rebranding', priority: 'high', assigneeId: siti.id, position: 0, labels: ['desain', 'branding'] },
      { id: 't2', columnId: 'col1', projectId: p1.id, title: 'Pilih Warna Brand', description: 'Tentukan palet warna untuk branding baru', priority: 'medium', assigneeId: ahmad.id, position: 1, labels: ['desain'] },
      { id: 't3', columnId: 'col2', projectId: p1.id, title: 'Buat Materi Promosi', description: 'Desain brosur, spanduk, dan kartu nama', priority: 'high', assigneeId: siti.id, position: 0, labels: ['desain', 'marketing'] },
      { id: 't4', columnId: 'col2', projectId: p1.id, title: 'Update Profil Media Sosial', description: 'Ganti foto profil dan banner', priority: 'medium', assigneeId: ahmad.id, position: 1, labels: ['marketing'] },
      { id: 't5', columnId: 'col3', projectId: p1.id, title: 'Review Desain Packaging', description: 'Periksa hasil desain packaging', priority: 'low', assigneeId: budi.id, position: 0, labels: ['desain'] },
      { id: 't6', columnId: 'col4', projectId: p1.id, title: 'Riset Kompetitor', description: 'Analisis branding kompetitor', priority: 'medium', assigneeId: ahmad.id, position: 0, labels: ['research'] },
    ]
  })

  console.log('✅ Tasks created')

  // Create Comments
  await prisma.comment.createMany({
    data: [
      { id: 'cmt1', taskId: 't1', userId: budi.id, content: 'Pastikan logo bisa digunakan untuk berbagai ukuran.' },
      { id: 'cmt2', taskId: 't1', userId: siti.id, content: '@Budi Santoso saya sudah buat 2 konsep awal.', mentions: ['u1'] },
      { id: 'cmt3', taskId: 't3', userId: ahmad.id, content: 'Ukuran brosur A4 dan spanduk 3x1m sudah siap.' },
    ]
  })

  console.log('✅ Comments created')

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      { id: 'n1', type: 'task_assigned', title: 'Tugas Baru', message: 'Anda ditugaskan: "Desain Logo Baru"', userId: siti.id, projectId: p1.id, taskId: 't1' },
      { id: 'n2', type: 'mention', title: 'Anda disebutkan', message: 'Anda disebutkan di "Desain Logo Baru"', userId: budi.id, projectId: p1.id, taskId: 't1' },
    ]
  })

  console.log('✅ Notifications created')

  // Create Subscriptions
  await prisma.subscription.createMany({
    data: [
      { id: 'sub1', tenantId: tenant1.id, plan: 'pro', status: 'active', billingCycle: 'monthly', price: 49000, currentPeriodStart: new Date('2026-03-01'), currentPeriodEnd: new Date('2026-04-01') },
      { id: 'sub2', tenantId: tenant2.id, plan: 'free', status: 'active', billingCycle: 'monthly', price: 0, currentPeriodStart: new Date('2026-02-20'), currentPeriodEnd: new Date('2099-12-31') },
      { id: 'sub3', tenantId: tenant3.id, plan: 'enterprise', status: 'active', billingCycle: 'yearly', price: 2500000, currentPeriodStart: new Date('2026-03-01'), currentPeriodEnd: new Date('2027-03-01') },
    ]
  })

  console.log('✅ Subscriptions created')

  console.log('')
  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📧 Demo accounts:')
  console.log('   budi@manapro.id / password123 (Owner Toko Budi - Pro)')
  console.log('   siti@manapro.id / password123 (Owner Kerajinan Bali - Free)')
  console.log('   ahmad@manapro.id / password123 (Member)')
  console.log('   dewi@manapro.id / password123 (Member)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

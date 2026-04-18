# Manapro - Project Management for UMKM Indonesia

Sistem manajemen proyek yang dirancang khusus untuk UMKM Indonesia, menggabungkan kesederhanaan antarmuka dengan fitur analitik manajerial dan keuangan.

## Features

- **Kanban Board** - Papan tugas visual dengan drag & drop
- **Task Management** - Buat, edit, dan kelola tugas dengan mudah
- **Real-time Collaboration** - Komentar dan notifikasi real-time
- **Multi-Tenant** - Isolasi data per organisasi dengan Row-Level Security
- **Localization** - Bahasa Indonesia & English, format mata uang IDR
- **Financial Tracking** - Pelacakan biaya dan pajak lokal (roadmap)
- **Offline Mode** - Operasional tanpa koneksi internet (roadmap)

## Tech Stack

### Backend
- **NestJS** (TypeScript) - Framework backend
- **Prisma** - ORM untuk PostgreSQL
- **PostgreSQL** - Database utama
- **JWT** - Authentication

### Frontend
- **Vue 3** (Composition API) - Framework UI
- **Vite** - Build tool
- **Pinia** - State management
- **Tailwind CSS** - Styling
- **Vue Router** - Routing

## Project Structure

```
manapro/
├── backend/          # NestJS API server
├── frontend/         # Vue 3 dashboard application
├── web/              # Vue 3 landing page
├── docker-compose.yml
└── package.json      # Root scripts for running all services
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

```bash
# Install all dependencies
npm run install:all

# Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Run database migrations
cd backend && npx drizzle-kit migrate
```

### Development

```bash
# Run all services (backend + frontend + web)
npm run dev

# Or run individually
npm run dev:backend    # Backend on port 3000
npm run dev:frontend   # Frontend on port 5173
npm run dev:web        # Landing page on port 5174
```

### Using Docker

```bash
docker-compose up -d
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## API Documentation

Once the backend is running, Swagger docs are available at:
`http://localhost:3000/api`

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `PORT` | Server port (default: 3000) |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_WS_URL` | WebSocket URL |

## Roadmap

### Phase 1: MVP (Q3 2026)
- [x] Task management with Kanban board
- [x] Basic collaboration (comments, notifications)
- [x] Multi-tenant foundation
- [ ] Web & mobile access

### Phase 2: Growth (6-12 Months)
- [ ] Calendar & Timeline (Gantt Chart)
- [ ] Workflow automation (Rules)
- [ ] Integrations (Slack, Google Workspace, WhatsApp)

### Phase 3: Long Term
- [ ] Financial analytics & e-invoicing
- [ ] AI-Assistant for task drafting
- [ ] Full Offline Mode with auto-sync

## Pricing

| Plan | Price | Members | Projects |
|------|-------|---------|----------|
| Free | Rp 0 | 3 | 2 |
| Pro | Rp 49.000/user/mo | 20 | 20 |
| Enterprise | Custom | Unlimited | Unlimited |

## License

Private - All rights reserved

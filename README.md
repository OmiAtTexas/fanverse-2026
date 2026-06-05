# FanVerse 2026 🏆

> **AI-powered social & travel companion for FIFA World Cup 2026 fans**

A full-stack production-ready platform connecting millions of international fans traveling across the United States, Canada, and Mexico for the 2026 World Cup.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

### 1. Clone & Install
```bash
git clone https://github.com/OmiAtTexas/fanverse-2026
cd fanverse-2026
cp .env.example .env
# Fill in your API keys in .env
pnpm install
```

### 2. Start Infrastructure
```bash
docker-compose up postgres redis -d
```

### 3. Database Setup
```bash
cd apps/api
pnpm db:generate    # Generate Prisma client
pnpm db:migrate:dev # Run migrations
pnpm db:seed        # Seed host cities & sample data
```

### 4. Start Dev Servers
```bash
# From root (runs both web + api)
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: `pnpm --filter @fanverse/api db:studio`

---

## 🏗️ Architecture

```
fanverse-2026/
├── apps/
│   ├── web/          # Next.js 14 PWA (Vercel)
│   └── api/          # NestJS REST + WebSockets (Railway/AWS)
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared component library
├── docs/
│   └── PRD.md        # Full product requirements
├── docker-compose.yml
└── turbo.json
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis + BullMQ |
| Auth | Clerk (Google + Apple OAuth) |
| Realtime | Socket.io |
| AI | OpenAI GPT-4-turbo + text-embedding-3-large |
| Vector DB | Pinecone |
| Maps | Google Maps + Places API |
| Push | Firebase Cloud Messaging |
| Storage | Cloudinary |
| Monitoring | Sentry + PostHog |
| CI/CD | GitHub Actions |
| Hosting | Vercel + Railway |

---

## 🌟 Core Features

### 1. AI Fan Matching
- Embedding-based similarity via Pinecone
- Collaborative + content-based hybrid scoring
- AI-generated icebreakers for matched fans

### 2. AI Travel Companion
- GPT-4 powered itinerary generation
- Real city context from database
- Google Places API integration

### 3. City-Based Fan Groups
- Real-time group chat via Socket.io
- Multi-team and city-filtered groups
- AI content moderation

### 4. Digital World Cup Passport
- Stamps for matches, cities, meetups
- Journey statistics dashboard
- AI-generated journey narrative

### 5. Safety & Moderation
- Multi-layer content filtering
- OpenAI Moderation API
- Risk scoring and auto-banning

---

## 🗃️ Database

Key models: `User`, `WorldCupMatch`, `UserTicket`, `Connection`, `Group`, `GroupMember`, `Conversation`, `Message`, `Meetup`, `Passport`, `Stamp`, `Itinerary`, `HostCity`

Run `pnpm --filter @fanverse/api db:studio` to browse data visually.

---

## 🚀 Deployment

### Production (Vercel + Railway)

**Frontend (Vercel):**
```bash
vercel --prod
```

**Backend (Railway):**
```bash
railway up
```

### Docker (Self-hosted)
```bash
docker-compose up --build -d
```

---

## 🌍 Supported Languages
English · Spanish · Portuguese · French · German · Japanese · Korean

---

## 📊 Scale Targets
- 100,000+ MAU
- 5,000 concurrent users on match days
- 500 messages/sec WebSocket throughput
- Sub-2.5s initial load time

---

## 📄 License
MIT — FanVerse 2026

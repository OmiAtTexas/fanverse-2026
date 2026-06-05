# FanVerse 2026 — Product Requirements Document
## AI-Powered Fan Companion for FIFA World Cup 2026

**Version:** 1.0 MVP  
**Status:** Active Development  
**Target Launch:** April 2026 (8 weeks before opening match)

---

## 1. PRODUCT OVERVIEW

FanVerse 2026 is a mobile-first Progressive Web Application that serves as the AI-powered social and travel layer for the 5+ million international fans attending FIFA World Cup 2026 matches across 16 host cities in the United States, Canada, and Mexico.

### 1.1 The Problem

International World Cup fans face critical pain points when traveling to a foreign country alone:

| Problem | Impact | FanVerse Solution |
|---|---|---|
| Traveling alone in foreign cities | Isolation, safety risks | AI fan matching + community groups |
| Language barriers | Cannot communicate | Real-time translation in 9 languages |
| Unfamiliar cities with limited time | Missed experiences | AI match-day itinerary generator |
| Difficulty meeting other fans | Lonely experience | Social matching + meetups |
| Unreliable local recommendations | Poor experiences | AI local companion + curated places |
| Transport confusion | Late to matches | Turn-by-turn stadium navigation |
| Safety concerns | Real risk | Community trust scoring + alerts |

### 1.2 Product Mission

> "Make every World Cup fan feel like they have a local friend in every host city."

---

## 2. TARGET USERS

### Primary Persona: The International Traveler
- Age: 25-45
- Nationality: Non-US (Brazil, Argentina, France, Germany, Japan, Korea, Mexico top markets)
- Trip duration: 7-21 days
- Matches attending: 2-5
- Cities visiting: 2-4
- Device: Android or iPhone, mobile-first
- Language: May not speak English fluently
- Budget: Mid to high (flew internationally)

### Secondary Persona: The Local Fan
- US/Canada/Mexico resident
- Attending 1-3 local matches
- Wants to meet international fans
- Moderate app engagement

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 14 PWA (Vercel CDN) — Mobile-first             │
│  React Query + Zustand + Socket.io Client                │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS / WSS
┌──────────────────▼──────────────────────────────────────┐
│                    API LAYER                             │
│  NestJS (Railway) — REST + WebSocket                     │
│  Rate limiting, Auth middleware, Request validation       │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌───────▼───────┐
│  PostgreSQL  │          │    Redis       │
│  (Supabase)  │          │  (Upstash)     │
│  Primary DB  │          │  Sessions,     │
│  + Prisma    │          │  Rate limits,  │
└─────────────┘          │  Pub/Sub       │
                         └───────────────┘

┌─────────────────────────────────────────────────────────┐
│                    AI/ML LAYER                           │
├────────────┬─────────────┬──────────────┬───────────────┤
│  OpenAI    │  Pinecone   │  Google Maps  │  Firebase     │
│  GPT-4     │  Vector DB  │  Places API   │  Push Notifs  │
│  Embeddings│  Fan match  │  Itineraries  │               │
│  Moderation│  search     │  Geocoding    │               │
└────────────┴─────────────┴──────────────┴───────────────┘
```

---

## 4. DATABASE SCHEMA SUMMARY

### Core Tables
- **users** — Fan profiles, trust levels, preferences
- **world_cup_matches** — All 104 official matches with venue data
- **user_tickets** — Fan's match ticket registrations
- **connections** — Fan-to-fan connections (with AI match score)
- **groups** — City/team fan groups (city_slug, team_code)
- **conversations** — Direct and group chats
- **messages** — All chat messages with translation cache
- **meetups** — Fan meetup events with geolocation
- **passport** — Digital World Cup passport per fan
- **stamps** — City stamps, match stamps, achievement badges
- **itineraries** — AI-generated match day plans
- **notifications** — Push notification queue
- **reports** — Safety incident reports
- **moderation_logs** — Safety audit trail

### Key Indexes (for scale)
```sql
-- Fan matching queries (most frequent)
CREATE INDEX users_nationality_team ON users(nationality, supported_team);
CREATE INDEX users_host_cities_gin ON users USING GIN(host_cities);
CREATE INDEX users_last_active ON users(last_active_at DESC);

-- Message retrieval (real-time)
CREATE INDEX messages_conv_time ON messages(conversation_id, created_at DESC);

-- Match lookups
CREATE INDEX matches_city_kickoff ON world_cup_matches(city_slug, kickoff_at);
```

---

## 5. API DESIGN

### Base URL: `https://api.fanverse.app/v1`

### Authentication
All endpoints require `Authorization: Bearer <clerk-jwt>` header.

### Core Endpoints

#### Users
```
GET    /users/me                    — Current user profile
PATCH  /users/me                    — Update profile
GET    /users/:id                   — Public profile
POST   /users/me/embedding          — Regenerate AI embedding
```

#### Matching
```
GET    /matching/fans               — Get fan matches (paginated)
POST   /matching/connect            — Send connection request
PATCH  /matching/:id/respond        — Accept/decline connection
GET    /matching/connections        — My connections
POST   /matching/icebreaker         — Generate icebreaker for match
```

#### Travel AI
```
POST   /travel/itinerary            — Generate match-day itinerary
POST   /travel/chat                 — Conversational travel assistant
GET    /travel/cities               — Host city information
GET    /travel/cities/:slug/places  — Curated places for a city
```

#### Groups
```
GET    /groups                      — Browse groups (filter: city, team)
POST   /groups                      — Create a group
GET    /groups/:id                  — Group details + members
POST   /groups/:id/join             — Join a group
DELETE /groups/:id/leave            — Leave a group
```

#### Chat
```
GET    /conversations               — My conversations
GET    /conversations/:id/messages  — Message history (paginated)
        (WebSocket preferred for real-time)
```

#### Passport
```
GET    /passport                    — My digital passport
GET    /passport/:shareCode         — View a shared passport
POST   /passport/story              — Generate AI journey story
GET    /passport/stamps             — My stamps
```

#### Meetups
```
GET    /meetups?city=dallas         — Browse meetups by city
POST   /meetups                     — Create a meetup
POST   /meetups/:id/attend          — RSVP to meetup
GET    /meetups/:id                 — Meetup details
```

### WebSocket Events (Socket.io)
```
Client → Server:
  send_message    — Send chat message
  join_conv       — Join conversation room
  typing          — Typing indicator
  mark_read       — Mark messages read

Server → Client:
  new_message     — Incoming message
  fan_match       — New fan match suggested
  nearby_fan      — Fan within 500m alert
  meetup_alert    — Upcoming meetup reminder
  achievement     — Stamp/badge earned
  presence_update — Contact online/offline
```

---

## 6. AI SYSTEM DESIGN

### 6.1 Fan Matching Algorithm

```
Input: User A profile
Output: Ranked list of fans with scores

Step 1: HARD FILTERS (no AI needed)
  - Same host cities (any overlap)
  - Not banned
  - Active in last 7 days
  - Not previously declined/blocked

Step 2: EMBEDDING SEARCH (Pinecone)
  - Generate text from profile: "Brazilian fan, supports Brazil,
    visiting Dallas, LA. Speaks Portuguese, English.
    Interests: food, photography, nightlife."
  - text-embedding-3-large (3072 dims)
  - Query Pinecone top-100 similar

Step 3: COLLABORATIVE SCORING
  - Same match ticket: +0.40 per shared match
  - Shared interests: +0.20 (proportional)
  - Language compatible: +0.15
  - Same city overlap: +0.10
  - Embedding similarity: +0.10
  - Same age range: +0.05

Step 4: FINAL RANKING
  - Sort by composite score
  - Apply diversity filter (not all same nationality)
  - Return top 30 with reasons + icebreaker
```

### 6.2 Travel Companion (LLM Chain)
```
User: "I have 5 hours before the match in Dallas"

System enrichment:
  1. Load user context (team, interests, languages)
  2. Load match details (stadium, kickoff time)
  3. Fetch Places API data (restaurants, attractions near stadium)
  4. Build enriched prompt with city context

GPT-4 generates:
  - Personalized itinerary (JSON format)
  - Timing-aware (accounts for travel to stadium)
  - Interest-matched recommendations
  - Local tips and safety notes

Post-processing:
  - Geocode addresses (Google Maps API)
  - Add Google Maps links
  - Save to DB for offline access
```

### 6.3 Moderation Pipeline
```
Every message:
  1. Rule-based check (< 1ms, catches obvious spam/scams)
  2. Spam detection (rate limiting, duplicate detection)
  3. OpenAI Moderation API (100-300ms)
  4. User risk score modifier (high-risk = stricter)

Actions:
  - Score 0.0-0.3: Allow
  - Score 0.3-0.6: Allow + flag for review
  - Score 0.6-0.8: Warn user + flag
  - Score 0.8-1.0: Block + log violation
  - Score hits 0.9 cumulative: Auto-ban
```

---

## 7. MVP DEVELOPMENT ROADMAP

### Phase 1 — Foundation (Weeks 1-2)
- [ ] Project setup: monorepo, CI/CD, Docker
- [ ] Auth (Clerk) + user profile creation + onboarding flow
- [ ] Database schema + Prisma migrations
- [ ] Basic REST API (NestJS)
- [ ] Mobile-first Next.js shell + navigation
- [ ] PWA manifest + service worker

### Phase 2 — Core Social (Weeks 3-4)
- [ ] Fan matching: basic scoring (no embeddings yet)
- [ ] Fan card UI component
- [ ] Connect / decline flow
- [ ] City-based groups CRUD
- [ ] Join/leave groups
- [ ] Real-time group chat (Socket.io)
- [ ] Direct messages between connected fans
- [ ] Push notifications (FCM)

### Phase 3 — AI Features (Weeks 5-6)
- [ ] OpenAI embedding generation for users
- [ ] Pinecone integration + vector search
- [ ] AI icebreaker generation
- [ ] AI travel companion (itinerary generation)
- [ ] Chat-based travel assistant
- [ ] AI moderation pipeline

### Phase 4 — Engagement Features (Weeks 7-8)
- [ ] Digital passport + stamps system
- [ ] Match ticket registration
- [ ] Meetup creation and RSVP
- [ ] World Cup match schedule import
- [ ] Journey story generation
- [ ] Multilingual support (i18n)

### Phase 5 — Polish & Scale (Weeks 9-10)
- [ ] Offline mode (service worker caching)
- [ ] Performance optimization
- [ ] Load testing (100k user simulation)
- [ ] Security audit
- [ ] App Store submission (PWA + Capacitor wrapper)
- [ ] Marketing page + launch prep

---

## 8. SCALING STRATEGY (100,000+ Users)

### Database
- **Connection Pooling**: Prisma Accelerate or PgBouncer
- **Read Replicas**: 2x read replicas for match/group queries
- **Partitioning**: Messages table partitioned by month
- **Caching**: Redis for user profiles, group lists, match data (TTL: 5 min)

### API
- **Horizontal scaling**: Railway auto-scaling (min 2, max 10 instances)
- **Rate limiting**: Redis-backed per-user limits
- **Queue**: BullMQ for async jobs (embedding generation, push notifications, translations)
- **CDN**: Cloudflare for static assets and API caching

### AI/Vector
- **Pinecone**: Pod-based index for production (not serverless)
- **OpenAI**: Batch embedding updates (not real-time for cold users)
- **Caching**: Cache itineraries for same city+match combos

### Real-time
- **Socket.io + Redis adapter**: Horizontal scaling across instances
- **Room-based**: Users join city rooms, group rooms, personal room
- **Presence**: Redis SET for online tracking

### Load Estimates (World Cup peak: 5M fans, 30k/day on FanVerse)
```
Concurrent users (match day peaks): ~5,000
Messages/second: ~500
API requests/second: ~2,000
Embedding queries/day: ~10,000
AI itineraries/day: ~5,000
Push notifications/day: ~500,000
```

---

## 9. MONETIZATION

### Free Tier (All users)
- Fan matching (up to 10 matches/day)
- Group membership (up to 5 groups)
- Basic travel suggestions (3 queries/day)
- Digital passport + stamps
- Group chat

### Premium Tier ($9.99/month or $24.99 for tournament)
- Unlimited fan matching
- Priority matching (show to more fans)
- AI itinerary generation (unlimited)
- Exclusive premium groups
- Passport shareable card (premium design)
- Translation credits (unlimited)
- AI journey story (end-of-tournament)

### Partnership Revenue
- Hotel booking affiliate (Booking.com, Hotels.com)
- Restaurant reservations (OpenTable partnership)
- Tour operator integrations
- Official FIFA merchandise affiliate
- Transport partnerships (Uber, local transit apps)
- Tourism board sponsorships (Visit Dallas, LA Tourism)

### Target Revenue (Tournament Period)
- 100,000 MAU × 15% premium conversion = 15,000 premium
- 15,000 × $24.99 = $375,000 direct revenue
- Partnership revenue: ~$200,000
- **Total tournament revenue: ~$575,000**

---

## 10. SECURITY

### Authentication
- Clerk JWT tokens (RS256, 15-minute expiry)
- Socket.io JWT validation on connection
- API key rotation every 90 days

### Data Protection
- PII encrypted at rest (PostgreSQL encryption)
- No exact birthdates stored (age ranges only)
- User location only stored with explicit consent
- GDPR: Data export, deletion, consent management
- CCPA: California user rights compliance

### API Security
- Rate limiting per user + per IP
- Input validation (Zod schemas on all endpoints)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (Next.js built-in + CSP headers)
- CORS: whitelist fanverse.app only

---

## 11. FOLDER STRUCTURE

```
fanverse-2026/
├── apps/
│   ├── web/                       # Next.js 14 PWA
│   │   └── src/
│   │       ├── app/               # App Router pages
│   │       │   ├── (auth)/        # Auth routes (sign-in, sign-up)
│   │       │   ├── (app)/         # Protected app routes
│   │       │   │   ├── home/
│   │       │   │   ├── matching/
│   │       │   │   ├── groups/
│   │       │   │   ├── travel/
│   │       │   │   ├── passport/
│   │       │   │   └── chat/
│   │       │   └── api/           # Route handlers
│   │       ├── components/
│   │       │   ├── ui/            # shadcn/ui components
│   │       │   ├── layout/        # Shell, nav, headers
│   │       │   └── features/      # Feature-specific components
│   │       ├── lib/
│   │       │   ├── ai/            # Client-side AI utilities
│   │       │   ├── api/           # API client (Axios/fetch wrapper)
│   │       │   ├── auth/          # Clerk helpers
│   │       │   ├── maps/          # Google Maps loader
│   │       │   ├── providers/     # React Context providers
│   │       │   └── realtime/      # Socket.io client
│   │       ├── hooks/             # Custom React hooks
│   │       ├── store/             # Zustand stores
│   │       └── types/             # TypeScript types
│   │
│   └── api/                       # NestJS REST + WS API
│       └── src/
│           ├── modules/
│           │   ├── auth/          # Clerk webhook sync
│           │   ├── users/         # User CRUD
│           │   ├── matching/      # Fan matching algorithm
│           │   ├── travel/        # AI travel companion
│           │   ├── groups/        # Groups + membership
│           │   ├── chat/          # Messages + WebSocket
│           │   ├── passport/      # Digital passport
│           │   ├── matches/       # World Cup match data
│           │   ├── moderation/    # AI safety system
│           │   └── notifications/ # Push notifications
│           ├── common/
│           │   ├── guards/        # Auth guards
│           │   ├── interceptors/  # Logging, transform
│           │   ├── filters/       # Exception handling
│           │   └── decorators/    # Custom decorators
│           └── prisma/            # Prisma service
│
└── packages/
    ├── shared/                    # Shared types + utils
    ├── ui/                        # Shared UI components
    ├── types/                     # Shared TypeScript types
    └── config/                    # Shared configs (ESLint, TS)
```

# Devstiny — Technical Summary

## Overview

Devstiny is a pixel-art RPG-themed web development learning platform. Players progress through chapters and quests, earn XP and gold, collect titles and costumes, and participate in a community forum. The entire experience is wrapped in a dark fantasy RPG aesthetic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | NestJS 11, TypeScript, ESM modules |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma v7 (`prisma-client` generator, `@prisma/adapter-pg`) |
| Auth | JWT (`@nestjs/jwt`), bcryptjs |
| Email | Resend (domain: `devstiny.com`, from: `noreply@devstiny.com`) |
| Fonts | Press Start 2P (pixel), Inter (body) |

---

## Project Structure

```
devstiny/
├── docker-compose.yml          # PostgreSQL container
├── backend-devstiny/           # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts             # Dev seed (dummy users + data)
│   │   ├── seed-prod.ts        # Production seed (content only, no users)
│   │   ├── create-admin.ts     # Create admin account from env vars
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts   # GET /stats, GET /costume-configs
│   │   ├── app.service.ts
│   │   ├── auth/               # JWT auth, guards, email verification, password reset
│   │   ├── players/            # Player CRUD, progress, costumes
│   │   ├── forum/              # Forum threads, replies, categories
│   │   ├── admin/              # Admin-only endpoints
│   │   └── prisma/             # PrismaService (global)
│   └── generated/prisma/       # Generated Prisma client
└── frontend-devstiny/          # Next.js App
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx         # Homepage
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── path/            # Learning path
    │   │   ├── quests/          # Side quests
    │   │   ├── books/           # Reference books
    │   │   ├── forum/           # Community forum
    │   │   ├── shop/            # Costume shop
    │   │   ├── profile/         # User profile + [username] (public)
    │   │   ├── whats-new/       # Changelog
    │   │   └── admin/           # Admin dashboard
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── StatsBar.tsx
    │   │   ├── auth/            # LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, LoginStats
    │   │   ├── profile/         # ProfileDashboard
    │   │   ├── course/          # CourseSidebar, PlayerDialogue, QuizGate
    │   │   ├── forum/           # ReplyForm
    │   │   ├── books/           # BookSidebar, CodeBlock
    │   │   └── ui/              # PathContent, QuestGrid, StoryTimeline
    │   ├── context/
    │   │   └── AuthContext.tsx  # Global auth state
    │   └── lib/
    │       ├── api.ts           # apiGet, apiPost, apiPatch
    │       ├── costume.ts       # getUserCostume()
    │       ├── quests/          # Quest definitions
    │       └── contentLoader.ts # Chapter/act content
    └── public/
        ├── costume/             # 184 costume sprites (costume-1.png … costume-184.png)
        ├── gem/                 # Gem icons
        ├── scroll/              # Title scroll images
        ├── book/                # Book icons
        ├── NPC/                 # NPC head sprites
        └── base-char/           # Base character sprites
```

---

## Database Schema

### Player
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | String (unique) | |
| username | String (unique) | |
| passwordHash | String | bcrypt |
| role | String | `USER` \| `ADMIN` |
| createdAt | DateTime | |

### Progress
| Column | Type | Notes |
|---|---|---|
| playerId | String (unique FK) | → Player |
| xp | Int | Total XP earned |
| gold | Int | Current gold balance |
| currentChapter | String | Active chapter slug |
| completedChapters | String[] | Chapter slugs |
| completedScenes | String[] | `"chapter/act"` or `"quest/slug"` |
| costume | String | Currently equipped costume number |
| ownedCostumes | String[] | Purchased costume numbers |
| flags | Json | `equippedBadge`, misc flags |

### ForumThread
| Column | Type | Notes |
|---|---|---|
| category | String (FK) | → ForumCategory.slug |
| authorId | String (FK) | → Player |
| views | Int | Auto-incremented on fetch |
| solved | Boolean | Thread author can toggle |

### ForumReply
| Column | Type | Notes |
|---|---|---|
| isAnswer | Boolean | Pinned reply (thread author only) |
| likes | Int | |

### ForumCategory
| Column | Type | Notes |
|---|---|---|
| slug | String (unique) | URL identifier |
| gem | String | Icon path `/gem/gem-N.png` |
| color | String | Tailwind color class |
| order | Int | Display order |

### EmailVerificationToken
| Column | Type | Notes |
|---|---|---|
| token | String (unique) | `crypto.randomUUID()` |
| playerId | String (FK) | → Player (cascade delete) |
| expiresAt | DateTime | 24 hours from creation |
| used | Boolean | Marked true after first use |

### PasswordResetToken
| Column | Type | Notes |
|---|---|---|
| token | String (unique) | `crypto.randomUUID()` |
| playerId | String (FK) | → Player (cascade delete) |
| expiresAt | DateTime | 1 hour from creation |
| used | Boolean | Marked true after use; previous tokens invalidated on new request |

### CostumeTier
| Column | Type | Notes |
|---|---|---|
| name | String (unique) | COMMON / RARE / EPIC / LEGENDARY |
| price | Int | Gold cost |
| color | String | Tailwind color class |

### CostumeConfig
| Column | Type | Notes |
|---|---|---|
| costumeId | Int (PK) | 1–184 |
| tierId | String (FK) | → CostumeTier |
| isFree | Boolean | Free costumes auto-added to inventory |

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register; sends verification email. No JWT returned until email is verified. |
| POST | `/auth/login` | — | Login; blocked if `emailVerified = false` (error code `EMAIL_NOT_VERIFIED`) |
| GET | `/auth/verify-email?token=` | — | Verify email; returns JWT for auto-login |
| POST | `/auth/resend-verification` | — | Resend verification email |
| POST | `/auth/forgot-password` | — | Send password reset email (always returns 200) |
| POST | `/auth/reset-password` | — | Set new password using reset token (1hr expiry) |

### Players
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/players/me` | ✅ | Full profile data |
| GET | `/players/:username/public` | — | Public profile |
| PATCH | `/players/me/account` | ✅ | Update username/password |
| PATCH | `/players/me/badge` | ✅ | Equip/unequip title |
| POST | `/players/me/scene` | ✅ | Complete act (award XP/gold) |
| PATCH | `/players/me/costume` | ✅ | Equip costume |
| POST | `/players/me/costume/buy` | ✅ | Purchase costume (deduct gold) |

### Forum
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/forum/threads` | — | List threads (filter: category, author, sort, search, solvedOnly) |
| GET | `/forum/threads/:id` | — | Thread + replies (increments views) |
| POST | `/forum/threads` | ✅ | Create thread |
| POST | `/forum/threads/:id/replies` | ✅ | Add reply |
| PATCH | `/forum/threads/:id/solve` | ✅ | Toggle solved (author only) |
| PATCH | `/forum/threads/:id/pin` | ✅ | Pin/unpin reply (author only) |
| POST | `/forum/replies/:id/like` | ✅ | Like a reply |
| GET | `/forum/categories` | — | List categories with counts |
| GET | `/forum/categories/:slug` | — | Single category |
| GET | `/forum/stats` | — | Total threads + posts |

### Global
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | — | Site stats (adventurers, questsDone, items, guilds) |
| GET | `/costume-configs` | — | All costume configs with tier info |

### Admin (all require `role = ADMIN`)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | User/thread/reply/category counts |
| GET | `/admin/users` | Paginated user list with search |
| PATCH | `/admin/users/:id` | Update user role |
| DELETE | `/admin/users/:id` | Delete user + all data |
| GET/POST/PATCH/DELETE | `/admin/categories` | Forum category CRUD |
| GET | `/admin/costume-tiers` | List tiers |
| PATCH | `/admin/costume-tiers/:id` | Update tier (price, color) |
| GET | `/admin/costume-configs` | All costume configs |
| PATCH | `/admin/costume-configs/:id` | Update costume (tier, isFree) |
| POST | `/admin/costume-configs/bulk-tier` | Bulk assign tier |

---

## Authentication Flow

### Registration
1. `POST /auth/register` → creates player with `emailVerified: false`, sends verification email via Resend
2. Frontend shows "check your email" panel — no JWT issued yet
3. User clicks link → `GET /auth/verify-email?token=` → sets `emailVerified: true`, returns JWT
4. Frontend auto-logs in and redirects to `/path`

### Login
1. `POST /auth/login` → validates credentials
2. If `emailVerified = false` → returns `401 EMAIL_NOT_VERIFIED`; frontend shows resend button
3. On success → returns `{ access_token, user: { id, email, username, role, costume } }`
4. Frontend stores token in `localStorage` (`access_token`) and user in `localStorage` (`user`)
5. `AuthContext` reads `localStorage` on mount, refreshes `role` and `costume` from `/players/me`

### Password Reset
1. `POST /auth/forgot-password` → generates token (1hr expiry), sends email via Resend
2. User clicks link → `/reset-password?token=`
3. `POST /auth/reset-password` → validates token, updates `passwordHash`, marks token used

### Guards
- `JwtAuthGuard` — validates Bearer token on protected routes
- `AdminGuard` — extends JwtAuthGuard, additionally checks `role === "ADMIN"`

---

## Key Frontend Patterns

### Auth Context
```tsx
// Reads localStorage + refreshes role/costume from backend
const { user, ready, setUser } = useAuth();
```

### API Utilities (`src/lib/api.ts`)
```ts
apiGet<T>(path)          // GET with auth token
apiPost<T>(path, body)   // POST with auth token
apiPatch<T>(path, body)  // PATCH with auth token
```

### Costume System
```ts
// getUserCostume(username, storedCostume?)
// Returns /costume/costume-N.png
// Falls back to username hash if no stored costume
getUserCostume(user.username, user.costume)
```

### Progress Tracking
- Acts tracked as `"chapter-slug/act-slug"` strings in `completedScenes[]`
- Quests tracked as `"quest/quest-slug"` in `completedScenes[]`
- Idempotent: re-completing an act/quest awards no additional XP/gold

---

## Forum System

### Categories (DB-driven)
| Slug | Title | Features |
|---|---|---|
| `tavern` | The Tavern | General discussion |
| `oracle` | The Oracle | Q&A — Solved + Pin enabled |
| `hall-of-champions` | Hall of Champions | Showcases — Pin enabled |
| `guild-board` | Guild Board | Recruitment |

### Thread Features
- **Solved toggle** — thread author only, available in Oracle + Hall of Champions
- **Pin reply** — thread author only, available in Oracle + Hall of Champions
- **Like replies** — any authenticated user, one per session
- **Sort** — by date / views / replies
- **Filter** — solved only, search by title

---

## Costume Shop

- 184 total costumes (`/public/costume/costume-1.png` … `costume-184.png`)
- Organised into tiers: COMMON (150G) / RARE (300G) / EPIC (600G) / LEGENDARY (1200G)
- Free costumes marked via `CostumeConfig.isFree` — auto-added to every player's inventory
- Purchase deducts gold from `Progress.gold`, adds to `Progress.ownedCostumes`
- Admin can reassign tiers, change prices, and mark costumes as free from `/admin/costumes`

---

## Running the Project

### Prerequisites
- Node.js 20+, npm, Docker Desktop

### 1. Start Database
```bash
cd devstiny
docker compose up -d
```

### 2. Backend
```bash
cd backend-devstiny
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed      # optional: seed test data
npm run start:dev       # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend-devstiny
npm install
npm run dev             # http://localhost:4001 (--port 4001 set in package.json)
```

### Default Credentials (Dev only — from `seed.ts`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@devstiny.com | password123 |
| User | shadowbyte@devstiny.com | password123 |
| User | runeweaver@devstiny.com | password123 |
| User | ironscribe@devstiny.com | password123 |
| User | voidcaster@devstiny.com | password123 |
| User | lyra@devstiny.com | password123 |

> These users have `emailVerified: true` set directly in seed. Do NOT use `seed.ts` in production.

---

## Environment Variables

### Backend (`backend-devstiny/.env`)
```env
DATABASE_URL=postgresql://devstiny_user:devstiny_pass@localhost:5432/devstiny
JWT_SECRET=your-secret-key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:4001
```

### Frontend (`frontend-devstiny/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Content Status

### Chapter 4: JavaScript — Acts

| Act | Slug | Topic | Sections | Quiz | Somers Dialogue |
|---|---|---|---|---|---|
| 1 | act-1 | The Living City | ✅ | ✅ | ✅ |
| 2 | act-2 | Data Types | ✅ | ✅ | ✅ |
| 3 | act-3 | Variables & Scope | ✅ | ✅ | ✅ |
| 4 | act-4 | Operators & Type Coercion | ✅ | ✅ | ✅ |
| 5 | act-5 | Conditionals | ✅ | ✅ | ✅ |
| 6 | act-6 | Loops | ✅ | ✅ | ✅ |
| 7 | act-7 | Functions | ✅ | ✅ | ✅ |
| 8 | act-8 | Before the Data Bazaar | ✅ | ✅ | ✅ |
| 9 | act-9 | Operators | ✅ | ✅ | ✅ |
| 10 | act-10 | Scope & Hoisting | ✅ | ✅ | ✅ |
| 11 | act-11 | Strings | ✅ | ✅ | ✅ |
| 12 | act-12 | Classes & OOP | ✅ | ✅ | ✅ |
| 13 | act-13 | ES Modules | ✅ | ✅ | ✅ |
| 14 | act-14 | Iterators & Generators | ✅ | ✅ | ✅ |
| 15 | act-15 | Advanced Concepts | ✅ | ✅ | ✅ |
| 16 | act-16 | JS in the Browser | ✅ | ✅ | ✅ |
| 17 | act-17 | Debugging & Tooling | ✅ | ✅ | ✅ |
| — | final-act | The Phantom Broker | ✅ | ✅ | ✅ |

### Key Backend Fixes
- `path.service.ts` `updateAct()` — content PATCH now **merges** the content JSON field (deep merge) instead of replacing it entirely. Sending `{ content: { quiz: ... } }` preserves existing `sections` and other fields.

### Key Frontend Fixes
- `act/page.tsx` — null safety on `content.sections` and `content.quiz` — no crash when fields are missing
- `QuizGate.tsx` — auto-passes and hides quiz section when `questions.length === 0`
- `CourseSidebar.tsx` — module-level cache with stale-while-revalidate pattern eliminates skeleton flash on repeated act visits

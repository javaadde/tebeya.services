# AGENT.md - Autonomous Agent Operating Guide

> **Repository:** `tebeya.services`  
> **Type:** Full-stack TypeScript Monorepo (`pnpm`)  
> **Primary Systems:** Catering Staff Mobile App, Admin Web Dashboard, Express Backend API, Shared Core Types  

---

## 1. Project Context & Purpose

`tebeya.services` is a booking and coordination platform for a catering service-staff business. Instead of catering food, the business supplies trained, uniformed event servers and banquet staff to client venues.

### Monorepo Workspaces

```
tebeya.services/
├── apps/
│   ├── api/            # Express 4.x + MongoDB (Mongoose) + TypeScript backend
│   ├── mobile/         # React Native 0.76 + Expo 52 staff mobile app
│   └── web-admin/      # React 19 + TanStack Router/Query + Tailwind + Vite admin panel
├── packages/
│   └── shared/         # Shared domain models, TypeScript interfaces, & constants
├── docs/               # PRD and API architecture documentation
├── pnpm-workspace.yaml # Workspace definitions
└── package.json        # Root scripts and workspace orchestration
```

---

## 2. Essential Commands

Always execute commands from the monorepo root unless a specific package context is required:

### Development Servers
- **Start Backend API:** `pnpm dev:api` (Runs on `http://localhost:5000` via `tsx watch`)
- **Start Web Admin:** `pnpm dev:admin` (Runs on `http://localhost:5173` via `vite`)
- **Start Mobile App:** `pnpm dev:mobile` (Runs Expo dev server)

### Build & Verification
- **Build all buildable packages:** `pnpm build`
- **Lint all packages:** `pnpm lint`
- **Typecheck API:** `pnpm --filter @tebeya/api typecheck`
- **Typecheck Admin:** `pnpm --filter @tebeya/web-admin typecheck`
- **Typecheck Mobile:** `pnpm --filter @tebeya/mobile typecheck`
- **Typecheck Shared:** `pnpm --filter @tebeya/shared typecheck`

---

## 3. Core Architectural Invariants (Never Violate)

When modifying or implementing features, you **must adhere to these rules**:

### Rule 1: Shared Models as Single Source of Truth
- All entity contracts, payload interfaces, enums, and shared types must reside in `packages/shared/src/types/index.ts`.
- When updating an entity field (e.g. adding a property to `CateringEvent` or `Booking`), **update `packages/shared` first**, run `pnpm --filter @tebeya/shared build` (or verify export), and then use it in `api`, `web-admin`, and `mobile`.

### Rule 2: Server-Side Enforcement of Booking Rules
- Never rely solely on client-side validation for schedule clashes or capacity.
- **Hard Overlap Rule:** An event cannot overlap with any other confirmed event on the same day (`startA < endB && startB < endA`).
- **Daily Cap:** Maximum of 2 events per calendar day.
- **Travel Gap:** Minimum of 2 hours travel buffer required between 2 events on the same day.
- **Double-Booking Acknowledgment:** The second event on a day requires `acknowledgedDoubleBooking: true`.
- **Atomic Concurrency:** Increment `filledCount` conditionally (`$expr: { $lt: ['$filledCount', '$headcount'] }`) to prevent overbooking races.

### Rule 3: Invite-Only Onboarding Security
- Staff signups require a valid, active, non-expired invite code created by an admin.
- Invite codes are single-use and must be redeemed atomically during registration.

### Rule 4: Private Storage for Staff ID Proofs
- Staff ID proof images are sensitive KYC documents. Store them as Cloudinary private/authenticated assets.
- Never expose raw public Cloudinary URLs for ID proofs. Always generate time-limited signed URLs for admin view.

---

## 4. Package Guidelines & Conventions

### 4.1 Backend API (`apps/api`)
- **Architecture:** Layered (`routes/` $\rightarrow$ `controllers/` $\rightarrow$ `services/` $\rightarrow$ `models/`).
- **Imports:** Uses Node Next resolution with explicit `.js` extensions for local relative imports:
  ```typescript
  import { ENV } from './config/env.js';
  import { CateringEvent } from './models/event.model.js';
  ```
- **Validation:** Always validate incoming requests using `zod`.
- **Response Format:** Follow the standard envelope:
  - Success: `{ success: true, data: T, message?: string }`
  - Error: `{ success: false, error: { code: string, message: string, details?: any } }`

### 4.2 Web Admin (`apps/web-admin`)
- **Stack:** React 19, `@tanstack/react-query` v5, `@tanstack/react-router`, Tailwind CSS.
- **Design:** Clean dashboard with responsive tables, status badges, and actionable modal flows.
- **State Management:** Server state via TanStack Query; UI state via local React state.

### 4.3 Mobile App (`apps/mobile`)
- **Stack:** React Native 0.76, Expo 52.
- **UX Priorities:** High-contrast buttons, fast event list loading (< 3s), offline resilience for viewing upcoming shifts.
- **Clash UI:** Display clear warning modals and require the "I understand" confirmation checkbox when joining a second daily event.

---

## 5. Agent Verification Checklist

Before finishing any user request, perform these verification steps:
1. **Types Consistency:** Run `pnpm -r typecheck` or verify that types compile cleanly across all affected workspaces.
2. **Import Integrity:** Ensure no missing dependencies or broken relative path imports.
3. **No Regressions:** Verify existing endpoints (e.g. `/api/health`) remain functional.
4. **Documentation:** If updating API routes or data models, keep `docs/API_ARCHITECTURE.md` synchronized.

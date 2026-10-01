# CLAUDE.md - Project Guidelines & Assistant Reference

## Project Overview

**Tebeya Services (`tebeya.services`)** is a catering service-staff coordination and booking platform. It replaces manual calls and WhatsApp coordination with a centralized mobile app for staff, an administrative web portal for event managers, and a robust Node.js/Express/MongoDB backend.

- **Monorepo Manager:** `pnpm` workspace
- **Root Directory:** `/home/kuttappi/Projects/tebeya.services`
- **Key Documentation:**
  - [API Architecture & Specification](./docs/API_ARCHITECTURE.md)
  - [Product Requirements Document (PRD)](./docs/PRD_%20Catering%20Staff%20Booking%20App.md)
  - [Agent Operating Guide](./AGENTS.md)

---

## Workspace Structure

| Package / App | Path | Primary Technologies | Description |
|---|---|---|---|
| **API Server** | `apps/api` | Express 4.x, TypeScript, MongoDB, Mongoose, Zod | Core REST API, clash engine, atomic booking, auth |
| **Web Admin** | `apps/web` | React 19, Vite, TanStack Router/Query, Tailwind CSS | Event roster, invite code generation, staff verifications |
| **Mobile App** | `apps/mobile` | React Native 0.76, Expo 52, TypeScript | Staff shift discovery, booking, clash alert UI, earnings |
| **Shared Core** | `packages/shared` | TypeScript (ESM) | Canonical domain types (`User`, `CateringEvent`, `Booking`, etc.) |

---

## Essential Commands

### Development
```bash
# Start Backend API (runs on http://localhost:5000)
pnpm dev:api

# Start Web Admin Panel (runs on http://localhost:5173)
pnpm dev:admin

# Start Staff Mobile App (Expo Metro bundler)
pnpm dev:mobile
```

### Build & Verification
```bash
# Build all workspaces
pnpm build

# Lint all workspaces
pnpm lint

# Workspace-specific typechecks
pnpm --filter @tebeya/api typecheck
pnpm --filter @tebeya/web typecheck
pnpm --filter @tebeya/mobile typecheck
pnpm --filter @tebeya/shared typecheck
```

---

## Code Style & Conventions

### General TypeScript
- **Target:** NodeNext / ES2022.
- **Strict Mode:** Enabled across all packages (`tsconfig.base.json`). Avoid `any` - prefer specific types or `unknown`.
- **Imports in `apps/api`:** Use relative imports with the `.js` extension (e.g., `import { ENV } from './config/env.js';`).
- **Shared Package:** When adding or updating domain interfaces, always update `packages/shared/src/types/index.ts` first.

### Backend API Design (`apps/api`)
- **Layered Flow:** `Router` $\rightarrow$ `Middleware (Auth / Validate)` $\rightarrow$ `Controller` $\rightarrow$ `Service` $\rightarrow$ `Mongoose Model`.
- **Validation:** Use `zod` for all request bodies, params, and queries.
- **Envelope Standard:**
  - Success: `{ success: true, data: ..., message?: string }`
  - Failure: `{ success: false, error: { code: string, message: string, details?: any } }`
- **Transactions & Concurrency:** Use conditional atomic queries (`findOneAndUpdate` with `$expr` capacity guards) or MongoDB transactions to prevent race conditions during booking.

### Frontend & Admin (`apps/web`)
- **Routing:** TanStack Router.
- **Data Fetching:** TanStack Query (`useQuery`, `useMutation`).
- **Styling:** Tailwind CSS utility classes; use `clsx` and `tailwind-merge` for conditional class combinations.
- **Component Design:** Keep presentation and data-fetching hooks separated.

### Mobile App (`apps/mobile`)
- **Component Library:** Native React Native primitives styled with StyleSheet.
- **Flows:** Invite-code registration, event discovery, event detail with conflict modal, booking history.

---

## Domain Rules & Invariants

1. **Restricted Signups:** Staff can only register if providing an active, unexpired admin-issued invite code.
2. **Hard Schedule Conflict Block:** Staff cannot join an event whose time interval overlaps with any event they have already confirmed on the same day (`startA < endB && startB < endA`).
3. **Daily Limit & Travel Gap:** Max 2 events per day with a mandatory minimum travel buffer (2 hours) between end and start times.
4. **Double Booking Confirmation:** Second event on the same day requires explicit user consent (`acknowledgedDoubleBooking: true`).
5. **Private KYC Storage:** Staff ID proofs must be stored in Cloudinary authenticated mode and accessed only via short-lived signed URLs.

---

## Working Guidelines for Claude Code

- When adding new endpoints to `apps/api`, create the corresponding Zod schema, service function, controller, and route handler.
- Update `packages/shared` first if any domain model or API contract changes.
- Always run type checks (`pnpm typecheck` or package-specific) before reporting tasks complete.
- Keep documentation in sync with any architectural or endpoint changes.

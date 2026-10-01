# Tebeya Services - Catering Staff Booking Platform

Monorepo for the **Catering Staff Booking App**, managing staff discovery, shift joining with clash validation, admin roster operations, and payment tracking.

## Workspace Architecture

This project is configured as a `pnpm` monorepo:

```
tebeya.services/
├── apps/
│   ├── api/            # Node.js + Express + MongoDB (Mongoose) API service
│   ├── mobile/         # React Native + Expo app for catering service staff
│   └── web-admin/      # React + TanStack (Router/Query) + Vite admin panel
├── packages/
│   └── shared/         # Shared domain models, TypeScript interfaces, & constants
├── docs/               # PRD and technical specifications
├── pnpm-workspace.yaml # Monorepo workspace configuration
└── package.json        # Root scripts and workspace tooling
```

---

## Documentation

- 📘 **[API Server Architecture & Endpoints Spec](./docs/API_ARCHITECTURE.md)**: Full breakdown of backend modules, data schemas, endpoints catalog, clash algorithms, and security.
- 📋 **[Product Requirements Document (PRD)](./docs/PRD_%20Catering%20Staff%20Booking%20App.md)**: Product goals, user journeys, edge cases, and milestone roadmaps.
- 🤖 **[Agent Operating Guide (AGENTS.md)](./AGENTS.md)**: Autonomous agent operating rules, system invariants, and workflow standards.
- 🧠 **[Claude Code Reference (CLAUDE.md)](./CLAUDE.md)**: Architecture quick reference and development conventions.

---

## Tech Stack Mapping (per PRD)

| Component | Technology | Role & Responsibilities |
|---|---|---|
| **Mobile App (`apps/mobile`)** | React Native (Expo) | Staff onboarding with single-use invite codes, browsing shifts, join/leave with hard clash checks, history & earnings. |
| **Admin Portal (`apps/web-admin`)** | React (Vite) + TanStack (Query & Router) + Tailwind CSS | Admin dashboard, event scheduling, rosters, attendance & payout marking, invite code generation. |
| **Backend API (`apps/api`)** | Node.js + Express + MongoDB (Mongoose) | Central business logic: atomic bookings, hard overlap checks, travel gap validation, JWT auth, notifications. |
| **Shared Core (`packages/shared`)** | TypeScript | Shared data models (`User`, `CateringEvent`, `Booking`, `InviteCode`, `WageRule`) and shared constants. |

---

## Getting Started

### 1. Install Dependencies
Run from the repository root:
```bash
pnpm install
```

### 2. Running Services Locally

#### Backend API (`apps/api`)
```bash
# Start Express + MongoDB API in watch mode
pnpm dev:api
```
- Listens on `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

#### Web Admin Portal (`apps/web-admin`)
```bash
# Start Vite development server
pnpm dev:admin
```
- Available at `http://localhost:5173`

#### Staff Mobile App (`apps/mobile`)
```bash
# Start Expo development server
pnpm dev:mobile
```
- Press `a` for Android, `i` for iOS, or scan QR code in Expo Go.

---

## Workspace Scripts

| Command | Action |
|---|---|
| `pnpm dev:api` | Starts backend API dev server with `tsx watch` |
| `pnpm dev:admin` | Starts web-admin portal with Vite |
| `pnpm dev:mobile` | Starts Expo dev server for the mobile app |
| `pnpm build` | Builds buildable apps/packages in the workspace |
| `pnpm lint` | Runs linter across all packages |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DND Book is a campaign management application for Dungeon Masters and tabletop RPG players. It organizes notes, NPCs, locations, and other campaign data.

**Migration in progress**: Converting from React/Vite web app to offline-first Expo mobile app with P2P sync. See [MIGRATION_PLAN.md](MIGRATION_PLAN.md) for details.

## Development Commands

All frontend commands run from the `frontend/` directory:

```bash
npm run dev          # Start Vite dev server with hot reload
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm run typecheck    # TypeScript check only (no emit)
npm run lint         # Run ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

## Architecture

### Monorepo Structure
- **frontend/** - React application (Vite, TypeScript, TailwindCSS, Flowbite)
- **backend/** - PocketBase container (Alpine Linux, port 8090)
- **docs/** - Jekyll documentation site for GitHub Pages

### Frontend Organization
```
frontend/src/
├── api/        # PocketBase SDK integration (base.ts initializes client)
├── components/ # React components
│   ├── auth/   # Login form
│   ├── layout/ # MainLayout, Navbar, Sidebar
│   ├── shared/ # Reusable: ErrorBoundary, Loader, Cards
│   └── ui/     # RelatedItemsModal
├── hooks/      # Custom hooks (useAuthUser, useNotes, useLocations, etc.)
├── pages/      # Page components (Dashboard, Login, Notes, Locations, Profile)
├── types/      # TypeScript types (includes pocketbase-types.ts)
└── utils/      # Utilities (colors, iconMap, tagUtils)
```

### Key Patterns
- **API Layer**: All PocketBase interactions go through `src/api/` modules
- **Custom Hooks**: Business logic lives in hooks, not components
- **Type Safety**: PocketBase types are generated in `types/pocketbase-types.ts`

## Environment Variables

Frontend uses Vite env variables (prefix with `VITE_`):
- `VITE_API_BASE_URL` - PocketBase API URL (defaults to `http://localhost:8080`)

## Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript, TailwindCSS, Flowbite React, React Router DOM
- **Backend**: PocketBase (self-hosted, SQLite database, built-in auth)
- **CI/CD**: GitHub Actions builds Docker images on release, pushes to GHCR

## Backend

PocketBase runs on port 8090. Database migrations are in `backend/pb_migrations/`. The main schema is defined in `10000_collections_snapshot.js`.

## Deployment

Docker images are built and pushed to GitHub Container Registry on release:
- `ghcr.io/{repo}-backend`
- `ghcr.io/{repo}-frontend`

Both images use semantic versioning tags.

## Mobile App (Planned)

Target stack for Expo migration:
- **Framework**: Expo with expo-router
- **Data**: TinyBase (offline-first local store)
- **Sync**: Yjs + y-webrtc (P2P sync at the table)
- **Persistence**: expo-sqlite
- **UI**: NativeWind (TailwindCSS for React Native) + React Native Paper

Key expo modules: `expo-sqlite`, `expo-file-system`, `expo-secure-store`, `expo-network`, `expo-image-picker`

### Mobile Commands (once set up)
```bash
cd mobile
npx expo start              # Start dev server
npx expo start --go         # Start with Expo Go
npx expo run:ios            # Run on iOS simulator
npx expo run:android        # Run on Android emulator
```

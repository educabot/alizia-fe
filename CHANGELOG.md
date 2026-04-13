# Changelog

All notable changes to this project will be documented in this file.

## [0.0.3] - 2026-04-13

### Fixed

- Global mutable Map outside component in MomentEditor (moved to useMemo)
- Stale closure in ChatPanel sendMessage (functional state update)
- Unsafe type assertion for 204 responses in api-client
- Unsafe HeadersInit cast in api-client (proper Headers/array/Record handling)
- Auto-generate useEffect dependency issue in Document and TeacherLessonPlan
- Non-unique key prop in ChatBot message list

### Removed

- Dead code: coordinationStore and teachingStore (unused Zustand stores)

### Changed

- Zustand selectors in useAuth from destructured object to individual selectors (re-render optimization)
- Silent catch blocks replaced with showApiError() in TeacherLessonPlan and ResourceCreate
- Added DataState wrapper in CoordinatorHome and TeacherHome for consistent loading/error/empty states
- Centralized moment constants (MOMENT_KEYS, MOMENT_LABELS, MOMENT_SECTION_LABELS) in lib/constants
- Added aria-labels to icon-only buttons across Document, TeacherLessonPlan, ChatBot
- Added keyboard navigation (role, tabIndex, onKeyDown) to clickable cards in TeacherHome

## [0.0.2] - 2026-04-10

### Added

- TanStack Query migration: all server state moved from Zustand to React Query hooks
- Query hooks by domain: useCoordinationQueries, useTeachingQueries, useReferenceQueries, useOnboardingQueries
- Pagination hook (usePaginatedList) with "load more" pattern
- Rate-limit cooldown handling in ChatPanel (429 retry with countdown)
- Markdown editor with react-markdown + remark-gfm for resource content
- Dynamic nomenclature from org config (useOrgConfig hook)
- Teaching mutations: create, update, delete lesson plans and update status
- RFC frontend document (docs/rfc-alizia-fe/)
- 417 tests across 61 files (stores, hooks, components, services, pages)

### Removed

- Zustand stores for coordination and teaching server state (replaced by TanStack Query)

## [0.0.1] - 2026-04-06

### Added

- React 19 + TypeScript 5.8 + Vite 7 project setup
- Tailwind CSS 4 with shadcn/ui component library (Radix primitives)
- React Router 7 with role-based protected routes and lazy loading
- Zustand stores for auth, config, and UI state
- JWT authentication flow with login, logout, and session persistence
- Multi-role support: admin, coordinator, teacher views
- Coordinator flow: document creation wizard, dynamic section editor, class plan table
- Teacher flow: course subjects, lesson plan wizard, moment editor with activity selector
- AI integration: ChatPanel (reusable), GenerateButton, LoadingOrb
- Resource creation and editing with AI generation
- Onboarding wizard with dynamic profile form and product tour
- Dashboard widgets: course overview, notifications, planning progress, pending plans
- Biome for linting and formatting
- Vitest + Testing Library test setup with jsdom environment

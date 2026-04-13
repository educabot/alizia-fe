# Auditoria RFC Alizia Frontend — Estado real del codigo

**Fecha:** 2026-04-12
**Commit base:** `5f0bae5` (main, post-migracion TanStack Query)
**Tests:** 61 archivos / 417 tests verdes
**Metodo:** Lectura directa del codigo contra cada seccion del RFC. Citas con `archivo:linea`.

Leyenda:
- OK — Implementado segun la spec.
- PARCIAL — Implementado pero con gap funcional o naming distinto.
- FALTA — No existe.
- FUTURO — El RFC lo marca como futuro / post-MVP.

---

## Seccion 2 — Arquitectura frontend

### 2.1 Estructura de directorios

| RFC propone | Estado | Observacion |
|---|---|---|
| `src/components/ui/` | OK | 22 archivos (button, card, dialog, etc.) |
| `src/components/layout/` | OK | Header, Sidebar, MainLayout + tests |
| `src/components/<dominio>/` | OK | ai/, auth/, coordination/, dashboard/, onboarding/, reference/, resources/, teaching/ |
| `src/pages/` | OK | 18 paginas |
| `src/services/` | OK | api-client.ts + api.ts + tests |
| `src/store/` | OK | 5 stores client-only (auth, config, coordination, teaching, ui) |
| `src/hooks/queries/` | OK | 4 archivos TQ (reference, resource, coordination, teaching) |
| `src/types/` | OK | index.ts (427 lineas, alineado al RFC backend) |
| `src/lib/` | OK | utils, error-messages, toast, query-client |
| `src/test-utils/` | OK | createTestQueryClient, helpers |

### 2.2 Patrones de componentes

| RFC propone | Estado |
|---|---|
| CVA para variantes | OK |
| Compound components | OK |
| Radix asChild via Slot | OK |
| forwardRef | OK |
| Config-driven (DynamicSectionRenderer) | OK |

### 2.3 Manejo de errores

| RFC exige | Estado | Evidencia |
|---|---|---|
| ErrorBoundary por ruta | OK | RouteBoundary envuelve cada pagina lazy |
| Interceptor API (401 → logout) | OK | api-client.ts:88 + authStore hydrate |
| Parseo de APIError/AuthError | OK | api-client.ts:8-27 |
| Toast via Sonner | OK | src/lib/toast.ts + Sonner instalado |
| ERROR_MESSAGES map | OK | src/lib/error-messages.ts |
| Loading/Error/Empty triple | OK | DataState component + patron por pagina |

---

## Seccion 3 — Capa de datos

### 3.1 Cliente API

| Requisito | Estado | Evidencia |
|---|---|---|
| Fetch wrapper | OK | api-client.ts:57-97 |
| Base URL desde env | OK | config/env.ts |
| Bearer header | OK | api-client.ts:63-65 |
| Error parsing | OK | APIError + AuthError |
| 401 → logout | OK | api-client.ts:88 |
| Helpers GET/POST/PATCH/PUT/DELETE | OK | api-client.ts:103-126 |
| fetchPaginated helper | OK | api-client.ts:132-141 |

### 3.2 Paginacion

| Requisito | Estado |
|---|---|
| PaginatedResponse<T> | OK (types/index.ts:8-11) |
| fetchPaginated helper | OK |
| usePaginatedList hook | OK (hooks/usePaginatedList.ts) |
| Listados paginados en practica | OK — AdminAreas, CoordinatorDocuments y Resources usan usePaginatedList |

### 3.3 State management

| Requisito | Estado | Evidencia |
|---|---|---|
| Server-state en TanStack Query | OK | 4 archivos en hooks/queries/ |
| Client-state en Zustand slices | OK | 5 stores: auth, config, coordination, teaching, ui |
| Prefetch de referencia al bootstrap | OK | App.tsx usa queryClient.prefetchQuery() |
| Invalidacion post-mutacion | OK | Mutations tienen onSuccess → invalidateQueries |
| Optimistic updates | OK | Document.tsx y TeacherLessonPlan.tsx usan setQueryData |
| Fallback a mocks | OK | setQueryData con mock data si backend falla |

### 3.4 Interfaces TypeScript

Todas alineadas al RFC backend. Ver rfc-alizia-fe.md seccion 3.2 para tabla completa.

---

## Seccion 4 — Autenticacion y autorizacion

| Requisito | Estado | Evidencia |
|---|---|---|
| Login POST → token + user | OK | authStore.ts login() |
| Token en sessionStorage | OK | authStore.ts hydrate/persist |
| Bearer en todas las requests | OK | api-client.ts |
| 401 → logout → /login | OK | Cadena completa |
| Rehidratacion en F5 | OK | authStore.hydrate() lee sessionStorage |
| ProtectedRoute con roles | OK | components/auth/ProtectedRoute.tsx |
| RequireModule con feature flag | OK | components/auth/RequireModule.tsx |
| Multi-rol simultaneo en sidebar | OK | Sidebar usa hasRole() multi-rol. Items de todos los roles visibles. |
| Redirect a onboarding post-login | OK | useAuth.handleLogin chequea onboardingApi.getStatus() → /onboarding si no completado |

---

## Seccion 5 — Rutas y navegacion

| Requisito | Estado |
|---|---|
| 18 rutas con lazy loading | OK |
| Guards de rol | OK |
| Feature flags en rutas | OK |
| Pagina 404 (NotFound) | OK |
| Pagina 403 (Forbidden) | OK |
| Sidebar filtrada por rol + flags | OK |
| useNomenclature en sidebar labels | OK — sidebar consume useNomenclature para documentos y recursos |
| useNomenclature en headers/titulos | OK — Course, TeacherHome, TeacherCourseSubject, Resources usan useNomenclature |
| Links de sidebar correctos | OK — destinos reales: /coordinator/documents, /resources, /admin/areas |

---

## Seccion 6 — Modulos por epica

### 6.1 Epica 1 — Roles y accesos: OK
### 6.2 Epica 2 — Onboarding: OK (wizard 4 pasos, ProfileForm, TourOverlay)
### 6.3 Epica 3 — Integracion: OK (TopicTree, ScheduleGrid, SharedClassIndicator)
### 6.4 Epica 4 — Documento de coordinacion: OK (wizard, editor, secciones, publicacion, chat)
### 6.5 Epica 5 — Planificacion docente: OK (momentos, actividades, generacion, publicacion)
### 6.6 Epica 6 — Asistente IA: OK (ChatPanel, GenerateButton, LoadingOrb)
### 6.7 Epica 7 — Dashboard: OK (CoordinatorHome + TeacherHome con widgets)
### 6.8 Epica 8 — Contenido y recursos: OK (library, create, editor, generacion)
### 6.9 Epica 10 — Cosmos: OK (useOrgConfig, useFeatureFlag, applyVisualIdentity)

---

## Seccion 7 — Integracion IA: OK
## Seccion 8 — Cosmos config dinamica: OK

---

## Resumen de gaps pendientes

### Prioridad baja
1. **G-2** — Multi-rol en home redirect (sidebar ya multi-rol; home usa rol primario — aceptable)

---

## Brechas cerradas desde la auditoria v0.1

| Gap original | Estado |
|---|---|
| G-2.1 ErrorBoundary unico a nivel app | CERRADO — RouteBoundary por pagina |
| G-2.2 Sin Sonner | CERRADO — toast.ts + Sonner cableado |
| G-2.3 Sin ERROR_MESSAGES map | CERRADO — error-messages.ts |
| G-2.4 Sin patron loading/error/empty | CERRADO — DataState component |
| G-3.1 Sin usePaginatedList | CERRADO — hook creado |
| G-3.2 Sin uiStore | CERRADO — uiStore.ts con sidebarOpen |
| G-3.3 Sin invalidacion de cache | CERRADO — TanStack Query mutations |
| G-4.1 Token se pierde en F5 | CERRADO — sessionStorage + hydrate() |
| G-5.1 Sin /coordinator/documents | CERRADO — CoordinatorDocuments page |
| G-5.3 Sin paginas 404/403 | CERRADO — NotFound + Forbidden |
| G-8 Sidebar links rotos | CERRADO — destinos reales + multi-rol + useNomenclature |
| G-1 Sin redirect a onboarding | CERRADO — useAuth.handleLogin chequea onboardingApi.getStatus() |
| G-7 Teaching sin mutations TQ | CERRADO — 4 mutations: create, update, updateStatus, generateActivity |
| G-3 useNomenclature sin consumidores | CERRADO — 4 paginas usan useNomenclature para titulos |
| G-4 Sin paginacion real en listados | CERRADO — Resources migrado a usePaginatedList; AdminAreas y CoordinatorDocuments ya lo usaban |
| G-5 Sin cooldown visual para rate limit | CERRADO — GenerateButton detecta AI_RATE_LIMITED y muestra countdown 30s |
| G-6 Sin editor markdown para secciones markdown | CERRADO — MarkdownEditor con edit/preview; SectionEditor lo usa para type: 'markdown' |

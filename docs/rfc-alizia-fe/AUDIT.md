# Auditoría RFC Alizia Frontend — Estado real del código

**Fecha:** 2026-04-10
**Commit base:** `5f7c502` (main, único commit)
**Tests:** 41 archivos / 271 tests verdes
**Método:** Lectura directa del código contra cada sección del RFC. Citas con `archivo:línea`.

Leyenda:
- ✅ **Hecho** — Implementado según la spec.
- 🟡 **Parcial** — Implementado pero con gap funcional o naming distinto.
- ❌ **Falta** — No existe.
- ⚪ **Fuera de alcance MVP** — El RFC lo marca como futuro.

---

## Sección 2 — Arquitectura frontend

### 2.1 Estructura de directorios

| RFC propone | Estado | Observación |
|---|---|---|
| `src/components/ui/` | ✅ | `src/components/ui/` — 22 archivos (button, card, dialog, etc. + TopicTree, ChatBot, etc.) |
| `src/components/layout/` | ✅ | `Header.tsx`, `Sidebar.tsx`, `MainLayout.tsx` |
| `src/features/<dominio>/` | ❌ | **No existe.** La co-locación se hizo por carpeta en `src/components/` (ai/, auth/, coordination/, dashboard/, onboarding/, reference/, resources/, teaching/). Misma intención, otro layout. Sin impacto funcional. |
| `src/pages/` | ✅ | 13 páginas |
| `src/services/` | ✅ | `api.ts` + `api-client.ts` + tests |
| `src/store/` | ✅ | 6 slices (auth, config, coordination, reference, resource, teaching) + tests |
| `src/types/` | ✅ | `index.ts` monolítico (427 líneas) |
| `src/hooks/` | ✅ | `useAuth.ts`, `useOrgConfig.ts` + tests |
| `src/lib/` | ✅ | `utils.ts`, `visual-identity.ts` |
| `src/config/` | ✅ | `env.ts` |

**Gap:** la estructura propuesta `src/features/` no existe — se reemplazó por co-locación en `src/components/<dominio>/`. Es una decisión de layout equivalente. No recomiendo tocarlo.

### 2.2 Patrones de componentes

| RFC propone | Estado | Evidencia |
|---|---|---|
| CVA para variantes | ✅ | `src/components/ui/button.tsx`, `badge.tsx` |
| Compound components | ✅ | `Card`, `Tabs`, `Dialog` en `src/components/ui/` |
| Radix `asChild` vía Slot | ✅ | Button usa `asChild` (Radix) |
| forwardRef | ✅ | Todos los componentes base lo usan |
| Config-driven (`DynamicSectionRenderer`) | ✅ | `src/components/coordination/DynamicSectionRenderer.tsx` — existe y tiene tests |

### 2.3 Manejo de errores

| RFC exige | Estado | Evidencia |
|---|---|---|
| ErrorBoundary a nivel ruta | 🟡 | `src/components/ErrorBoundary.tsx:14` — existe, pero está montado **una vez** a nivel de `<App>` (`src/App.tsx:234`), no por ruta. Si el error lo tira una página lazy, toda la app queda en fallback hasta recargar. |
| Interceptor API (401 → logout) | ✅ | `src/services/api-client.ts:88` llama `onUnauthorized?.()` en 401. `src/store/authStore.ts:75` cablea el callback con `setOnUnauthorized` → `logout()`. |
| Parseo de `APIError`/`AuthError` | ✅ | `api-client.ts:8-27` define ambas clases. `api-client.ts:76-94` las lanza. |
| Toast via Sonner para errores | ❌ | `sonner` está en `package.json:41` pero **no se importa en ninguna parte de src/**. Los errores se muestran inline en los forms (ej. `Login.tsx:93`) o con `console.error`. |
| Loading/Error/Empty triple | 🟡 | **Empty** sí (varias páginas lo cubren: `CoordinatorHome.tsx:72-81`, `ScheduleGrid.tsx:73-86`). **Loading** usa `LoadingFallback` global de `Suspense` (`src/components/LoadingFallback.tsx`) pero no hay skeletons de carga por componente de datos. **Error** apenas existe como estado propio por pantalla — sólo hay `error` en el form de login y el ErrorBoundary global. |
| `ERROR_MESSAGES` map backend→usuario | ❌ | `grep ERROR_MESSAGES src/` no encuentra nada. Los mensajes de error del backend se muestran crudos. |

**Gaps concretos:**
- **G-2.1**: Envolver cada `<Route>` en ErrorBoundary propio (o al menos envolver `<Suspense>` interno con uno).
- **G-2.2**: Cablear Sonner — `<Toaster />` en root + helper `showApiError(error)` que parsea `APIError` y elige un mensaje del catálogo.
- **G-2.3**: Crear `src/lib/error-messages.ts` con el map del RFC.
- **G-2.4**: Patrón loading/error por feature: un `<DataState>` componible (o hook `useAsync`) que cubra los 3 estados. La mayoría de las páginas hoy asume que los datos ya están en el store.

---

## Sección 3 — Capa de datos

### 3.1 Cliente API

**Estado: ✅ completo.**

| Requisito | Evidencia |
|---|---|
| Fetch wrapper | `src/services/api-client.ts:57-97` |
| Base URL desde env | `src/services/api-client.ts:1` importa `env.API_BASE_URL` desde `src/config/env.ts` |
| Bearer header | `api-client.ts:63-65` |
| Parseo de errores backend | `api-client.ts:76-94` |
| 204 No Content | `api-client.ts:73` |
| 401 → logout callback | `api-client.ts:88` + `authStore.ts:75` |
| `AuthError` y `APIError` separados | `api-client.ts:8-27` |
| Helpers GET/POST/PATCH/PUT/DELETE | `api-client.ts:103-126` |

**Diferencia con la spec literal del RFC (sólo forma, no fondo):**
- El RFC sugería leer el token con `useAuthStore.getState().token`. El código actual usa variable de módulo `authToken` + `setAuthToken()`. Resultado equivalente, evita acoplar `api-client` al store.

### 3.1 Paginación

| Requisito | Evidencia |
|---|---|
| `PaginatedResponse<T>` | `src/types/index.ts:8-11` |
| Helper `fetchPaginated` | `src/services/api-client.ts:132-141` |
| Hook `usePaginatedList` | ❌ No existe |

**Gap G-3.1:** El RFC propone un hook `usePaginatedList` con `items`, `hasMore`, `loadMore`. No existe. Hoy `fetchPaginated` se usa directo en `api.ts` y las páginas cargan la primera página en `App.tsx` al bootstrap. **Nadie está paginando** — todos los listados cargan los primeros 20 (default) y listo. Consecuencia: si el backend tiene más de 20 cursos/áreas/documentos, la UI los pierde en silencio.

### 3.2 Interfaces TypeScript

**Estado: ✅ completo.** `src/types/index.ts` está alineado al RFC:

| Entidad RFC | Estado en `types/index.ts` |
|---|---|
| `PaginatedResponse<T>` | ✅ línea 8 |
| `Topic` recursivo (no Nucleus/Area/Category) | ✅ línea 107 |
| `CoordinationDocument` con `sections: Record<string, SectionValue>` | ✅ línea 209-224 |
| `CoordinationDocumentStatus: 'pending'│'in_progress'│'published'` | ✅ línea 207 |
| `LessonPlanFonts` como objeto (global/apertura/…) + `resources_mode` | ✅ líneas 277-285, 298 |
| `Resource.resource_type_id` (no enum hardcoded) + `content: Record<string, unknown>` | ✅ líneas 348-360 |
| `User.roles: UserRole[]` (multi-rol) | ✅ línea 42 |
| `Organization` + `OrgConfig` | ✅ líneas 58-89 |
| `ProfileField`, `TourStep` para onboarding dinámico | ✅ líneas 91-103 |

**Nota menor:** el RFC lista `User.organization_id`, `User.profile_data` y `User.onboarding_completed_at`. El tipo actual los omite. Si la API los devuelve, se descartan.

### 3.3 Zustand slices

**Estado: ✅ completo.**

| Slice propuesto | Archivo |
|---|---|
| auth | `src/store/authStore.ts` |
| coordination | `src/store/coordinationStore.ts` |
| teaching | `src/store/teachingStore.ts` |
| resources | `src/store/resourceStore.ts` |
| config | `src/store/configStore.ts` |
| ui | `src/store/uiStore.ts` |
| reference (no listado en RFC pero útil) | `src/store/referenceStore.ts` |

**Gap G-3.2:** ✅ cerrado. `src/store/uiStore.ts` expone `sidebarOpen` + `setSidebarOpen` / `toggleSidebar` con persistencia a `localStorage`. El toggle se consume desde `Header` (botón `PanelLeft`) y `MainLayout` (renderiza `<Sidebar />` condicionalmente). Tests en `src/store/uiStore.test.ts`, `src/components/layout/Header.test.tsx` y `src/components/layout/MainLayout.test.tsx`.

### 3.4 Cache

**Gap G-3.3:** El RFC sugiere "carga eager al login + invalidación manual". Eso está implementado en `src/App.tsx:52-100` (`loadReferenceData`, `loadOrgConfig`), pero **no hay invalidación**. Después de crear/editar un documento, la lista del store no se refresca automáticamente — las páginas tienen que llamar a los setters del slice manualmente. No es un gap crítico hoy con mocks, pero con backend real va a causar UI stale.

---

## Sección 4 — Autenticación y autorización

### 4.1 Flujo JWT

| Requisito RFC | Estado | Evidencia |
|---|---|---|
| Login POST → token + user | ✅ | `authStore.ts:32-35` |
| Token en memoria, no localStorage | ✅ | `api-client.ts:33` (variable de módulo) |
| Todas las requests con Bearer | ✅ | `api-client.ts:63-65` |
| 401 → logout → /login | ✅ | `api-client.ts:88` + `authStore.ts:75` + `useAuth.ts:23` |
| Sin refresh token MVP | ✅ | Intencional |
| Decodificar claims JWT | ❌ | El POC **no decodifica** el JWT. Usa el objeto `user` del response de login. El tipo `JWTClaims` existe (`types/index.ts:45`) pero no se usa. En práctica, si el backend no manda un `user` completo junto al token, el cliente no puede leer roles. |

**Gap G-4.1:** La persistencia del token se pierde al refrescar la página (F5). El usuario tiene que re-loguearse cada vez. El RFC no lo prohíbe explícitamente (dice "memoria, NO localStorage"), pero tampoco dice cómo sobrevivir a un refresh. Recomendación: **sessionStorage** para el token + re-validar con `/auth/me` al bootstrap. Sobrevive al F5, muere al cerrar la pestaña, y no queda persistido en disco.

### 4.2 Hook useAuth

| Requisito | Estado | Evidencia |
|---|---|---|
| `user`, `roles`, `isAuthenticated` | ✅ | `src/hooks/useAuth.ts:28-36` |
| `isCoordinator`, `isTeacher`, `isAdmin` | 🟡 | El hook expone `role` (primario), no flags booleanas separadas. Equivalente funcionalmente, distinto en forma. Consumidores hacen `role === 'coordinator'`. |
| `logout` | ✅ | `useAuth.ts:23-26` |
| Multi-rol simultáneo | 🟡 | `authStore.getUserRole()` devuelve **un solo rol primario** (coord > teacher > admin). `hasRole()` sí soporta multi. La sidebar filtra por el rol primario (`Sidebar.tsx:19`), por lo que **un usuario con ambos roles nunca ve los dos sets de items simultáneamente** — sólo ve los de coordinador. Esto contradice RFC §4.2: "el frontend muestra la UI de ambos roles simultáneamente". |

**Gap G-4.2:** Usuario multi-rol ve sólo la UI de su rol primario. Para cumplir el RFC, la sidebar debería iterar `user.roles` completo en lugar de `getUserRole()`. Ejemplo concreto del bug: `teacher2@neuquen.edu.ar` tiene `roles: ['teacher', 'coordinator']` (`authStore.ts:10`) pero el sidebar lo trata como coordinador puro.

### 4.3 Rutas protegidas

| Requisito | Estado | Evidencia |
|---|---|---|
| `ProtectedRoute` con `roles` | ✅ | `src/components/auth/ProtectedRoute.tsx:11-26` |
| `RequireModule` con feature flag | ✅ | `src/components/auth/RequireModule.tsx` |
| Redirect a /login si no autenticado | ✅ | `ProtectedRoute.tsx:15-17` |
| Redirect a / si rol insuficiente | ✅ | `ProtectedRoute.tsx:19-23` |

---

## Sección 5 — Rutas y navegación

### 5.1 Mapa de rutas

Tabla comparativa (RFC vs `src/App.tsx`):

| Ruta RFC | Página RFC | Ruta real | Estado |
|---|---|---|---|
| `/login` | LoginPage | `/login` → `Login` (App.tsx:140) | ✅ |
| `/onboarding` | OnboardingPage | `/onboarding` → `Onboarding` (App.tsx:150) | ✅ (pero ver G-6.1) |
| `/` | Redirect por rol | `/` → `CoordinatorHome` o `TeacherHome` según rol (App.tsx:215-223) | 🟡 naming: la home no está detrás de `/coordinator` o `/teacher` |
| `/coordinator` | CoordinatorDashboard | ❌ no existe como ruta explícita | 🟡 cubierto por `/` |
| `/coordinator/documents` | DocumentListPage | ❌ **no existe** | ❌ |
| `/coordinator/documents/new` | DocumentWizardPage | `/coordinator/courses/:id/documents/new` → `Wizard` (App.tsx:158) | 🟡 naming: el wizard está anidado bajo `courses/:id` |
| `/coordinator/documents/:id` | DocumentEditorPage | `/coordinator/documents/:id` → `Document` (App.tsx:167) | ✅ |
| `/teacher` | TeacherDashboard | ❌ no existe como ruta explícita | 🟡 cubierto por `/` |
| `/teacher/courses/:csId` | TeacherCoursePage | `/teacher/courses/:id` → `TeacherCourseSubject` (App.tsx:228) | ✅ |
| `/teacher/courses/:csId/plans/:classNumber/new` | LessonPlanWizardPage | `/teacher/courses/:csId/plans/:classNumber/new` → `TeacherPlanWizard` (App.tsx:231-237) | ✅ |
| `/teacher/plans/:id` | LessonPlanEditorPage | `/teacher/plans/:id` → `TeacherLessonPlan` (App.tsx:176) | ✅ |
| `/resources` | ResourceLibraryPage | `/resources` → `Resources` (App.tsx:240) | ✅ |
| `/resources/new` | ResourceCreatePage | `/resources/new` → `ResourceCreate` (App.tsx:185) | ✅ |
| `/resources/:id` | ResourceEditorPage | `/resources/:id` → `ResourceEditor` (App.tsx:194) | ✅ |

**Gaps concretos:**
- **G-5.1**: No hay `/coordinator/documents` (listado de documentos). Hoy los documentos se muestran embebidos en `CoordinatorHome.tsx:65-72`. Para un coordinador con muchos documentos, no hay vista dedicada con filtros/paginación.
- **G-5.2**: Wizard anidado bajo `/coordinator/courses/:id/documents/new` en vez de `/coordinator/documents/new`. Funcionalmente OK (el curso define el área), pero diverge del RFC.
- **G-5.3**: No hay páginas 404/403 dedicadas. Toda ruta desconocida hace `<Navigate to="/" replace />` (App.tsx:247). Un usuario que escribe una URL mal no sabe que falló.

### 5.2 Lazy loading

**Estado: ✅ completo.** `src/App.tsx:37-50` declara 13 páginas con `React.lazy`. `Suspense` envuelve con `<LoadingFallback />`.

**Nota:** El RFC pide `PageSkeleton` como fallback. Hoy es un spinner simple en `src/components/LoadingFallback.tsx`. No impide el funcionamiento; es pulido de UX.

### 5.3 Sidebar dinámica

| Requisito | Estado | Evidencia |
|---|---|---|
| Filtrado por rol | 🟡 | `Sidebar.tsx:56-63` — filtra, pero lee sólo `getUserRole()` (rol primario). Multi-rol roto — ver G-4.2. |
| Filtrado por feature flag | ✅ | `Sidebar.tsx:22-23, 60-61` usa `useFeatureFlag('contenido')` y `useFeatureFlag('planificacion')` |
| `useNomenclature` para labels | ❌ | Existe el hook (`useOrgConfig.ts:26`) pero **la sidebar usa strings hardcodeados** ("Inicio", "Cursos", "Mis materias", "Planificacion", "Recursos"). Si una org quiere llamar "Disciplina" en vez de "Materia", no se aplica. |
| Paths reales | ❌ | **4 de 5 items apuntan a `to: '/'`** (`Sidebar.tsx:27, 31, 41, 46`). La navegación del sidebar está **rota** para "Cursos", "Mis materias", "Planificacion". Sólo "Recursos" (`/resources`) funciona. |

**Gap crítico G-5.4:** La sidebar se ve correcta pero los links no llevan a ningún lado. Es probablemente el bug más visible del POC si un usuario intenta navegar. Arreglo: definir las páginas destino (`/coordinator/documents`, `/teacher/courses`, etc.) y linkear. Pero eso requiere que esas páginas existan (ver G-5.1).

---

## Sección 6 — Módulos por épica

### 6.1 Épica 1 — Roles y accesos

| RFC | Estado | Evidencia |
|---|---|---|
| LoginPage con form real | ✅ | `src/pages/Login.tsx` |
| `LoginForm` como componente | 🟡 | Está inlineado en la página, no como componente separado. Irrelevante funcionalmente. |
| `RoleBadge` | ❌ | No existe. No hay lugar en la UI donde se muestre un badge con el rol del usuario. El Header podría usarlo. |
| Redirect a `/onboarding` si no completado | ❌ | **No implementado.** Ver G-6.1. |

**Gap G-6.1:** Después del login, `useAuth.handleLogin` hace `navigate('/')` directo. Nunca llama a `onboardingApi.getStatus()` ni verifica `onboarding_completed_at`. Consecuencia: un usuario nuevo **nunca ve el onboarding** a menos que escriba `/onboarding` a mano.

### 6.2 Épica 2 — Onboarding

| RFC | Estado | Evidencia |
|---|---|---|
| OnboardingPage con wizard | ✅ | `src/pages/Onboarding.tsx:14` — 195 líneas con 4 pasos (welcome/profile/tour/done) |
| `ProfileForm` config-driven | ✅ | `src/components/onboarding/ProfileForm.tsx` |
| `TourOverlay` / ProductTour | ✅ | `src/components/onboarding/TourOverlay.tsx` |
| `allow_skip` respetado | ✅ | `Onboarding.tsx:21, 100-106` |
| POST `/users/me/onboarding/complete` | ✅ | `Onboarding.tsx:56` |
| Tests | ❌ | `Onboarding.tsx` y `ProfileForm` no tienen tests. `TourOverlay.test.tsx` y `ProfileForm.test.tsx` sí existen. |

### 6.3 Épica 3 — Integración (reference data)

| RFC | Estado | Evidencia |
|---|---|---|
| `TopicTree` recursivo config-driven | ✅ | `src/components/ui/TopicTree.tsx` + tests |
| `ScheduleGrid` | ✅ | `src/components/reference/ScheduleGrid.tsx` + tests (Grupo D) |
| `SharedClassBadge` / `SharedClassIndicator` | ✅ | `src/components/coordination/SharedClassIndicator.tsx`, re-exportado como `SharedClassBadge` en `reference/index.ts` |

### 6.4 Épica 4 — Documento de coordinación

| Componente RFC | Estado | Evidencia |
|---|---|---|
| `DocumentCard` | ✅ | `components/coordination/DocumentCard.tsx` |
| `DocumentWizard` (3 pasos) | ✅ | `pages/Wizard.tsx` (251 líneas) |
| `TopicSelector` | ✅ | `components/coordination/TopicSelector.tsx` |
| `SubjectClassConfig` | ✅ | `components/coordination/SubjectClassConfig.tsx` |
| `DynamicSectionRenderer` | ✅ | `components/coordination/DynamicSectionRenderer.tsx` |
| `SectionEditor` (text/select_text/markdown) | ✅ | `components/coordination/SectionEditor.tsx`. **markdown → Textarea placeholder** (markdown real es futuro). |
| `ClassPlanTable` | ✅ | `components/coordination/ClassPlanTable.tsx` |
| `PublishValidation` | ✅ | `components/coordination/PublishValidation.tsx` |
| `SharedClassIndicator` | ✅ | `components/coordination/SharedClassIndicator.tsx` |
| DocumentListPage | ❌ | No existe. Ver G-5.1. |

### 6.5 Épica 5 — Planificación docente

| Componente RFC | Estado |
|---|---|
| `ClassCard` | ✅ `teaching/ClassCard.tsx` |
| `MomentEditor` | ✅ `teaching/MomentEditor.tsx` |
| `ActivitySelector` | ✅ `teaching/ActivitySelector.tsx` |
| `ActivityContentEditor` | ✅ `teaching/ActivityContentEditor.tsx` |
| `FontSelector` | ✅ `components/ui/FontSelector.tsx` |
| `MomentsValidation` | ✅ `teaching/MomentsValidation.tsx` |
| `ResourceModeToggle` | ✅ `teaching/ResourceModeToggle.tsx` |

### 6.6 Épica 6 — Asistente IA

| Componente RFC | Estado |
|---|---|
| `ChatPanel` reutilizable | ✅ `components/ai/ChatPanel.tsx` |
| `GenerateButton` | ✅ `components/ai/GenerateButton.tsx` |
| `LoadingOrb` | ✅ `components/ai/LoadingOrb.tsx` |

### 6.7 Épica 7 — Dashboard

| Componente RFC | Estado | Evidencia |
|---|---|---|
| `DocumentStatusCard` (coord) | 🟡 | No existe con ese nombre. `DocumentCard` (coord) cubre la funcionalidad. |
| `PlanningProgressBar` | ✅ | `dashboard/PlanningProgressBar.tsx` |
| `CourseOverview` | ✅ | `dashboard/CourseOverview.tsx` |
| `UpcomingClassesWidget` (teacher) | ✅ | `dashboard/UpcomingClassesWidget.tsx` |
| `PendingPlansCard` (teacher) | ✅ | `dashboard/PendingPlansCard.tsx` |
| `PublishedDocumentsCard` (teacher) | ✅ | `dashboard/PublishedDocumentsCard.tsx` |
| `NotificationList` | ✅ | `dashboard/NotificationList.tsx` |
| CoordinatorHome dashboard completo | ✅ | `pages/CoordinatorHome.tsx` (120 líneas) — integra DocumentCard, StatsCard, PlanningProgressBar, PublishedDocumentsCard, CourseOverview |
| TeacherHome dashboard completo | ✅ | `pages/TeacherHome.tsx` (117 líneas) |

**Nota:** El RFC dice "CoordinatorHome y TeacherHome son básicas, se construyen desde cero". **Ya se construyeron** — son dashboards completos con los widgets del RFC. Este ítem del RFC está desactualizado respecto al código.

### 6.8 Épica 8 — Contenido y recursos

| Componente RFC | Estado |
|---|---|
| `ResourceTypeSelector` | ✅ `resources/ResourceTypeSelector.tsx` |
| `FontRequirementSelector` | ✅ `resources/FontRequirementSelector.tsx` |
| `DynamicContentRenderer` | ✅ `resources/DynamicContentRenderer.tsx` |
| `ResourceCard` | ✅ `resources/ResourceCard.tsx` |
| Pages (Library/Create/Editor) | ✅ `pages/Resources.tsx`, `ResourceCreate.tsx`, `ResourceEditor.tsx` |

### 6.9 Épica 10 — Cosmos

| RFC | Estado | Evidencia |
|---|---|---|
| `useOrgConfig` hook | ✅ | `src/hooks/useOrgConfig.ts:15` |
| `useFeatureFlag` | ✅ | `useOrgConfig.ts:20` |
| `useNomenclature` | ✅ | `useOrgConfig.ts:26` — **existe pero nadie lo usa** (0 consumidores en `src/`). |
| `useLevelName` | ✅ | `useOrgConfig.ts:33` |
| `applyVisualIdentity` | ✅ | `src/lib/visual-identity.ts:7` — aplica `--color-primary` y `document.title` |
| `logo_url` en Header | ❓ | No verificado en este pase. |
| Default modules=true si no seteado | ✅ | `useOrgConfig.ts:22` |

**Gap G-6.2:** `useNomenclature` existe pero está huérfano. Si querés honrar el nomenclador dinámico del RFC, hay que reemplazar strings hardcodeados (sidebar, headers, títulos) por `useNomenclature('coordination_document')` etc. Es trabajo de búsqueda/reemplazo más que de arquitectura.

---

## Sección 7 — Integración IA

| Requisito | Estado | Evidencia |
|---|---|---|
| `ChatPanel` con `entityType` | ✅ | `components/ai/ChatPanel.tsx:8-19` |
| `onEntityUpdated` callback en `document_updated` | ✅ | `ChatPanel.tsx:56-58` |
| Soporte multi-entidad (doc/plan/resource/general) | ✅ | `ChatPanel.tsx:6` define 4 tipos |
| `GenerateButton` con `isGenerating` | ✅ | `components/ai/GenerateButton.tsx` |
| Generación parcial con `section_keys` | ✅ | `coordinationDocumentsApi.generate` (`api.ts:161-164`) acepta `section_keys` |
| Toast en error de generación | ❌ | Ver G-2.2 — no hay Sonner cableado |
| Cooldown visual en rate limit | ❌ | El código no diferencia `AI_RATE_LIMITED` de otros errores |

---

## Sección 8 — Cosmos config dinámica

### 8.1 Carga de config

| Requisito | Estado |
|---|---|
| Bootstrap post-login | ✅ `App.tsx:52-65` (`loadOrgConfig`) — trata de `GET /org/config` y cae a mock si falla |
| Disponible via `useOrgConfig()` | ✅ |

**Nota:** El RFC dice "al login exitoso, `GET /auth/me` retorna user + org info". El código actual carga la config como llamada **separada** (`/org/config`). Diferencia de endpoint, mismo efecto.

### 8.2 Secciones dinámicas

✅ `DynamicSectionRenderer.tsx` cubre el patrón con tests.

### 8.3 Feature flags

✅ `useFeatureFlag` + `RequireModule` completo.

### 8.4 Identidad visual

| Config | Estado |
|---|---|
| `platform_name` en `document.title` | ✅ `visual-identity.ts:18` |
| `primary_color` como CSS var | ✅ `visual-identity.ts:14` |
| `logo_url` en Header | ❓ no verificado |
| `platform_name` en tab del browser | ✅ (es lo mismo que document.title) |

---

## Resumen ejecutivo — gaps priorizados

### Bloqueantes para un MVP funcional
1. **G-5.4** — Sidebar con links rotos (`to: '/'` en 4 de 5 items). Hoy el usuario no puede navegar con el sidebar.
2. **G-6.1** — No hay redirect a `/onboarding` post-login. Los usuarios nuevos no lo ven.
3. **G-4.1** — Refrescar la página (F5) desloguea al usuario. Se pierde trabajo.

### Gaps funcionales que el RFC exige explícitamente
4. **G-4.2** — Usuario multi-rol ve sólo UI de su rol primario (contradice RFC §4.2).
5. **G-2.2** — Sin Sonner: los errores de API no se muestran como toast al usuario. Sólo console.error.
6. **G-2.3** — Sin `ERROR_MESSAGES` map: los errores del backend se muestran crudos en vez del mensaje amigable del RFC §2.3.
7. **G-5.1** — No existe `/coordinator/documents` (listado). Hoy los documentos se ven sólo embebidos en el home.

### Gaps de polish importantes
8. **G-3.1** — Sin `usePaginatedList`: todos los listados cargan los primeros 20 y pierden el resto en silencio.
9. **G-2.1** — ErrorBoundary único a nivel app. Un error en una página fallea toda la app.
10. **G-3.3** — Sin invalidación de cache post-mutación. Stale data en cuanto haya backend real.
11. **G-6.2** — `useNomenclature` existe pero nadie lo usa. Orgs no pueden renombrar conceptos.
12. **G-5.3** — Sin páginas 404/403.
13. **G-5.2** — Wizard en ruta anidada distinta a la del RFC (cosmético).

### Diferencias de forma (no son gaps)
- `src/features/` no existe, se usa `src/components/<dominio>/`. Equivalente.
- `ClassPlanTable` vs `DocumentStatusCard`: naming RFC desactualizado.
- `RoleBadge` no existe. No es crítico, es decoración.

### Ya hecho (el RFC decía "construir desde cero" pero ya está)
- Onboarding wizard (RFC §6.2 dice "no existe en el POC").
- Dashboard coordinador y docente (RFC §6.7 dice "no existe en el POC").
- Todos los componentes de las épicas 3, 4, 5, 6, 8.

---

## Qué hacer ahora

El RFC en sí **está desactualizado** respecto al código. El 70-80% del trabajo que el RFC marca como "construir" ya está. Lo que queda es:

**Quick wins (medio día cada uno):**
1. Arreglar G-5.4 (sidebar links) — hay que darle destinos reales a los items.
2. Arreglar G-6.1 (redirect a onboarding) — añadir check en `useAuth.handleLogin` o en `AppRoutes`.
3. Arreglar G-4.1 (sessionStorage + `/auth/me` rehidratación).
4. Arreglar G-4.2 (multi-rol en sidebar).

**Medio (1-2 días cada uno):**
5. G-2.2 + G-2.3 + G-2.4 (Sonner + catálogo de errores + patrón de data loading).
6. G-3.1 (`usePaginatedList` + aplicar en listados).
7. G-5.1 (crear `/coordinator/documents` como página con filtros).

**Alcance grande:**
8. G-3.3 (estrategia de invalidación de cache — posiblemente adoptar TanStack Query).

**Recomendación:** Agrupar 1-4 como **Grupo F — Fixes bloqueantes**. Son pequeños, ortogonales, y destapan los bugs más visibles del POC. Después decidir si seguir con Grupo G — manejo de errores user-facing (5, 6) o con features nuevas.

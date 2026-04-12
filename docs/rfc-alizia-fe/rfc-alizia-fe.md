# RFC: Alizia Frontend — Especificacion de desarrollo

| Campo              | Valor                                      |
|--------------------|--------------------------------------------|
| **Autor(es)**      | Equipo Frontend                            |
| **Estado**         | Borrador                                   |
| **Tipo**           | Frontend / Arquitectura / Modulos          |
| **Creado**         | 2026-04-08                                 |
| **Ultima edicion** | 2026-04-12                                 |
| **Revisores**      | Pendiente                                  |
| **Decision**       | Pendiente                                  |

---

## Historial de versiones

| Version | Fecha      | Autor           | Cambios |
|---------|------------|-----------------|---------|
| 0.1     | 2026-04-08 | Equipo Frontend | Borrador inicial — estructura completa, modulos, brechas, plan |
| 0.2     | 2026-04-12 | Equipo Frontend | Actualizacion completa post-migracion TanStack Query. Refleja estado real: 18 paginas, 413 tests, server-state en TQ, stores Zustand solo client-state. Tabla de brechas actualizada. |

---

## Indice

- [1. Contexto](#1-contexto)
- [2. Arquitectura frontend](#2-arquitectura-frontend)
- [3. Capa de datos](#3-capa-de-datos)
- [4. Autenticacion y autorizacion](#4-autenticacion-y-autorizacion)
- [5. Rutas y navegacion](#5-rutas-y-navegacion)
- [6. Modulos por epica](#6-modulos-por-epica)
- [7. Integracion IA (detalle frontend)](#7-integracion-ia-detalle-frontend)
- [8. Configuracion dinamica (Cosmos)](#8-configuracion-dinamica-cosmos)
- [9. Analisis de brechas (estado actual vs RFC backend)](#9-analisis-de-brechas-estado-actual-vs-rfc-backend)
- [10. Plan de implementacion](#10-plan-de-implementacion)
- [Glosario](#glosario)

---

## 1. Contexto

### 1.1 Relacion con el RFC backend

Este documento es la contraparte frontend del [RFC Alizia backend](../rfc-alizia/rfc-alizia.md). El RFC backend cubre producto, arquitectura Go, modelo de datos (26+ tablas), endpoints API, IA y 12 epicas. Explicitamente declara "Frontend" como no-objetivo.

**Principio: no duplicar, referenciar.** Este RFC no repite flujos de usuario, reglas de negocio ni contratos API ya definidos. En su lugar, referencia los documentos existentes y se enfoca en:

- Como se organizan los modulos frontend
- Que componentes renderizan cada funcionalidad
- Como se consume la API y se maneja el estado
- Que decisiones arquitectonicas aplican al frontend

**Documentos de referencia:**
- [Integracion frontend](../rfc-alizia/tecnico/frontend-integration.md) — guia de consumo de API
- [Endpoints API](../rfc-alizia/tecnico/endpoints.md) — contratos request/response
- [Catalogo de errores](../rfc-alizia/tecnico/errores.md) — codigos de error por dominio
- [Epicas](../rfc-alizia/epicas/epicas.md) — definicion de producto y tareas
- [Cosmos (Epica 10)](../rfc-alizia/epicas/10-cosmos/10-cosmos.md) — configuracion por organizacion

### 1.2 Estado actual del frontend

El frontend fue desarrollado iterativamente desde un POC inicial. Estado al 2026-04-12:

| Area | Estado actual |
|------|--------------|
| Paginas | 18 paginas: Login, CoordinatorHome, CoordinatorDocuments, Course, Wizard, Document, TeacherHome, TeacherCourseSubject, TeacherPlanWizard, TeacherLessonPlan, Resources, ResourceCreate, ResourceEditor, AdminHome, AdminAreas, Onboarding, NotFound, Forbidden |
| Componentes | ~50 componentes organizados por dominio (ai/, auth/, coordination/, dashboard/, layout/, onboarding/, reference/, resources/, teaching/, ui/) |
| Server-state | TanStack Query con 4 hook files: useReferenceQueries (7 queries), useResourceQueries (3+3), useCoordinationQueries (2+3), useTeachingQueries (2 queries) |
| Client-state | Zustand 5 stores: authStore, configStore, coordinationStore (wizard/chat), teachingStore (wizard), uiStore (sidebar) |
| Auth | JWT con sessionStorage, 401 auto-logout, roles multi-rol, ProtectedRoute + RequireModule |
| API client | Fetch wrapper con auth headers, error parsing (APIError/AuthError), paginacion helper |
| Tipos | Alineados al RFC: Topic recursivo, sections dinamicas, Moments JSONB, ResourceType dinamico |
| Routing | Lazy loading (React.lazy + Suspense), guards de rol, feature flags |
| Errores | ErrorBoundary por ruta (RouteBoundary), error-messages map, DataState component, toast (Sonner) |
| Tests | 61 archivos, 413 tests (Vitest + Testing Library) |
| Onboarding | Wizard 4 pasos: welcome, profile form dinamico, tour overlay, done |
| Dashboard | Coordinador (stats, progress, documents) + Docente (materias, clases, notificaciones) |

### 1.3 Stack tecnologico

| Tecnologia | Version | Rol |
|---|---|---|
| React | 19.1 | Framework UI |
| TypeScript | ~5.8 | Tipado estricto |
| Vite | 7.x | Build tool (SWC) |
| Tailwind CSS | 4.x | Estilos utilitarios |
| TanStack Query | 5.x | Server-state (queries, mutations, cache) |
| Zustand | 5.x | Client-state (wizard data, UI, auth) |
| React Router | 7.x | Enrutamiento |
| Radix UI | Multiples | Primitivos accesibles |
| Biome | 2.2 | Linting + formato |
| CVA | class-variance-authority | Variantes de componentes |
| Lucide React | 0.544 | Iconografia |
| Sonner | 2.x | Toast notifications |
| Motion | 12.x | Animaciones |
| date-fns | 4.x | Utilidades de fecha |
| Vitest | 4.x | Test runner |
| Testing Library | 16.x | Test utilities |

---

## 2. Arquitectura frontend

### 2.1 Estructura de directorios

```
src/
├── components/
│   ├── ui/              # Componentes base (button, card, input, dialog, etc.)
│   ├── layout/          # Header, Sidebar, MainLayout
│   ├── ai/              # ChatPanel, GenerateButton, LoadingOrb
│   ├── auth/            # ProtectedRoute, RequireModule
│   ├── coordination/    # DocumentCard, DynamicSectionRenderer, SectionEditor, etc.
│   ├── dashboard/       # StatsCard, PendingPlansCard, NotificationList, etc.
│   ├── onboarding/      # ProfileForm, TourOverlay
│   ├── reference/       # ScheduleGrid
│   ├── resources/       # ResourceTypeSelector, DynamicContentRenderer, etc.
│   └── teaching/        # MomentEditor, ActivitySelector, ClassCard, etc.
├── pages/               # Componentes de pagina (1:1 con rutas)
├── services/            # api-client.ts (HTTP), api.ts (endpoints tipados)
├── store/               # Zustand slices (solo client-state)
├── hooks/
│   ├── queries/         # TanStack Query hooks (server-state)
│   └── *.ts             # Hooks custom (useAuth, useOrgConfig, useAsync, usePaginatedList)
├── types/               # index.ts — todas las interfaces TypeScript
├── lib/                 # Utilidades (cn, error-messages, toast, query-client)
├── config/              # env.ts
├── mocks/               # mock-config.ts (datos de desarrollo)
├── test-utils/          # createTestQueryClient, renderWithProviders
└── test/                # setup.ts (vitest config)
```

**Nota:** El RFC v0.1 proponia `src/features/<dominio>/`. Se opto por `src/components/<dominio>/` — misma co-locacion, layout mas plano. Sin impacto funcional.

### 2.2 Patrones de componentes

1. **CVA para variantes** — `buttonVariants`, `badgeVariants` con `variant` y `size`
2. **Compound components** — Card (CardHeader/Content/Footer), Tabs, Dialog
3. **forwardRef** para todos los componentes reutilizables
4. **Radix `asChild`** para componentes polimorficos via Slot
5. **Config-driven** — `DynamicSectionRenderer` renderiza editores segun `coord_doc_sections` de la org config

```typescript
// Cada type en la config mapea a un componente:
// text → <Textarea />
// select_text → <Select /> + <Textarea />
// markdown → <Textarea /> (markdown editor futuro)
```

### 2.3 Manejo de errores

**Tres capas implementadas:**

1. **ErrorBoundary por ruta** — `RouteBoundary` envuelve cada pagina lazy con error boundary individual. Un error en una pagina no tumba toda la app.

2. **Interceptor API** — `api-client.ts` parsea `APIError`/`AuthError` del backend. 401 auto-logout via `setOnUnauthorized()`.

3. **Triple loading/error/empty** — `DataState` component composable:
   - **Loading**: Skeleton placeholder o LoadingOrb
   - **Error**: Mensaje de error con opcion de reintentar
   - **Empty**: Estado vacio con mensaje contextual

**Mapeo de errores backend → usuario** (`src/lib/error-messages.ts`):

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Tu sesion expiro. Inicia sesion nuevamente.',
  FORBIDDEN: 'No tenes permisos para esta accion.',
  NOT_FOUND: 'El recurso no fue encontrado.',
  VALIDATION_ERROR: 'Revisa los datos ingresados.',
  AI_GENERATION_ERROR: 'Error al generar con IA. Intenta nuevamente.',
  AI_RATE_LIMITED: 'Demasiadas solicitudes. Espera un momento.',
  DOCUMENT_NOT_DRAFT: 'Solo se pueden editar documentos en borrador.',
  INVALID_MOMENT_ACTIVITIES: 'Revisa las actividades seleccionadas por momento.',
  LESSON_PLAN_INCOMPLETE: 'Completa todos los campos antes de publicar.',
};
```

**Toast via Sonner** (`src/lib/toast.ts`): helper `showApiError(error)` que parsea APIError y muestra toast con mensaje del catalogo.

---

## 3. Capa de datos

### 3.1 Cliente API

**`src/services/api-client.ts`** — Fetch wrapper completo:

| Funcionalidad | Estado | Implementacion |
|---|---|---|
| Base URL desde env | OK | `import { env } from '@/config/env'` |
| Bearer header automatico | OK | `Authorization: Bearer ${authToken}` en cada request |
| Error parsing | OK | `APIError` (400-499) y `AuthError` (401) como clases separadas |
| 401 → logout callback | OK | `setOnUnauthorized()` cableado en `authStore.hydrate()` |
| 204 No Content | OK | Retorna `undefined` sin parsear body |
| Helpers tipados | OK | `apiClient.get/post/patch/put/delete<T>()` |
| Paginacion | OK | `fetchPaginated<T>(endpoint, limit, offset)` helper |

**Token storage:** Variable de modulo (`authToken`) + `setAuthToken()`. El token se persiste en `sessionStorage` para sobrevivir F5, muere al cerrar pestana. No usa localStorage.

### 3.2 Interfaces TypeScript

**`src/types/index.ts`** — Alineado al RFC backend:

| Entidad RFC | Estado | Detalle |
|---|---|---|
| `PaginatedResponse<T>` | OK | `{ items: T[], more: boolean }` |
| `Topic` recursivo | OK | `{ id, name, level, parent_id, children: Topic[] }` |
| `CoordinationDocument` con `sections` | OK | `sections: Record<string, SectionValue>` dinamico |
| `SectionConfig` + `SectionValue` | OK | `type: 'text' \| 'select_text' \| 'markdown'` |
| `LessonPlan` con `Moments` | OK | `moments.apertura/desarrollo/cierre: { activities, activityContent }` |
| `LessonPlanFonts` + `resources_mode` | OK | `'global' \| 'per_moment'` |
| `Resource` con `content: Record` | OK | Dinamico segun `output_schema` del tipo |
| `ResourceType` con `output_schema` | OK | `{ prompt, output_schema, requires_font }` |
| `User` multi-rol | OK | `roles: UserRole[]` |
| `Organization` + `OrgConfig` | OK | JSONB config completo |
| `ProfileField`, `TourStep` | OK | Onboarding dinamico |
| `ChatMessage/Request/Response` | OK | Con `document_updated` flag |
| `Notification` | OK | `type: 'publication' \| 'update' \| 'deadline'` |

**Tipos menores omitidos** (se pueden agregar si la API los devuelve):
- `User.organization_id`, `User.profile_data`, `User.onboarding_completed_at`

### 3.3 Manejo de estado

**Arquitectura de dos capas:**

#### Capa 1: Server-state (TanStack Query)

Todo dato que viene de la API se maneja con TanStack Query. Hooks en `src/hooks/queries/`:

| Archivo | Queries | Mutations | Query Keys |
|---|---|---|---|
| `useReferenceQueries.ts` | 7: areas, courses, subjects, topics, courseSubjects, activitiesByMoment, fonts | — | `referenceKeys.*` |
| `useResourceQueries.ts` | 3: resources, resource(id), resourceTypes | 3: create, delete, generateContent | `resourceKeys.*` |
| `useCoordinationQueries.ts` | 2: documents, document(id) | 3: create, update, generate | `coordinationKeys.*` |
| `useTeachingQueries.ts` | 2: lessonPlans(csId), lessonPlan(id) | — | `teachingKeys.*` |

**Patrones:**
- Prefetch de referencia en `App.tsx` bootstrap via `queryClient.prefetchQuery()`
- Invalidacion automatica en `onSuccess` de mutations
- Optimistic updates en edicion de secciones y contenido de actividades via `queryClient.setQueryData()`
- Fallback a mocks si backend no disponible via `queryClient.setQueryData()` directo

#### Capa 2: Client-state (Zustand)

Solo estado de UI y wizards — datos que NO vienen del servidor:

| Store | Estado | Proposito |
|---|---|---|
| `authStore` | `user`, `token`, `isLoading`, `error` | Sesion, login/logout, hidratacion desde sessionStorage |
| `configStore` | `orgConfig`, `isLoaded` | Config de organizacion (cargada una vez) |
| `coordinationStore` | `wizardData`, `chatHistory`, `isGenerating`, `expandedSubjects` | Wizard de doc + UI del editor |
| `teachingStore` | `lessonWizardData` | Wizard de lesson plan (step, moments, fonts) |
| `uiStore` | `sidebarOpen` | Preferencia de sidebar (persiste en localStorage) |

### 3.4 Estrategia de cache

Manejada por TanStack Query:

| Tipo de dato | staleTime | Razon |
|---|---|---|
| Org config | Session lifetime | Rara vez cambia. Se carga al login. |
| Referencia (areas, subjects, topics, activities, fonts) | 5 min (default) | Datos que cambian poco. Prefetched al bootstrap. |
| Documentos, lesson plans, resources | 0 (siempre stale) | Datos mutables. TQ refetch automatico en window focus. |
| User profile | Session lifetime | Cambia solo en onboarding. |

**Invalidacion:** Cada mutation invalida sus query keys relevantes en `onSuccess`. Ejemplo:
```typescript
useCreateDocumentMutation() → onSuccess → invalidateQueries({ queryKey: coordinationKeys.all })
```

---

## 4. Autenticacion y autorizacion

### 4.1 Flujo JWT

```
1. Usuario ingresa email + password
2. POST /api/v1/auth/login → { token, user }
3. Token se guarda en sessionStorage + variable de modulo
4. Todas las requests llevan Authorization: Bearer <token>
5. Si 401 → logout() → redirect a /login
6. Al recargar (F5): hydrate() lee token de sessionStorage
7. No hay refresh token en MVP
```

**Persistencia:** `sessionStorage` (sobrevive F5, muere al cerrar pestana). El RFC backend dice "no localStorage" — sessionStorage cumple esa restriccion sin perder sesion en cada recarga.

### 4.2 Control de acceso por rol

**Hook `useAuth`** (`src/hooks/useAuth.ts`):

```typescript
function useAuth() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  return {
    user,
    role: getUserRole(),           // rol primario (coordinator > teacher > admin)
    isAuthenticated: !!user,
    hasRole: (r: UserRole) => hasRole(r),
    logout: () => { logout(); navigate('/login'); },
  };
}
```

**Multi-rol:** `user.roles` es un array. `hasRole()` soporta consulta individual. `getUserRole()` devuelve el rol primario para decidir home y sidebar.

**Gap conocido:** Un usuario con `['teacher', 'coordinator']` ve solo la UI de su rol primario en el sidebar. El RFC backend dice "muestra la UI de ambos roles simultaneamente". Para resolverlo, el sidebar deberia iterar `user.roles` completo.

### 4.3 Rutas protegidas

**`ProtectedRoute`** — verifica autenticacion y roles:
- Sin autenticacion → redirect a `/login`
- Rol insuficiente → redirect a `/` (home)

**`RequireModule`** — verifica feature flags de Cosmos:
- Modulo deshabilitado → redirect a `/`

Ambos son wrappers en `src/components/auth/`.

---

## 5. Rutas y navegacion

### 5.1 Mapa de rutas

| Ruta | Pagina | Roles | Lazy | Estado |
|------|--------|-------|------|--------|
| `/login` | Login | Publico | No | OK |
| `/onboarding` | Onboarding | Todos | Si | OK |
| `/` | Redirect por rol | Todos | — | OK |
| `/coordinator/documents` | CoordinatorDocuments | coordinator | Si | OK |
| `/coordinator/documents/:id` | Document | coordinator | Si | OK |
| `/coordinator/courses/:id` | Course | coordinator | Si | OK |
| `/coordinator/courses/:id/documents/new` | Wizard | coordinator | Si | OK |
| `/teacher/courses/:id` | TeacherCourseSubject | teacher | Si | OK |
| `/teacher/courses/:csId/plans/:classNumber/new` | TeacherPlanWizard | teacher | Si | OK |
| `/teacher/plans/:id` | TeacherLessonPlan | teacher | Si | OK |
| `/resources` | Resources | teacher | Si | OK (RequireModule 'contenido') |
| `/resources/new` | ResourceCreate | teacher | Si | OK (RequireModule 'contenido') |
| `/resources/:id` | ResourceEditor | teacher | Si | OK (RequireModule 'contenido') |
| `/admin` | AdminHome | admin | Si | OK |
| `/admin/areas` | AdminAreas | admin | Si | OK |
| `*` | NotFound | — | — | OK (404 page) |

### 5.2 Lazy loading

Todas las paginas se cargan con `React.lazy` + `Suspense` en `App.tsx`. Fallback: `<LoadingFallback />`.

### 5.3 Sidebar dinamica

Items filtrados por rol del usuario y feature flags:

```typescript
const items = [
  { label: 'Inicio', path: '/', roles: ['coordinator'], icon: Home },
  { label: 'Cursos', path: '/coordinator/courses', roles: ['coordinator'], icon: BookOpen },
  { label: 'Inicio', path: '/', roles: ['teacher'], icon: Home },
  { label: 'Mis materias', path: '/teacher/courses', roles: ['teacher'], icon: BookOpen },
  { label: 'Recursos', path: '/resources', roles: ['teacher'], module: 'contenido', icon: Library },
];
```

**`useNomenclature`** hook existe (`src/hooks/useOrgConfig.ts`) para labels dinamicos por org. Actualmente no se consume en sidebar — los labels son hardcodeados. Gap menor de polish.

---

## 6. Modulos por epica

### 6.1 Epica 1 — Roles y accesos

**Paginas:** Login
**Componentes:** LoginForm (inlineado en pagina), ProtectedRoute, RequireModule

**Flujo implementado:**
1. Usuario ingresa email + password
2. `POST /auth/login` → recibe JWT + user data
3. Token se almacena en sessionStorage + variable de modulo
4. Redirect a `/` → home segun rol

**Pendiente:** Redirect automatico a `/onboarding` si `onboarding_completed_at` es null. Hoy el usuario no ve onboarding a menos que navegue manualmente.

### 6.2 Epica 2 — Onboarding

**Paginas:** Onboarding (wizard 4 pasos)
**Componentes:** ProfileForm (config-driven), TourOverlay

**Flujo:**
1. Welcome screen
2. `ProfileForm` renderiza campos segun `org.config.onboarding.profile_fields`
3. `TourOverlay` muestra pasos segun `org.config.onboarding.tour_steps`
4. `POST /users/me/onboarding/complete`
5. Redirect a home

`allow_skip` respetado. Tests existentes para ProfileForm y TourOverlay.

### 6.3 Epica 3 — Integracion (datos de referencia)

**Componentes:** TopicTree, ScheduleGrid, SharedClassIndicator

El frontend consume datos de referencia via TanStack Query hooks prefetched al bootstrap:
- `useAreasQuery()`, `useCoursesQuery()`, `useSubjectsQuery()`, `useTopicsQuery()`
- `useCourseSubjectsQuery()`, `useActivitiesByMomentQuery()`, `useFontsQuery()`

**TopicTree** (`src/components/ui/TopicTree.tsx`): arbol recursivo que respeta `topic_max_levels`, `topic_level_names`, y `topic_selection_level` de la config de la org. Reemplaza los 3 componentes hardcoded del POC original.

### 6.4 Epica 4 — Documento de coordinacion

**Paginas:** CoordinatorDocuments (listado), Wizard (creacion 3 pasos), Document (editor)
**Componentes:**

| Componente | Descripcion | Tests |
|---|---|---|
| DocumentCard | Tarjeta: nombre, area, estado, fechas | — |
| TopicSelector | Seleccion al nivel `topic_selection_level` | Si |
| SubjectClassConfig | class_count + asignacion de topics por disciplina | Si |
| DynamicSectionRenderer | Renderiza secciones segun config | Si |
| SectionEditor | Editor por type (text, select_text, markdown) | — |
| ClassPlanTable | Tabla de clases por disciplina | Si |
| PublishValidation | Valida secciones requeridas + completitud | Si |
| SharedClassIndicator | Badge para `is_shared: true` | Si |

**Wizard (3 pasos):**
1. Seleccion de topics al nivel configurado
2. Periodo (fechas) + class_count por disciplina
3. Asignacion de topics a disciplinas

**Editor:** `DynamicSectionRenderer` itera `coord_doc_sections` de la org config. Guardado via `PATCH /coordination-documents/:id` con optimistic update en TQ cache. Generacion IA via `POST /coordination-documents/:id/generate`. Chat con Alizia via ChatPanel.

**Queries/Mutations:** `useCoordinationDocumentsQuery()`, `useCoordinationDocumentQuery(id)`, `useCreateDocumentMutation()`, `useUpdateDocumentMutation()`, `useGenerateDocumentMutation()`.

### 6.5 Epica 5 — Planificacion docente

**Paginas:** TeacherCourseSubject (lista clases), TeacherPlanWizard (creacion), TeacherLessonPlan (editor)
**Componentes:**

| Componente | Descripcion | Tests |
|---|---|---|
| ClassCard | Tarjeta por clase: numero, titulo, estado, badge shared | Si |
| MomentEditor | Editor por momento (apertura/desarrollo/cierre) | Si |
| ActivitySelector | Seleccion de actividades filtradas por momento | — |
| ActivityContentEditor | Editor del contenido generado por actividad | Si |
| FontSelector | Selector de fuentes (global o per_moment) | — |
| MomentsValidation | Valida: apertura=1, desarrollo=1..N, cierre=1 | Si |
| ResourceModeToggle | Switch global / per_moment | Si |

**Flujo:**
1. `useLessonPlansQuery(csId)` → lista clases con estado de plan
2. Click en clase sin plan → TeacherPlanWizard
3. Wizard: titulo, objetivo, actividades por momento, fuentes
4. `POST /lesson-plans` con moments, fonts
5. Auto-generacion: al entrar al editor, si hay actividades sin contenido, genera automaticamente
6. Edicion: optimistic update via `queryClient.setQueryData()`
7. Publicacion: `PATCH /lesson-plans/:id/status`

**Auto-generacion:** Patron `useRef(false)` + `useEffect` para disparar generacion solo en primer mount sin loops de React.

### 6.6 Epica 6 — Asistente IA

**Componentes:** ChatPanel (reutilizable), GenerateButton, LoadingOrb

Transversal a documentos, lesson plans y recursos. Ver seccion 7.

### 6.7 Epica 7 — Dashboard

**Paginas:** CoordinatorHome, TeacherHome
**Componentes:**

**Coordinador:**
- StatsCard — metricas genericas
- PlanningProgressBar — progreso de planificacion por curso
- CourseOverview — resumen de cursos del area
- PublishedDocumentsCard — documentos publicados recientes

**Docente:**
- StatsCard — mis materias, notificaciones
- PendingPlansCard — planes pendientes
- UpcomingClassesWidget — proximas clases
- NotificationList — feed de notificaciones

**Notificaciones:** Mock data actualmente (`MOCK_NOTIFICATIONS`). Backend Fase 7 proveera datos reales via `GET /users/me/notifications`.

### 6.8 Epica 8 — Contenido y recursos

**Paginas:** Resources (library), ResourceCreate, ResourceEditor
**Componentes:**

| Componente | Descripcion | Tests |
|---|---|---|
| ResourceTypeSelector | Seleccion de tipo con descripcion | Si |
| FontRequirementSelector | Selector de font si `requires_font` | — |
| DynamicContentRenderer | Renderiza `content` segun `output_schema` | Si |
| ResourceCard | Tarjeta: titulo, tipo, status | — |

**Flujo:**
1. `useResourceTypesQuery()` → tipos disponibles
2. Si `requires_font` → `useFontsQuery()` → selector
3. `useCreateResourceMutation()` → draft con content vacio
4. `useGenerateContentMutation()` → genera con IA
5. `DynamicContentRenderer` itera schema y renderiza inputs editables
6. Guardado via `PATCH /resources/:id`

**Queries/Mutations:** `useResourcesQuery()`, `useResourceQuery(id)`, `useResourceTypesQuery()`, `useCreateResourceMutation()`, `useDeleteResourceMutation()`, `useGenerateContentMutation()`.

### 6.9 Epica 10 — Cosmos (configuracion transversal)

**Hooks:**

| Hook | Ubicacion | Uso |
|---|---|---|
| `useOrgConfig()` | `hooks/useOrgConfig.ts` | Acceso a config completa de la org |
| `useFeatureFlag(module)` | `hooks/useOrgConfig.ts` | Toggle de modulos. Default: `true` si no seteado |
| `useNomenclature(key)` | `hooks/useOrgConfig.ts` | Labels dinamicos por org (existente, sin consumidores aun) |
| `useLevelName(level)` | `hooks/useOrgConfig.ts` | Nombres de niveles de topics |

**Identidad visual:** `applyVisualIdentity()` aplica CSS custom properties al bootstrap:
- `--color-primary` desde `visual_identity.primary_color`
- `document.title` desde `visual_identity.platform_name`

**Feature flags en accion:**
- `modules.contenido = false` → oculta "Recursos" del sidebar y rutas
- `modules.planificacion = false` → oculta flujo de lesson plans
- `shared_classes_enabled = false` → no muestra badges de clase compartida

---

## 7. Integracion IA (detalle frontend)

### 7.1 Patron ChatPanel

Componente reutilizable (`src/components/ai/ChatPanel.tsx`):

```typescript
interface ChatPanelProps {
  entityType: 'coordination-document' | 'lesson-plan' | 'resource' | 'general';
  entityId: number;
  onEntityUpdated: () => void;   // Callback para refetch via TQ invalidation
  placeholder?: string;
  welcomeMessage?: { title: string; content: string };
  isGenerating?: boolean;
}
```

**Comportamiento:**
1. Mantiene historial de mensajes en estado local
2. Envia `{ message, history }` al endpoint de chat de la entidad
3. Recibe respuesta con `content` y `document_updated: boolean`
4. Si `document_updated: true` → llama `onEntityUpdated()` que invalida TQ cache
5. Agrega ambos mensajes (user + assistant) al historial local

**Endpoints de chat por entidad:**
- Documento: `POST /coordination-documents/:id/chat`
- Lesson plan: `POST /lesson-plans/:id/chat` (futuro)
- General: `POST /chat`

### 7.2 Generacion de contenido

**GenerateButton** (`src/components/ai/GenerateButton.tsx`):

```typescript
interface GenerateButtonProps {
  onClick: () => Promise<void>;
  label?: string;
  isGenerating: boolean;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm';
}
```

**Patron de auto-generacion** (usado en Document.tsx y TeacherLessonPlan.tsx):

```typescript
const autoGeneratedRef = useRef(false);
useEffect(() => {
  if (!entity || autoGeneratedRef.current || isGenerating) return;
  if (hasEmptyContent(entity)) {
    autoGeneratedRef.current = true;
    doGenerateAll();
  }
}, [entity?.id]);
```

El `useRef` evita re-generacion en re-renders. El `useEffect` dispara solo cuando cambia el entity id.

### 7.3 Estados de carga y error

| Estado | UI | Accion |
|--------|-----|--------|
| Generando | LoadingOrb + "Generando..." | Desactiva edicion |
| Chat pensando | Indicador loading en chat | Desactiva input |
| Error de IA | Toast "Error al generar. Intenta nuevamente." | Boton retry |
| Rate limited | Toast "Demasiadas solicitudes." | Cooldown visual |
| Timeout | Toast "La generacion tardo demasiado." | Boton retry |

---

## 8. Configuracion dinamica (Cosmos)

### 8.1 Carga de configuracion

1. **Al bootstrap** (`App.tsx`): `GET /org/config` → almacena en `configStore`
2. Fallback a `MOCK_ORG_CONFIG` si backend no disponible
3. Disponible globalmente via `useOrgConfig()` hook

### 8.2 Secciones dinamicas

El array `coord_doc_sections` en la config define las secciones del documento:

```
org_config.coord_doc_sections → DynamicSectionRenderer → SectionEditor (por type)
```

Cada seccion tiene: `key`, `label`, `type`, `options` (para select_text), `ai_prompt` (backend-only), `required`.

### 8.3 Feature flags

```typescript
// En componentes
const canShowResources = useFeatureFlag('contenido');

// En rutas
<Route path="/resources" element={
  <RequireModule module="contenido">
    <Resources />
  </RequireModule>
} />
```

### 8.4 Identidad visual

| Config | Uso en frontend |
|--------|----------------|
| `platform_name` | Titulo en Header, tab del browser |
| `logo_url` | Logo en Header y Login |
| `primary_color` | CSS custom property `--color-primary` |

---

## 9. Analisis de brechas (estado actual vs RFC backend)

### 9.1 Brechas pendientes

| ID | Area | Estado actual | Requisito RFC | Prioridad | Esfuerzo |
|---|------|--------------|--------------|-----------|----------|
| G-1 | Onboarding redirect | Login hace `navigate('/')` directo | Verificar `onboarding_completed_at`, redirect a `/onboarding` si null | Alta | Bajo |
| G-2 | Multi-rol sidebar | Sidebar muestra solo rol primario | Mostrar items de todos los roles del usuario | Media | Bajo |
| G-3 | Nomenclatura dinamica | `useNomenclature` existe sin consumidores | Sidebar, headers, titulos usan labels dinamicos de org config | Baja | Bajo |
| G-4 | Paginacion en listados | `usePaginatedList` hook existe | Aplicar en listados que hoy cargan solo primera pagina (20 items) | Media | Medio |
| G-5 | Rate limit diferenciado | Errores de IA tratados igual | Diferenciar `AI_RATE_LIMITED` con cooldown visual | Baja | Bajo |
| G-6 | Markdown editor | `type: 'markdown'` renderiza Textarea | Editor markdown real para secciones de documento | Baja | Medio |
| G-7 | Teaching mutations | No hay mutations TQ para lesson plans | Crear `useCreateLessonPlanMutation`, `useUpdateLessonPlanMutation` | Media | Bajo |
| G-8 | Sidebar links parciales | Algunos items apuntan a `/` | Verificar que todos los destinos existen y son correctos | Alta | Bajo |

### 9.2 Brechas cerradas (resueltas desde v0.1)

Estos items estaban en la tabla de brechas del RFC v0.1 y ya fueron implementados:

| Brecha original | Solucion implementada |
|---|---|
| Auth mock (click-to-login) | JWT con sessionStorage, auto-logout 401 |
| API client sin auth ni errors | api-client.ts con Bearer, APIError/AuthError, fetchPaginated |
| Tipos hardcoded (3 niveles fijos) | Topic recursivo, sections dinamicas, Moments JSONB |
| Store monolito 300 lineas | TanStack Query (server-state) + Zustand slices (client-state) |
| Sin lazy loading | React.lazy + Suspense en todas las paginas |
| Sin tests | 413 tests (Vitest + Testing Library) |
| Sin onboarding | Wizard 4 pasos con profile form dinamico |
| Sin dashboards | CoordinatorHome + TeacherHome con widgets completos |
| Sin ErrorBoundary | RouteBoundary por pagina + DataState component |
| Sin toast/error map | Sonner + error-messages.ts |
| Sin invalidacion de cache | TanStack Query mutations con invalidateQueries automatico |
| Token se pierde en F5 | sessionStorage + hydrate() al bootstrap |
| Sin paginas 404/403 | NotFound + Forbidden pages |
| Sin CoordinatorDocuments | Pagina dedicada con listado |

### 9.3 Lo que se reutiliza del POC original

| Modulo | Accion tomada |
|---|---|
| Componentes UI (button, card, input, dialog, etc.) | Mantenidos tal cual |
| Layout (Header, Sidebar, MainLayout) | Refactorizados para dinamismo |
| Estructura de paginas | Refactorizadas para TanStack Query |
| Patron CVA + Radix | Confirmado como estandar |
| Design tokens | Mantenidos, overrideables por Cosmos |

### 9.4 Lo que se descarto del POC original

| Modulo | Razon |
|---|---|
| Auth mock (click-to-login) | Reemplazado por JWT real |
| Store monolito (`useStore.ts`) | Server-state migrado a TanStack Query |
| `referenceStore.ts` | Eliminado — datos en useReferenceQueries |
| `resourceStore.ts` | Eliminado — datos en useResourceQueries |
| `invalidation.ts` | Eliminado — TQ maneja invalidacion |
| Tipos `ProblematicNucleus/KnowledgeArea/Category` | Reemplazados por Topic recursivo |
| `loadAllData()` global | Reemplazado por prefetch + queries per-component |

---

## 10. Plan de implementacion

### 10.1 Estado por fase

| Fase FE | Contenido | Estado | Epicas |
|---------|-----------|--------|--------|
| **1 — Fundaciones** | Auth JWT, cliente API, store slices, routing con guards, error handling, lazy loading, tests | **Completa** | 1 |
| **2 — Datos de referencia + Cosmos** | Queries de referencia, TopicTree, ScheduleGrid, config loading, feature flags, identidad visual | **Completa** | 3, 10 |
| **3 — Documento de coordinacion** | Wizard 3 pasos, DynamicSectionRenderer, editor, ClassPlanTable, publicacion, chat | **Completa** | 4 |
| **4 — Integracion IA** | ChatPanel reutilizable, GenerateButton, loading states, document_updated | **Completa** | 6 |
| **5 — Planificacion docente** | Lista clases, MomentEditor, ActivitySelector, FontSelector, generacion, publicacion | **Completa** | 5 |
| **6 — Recursos** | ResourceTypeSelector, DynamicContentRenderer, library, generacion, edicion | **Completa** | 8 |
| **7 — Dashboard + Onboarding** | Dashboard coordinador/docente, notificaciones, onboarding wizard, profile form, tour | **Completa** | 7, 2 |
| **8 — Polish** | Brechas G-1 a G-8, paginacion real, multi-rol sidebar, nomenclatura, markdown editor | **Pendiente** | Transversal |

### 10.2 Fase 8 — Polish (trabajo pendiente)

Tareas ordenadas por prioridad:

1. **G-8** — Verificar/arreglar destinos de sidebar links
2. **G-1** — Redirect a onboarding post-login
3. **G-7** — Teaching mutations en TanStack Query
4. **G-2** — Multi-rol en sidebar
5. **G-4** — Aplicar paginacion en listados
6. **G-3** — Consumir `useNomenclature` en sidebar/headers
7. **G-5** — Rate limit con cooldown visual
8. **G-6** — Markdown editor real

### 10.3 Criterios de aceptacion transversales

Aplican a **todas** las paginas y componentes:

- [x] Toda pagina tiene estados de loading, error y empty (DataState)
- [x] Todo formulario valida antes de enviar
- [x] Todo error de API muestra toast con mensaje de usuario (Sonner + error-messages)
- [x] Acceso por rol protegido en todas las rutas (ProtectedRoute)
- [x] Todas las paginas usan lazy loading (React.lazy)
- [x] Feature flags de Cosmos respetados en sidebar y rutas (RequireModule)
- [ ] Nomenclatura dinamica usada donde corresponda (useNomenclature — pendiente)
- [x] Identidad visual aplicada desde config (applyVisualIdentity)
- [x] Tests para: query hooks, stores, cliente API, flujos de usuario (413 tests)
- [x] Secciones dinamicas renderizan correctamente segun config (DynamicSectionRenderer)
- [x] Server-state en TanStack Query con invalidacion automatica

---

## Glosario

Extiende el [glosario del RFC backend](../rfc-alizia/rfc-alizia.md#glosario) con terminos frontend:

| Termino | Definicion |
|---------|-----------|
| TanStack Query | Libreria de server-state management. Reemplaza la carga manual de datos en stores. Provee cache, invalidacion, refetch, optimistic updates. |
| Query hook | Hook de React que encapsula una query de TanStack Query (ej: `useAreasQuery()`). |
| Mutation hook | Hook que encapsula una operacion de escritura con invalidacion automatica (ej: `useCreateDocumentMutation()`). |
| Zustand slice | Store de Zustand dedicado a un dominio de client-state (auth, config, UI). |
| Feature flag | Toggle booleano en `org.config.modules` que activa/desactiva modulos de la UI. |
| DynamicSectionRenderer | Componente que renderiza editores segun `coord_doc_sections` de la config. |
| DynamicContentRenderer | Componente que renderiza contenido de recursos segun `output_schema` del tipo. |
| ChatPanel | Componente reutilizable de chat con Alizia, usado en documentos, planes y recursos. |
| TopicTree | Componente de arbol recursivo para topics con niveles configurables por org. |
| ProtectedRoute | Wrapper de ruta que verifica autenticacion y roles. |
| RequireModule | Wrapper de ruta que verifica feature flags de Cosmos. |
| Config-driven | Patron donde la UI se renderiza dinamicamente segun la configuracion de la organizacion. |
| Optimistic update | Actualizar el cache de TQ inmediatamente antes de que el servidor confirme, para UX instantanea. |
| Prefetch | Cargar datos en cache de TQ anticipadamente (al bootstrap) para evitar waterfalls. |
| DataState | Componente composable que maneja los 3 estados: loading, error, empty. |
| RouteBoundary | Error boundary por ruta. Un crash en una pagina no afecta otras. |

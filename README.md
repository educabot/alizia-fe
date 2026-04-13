# Alizia Frontend

Frontend React para la plataforma educativa Alizia. Planificacion anual, coordinacion de areas, planificacion docente, generacion de recursos con IA.

## Features

- **Coordinacion**: Documentos de planificacion anual con secciones dinamicas y generacion IA
- **Planificacion docente**: Lesson plans con momentos didacticos (apertura, desarrollo, cierre) y actividades
- **Recursos**: Biblioteca de recursos generados por IA con editor markdown
- **Chat IA**: Asistente Alizia reutilizable con soporte para documentos y lesson plans
- **Multi-rol**: Vistas diferenciadas para admin, coordinador y docente
- **Configuracion dinamica**: Secciones, feature flags e identidad visual por organizacion

## Quick Start

```bash
npm install                          # Instalar dependencias
cp .env.example .env                 # Configurar variables (cuando exista backend)
npm run dev                          # Arranca Vite dev server
```

## Stack

| Componente | Tecnologia |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build | Vite 7 |
| Styles | Tailwind CSS 4 |
| Components | shadcn/ui (Radix) |
| Server State | TanStack Query 5 |
| Client State | Zustand 5 |
| Routing | React Router 7 |
| Icons | Lucide React |
| Linting | Biome 2.2 |
| Testing | Vitest 4 + Testing Library |

## Architecture

```
src/
  components/       <- Componentes reutilizables
    ai/             <- ChatPanel, GenerateButton, LoadingOrb
    coordination/   <- DynamicSectionRenderer, ClassPlanTable, PublishValidation
    dashboard/      <- Widgets de dashboards (coordinador + docente)
    teaching/       <- MomentEditor, ActivitySelector, ActivityContentEditor
    ui/             <- shadcn/ui primitives (Button, Dialog, Select, etc.)
  hooks/
    queries/        <- TanStack Query hooks por dominio
  lib/              <- Utilidades (api-client, toast, constants, error-messages)
  pages/            <- Paginas por rol (Admin, Coordinator, Teacher)
  services/         <- Capa API (endpoints agrupados por dominio)
  store/            <- Zustand slices (auth, config, ui)
  types/            <- Interfaces TypeScript alineadas con backend
  test/             <- Setup de testing (jsdom, polyfills)
```

Detalle completo en `docs/rfc-alizia-fe/`.

## Development

```bash
npm run dev           # Vite dev server con hot reload
npm run build         # TypeScript check + Vite build
npm run typecheck     # tsc --noEmit
npm run lint          # Biome lint con auto-fix
npm run format        # Biome format con auto-fix
npm run test          # Vitest (watch mode)
npm run test:run      # Vitest single run
npm run test:coverage # Vitest con coverage report
npm run preview       # Preview del build de produccion
```

## Testing

417 tests en 61 archivos. Cobertura en stores, hooks, componentes, servicios y paginas.

```bash
npm run test:run
```

Patron de testing:
- **Stores**: Test directo de state con `getState()` + mocks de API
- **Hooks**: `renderHook()` con providers (Router, QueryClient)
- **Componentes**: `render()` + `userEvent` + assertions de DOM
- **Servicios**: Mock de fetch, validacion de headers y error parsing

## Pages

| Ruta | Pagina | Rol |
|---|---|---|
| `/login` | Login | Publico |
| `/onboarding` | Onboarding wizard | Todos |
| `/` | CoordinatorHome | Coordinador |
| `/documents` | CoordinatorDocuments | Coordinador |
| `/document/:id` | Document editor | Coordinador |
| `/course/:id` | Course detail | Coordinador |
| `/teacher` | TeacherHome | Docente |
| `/teacher/courses/:id` | TeacherCourseSubject | Docente |
| `/teacher/lesson-plans/:id` | TeacherLessonPlan | Docente |
| `/teacher/plan-wizard` | TeacherPlanWizard | Docente |
| `/resources/new` | ResourceCreate | Todos |
| `/resources/:id/edit` | ResourceEditor | Todos |
| `/admin` | AdminHome | Admin |
| `/admin/areas` | AdminAreas | Admin |

## Environment Variables

**Requeridas (cuando conecte al backend):**
- `VITE_API_BASE_URL` - URL base del backend API

**Opcionales:**
- `VITE_APP_ENV` - Entorno: local, staging, production

## Deploy

Push a main -> CI (typecheck + lint + test) -> Deploy automatico.

## License

Private.

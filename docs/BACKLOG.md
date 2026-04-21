# Backlog — Mejoras pendientes

Gaps identificados en la auditoria frontend vs backend (2026-04-20).
No bloquean la epica 3; son mejoras para epicas futuras.

## Fonts: pasar area_id a useFontsQuery

- **Archivos**: `src/pages/TeacherPlanWizard.tsx`, `src/pages/ResourceCreate.tsx`
- **Estado**: Hook listo (`useFontsQuery(areaId?)`) pero los callers no pasan el `areaId` todavia.
- **Requiere**: Obtener `area_id` del contexto de course-subject o recurso en cada pagina.
- **Epica**: 5 (Teaching / Resources)

## Student CRUD: update y delete

- **Estado**: Backend solo tiene `POST /courses/:id/students` (create). No existe update ni delete.
- **Requiere**: Endpoints en backend primero, luego UI en frontend.
- **Epica**: futura (gestion de alumnos)

## TimeSlot CRUD: update y delete

- **Estado**: Backend solo tiene `POST /courses/:id/time-slots` (create). No existe update ni delete.
- **Requiere**: Endpoints en backend primero, luego UI en frontend.
- **Epica**: futura (gestion de horarios)

## Login: soporte multi-org con org_slug

- **Archivo**: `src/types/index.ts` (`LoginRequest`)
- **Estado**: Backend acepta `org_slug` opcional en `POST /auth/login`. Frontend no lo envia.
- **Requiere**: UI para seleccionar organizacion o resolver slug desde subdominio/URL.
- **Epica**: futura (multi-tenancy)

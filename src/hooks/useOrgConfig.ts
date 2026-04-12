import { useConfigStore } from '@/store/configStore';
import type { OrgConfig } from '@/types';

const DEFAULT_NOMENCLATURE: Record<string, string> = {
  coordination_document: 'Documento de coordinacion',
  coordination_document_plural: 'Documentos de coordinacion',
  lesson_plan: 'Plan de clase',
  lesson_plan_plural: 'Planes de clase',
  area: 'Area',
  area_plural: 'Areas',
  subject: 'Disciplina',
  subject_plural: 'Disciplinas',
  course: 'Curso',
  course_plural: 'Cursos',
  font: 'Fuente',
  font_plural: 'Fuentes',
  resource: 'Recurso',
  resource_plural: 'Recursos',
};

/** Access the full org config */
export function useOrgConfig(): OrgConfig {
  return useConfigStore((s) => s.orgConfig);
}

/** Check if a module is enabled via feature flags. Defaults to true if not set. */
export function useFeatureFlag(module: string): boolean {
  const modules = useConfigStore((s) => s.orgConfig.modules);
  return modules[module] ?? true;
}

/** Get a display name from org nomenclature, with sensible defaults */
export function useNomenclature(key: string): string {
  const config = useConfigStore((s) => s.orgConfig);
  const nomenclature = (config as OrgConfig & { nomenclature?: Record<string, string> }).nomenclature;
  return nomenclature?.[key] ?? DEFAULT_NOMENCLATURE[key] ?? key;
}

/** Get the display name for a topic level (1-indexed) */
export function useLevelName(level: number): string {
  const levelNames = useConfigStore((s) => s.orgConfig.topic_level_names);
  return levelNames[level - 1] ?? `Nivel ${level}`;
}

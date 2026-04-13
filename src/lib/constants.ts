import type { MomentKey } from '@/types';

/** Ordered list of lesson plan moment keys. */
export const MOMENT_KEYS: readonly MomentKey[] = ['apertura', 'desarrollo', 'cierre'] as const;

/** Display labels for each moment (used in selectors, headers, and cards). */
export const MOMENT_LABELS: Record<MomentKey, string> = {
  apertura: 'Apertura',
  desarrollo: 'Desarrollo',
  cierre: 'Cierre',
};

/** Extended labels for moment sections in lesson plan view. */
export const MOMENT_SECTION_LABELS: Record<MomentKey, string> = {
  apertura: 'Actividad de Apertura',
  desarrollo: 'Actividad de Desarrollo',
  cierre: 'Actividad de Cierre',
};

/** Empty moments structure — useful as default value. */
export const EMPTY_MOMENTS: Record<MomentKey, number[]> = {
  apertura: [],
  desarrollo: [],
  cierre: [],
};

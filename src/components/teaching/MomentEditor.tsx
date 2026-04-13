import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { ActivitySelector } from './ActivitySelector';
import type { Activity, MomentKey } from '@/types';

interface MomentEditorProps {
  momentKey: MomentKey;
  label: string;
  selectedActivityIds: number[];
  availableActivities: Activity[];
  onActivitiesChange: (activityIds: number[]) => void;
  maxActivities?: number;
}

export function MomentEditor({
  momentKey,
  label,
  selectedActivityIds,
  availableActivities,
  onActivitiesChange,
  maxActivities,
}: MomentEditorProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);

  const activitiesMap = useMemo(() => {
    const map = new Map<number, Activity>();
    for (const a of availableActivities) {
      map.set(a.id, a);
    }
    return map;
  }, [availableActivities]);

  const removeActivity = (id: number) => {
    onActivitiesChange(selectedActivityIds.filter((x) => x !== id));
  };

  return (
    <div className='activity-card-bg rounded-2xl p-4'>
      <div className='flex items-center justify-between mb-2'>
        <h4 className='body-1-medium text-secondary-foreground'>{label}</h4>
        {maxActivities && (
          <span className='text-xs text-gray-500'>
            {selectedActivityIds.length}/{maxActivities}
          </span>
        )}
      </div>

      {/* Selected activity chips */}
      <div className='flex flex-wrap gap-2 mb-3'>
        {selectedActivityIds.map((activityId) => {
          const activity = activitiesMap.get(activityId);
          if (!activity) return null;
          return (
            <div
              key={activityId}
              className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3FF] border border-[#DAD5F6]'
            >
              <span className='text-sm text-secondary-foreground'>{activity.name}</span>
              <button
                type='button'
                onClick={() => removeActivity(activityId)}
                className='text-gray-400 hover:text-red-500 transition-colors cursor-pointer'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        type='button'
        onClick={() => setSelectorOpen(true)}
        className='inline-flex items-center gap-1 text-sm text-[#324155] hover:text-[#324155]/80 transition-colors cursor-pointer'
      >
        <Plus className='w-4 h-4' />
        Agregar actividad
      </button>

      <ActivitySelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        momentKey={momentKey}
        activities={availableActivities}
        selected={selectedActivityIds}
        onConfirm={onActivitiesChange}
        maxActivities={maxActivities}
      />
    </div>
  );
}

/** Validates moment constraints per RFC:
 * - apertura: exactly 1 activity
 * - desarrollo: 1 to maxDesarrolloActivities
 * - cierre: exactly 1 activity
 */
export function validateMoments(
  moments: { apertura: number[]; desarrollo: number[]; cierre: number[] },
  maxDesarrolloActivities = 3,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (moments.apertura.length !== 1) {
    errors.push('Apertura debe tener exactamente 1 actividad');
  }
  if (moments.desarrollo.length < 1) {
    errors.push('Desarrollo debe tener al menos 1 actividad');
  }
  if (moments.desarrollo.length > maxDesarrolloActivities) {
    errors.push(`Desarrollo puede tener maximo ${maxDesarrolloActivities} actividades`);
  }
  if (moments.cierre.length !== 1) {
    errors.push('Cierre debe tener exactamente 1 actividad');
  }

  return { valid: errors.length === 0, errors };
}

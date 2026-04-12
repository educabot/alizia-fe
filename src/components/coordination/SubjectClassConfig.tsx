import { useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { Subject, Topic } from '@/types';

export interface SubjectConfigData {
  class_count: number;
  topic_ids: number[];
}

export type SubjectConfigMap = Record<number, SubjectConfigData>;

interface SubjectClassConfigProps {
  /** Subjects of the selected area */
  subjects: Subject[];
  /** Current config per subject, keyed by subject_id */
  value: SubjectConfigMap;
  /** Called when the config changes */
  onChange: (next: SubjectConfigMap) => void;
  /**
   * IDs of topics previously selected at document level.
   * Only these can be assigned to subjects.
   */
  availableTopicIds: number[];
  /** All topics (flattened or tree) for name lookups */
  topics: Topic[];
  /** Which view to render: class_count editor or topic assignment */
  mode: 'class_count' | 'topics';
  /** Read-only rendering */
  readOnly?: boolean;
}

/**
 * Configures class_count and topic assignments for each subject of an area.
 * RFC Epic 4 — Document creation wizard steps 2 and 3.
 */
export function SubjectClassConfig({
  subjects,
  value,
  onChange,
  availableTopicIds,
  topics,
  mode,
  readOnly = false,
}: SubjectClassConfigProps) {
  // Flatten topic tree to a name lookup map
  const topicNameById = useMemo(() => {
    const names = new Map<number, string>();
    const walk = (nodes: Topic[]) => {
      for (const t of nodes) {
        names.set(t.id, t.name);
        if (t.children?.length) walk(t.children);
      }
    };
    walk(topics);
    return names;
  }, [topics]);

  const updateClassCount = (subjectId: number, delta: number) => {
    if (readOnly) return;
    const current = value[subjectId]?.class_count ?? 0;
    onChange({
      ...value,
      [subjectId]: {
        class_count: Math.max(0, current + delta),
        topic_ids: value[subjectId]?.topic_ids ?? [],
      },
    });
  };

  const toggleTopic = (subjectId: number, topicId: number) => {
    if (readOnly) return;
    const current = value[subjectId]?.topic_ids ?? [];
    const next = current.includes(topicId) ? current.filter((id) => id !== topicId) : [...current, topicId];
    onChange({
      ...value,
      [subjectId]: {
        class_count: value[subjectId]?.class_count ?? 0,
        topic_ids: next,
      },
    });
  };

  if (subjects.length === 0) {
    return (
      <p className='text-sm text-muted-foreground text-center py-4'>No hay disciplinas en el area seleccionada.</p>
    );
  }

  if (mode === 'class_count') {
    return (
      <div className='space-y-3'>
        {subjects.map((subject) => {
          const count = value[subject.id]?.class_count ?? 0;
          return (
            <div key={subject.id} className='flex items-center justify-between bg-[#FFFFFF4D] rounded-lg p-4'>
              <Label className='text-secondary-foreground body-2-medium'>{subject.name}</Label>
              <div className='flex items-center gap-4'>
                <button
                  type='button'
                  onClick={() => updateClassCount(subject.id, -1)}
                  disabled={count === 0 || readOnly}
                  aria-label={`Restar clase a ${subject.name}`}
                  className={`w-8 h-8 flex items-center justify-center transition-colors rounded-lg ${
                    count > 0 && !readOnly
                      ? 'bg-white/60 border-gray-100 border-2 cursor-pointer hover:bg-white/80'
                      : 'border-2 border-[#E4E8EF] cursor-not-allowed opacity-50'
                  }`}
                >
                  <Minus className='w-5 h-5' />
                </button>
                <span className='w-8 text-center text-[#2C2C2C] font-medium' data-testid={`class-count-${subject.id}`}>
                  {count}
                </span>
                <button
                  type='button'
                  onClick={() => updateClassCount(subject.id, 1)}
                  disabled={readOnly}
                  aria-label={`Sumar clase a ${subject.name}`}
                  className={`w-8 h-8 flex rounded-lg items-center justify-center transition-colors ${
                    readOnly
                      ? 'border-2 border-[#E4E8EF] cursor-not-allowed opacity-50'
                      : 'bg-white/60 border-gray-100 border-2 cursor-pointer hover:bg-white/80'
                  }`}
                >
                  <Plus className='w-5 h-5' />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // mode === 'topics'
  return (
    <div className='space-y-6'>
      {subjects.map((subject) => {
        const assignedTopics = value[subject.id]?.topic_ids ?? [];
        return (
          <div key={subject.id} className='space-y-3 activity-card-bg rounded-2xl p-4'>
            <h3 className='body-1-medium text-secondary-foreground'>{subject.name}</h3>
            {availableTopicIds.length === 0 ? (
              <p className='text-xs text-muted-foreground'>
                Selecciona temas en el paso anterior para poder asignarlos.
              </p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {availableTopicIds.map((topicId) => {
                  const isAssigned = assignedTopics.includes(topicId);
                  const name = topicNameById.get(topicId) ?? `Topic ${topicId}`;
                  return (
                    <button
                      key={topicId}
                      type='button'
                      disabled={readOnly}
                      onClick={() => toggleTopic(subject.id, topicId)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${
                        isAssigned ? 'bg-[#735FE3] text-white hover:bg-[#735FE3]/90' : 'fill-primary text-[#47566C]'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Returns true when every subject has at least one topic assigned.
 * Use this as the guard for advancing out of step 3.
 */
export function allSubjectsHaveTopics(subjects: Subject[], value: SubjectConfigMap): boolean {
  if (subjects.length === 0) return false;
  return subjects.every((s) => (value[s.id]?.topic_ids.length ?? 0) > 0);
}

/**
 * Builds the initial config map for an area's subjects with class_count = 1.
 */
export function buildInitialSubjectConfig(subjects: Subject[]): SubjectConfigMap {
  const initial: SubjectConfigMap = {};
  for (const s of subjects) {
    initial[s.id] = { class_count: 1, topic_ids: [] };
  }
  return initial;
}

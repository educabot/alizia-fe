import { useMemo } from 'react';
import { TopicTree } from '@/components/ui/TopicTree';
import { useOrgConfig } from '@/hooks/useOrgConfig';
import type { Topic } from '@/types';

interface TopicSelectorProps {
  /** Full topic tree from GET /topics (via reference store) */
  topics: Topic[];
  /** Currently selected topic IDs */
  selected: number[];
  /** Callback when selection changes */
  onSelect: (topicIds: number[]) => void;
  /** Optional label shown above the tree */
  label?: string;
  /** Optional helper text shown below the label */
  helpText?: string;
  /** Make the selector read-only */
  readOnly?: boolean;
}

/**
 * High-level topic selector that pulls level configuration from org config.
 * Wraps the generic TopicTree primitive with labels, counter, and empty state.
 * RFC Epic 4 — used in the document creation Wizard, step 1.
 */
export function TopicSelector({
  topics,
  selected,
  onSelect,
  label = 'Temas',
  helpText,
  readOnly = false,
}: TopicSelectorProps) {
  const orgConfig = useOrgConfig();

  const selectionLevelName = useMemo(() => {
    const index = orgConfig.topic_selection_level - 1;
    return orgConfig.topic_level_names[index] ?? 'tema';
  }, [orgConfig.topic_selection_level, orgConfig.topic_level_names]);

  const hasTopics = topics.length > 0;

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium text-[#10182B]'>{label}</label>
        {selected.length > 0 && (
          <span
            className='text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full'
            data-testid='topic-selector-counter'
          >
            {selected.length} seleccionados
          </span>
        )}
      </div>

      {helpText && <p className='text-xs text-muted-foreground'>{helpText}</p>}

      {!hasTopics ? (
        <div className='activity-card-bg rounded-2xl p-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            No hay {selectionLevelName.toLowerCase()}s disponibles para seleccionar.
          </p>
        </div>
      ) : (
        <div className='activity-card-bg p-4 rounded-2xl'>
          <TopicTree
            topics={topics}
            maxLevels={orgConfig.topic_max_levels}
            levelNames={orgConfig.topic_level_names}
            selectionLevel={orgConfig.topic_selection_level}
            selected={selected}
            onSelect={onSelect}
            readOnly={readOnly}
          />
        </div>
      )}
    </div>
  );
}

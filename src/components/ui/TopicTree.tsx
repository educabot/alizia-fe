import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types';

interface TopicTreeProps {
  /** Full topic tree from GET /topics */
  topics: Topic[];
  /** Max depth to render (from org config topic_max_levels) */
  maxLevels: number;
  /** Display names per level (from org config topic_level_names) */
  levelNames: string[];
  /** Level at which topics become selectable (from org config topic_selection_level) */
  selectionLevel: number;
  /** Currently selected topic IDs */
  selected: number[];
  /** Callback when selection changes */
  onSelect: (topicIds: number[]) => void;
  /** Optional: make entire tree read-only */
  readOnly?: boolean;
}

interface TopicNodeProps {
  topic: Topic;
  level: number;
  maxLevels: number;
  selectionLevel: number;
  selected: Set<number>;
  onToggle: (id: number) => void;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  readOnly: boolean;
}

function TopicNode({
  topic,
  level,
  maxLevels,
  selectionLevel,
  selected,
  onToggle,
  expandedIds,
  onToggleExpand,
  readOnly,
}: TopicNodeProps) {
  if (level > maxLevels) return null;

  const hasChildren = topic.children && topic.children.length > 0;
  const isExpanded = expandedIds.has(topic.id);
  const isSelectable = level === selectionLevel;
  const isSelected = selected.has(topic.id);

  return (
    <div className='select-none'>
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-2 rounded-md transition-colors',
          isSelectable && !readOnly && 'cursor-pointer hover:bg-primary/5',
          isSelected && 'bg-primary/10',
        )}
        onClick={() => {
          if (isSelectable && !readOnly) {
            onToggle(topic.id);
          } else if (hasChildren) {
            onToggleExpand(topic.id);
          }
        }}
      >
        {/* Expand/collapse chevron for non-leaf or non-selection-level nodes */}
        {hasChildren && level < maxLevels ? (
          <button
            type='button'
            className='p-0.5 rounded hover:bg-gray-200 transition-colors'
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(topic.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className='w-4 h-4 text-gray-500' />
            ) : (
              <ChevronRight className='w-4 h-4 text-gray-500' />
            )}
          </button>
        ) : (
          <span className='w-5' />
        )}

        {/* Selection checkbox at selectionLevel */}
        {isSelectable && (
          <div
            className={cn(
              'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
              isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300',
            )}
          >
            {isSelected && <Check className='w-3 h-3' />}
          </div>
        )}

        <span
          className={cn(
            'text-sm',
            level === 1 && 'font-semibold text-gray-900',
            level === 2 && 'font-medium text-gray-700',
            level >= 3 && 'text-gray-600',
          )}
        >
          {topic.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className='ml-4 border-l border-gray-200 pl-1'>
          {topic.children.map((child) => (
            <TopicNode
              key={child.id}
              topic={child}
              level={level + 1}
              maxLevels={maxLevels}
              selectionLevel={selectionLevel}
              selected={selected}
              onToggle={onToggle}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TopicTree({
  topics,
  maxLevels,
  levelNames,
  selectionLevel,
  selected,
  onSelect,
  readOnly = false,
}: TopicTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    // Auto-expand first level
    return new Set(topics.map((t) => t.id));
  });

  const selectedSet = new Set(selected);

  const handleToggle = useCallback(
    (id: number) => {
      const next = new Set(selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelect(Array.from(next));
    },
    [selected, onSelect],
  );

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (topics.length === 0) {
    return <div className='text-sm text-gray-500 py-4 text-center'>No hay temas disponibles</div>;
  }

  return (
    <div>
      {/* Level legend */}
      <div className='flex items-center gap-3 mb-2 text-xs text-gray-500'>
        {levelNames.slice(0, maxLevels).map((name, i) => (
          <span key={name} className='flex items-center gap-1'>
            <span className='w-2 h-2 rounded-full bg-gray-300' />
            {name}
            {i + 1 === selectionLevel && <span className='text-primary font-medium'>(seleccionable)</span>}
          </span>
        ))}
      </div>

      {/* Tree */}
      <div className='space-y-0.5'>
        {topics.map((topic) => (
          <TopicNode
            key={topic.id}
            topic={topic}
            level={1}
            maxLevels={maxLevels}
            selectionLevel={selectionLevel}
            selected={selectedSet}
            onToggle={handleToggle}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

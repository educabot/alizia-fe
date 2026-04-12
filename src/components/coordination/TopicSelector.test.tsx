import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfigStore } from '@/store/configStore';
import { TopicSelector } from './TopicSelector';
import type { Topic, OrgConfig } from '@/types';

// TopicTree is tested in isolation elsewhere; mock it to a thin stub so we
// can focus on the TopicSelector's own behavior (label, counter, empty state).
vi.mock('@/components/ui/TopicTree', () => ({
  TopicTree: ({ topics, selected }: { topics: Topic[]; selected: number[] }) => (
    <div data-testid='topic-tree'>
      <span data-testid='topic-tree-count'>{topics.length}</span>
      <span data-testid='topic-tree-selected'>{selected.join(',')}</span>
    </div>
  ),
}));

const mockTopics: Topic[] = [
  {
    id: 1,
    name: 'Algebra',
    level: 1,
    parent_id: null,
    children: [
      {
        id: 2,
        name: 'Ecuaciones',
        level: 2,
        parent_id: 1,
        children: [],
      },
    ],
  },
];

const baseConfig: OrgConfig = {
  topic_max_levels: 3,
  topic_level_names: ['Nucleo', 'Area', 'Tema'],
  topic_selection_level: 3,
  shared_classes_enabled: false,
  desarrollo_max_activities: 3,
  coord_doc_sections: [],
  modules: {},
};

describe('TopicSelector', () => {
  beforeEach(() => {
    useConfigStore.setState({ orgConfig: baseConfig, isLoaded: true });
  });

  it('shows the default label', () => {
    render(<TopicSelector topics={mockTopics} selected={[]} onSelect={() => {}} />);
    expect(screen.getByText('Temas')).toBeInTheDocument();
  });

  it('shows a custom label', () => {
    render(<TopicSelector topics={mockTopics} selected={[]} onSelect={() => {}} label='Nucleos problematicos' />);
    expect(screen.getByText('Nucleos problematicos')).toBeInTheDocument();
  });

  it('shows the selected counter when selections exist', () => {
    render(<TopicSelector topics={mockTopics} selected={[1, 2]} onSelect={() => {}} />);
    expect(screen.getByTestId('topic-selector-counter')).toHaveTextContent('2 seleccionados');
  });

  it('hides the counter when there are no selections', () => {
    render(<TopicSelector topics={mockTopics} selected={[]} onSelect={() => {}} />);
    expect(screen.queryByTestId('topic-selector-counter')).toBeNull();
  });

  it('renders the empty state when there are no topics', () => {
    render(<TopicSelector topics={[]} selected={[]} onSelect={() => {}} />);
    expect(screen.getByText(/No hay tema/i)).toBeInTheDocument();
    expect(screen.queryByTestId('topic-tree')).toBeNull();
  });

  it('passes topics and selected ids to the underlying TopicTree', () => {
    render(<TopicSelector topics={mockTopics} selected={[2]} onSelect={() => {}} />);
    expect(screen.getByTestId('topic-tree-count')).toHaveTextContent('1');
    expect(screen.getByTestId('topic-tree-selected')).toHaveTextContent('2');
  });

  it('renders the help text when provided', () => {
    render(<TopicSelector topics={mockTopics} selected={[]} onSelect={() => {}} helpText='Elegi al menos uno' />);
    expect(screen.getByText('Elegi al menos uno')).toBeInTheDocument();
  });
});

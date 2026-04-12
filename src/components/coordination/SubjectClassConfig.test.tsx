import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SubjectClassConfig,
  allSubjectsHaveTopics,
  buildInitialSubjectConfig,
  type SubjectConfigMap,
} from './SubjectClassConfig';
import type { Subject, Topic } from '@/types';

const subjects: Subject[] = [
  { id: 1, name: 'Algebra', area_id: 10, created_at: '2026-01-01' },
  { id: 2, name: 'Geometria', area_id: 10, created_at: '2026-01-01' },
];

const topics: Topic[] = [
  { id: 100, name: 'Ecuaciones', level: 1, parent_id: null, children: [] },
  { id: 101, name: 'Triangulos', level: 1, parent_id: null, children: [] },
];

describe('SubjectClassConfig — class_count mode', () => {
  it('renders a row per subject with current class count', () => {
    const value: SubjectConfigMap = {
      1: { class_count: 3, topic_ids: [] },
      2: { class_count: 5, topic_ids: [] },
    };
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={value}
        onChange={() => {}}
        availableTopicIds={[]}
        topics={topics}
        mode='class_count'
      />,
    );
    expect(screen.getByTestId('class-count-1')).toHaveTextContent('3');
    expect(screen.getByTestId('class-count-2')).toHaveTextContent('5');
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Geometria')).toBeInTheDocument();
  });

  it('increments class_count when plus is clicked', () => {
    const onChange = vi.fn();
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{ 1: { class_count: 2, topic_ids: [] }, 2: { class_count: 0, topic_ids: [] } }}
        onChange={onChange}
        availableTopicIds={[]}
        topics={topics}
        mode='class_count'
      />,
    );
    fireEvent.click(screen.getByLabelText('Sumar clase a Algebra'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ 1: { class_count: 3, topic_ids: [] } }));
  });

  it('decrements class_count but not below 0', () => {
    const onChange = vi.fn();
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{ 1: { class_count: 1, topic_ids: [] }, 2: { class_count: 0, topic_ids: [] } }}
        onChange={onChange}
        availableTopicIds={[]}
        topics={topics}
        mode='class_count'
      />,
    );
    fireEvent.click(screen.getByLabelText('Restar clase a Algebra'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ 1: { class_count: 0, topic_ids: [] } }));
  });

  it('minus button is disabled when count is 0', () => {
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{ 1: { class_count: 0, topic_ids: [] }, 2: { class_count: 0, topic_ids: [] } }}
        onChange={() => {}}
        availableTopicIds={[]}
        topics={topics}
        mode='class_count'
      />,
    );
    expect(screen.getByLabelText('Restar clase a Algebra')).toBeDisabled();
  });
});

describe('SubjectClassConfig — topics mode', () => {
  it('renders available topic buttons per subject', () => {
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{
          1: { class_count: 1, topic_ids: [] },
          2: { class_count: 1, topic_ids: [] },
        }}
        onChange={() => {}}
        availableTopicIds={[100, 101]}
        topics={topics}
        mode='topics'
      />,
    );
    // Each subject renders both topic buttons -> 4 total
    expect(screen.getAllByText('Ecuaciones')).toHaveLength(2);
    expect(screen.getAllByText('Triangulos')).toHaveLength(2);
  });

  it('toggles a topic assignment when clicked', () => {
    const onChange = vi.fn();
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{
          1: { class_count: 1, topic_ids: [] },
          2: { class_count: 1, topic_ids: [] },
        }}
        onChange={onChange}
        availableTopicIds={[100]}
        topics={topics}
        mode='topics'
      />,
    );
    // First Ecuaciones button corresponds to Algebra (subject 1)
    fireEvent.click(screen.getAllByText('Ecuaciones')[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        1: { class_count: 1, topic_ids: [100] },
      }),
    );
  });

  it('unassigns a topic on second click', () => {
    const onChange = vi.fn();
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{
          1: { class_count: 1, topic_ids: [100] },
          2: { class_count: 1, topic_ids: [] },
        }}
        onChange={onChange}
        availableTopicIds={[100]}
        topics={topics}
        mode='topics'
      />,
    );
    fireEvent.click(screen.getAllByText('Ecuaciones')[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        1: { class_count: 1, topic_ids: [] },
      }),
    );
  });

  it('shows helper text when no topics were selected upstream', () => {
    render(
      <SubjectClassConfig
        subjects={subjects}
        value={{}}
        onChange={() => {}}
        availableTopicIds={[]}
        topics={topics}
        mode='topics'
      />,
    );
    expect(screen.getAllByText(/paso anterior/i)).toHaveLength(2);
  });
});

describe('allSubjectsHaveTopics helper', () => {
  it('returns true when every subject has at least one topic', () => {
    expect(
      allSubjectsHaveTopics(subjects, {
        1: { class_count: 1, topic_ids: [100] },
        2: { class_count: 1, topic_ids: [101] },
      }),
    ).toBe(true);
  });

  it('returns false when any subject has no topics', () => {
    expect(
      allSubjectsHaveTopics(subjects, {
        1: { class_count: 1, topic_ids: [100] },
        2: { class_count: 1, topic_ids: [] },
      }),
    ).toBe(false);
  });

  it('returns false for empty subjects list', () => {
    expect(allSubjectsHaveTopics([], {})).toBe(false);
  });
});

describe('buildInitialSubjectConfig helper', () => {
  it('initializes every subject with class_count=1 and no topics', () => {
    const result = buildInitialSubjectConfig(subjects);
    expect(result).toEqual({
      1: { class_count: 1, topic_ids: [] },
      2: { class_count: 1, topic_ids: [] },
    });
  });
});

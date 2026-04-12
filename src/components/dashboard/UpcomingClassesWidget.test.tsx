import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpcomingClassesWidget, type UpcomingClassItem } from './UpcomingClassesWidget';

const items: UpcomingClassItem[] = [
  { id: 1, subjectName: 'Matematicas', courseName: '6to A', date: 'Lun 13/04 08:00', classNumber: 3 },
  { id: 2, subjectName: 'Lengua', courseName: '6to A', date: 'Mar 14/04 09:00' },
  { id: 3, subjectName: 'Ciencias', courseName: '6to B', date: 'Mar 14/04 10:00' },
];

describe('UpcomingClassesWidget', () => {
  it('renders the section title', () => {
    render(<UpcomingClassesWidget items={items} />);
    expect(screen.getByRole('region', { name: 'Proximas clases' })).toBeInTheDocument();
    expect(screen.getByText('Proximas clases')).toBeInTheDocument();
  });

  it('renders each item with subject, course and date', () => {
    render(<UpcomingClassesWidget items={items} />);
    expect(screen.getByText('Matematicas')).toBeInTheDocument();
    expect(screen.getByText('Lun 13/04 08:00')).toBeInTheDocument();
    expect(screen.getAllByText('6to A').length).toBe(2);
  });

  it('renders class number when provided', () => {
    render(<UpcomingClassesWidget items={items} />);
    expect(screen.getByText('Clase 3')).toBeInTheDocument();
  });

  it('respects maxItems', () => {
    render(<UpcomingClassesWidget items={items} maxItems={2} />);
    expect(screen.getByText('Matematicas')).toBeInTheDocument();
    expect(screen.getByText('Lengua')).toBeInTheDocument();
    expect(screen.queryByText('Ciencias')).not.toBeInTheDocument();
  });

  it('shows empty message when no items', () => {
    render(<UpcomingClassesWidget items={[]} emptyMessage='Sin clases' />);
    expect(screen.getByText('Sin clases')).toBeInTheDocument();
  });

  it('calls onItemClick with the item when a row is clicked', () => {
    const onItemClick = vi.fn();
    render(<UpcomingClassesWidget items={items} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Matematicas').closest('button') as HTMLButtonElement);
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });

  it('renders non-interactive rows when onItemClick is omitted', () => {
    render(<UpcomingClassesWidget items={items} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

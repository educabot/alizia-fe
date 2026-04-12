import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceTypeSelector } from './ResourceTypeSelector';
import type { ResourceType } from '@/types';

const TYPES: ResourceType[] = [
  {
    id: 1,
    key: 'lecture_guide',
    name: 'Guia de lectura',
    description: 'Guia para lectura',
    requires_font: true,
    prompt: '',
    output_schema: {},
    is_custom: false,
  },
  {
    id: 2,
    key: 'course_sheet',
    name: 'Ficha de catedra',
    description: 'Material sintetico',
    requires_font: false,
    prompt: '',
    output_schema: {},
    is_custom: false,
  },
];

describe('ResourceTypeSelector', () => {
  it('renders all resource types', () => {
    render(<ResourceTypeSelector resourceTypes={TYPES} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByText('Guia de lectura')).toBeInTheDocument();
    expect(screen.getByText('Ficha de catedra')).toBeInTheDocument();
    expect(screen.getByText('Guia para lectura')).toBeInTheDocument();
    expect(screen.getByText('Material sintetico')).toBeInTheDocument();
  });

  it('shows "Requiere fuente" badge for types that need it', () => {
    render(<ResourceTypeSelector resourceTypes={TYPES} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByText('Requiere fuente')).toBeInTheDocument();
  });

  it('calls onSelect when clicking a type', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ResourceTypeSelector resourceTypes={TYPES} selected={null} onSelect={onSelect} />);

    await user.click(screen.getByText('Ficha de catedra'));
    expect(onSelect).toHaveBeenCalledWith(TYPES[1]);
  });

  it('highlights selected type', () => {
    const { container } = render(<ResourceTypeSelector resourceTypes={TYPES} selected={TYPES[0]} onSelect={vi.fn()} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons[0].className).toContain('border-primary bg-primary/5');
    expect(buttons[1].className).not.toContain('bg-primary/5');
  });

  it('shows empty message when no types', () => {
    render(<ResourceTypeSelector resourceTypes={[]} selected={null} onSelect={vi.fn()} />);

    expect(screen.getByText('No hay tipos de recurso disponibles')).toBeInTheDocument();
  });
});

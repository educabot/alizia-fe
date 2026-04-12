import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicContentRenderer } from './DynamicContentRenderer';

const SCHEMA = {
  title: { type: 'string' as const, label: 'Titulo' },
  introduction: { type: 'string' as const, label: 'Introduccion' },
  sections: {
    type: 'array' as const,
    label: 'Secciones',
    items: {
      heading: { type: 'string' as const, label: 'Subtitulo' },
      content: { type: 'string' as const, label: 'Contenido' },
    },
  },
};

const CONTENT = {
  title: 'Mi titulo',
  introduction: 'Intro del recurso',
  sections: [{ heading: 'Seccion 1', content: 'Contenido 1' }],
};

describe('DynamicContentRenderer', () => {
  it('renders string fields with labels', () => {
    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={vi.fn()} />);

    expect(screen.getByText('Titulo')).toBeInTheDocument();
    expect(screen.getByText('Introduccion')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mi titulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Intro del recurso')).toBeInTheDocument();
  });

  it('renders array items with labels', () => {
    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={vi.fn()} />);

    expect(screen.getByText('Secciones')).toBeInTheDocument();
    expect(screen.getByText('Secciones #1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Seccion 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Contenido 1')).toBeInTheDocument();
  });

  it('calls onChange when string field is edited', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={onChange} />);

    const titleInput = screen.getByDisplayValue('Mi titulo');
    await user.type(titleInput, '!');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.title).toBe('Mi titulo!');
  });

  it('adds new array item when clicking Agregar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={onChange} />);

    const addBtn = screen.getByText('Agregar');
    await user.click(addBtn);

    expect(onChange).toHaveBeenCalledWith({
      ...CONTENT,
      sections: [...CONTENT.sections, { heading: '', content: '' }],
    });
  });

  it('removes array item when clicking trash', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={onChange} />);

    // Find the trash button (svg.lucide-trash-2)
    const trashButtons = screen.getAllByRole('button').filter((btn) => btn.querySelector('svg.lucide-trash-2'));
    await user.click(trashButtons[0]);

    expect(onChange).toHaveBeenCalledWith({
      ...CONTENT,
      sections: [],
    });
  });

  it('renders empty state when schema is empty', () => {
    render(<DynamicContentRenderer schema={{}} content={{}} onChange={vi.fn()} />);

    expect(screen.getByText('Sin esquema definido para este tipo de recurso')).toBeInTheDocument();
  });

  it('renders read-only mode without inputs', () => {
    render(<DynamicContentRenderer schema={SCHEMA} content={CONTENT} onChange={vi.fn()} readOnly />);

    // Should show content as text, not as inputs
    expect(screen.getByText('Mi titulo')).toBeInTheDocument();
    expect(screen.getByText('Intro del recurso')).toBeInTheDocument();
    // No textareas in read-only
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    // No Agregar button in read-only
    expect(screen.queryByText('Agregar')).not.toBeInTheDocument();
  });

  it('renders array field with no items and empty message', () => {
    render(
      <DynamicContentRenderer
        schema={SCHEMA}
        content={{ title: 'Test', introduction: '', sections: [] }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/Sin elementos/)).toBeInTheDocument();
  });
});

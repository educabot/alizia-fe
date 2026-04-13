import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicSectionRenderer, validateSections } from './DynamicSectionRenderer';
import type { SectionConfig, SectionValue } from '@/types';

const SECTION_CONFIGS: SectionConfig[] = [
  { key: 'problem_edge', label: 'Arista del problema', type: 'text', ai_prompt: '', required: true },
  {
    key: 'methodology',
    label: 'Enfoque metodologico',
    type: 'select_text',
    options: ['Constructivista', 'Conductista'],
    ai_prompt: '',
    required: true,
  },
  { key: 'notes', label: 'Notas adicionales', type: 'text', ai_prompt: '', required: false },
  { key: 'bibliography', label: 'Bibliografia', type: 'markdown', ai_prompt: '', required: false },
];

describe('DynamicSectionRenderer', () => {
  it('renders all section labels', () => {
    render(<DynamicSectionRenderer sectionConfigs={SECTION_CONFIGS} sections={{}} onSectionChange={vi.fn()} />);

    expect(screen.getByText('Arista del problema')).toBeInTheDocument();
    expect(screen.getByText('Enfoque metodologico')).toBeInTheDocument();
    expect(screen.getByText('Notas adicionales')).toBeInTheDocument();
  });

  it('renders empty state when no configs', () => {
    render(<DynamicSectionRenderer sectionConfigs={[]} sections={{}} onSectionChange={vi.fn()} />);

    expect(screen.getByText('No hay secciones configuradas para este documento')).toBeInTheDocument();
  });

  it('shows select dropdown for select_text type', () => {
    render(<DynamicSectionRenderer sectionConfigs={SECTION_CONFIGS} sections={{}} onSectionChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('calls onSectionChange when select changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DynamicSectionRenderer sectionConfigs={SECTION_CONFIGS} sections={{}} onSectionChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'Constructivista');
    expect(onChange).toHaveBeenCalledWith(
      'methodology',
      expect.objectContaining({ selected_option: 'Constructivista' }),
    );
  });

  it('displays existing section values', () => {
    const sections: Record<string, SectionValue> = {
      problem_edge: { value: 'El problema central es...' },
      methodology: { selected_option: 'Conductista', value: 'Detalle metodologico' },
    };

    render(<DynamicSectionRenderer sectionConfigs={SECTION_CONFIGS} sections={sections} onSectionChange={vi.fn()} />);

    expect(screen.getByText('El problema central es...')).toBeInTheDocument();
    expect(screen.getByText('Detalle metodologico')).toBeInTheDocument();
  });

  it('renders markdown editor for markdown-type section', () => {
    render(<DynamicSectionRenderer sectionConfigs={SECTION_CONFIGS} sections={{}} onSectionChange={vi.fn()} />);

    expect(screen.getByText('Bibliografia')).toBeInTheDocument();
    // Markdown editor shows edit/preview tabs
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Vista previa')).toBeInTheDocument();
  });

  it('shows generating state for specific sections', () => {
    render(
      <DynamicSectionRenderer
        sectionConfigs={SECTION_CONFIGS}
        sections={{}}
        onSectionChange={vi.fn()}
        generatingSections={new Set(['problem_edge'])}
      />,
    );

    expect(screen.getByText('Generando con IA...')).toBeInTheDocument();
  });
});

describe('validateSections', () => {
  it('returns empty array when all required sections have values', () => {
    const sections: Record<string, SectionValue> = {
      problem_edge: { value: 'content' },
      methodology: { selected_option: 'Constructivista' },
    };
    expect(validateSections(SECTION_CONFIGS, sections)).toEqual([]);
  });

  it('returns missing required section labels', () => {
    const sections: Record<string, SectionValue> = {
      problem_edge: { value: 'content' },
    };
    expect(validateSections(SECTION_CONFIGS, sections)).toEqual(['Enfoque metodologico']);
  });

  it('ignores optional sections', () => {
    const sections: Record<string, SectionValue> = {
      problem_edge: { value: 'content' },
      methodology: { value: 'detail' },
    };
    expect(validateSections(SECTION_CONFIGS, sections)).toEqual([]);
  });

  it('treats empty strings as missing', () => {
    const sections: Record<string, SectionValue> = {
      problem_edge: { value: '  ' },
      methodology: { selected_option: '' },
    };
    expect(validateSections(SECTION_CONFIGS, sections)).toEqual(['Arista del problema', 'Enfoque metodologico']);
  });
});

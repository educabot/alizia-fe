import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from './ProfileForm';
import type { ProfileField } from '@/types';

const FIELDS: ProfileField[] = [
  {
    key: 'specialty',
    label: 'Area de especialidad',
    type: 'select',
    options: ['Ciencias', 'Humanidades', 'Matematica'],
    required: true,
  },
  { key: 'experience', label: 'Anos de experiencia', type: 'text', required: false },
  { key: 'preferences', label: 'Preferencias', type: 'multiselect', options: ['Email', 'Push'], required: false },
];

describe('ProfileForm', () => {
  it('renders all field labels', () => {
    render(<ProfileForm fields={FIELDS} values={{}} onChange={vi.fn()} />);

    expect(screen.getByText(/Area de especialidad/)).toBeInTheDocument();
    expect(screen.getByText(/Anos de experiencia/)).toBeInTheDocument();
    expect(screen.getByText(/Preferencias/)).toBeInTheDocument();
  });

  it('shows required indicator for required fields', () => {
    render(<ProfileForm fields={FIELDS} values={{}} onChange={vi.fn()} />);

    // The required field should have a * marker
    const labels = screen.getAllByText('*');
    expect(labels.length).toBe(1); // Only specialty is required
  });

  it('renders select options', () => {
    render(<ProfileForm fields={FIELDS} values={{}} onChange={vi.fn()} />);

    expect(screen.getByText('Ciencias')).toBeInTheDocument();
    expect(screen.getByText('Humanidades')).toBeInTheDocument();
    expect(screen.getByText('Matematica')).toBeInTheDocument();
  });

  it('calls onChange when select changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ProfileForm fields={FIELDS} values={{}} onChange={onChange} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Ciencias');

    expect(onChange).toHaveBeenCalledWith('specialty', 'Ciencias');
  });

  it('renders multiselect as toggle buttons', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ProfileForm fields={FIELDS} values={{}} onChange={onChange} />);

    const emailBtn = screen.getByText('Email');
    await user.click(emailBtn);

    expect(onChange).toHaveBeenCalledWith('preferences', ['Email']);
  });

  it('renders text field as textarea', () => {
    render(<ProfileForm fields={FIELDS} values={{ experience: '5 anos' }} onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('5 anos')).toBeInTheDocument();
  });

  it('returns null when no fields', () => {
    const { container } = render(<ProfileForm fields={[]} values={{}} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });
});

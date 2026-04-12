import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceModeToggle } from './ResourceModeToggle';

describe('ResourceModeToggle', () => {
  it('renders both options', () => {
    render(<ResourceModeToggle value='global' onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Global' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Por momento' })).toBeInTheDocument();
  });

  it('marks the current value as checked', () => {
    render(<ResourceModeToggle value='per_moment' onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'Global' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'Por momento' })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with the clicked value', () => {
    const onChange = vi.fn();
    render(<ResourceModeToggle value='global' onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Por momento' }));
    expect(onChange).toHaveBeenCalledWith('per_moment');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<ResourceModeToggle value='global' onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('radio', { name: 'Por momento' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders inside a labelled group for a11y', () => {
    render(<ResourceModeToggle value='global' onChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Modo de fuentes' })).toBeInTheDocument();
  });
});

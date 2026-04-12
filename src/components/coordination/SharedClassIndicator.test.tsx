import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SharedClassIndicator } from './SharedClassIndicator';

describe('SharedClassIndicator', () => {
  it('renders the default label', () => {
    render(<SharedClassIndicator />);
    expect(screen.getByText('Compartida')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<SharedClassIndicator label='Shared' />);
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('has an accessible role and label', () => {
    render(<SharedClassIndicator />);
    const indicator = screen.getByRole('status', { name: /Clase compartida/i });
    expect(indicator).toBeInTheDocument();
  });

  it('accepts extra classes', () => {
    render(<SharedClassIndicator className='custom-class' />);
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('renders the md variant with different sizing classes', () => {
    render(<SharedClassIndicator size='md' />);
    const node = screen.getByRole('status');
    expect(node.className).toMatch(/text-sm/);
  });
});

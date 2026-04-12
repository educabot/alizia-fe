import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerateButton } from './GenerateButton';

describe('GenerateButton', () => {
  it('renders default label', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} />);
    expect(screen.getByRole('button', { name: /generar con alizia/i })).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} label='Generar clases' />);
    expect(screen.getByRole('button', { name: /generar clases/i })).toBeInTheDocument();
  });

  it('shows loading state when generating', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={true} />);
    expect(screen.getByRole('button', { name: /generando/i })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GenerateButton onClick={onClick} isGenerating={false} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when generating', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} error='Error al generar' />);
    expect(screen.getByText('Error al generar')).toBeInTheDocument();
  });

  it('does not show error when null', () => {
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} error={null} />);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});

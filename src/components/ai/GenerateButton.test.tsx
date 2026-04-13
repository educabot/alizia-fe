import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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

  it('shows cooldown timer when errorCode is AI_RATE_LIMITED', () => {
    vi.useFakeTimers();
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} errorCode='AI_RATE_LIMITED' />);

    expect(screen.getByRole('button', { name: /espera 30s/i })).toBeDisabled();
    expect(screen.getByText(/demasiado trafico/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('counts down and re-enables after cooldown expires', () => {
    vi.useFakeTimers();
    render(<GenerateButton onClick={vi.fn()} isGenerating={false} errorCode='AI_RATE_LIMITED' />);

    expect(screen.getByRole('button', { name: /espera 30s/i })).toBeDisabled();

    // Advance 29 seconds
    act(() => vi.advanceTimersByTime(29_000));
    expect(screen.getByRole('button', { name: /espera 1s/i })).toBeDisabled();

    // Advance the last second
    act(() => vi.advanceTimersByTime(1_000));
    expect(screen.getByRole('button', { name: /generar con alizia/i })).not.toBeDisabled();
    vi.useRealTimers();
  });

  it('hides error message during cooldown', () => {
    vi.useFakeTimers();
    render(
      <GenerateButton
        onClick={vi.fn()}
        isGenerating={false}
        error='Rate limited'
        errorCode='AI_RATE_LIMITED'
      />,
    );

    // During cooldown, the amber message shows instead of the red error
    expect(screen.queryByText('Rate limited')).not.toBeInTheDocument();
    expect(screen.getByText(/demasiado trafico/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

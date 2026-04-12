import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityContentEditor } from './ActivityContentEditor';

vi.mock('@/components/ai/LoadingOrb', () => ({
  LoadingOrb: ({ message }: { message?: string }) => <div data-testid='loading-orb'>{message}</div>,
}));

describe('ActivityContentEditor', () => {
  it('shows the activity name in the header', () => {
    render(
      <ActivityContentEditor
        activityName='Debate inicial'
        content='Contenido original'
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Debate inicial')).toBeInTheDocument();
  });

  it('shows empty state when no content is provided', () => {
    render(<ActivityContentEditor activityName='Debate' content='' onSave={() => {}} onClose={() => {}} />);
    expect(screen.getByText(/Sin contenido generado todavia/)).toBeInTheDocument();
  });

  it('shows loading orb when isLoading is true', () => {
    render(<ActivityContentEditor activityName='Debate' content='' onSave={() => {}} onClose={() => {}} isLoading />);
    expect(screen.getByTestId('loading-orb')).toBeInTheDocument();
  });

  it('renders content as a button to enter edit mode', () => {
    render(
      <ActivityContentEditor activityName='Debate' content='Contenido original' onSave={() => {}} onClose={() => {}} />,
    );
    expect(screen.getByText('Contenido original')).toBeInTheDocument();
  });

  it('enters edit mode on click and shows textarea with current content', () => {
    render(
      <ActivityContentEditor activityName='Debate' content='Contenido original' onSave={() => {}} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByText('Contenido original'));
    const textarea = screen.getByLabelText('Editor de contenido de actividad') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Contenido original');
  });

  it('does not enter edit mode when readOnly', () => {
    render(
      <ActivityContentEditor
        activityName='Debate'
        content='Contenido original'
        onSave={() => {}}
        onClose={() => {}}
        readOnly
      />,
    );
    const contentBtn = screen.getByRole('button', { name: 'Contenido original' });
    fireEvent.click(contentBtn);
    expect(screen.queryByLabelText('Editor de contenido de actividad')).not.toBeInTheDocument();
  });

  it('calls onSave with draft value when Guardar is clicked', async () => {
    const onSave = vi.fn();
    render(<ActivityContentEditor activityName='Debate' content='Original' onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Original'));
    const textarea = screen.getByLabelText('Editor de contenido de actividad');
    fireEvent.change(textarea, { target: { value: 'Nuevo contenido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onSave).toHaveBeenCalledWith('Nuevo contenido');
    // Wait for the post-save setDraft(null) to settle inside act()
    await waitFor(() => expect(screen.queryByLabelText('Editor de contenido de actividad')).not.toBeInTheDocument());
  });

  it('discards the draft when Cancelar is clicked', () => {
    const onSave = vi.fn();
    render(<ActivityContentEditor activityName='Debate' content='Original' onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Original'));
    fireEvent.change(screen.getByLabelText('Editor de contenido de actividad'), {
      target: { value: 'Cambio descartado' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Editor de contenido de actividad')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ActivityContentEditor activityName='Debate' content='Original' onSave={() => {}} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar editor de actividad'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

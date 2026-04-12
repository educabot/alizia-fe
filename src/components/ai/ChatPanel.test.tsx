import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from './ChatPanel';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

// Mock the API modules
vi.mock('@/services/api', () => ({
  coordinationDocumentsApi: {
    chat: vi.fn().mockResolvedValue({ content: 'AI response', document_updated: false }),
  },
  chatApi: {
    send: vi.fn().mockResolvedValue({ content: 'General response', document_updated: false }),
  },
}));

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message', () => {
    render(
      <ChatPanel
        entityType='coordination-document'
        entityId={1}
        welcomeMessage={{ title: 'Hola', content: 'Soy Alizia' }}
      />,
    );

    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('Soy Alizia')).toBeInTheDocument();
  });

  it('renders input field with placeholder', () => {
    render(<ChatPanel entityType='general' placeholder='Escribi algo...' />);

    expect(screen.getByPlaceholderText('Escribi algo...')).toBeInTheDocument();
  });

  it('sends message on enter', async () => {
    const user = userEvent.setup();
    const { coordinationDocumentsApi } = await import('@/services/api');

    render(<ChatPanel entityType='coordination-document' entityId={42} />);

    const input = screen.getByPlaceholderText(/escribi tu mensaje/i);
    await user.type(input, 'Hola Alizia{enter}');

    expect(coordinationDocumentsApi.chat).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        message: 'Hola Alizia',
      }),
    );
  });

  it('calls onEntityUpdated when document_updated is true', async () => {
    const user = userEvent.setup();
    const { coordinationDocumentsApi } = await import('@/services/api');
    vi.mocked(coordinationDocumentsApi.chat).mockResolvedValueOnce({
      content: 'Updated!',
      document_updated: true,
    });

    const onEntityUpdated = vi.fn();
    render(<ChatPanel entityType='coordination-document' entityId={1} onEntityUpdated={onEntityUpdated} />);

    const input = screen.getByPlaceholderText(/escribi tu mensaje/i);
    await user.type(input, 'Cambia algo{enter}');

    // Wait for async operations
    await vi.waitFor(() => {
      expect(onEntityUpdated).toHaveBeenCalledOnce();
    });
  });

  it('does not call onEntityUpdated when document_updated is false', async () => {
    const user = userEvent.setup();

    const onEntityUpdated = vi.fn();
    render(<ChatPanel entityType='coordination-document' entityId={1} onEntityUpdated={onEntityUpdated} />);

    const input = screen.getByPlaceholderText(/escribi tu mensaje/i);
    await user.type(input, 'Solo una pregunta{enter}');

    await vi.waitFor(() => {
      expect(screen.getByText('AI response')).toBeInTheDocument();
    });
    expect(onEntityUpdated).not.toHaveBeenCalled();
  });

  it('uses general chat API for general entity type', async () => {
    const user = userEvent.setup();
    const { chatApi } = await import('@/services/api');

    render(<ChatPanel entityType='general' />);

    const input = screen.getByPlaceholderText(/escribi tu mensaje/i);
    await user.type(input, 'Pregunta general{enter}');

    expect(chatApi.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Pregunta general',
      }),
    );
  });
});

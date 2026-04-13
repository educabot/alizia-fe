import { useState, useCallback } from 'react';
import { ChatBot } from '@/components/ui/ChatBot';
import { coordinationDocumentsApi, chatApi } from '@/services/api';
import type { ChatMessage } from '@/types';

type EntityType = 'coordination-document' | 'lesson-plan' | 'resource' | 'general';

interface ChatPanelProps {
  entityType: EntityType;
  entityId?: number;
  /** Called when the AI reports it updated the entity (document_updated: true) */
  onEntityUpdated?: () => void;
  placeholder?: string;
  welcomeMessage?: { title: string; content: string };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  /** External generating state (e.g. content generation in progress) */
  isGenerating?: boolean;
}

/**
 * Reusable chat panel that handles entity-type routing and document_updated refetching.
 * Used in: coordination documents, lesson plans, resources, and general chat.
 */
export function ChatPanel({
  entityType,
  entityId,
  onEntityUpdated,
  placeholder = 'Escribi tu mensaje para Alizia...',
  welcomeMessage = {
    title: 'Chat con Alizia',
    content: 'Preguntame lo que necesites. Puedo ayudarte a mejorar el contenido.',
  },
  isCollapsed = false,
  onToggleCollapse,
  isGenerating = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { role: 'user', content: content.trim() };
      // Use functional update to get fresh messages (avoids stale closure)
      let history: ChatMessage[] = [];
      setMessages((prev) => {
        history = [...prev, userMsg];
        return history;
      });
      setIsSending(true);

      try {
        const result = await routeChat(entityType, entityId, content.trim(), history);

        setMessages((prev) => [...prev, { role: 'assistant', content: result.content }]);

        if (result.document_updated && onEntityUpdated) {
          onEntityUpdated();
        }
      } catch {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }]);
      } finally {
        setIsSending(false);
      }
    },
    [entityType, entityId, onEntityUpdated],
  );

  return (
    <ChatBot
      messages={messages}
      onSendMessage={sendMessage}
      isGenerating={isGenerating || isSending}
      placeholder={placeholder}
      welcomeMessage={welcomeMessage}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    />
  );
}

/** Routes chat to the correct API endpoint based on entity type */
async function routeChat(
  entityType: EntityType,
  entityId: number | undefined,
  message: string,
  history: ChatMessage[],
): Promise<{ content: string; document_updated: boolean }> {
  switch (entityType) {
    case 'coordination-document': {
      if (!entityId) throw new Error('entityId required for coordination-document chat');
      return coordinationDocumentsApi.chat(entityId, { message, history });
    }
    // lesson-plan and resource chat endpoints will be added when backend supports them
    case 'lesson-plan':
    case 'resource':
    case 'general':
    default: {
      const result = await chatApi.send({ message, history });
      return { content: result.content, document_updated: result.document_updated };
    }
  }
}

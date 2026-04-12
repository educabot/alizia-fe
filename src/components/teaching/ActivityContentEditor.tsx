import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingOrb } from '@/components/ai/LoadingOrb';

interface ActivityContentEditorProps {
  activityName: string;
  content: string;
  onSave: (newContent: string) => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function ActivityContentEditor({
  activityName,
  content,
  onSave,
  onClose,
  isLoading = false,
  readOnly = false,
}: ActivityContentEditorProps) {
  const [draft, setDraft] = useState<string | null>(null);

  // Reset draft if the underlying content changes (e.g., switching activities)
  useEffect(() => {
    setDraft(null);
  }, [activityName, content]);

  const isEditing = draft !== null;

  const startEdit = () => {
    if (readOnly) return;
    setDraft(content);
  };

  const handleSave = async () => {
    if (draft === null) return;
    await onSave(draft);
    setDraft(null);
  };

  const handleCancel = () => setDraft(null);

  return (
    <div className='flex flex-col h-full activity-card-bg rounded-2xl overflow-hidden'>
      <div className='p-4 px-6 border-b border-[#DAD5F6] flex items-center justify-between h-14'>
        <h3 className='headline-1-bold text-[#10182B] truncate'>{activityName}</h3>
        <button
          type='button'
          onClick={onClose}
          aria-label='Cerrar editor de actividad'
          className='cursor-pointer hover:opacity-70'
        >
          <X className='w-5 h-5 text-[#324155]' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingOrb message='Generando contenido...' size='sm' />
          </div>
        ) : !content ? (
          <p className='text-sm text-gray-400 italic'>Sin contenido generado todavia.</p>
        ) : isEditing ? (
          <div className='space-y-3'>
            <textarea
              aria-label='Editor de contenido de actividad'
              value={draft ?? ''}
              onChange={(e) => setDraft(e.target.value)}
              className='w-full p-3 border border-[#DAD5F6] rounded-lg text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20'
              rows={12}
            />
            <div className='flex gap-2'>
              <Button size='sm' onClick={handleSave}>
                Guardar
              </Button>
              <Button size='sm' variant='outline' onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type='button'
            onClick={startEdit}
            disabled={readOnly}
            className='w-full text-left text-sm text-gray-700 leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-primary/5 p-2 rounded-lg transition-colors disabled:cursor-default disabled:hover:bg-transparent'
          >
            {content}
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  className?: string;
}

/**
 * Markdown editor with edit/preview toggle.
 * Uses react-markdown + remark-gfm for rendering.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Escribi contenido en Markdown...',
  readOnly = false,
  rows = 8,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>(readOnly ? 'preview' : 'edit');

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className='flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200'>
          <button
            type='button'
            onClick={() => setMode('edit')}
            className={cn(
              'px-2 py-0.5 text-xs rounded font-medium transition-colors cursor-pointer',
              mode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Editar
          </button>
          <button
            type='button'
            onClick={() => setMode('preview')}
            className={cn(
              'px-2 py-0.5 text-xs rounded font-medium transition-colors cursor-pointer',
              mode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            Vista previa
          </button>
        </div>
      )}

      {/* Content */}
      {mode === 'edit' && !readOnly ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className='w-full p-3 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none font-mono'
        />
      ) : (
        <div className='p-3 min-h-[8rem] prose prose-sm prose-gray max-w-none'>
          {value ? (
            <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
          ) : (
            <p className='text-gray-400 italic'>{readOnly ? 'Sin contenido' : 'Nada que previsualizar'}</p>
          )}
        </div>
      )}
    </div>
  );
}

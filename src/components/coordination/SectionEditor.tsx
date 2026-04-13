import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type { SectionConfig, SectionValue } from '@/types';

interface SectionEditorProps {
  config: SectionConfig;
  value: SectionValue;
  onChange: (value: SectionValue) => void;
  onGenerateSection?: (sectionKey: string) => Promise<void>;
  isGenerating?: boolean;
  readOnly?: boolean;
}

export function SectionEditor({
  config,
  value,
  onChange,
  onGenerateSection,
  isGenerating = false,
  readOnly = false,
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const currentValue = value?.value ?? '';
  const selectedOption = value?.selected_option ?? '';
  const isEmpty = !currentValue && !selectedOption;

  const startEditing = () => {
    if (readOnly) return;
    setDraft(currentValue);
    setIsEditing(true);
  };

  const save = () => {
    onChange({ ...value, value: draft });
    setIsEditing(false);
  };

  const cancel = () => {
    setIsEditing(false);
  };

  if (isGenerating) {
    return (
      <div className='space-y-2'>
        <SectionHeader config={config} onGenerate={onGenerateSection} isGenerating />
        <div className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='w-6 h-6 animate-spin text-primary mb-2' />
          <p className='text-sm text-gray-500'>Generando con IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <SectionHeader config={config} onGenerate={onGenerateSection} isGenerating={false} readOnly={readOnly} />

      {/* Select for select_text type */}
      {config.type === 'select_text' && (
        <select
          value={selectedOption}
          onChange={(e) => onChange({ ...value, selected_option: e.target.value })}
          disabled={readOnly}
          className='w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60'
        >
          <option value=''>Seleccionar...</option>
          {config.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* Text content */}
      {config.type === 'markdown' ? (
        <MarkdownEditor
          value={currentValue}
          onChange={(val) => onChange({ ...value, value: val })}
          readOnly={readOnly}
          placeholder={`Escribi el contenido de ${config.label} en Markdown...`}
        />
      ) : isEditing ? (
        <div className='space-y-2'>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className='w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 whitespace-pre-wrap'
            rows={8}
            placeholder={`Escribi el contenido de ${config.label}...`}
            autoFocus
          />
          <div className='flex gap-2'>
            <Button size='sm' onClick={save}>
              Guardar
            </Button>
            <Button size='sm' variant='outline' onClick={cancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${
            !readOnly ? 'cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors min-h-[2rem]' : 'p-2'
          }`}
          onClick={startEditing}
          title={!readOnly ? 'Clic para editar' : undefined}
        >
          {isEmpty ? (
            <p className='text-gray-400 italic'>{readOnly ? 'Sin contenido' : 'Clic para agregar contenido...'}</p>
          ) : (
            currentValue
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  config,
  onGenerate,
  isGenerating,
  readOnly,
}: {
  config: SectionConfig;
  onGenerate?: (key: string) => Promise<void>;
  isGenerating: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <h3 className='font-semibold text-gray-900'>{config.label}</h3>
        {config.required && <span className='text-xs text-red-500'>*</span>}
      </div>
      {onGenerate && !readOnly && (
        <Button
          size='sm'
          variant='ghost'
          onClick={() => onGenerate(config.key)}
          disabled={isGenerating}
          className='text-xs gap-1'
        >
          <Sparkles className='w-3.5 h-3.5' />
          Generar
        </Button>
      )}
    </div>
  );
}

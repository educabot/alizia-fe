import { BookOpen } from 'lucide-react';
import type { Font } from '@/types';

interface FontRequirementSelectorProps {
  fonts: Font[];
  selectedFontId: number | null;
  onSelect: (fontId: number | null) => void;
}

export function FontRequirementSelector({ fonts, selectedFontId, onSelect }: FontRequirementSelectorProps) {
  if (fonts.length === 0) {
    return (
      <div className='p-4 rounded-xl bg-amber-50 text-amber-700 text-sm'>
        No hay fuentes disponibles para el area seleccionada.
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <p className='text-sm text-gray-600'>Selecciona la fuente bibliografica para este recurso:</p>
      <div className='space-y-2'>
        {fonts.map((font) => (
          <label
            key={font.id}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedFontId === font.id
                ? 'border-primary bg-primary/5'
                : 'border-[#E4E8EF] bg-white hover:border-primary/40'
            }`}
          >
            <input
              type='radio'
              name='font-selector'
              checked={selectedFontId === font.id}
              onChange={() => onSelect(font.id)}
              className='accent-primary'
            />
            <BookOpen className='w-4 h-4 text-gray-400 shrink-0' />
            <span className='text-sm text-gray-700'>{font.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

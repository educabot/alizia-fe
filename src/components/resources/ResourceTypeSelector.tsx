import { FileText, ChevronRight } from 'lucide-react';
import type { ResourceType } from '@/types';

interface ResourceTypeSelectorProps {
  resourceTypes: ResourceType[];
  selected: ResourceType | null;
  onSelect: (type: ResourceType) => void;
}

export function ResourceTypeSelector({ resourceTypes, selected, onSelect }: ResourceTypeSelectorProps) {
  if (resourceTypes.length === 0) {
    return <p className='text-sm text-gray-400 italic'>No hay tipos de recurso disponibles</p>;
  }

  return (
    <div className='space-y-3'>
      {resourceTypes.map((rt) => (
        <button
          key={rt.id}
          type='button'
          onClick={() => onSelect(rt)}
          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
            selected?.id === rt.id
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-[#E4E8EF] bg-white hover:border-primary/40 hover:shadow-sm'
          }`}
        >
          <div className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'>
            <FileText className='w-5 h-5' />
          </div>
          <div className='flex-1 min-w-0'>
            <h4 className='text-sm font-medium text-gray-900'>{rt.name}</h4>
            <p className='text-xs text-gray-500 mt-0.5'>{rt.description}</p>
            {rt.requires_font && (
              <span className='inline-block mt-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full'>
                Requiere fuente
              </span>
            )}
          </div>
          <ChevronRight
            className={`w-5 h-5 shrink-0 mt-1 transition-transform ${
              selected?.id === rt.id ? 'text-primary translate-x-0.5' : 'text-gray-300 group-hover:text-gray-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

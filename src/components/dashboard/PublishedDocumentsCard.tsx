import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoordinationDocument } from '@/types';

interface PublishedDocumentsCardProps {
  documents: CoordinationDocument[];
  onViewDocument?: (doc: CoordinationDocument) => void;
  maxItems?: number;
  className?: string;
}

export function PublishedDocumentsCard({
  documents,
  onViewDocument,
  maxItems = 3,
  className,
}: PublishedDocumentsCardProps) {
  const published = documents.filter((d) => d.status === 'published');
  const visible = published.slice(0, maxItems);
  const remaining = Math.max(published.length - visible.length, 0);

  return (
    <section
      aria-label='Documentos publicados'
      className={cn('bg-white border border-[#E4E8EF] rounded-2xl p-4', className)}
    >
      <div className='flex items-center gap-3 mb-3'>
        <div className='p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0'>
          <CheckCircle2 className='w-5 h-5' />
        </div>
        <div>
          <p className='text-2xl font-bold text-gray-900'>{published.length}</p>
          <p className='text-sm text-gray-500'>Documentos publicados</p>
        </div>
      </div>

      {published.length === 0 ? (
        <p className='text-xs text-gray-400 italic'>Aun no publicaste ningun documento.</p>
      ) : (
        <>
          <ul className='space-y-1.5'>
            {visible.map((doc) => {
              const title = doc.name || `Documento #${doc.id}`;
              const isInteractive = typeof onViewDocument === 'function';
              const row = (
                <>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{title}</p>
                    <p className='text-xs text-gray-400 truncate'>{doc.area_name}</p>
                  </div>
                  {isInteractive && <ChevronRight className='w-4 h-4 text-gray-400 shrink-0' />}
                </>
              );

              return (
                <li key={doc.id}>
                  {isInteractive ? (
                    <button
                      type='button'
                      onClick={() => onViewDocument?.(doc)}
                      className='w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left'
                    >
                      {row}
                    </button>
                  ) : (
                    <div className='flex items-center gap-2 p-2'>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {remaining > 0 && <p className='text-xs text-gray-400 mt-2'>+{remaining} mas</p>}
        </>
      )}
    </section>
  );
}

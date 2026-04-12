import { FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CoordinationDocument, CoordinationDocumentStatus } from '@/types';

interface DocumentCardProps {
  document: CoordinationDocument;
  onClick: () => void;
}

const STATUS_CONFIG: Record<CoordinationDocumentStatus, { label: string; className: string }> = {
  pending: { label: 'Borrador', className: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'En progreso', className: 'bg-amber-100 text-amber-800' },
  published: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
};

/**
 * Listing card for a CoordinationDocument.
 * Used in Course page and CoordinatorHome dashboard.
 * RFC Epic 4 — Documento de coordinacion.
 */
export function DocumentCard({ document, onClick }: DocumentCardProps) {
  const status = STATUS_CONFIG[document.status] ?? STATUS_CONFIG.pending;
  const year = (() => {
    try {
      return new Date(document.start_date).getFullYear();
    } catch {
      return '';
    }
  })();

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role='button'
      tabIndex={0}
      className='bg-white border border-[#E4E8EF] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 group'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'>
            <FileText className='w-5 h-5' />
          </div>
          <div className='min-w-0'>
            <h4 className='text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors'>
              {document.name || `Documento #${document.id}`}
            </h4>
            <p className='text-xs text-gray-500 mt-0.5'>
              {document.area_name}
              {year ? ` · ${year}` : ''}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <Badge className={`rounded-lg text-xs ${status.className} hover:${status.className}`}>{status.label}</Badge>
          <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-primary transition-colors' />
        </div>
      </div>
    </div>
  );
}

import { FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Resource } from '@/types';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const statusLabel = resource.status === 'active' ? 'Activo' : 'Borrador';
  const statusStyle = resource.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';

  const dateStr = new Date(resource.updated_at).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className='bg-white border border-[#E4E8EF] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group'
    >
      <div className='flex items-start gap-3'>
        <div className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'>
          <FileText className='w-5 h-5' />
        </div>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors'>
            {resource.title}
          </h4>
          <p className='text-xs text-gray-500 mt-0.5'>{resource.resource_type_name}</p>
        </div>
      </div>
      <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100'>
        <Badge className={`rounded-lg text-xs ${statusStyle} hover:${statusStyle}`}>{statusLabel}</Badge>
        <span className='flex items-center gap-1 text-xs text-gray-400'>
          <Clock className='w-3 h-3' />
          {dateStr}
        </span>
      </div>
    </div>
  );
}

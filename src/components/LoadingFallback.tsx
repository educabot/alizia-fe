import { Loader2 } from 'lucide-react';

export function LoadingFallback() {
  return (
    <div className='flex items-center justify-center min-h-[50vh]'>
      <Loader2 className='w-8 h-8 text-primary animate-spin' />
    </div>
  );
}

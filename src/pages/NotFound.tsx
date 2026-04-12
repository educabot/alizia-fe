import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Pagina 404 — ruta desconocida (RFC §5.3).
 *
 * Antes, cualquier ruta no existente hacia `<Navigate to="/" replace />`, lo
 * que dejaba al usuario sin feedback. Ahora mostramos un mensaje claro + dos
 * CTAs: volver atras o ir al inicio.
 */
export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 text-center'>
      <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6'>
        <Compass className='w-10 h-10 text-primary' />
      </div>
      <h1 className='title-2-emphasized text-[#10182B] mb-2'>Pagina no encontrada</h1>
      <p className='body-2-regular text-[#47566C] max-w-md mb-6'>
        La pagina que buscas no existe o fue movida. Verifica el enlace o vuelve al inicio.
      </p>
      <div className='flex gap-3'>
        <Button variant='outline' onClick={() => navigate(-1)}>
          Volver atras
        </Button>
        <Button onClick={() => navigate('/')}>Ir al inicio</Button>
      </div>
    </div>
  );
}

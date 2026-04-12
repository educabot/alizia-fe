import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Pagina 403 — acceso denegado por rol (RFC §5.3).
 *
 * Se renderiza cuando un usuario autenticado intenta entrar a una ruta que
 * requiere un rol que no tiene. No hacemos "redirect silencioso" porque
 * oculta el error y es mala UX; mejor mostrar el motivo.
 */
export function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 text-center'>
      <div className='w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6'>
        <ShieldOff className='w-10 h-10 text-red-500' />
      </div>
      <h1 className='title-2-emphasized text-[#10182B] mb-2'>Acceso denegado</h1>
      <p className='body-2-regular text-[#47566C] max-w-md mb-6'>
        No tenes permisos para ver esta pagina. Si creés que es un error, contactate con el administrador de tu
        organizacion.
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

import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useOrgConfig } from '@/hooks/useOrgConfig';
import { LogOut, PanelLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const config = useOrgConfig();

  const avatar = user?.name.charAt(0).toUpperCase() || 'U';
  const logoUrl = config.visual_identity?.logo_url;
  const platformName = config.visual_identity?.platform_name;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className='fixed top-0 left-0 w-full h-16 py-6 px-4 border-b border-primary/15 flex items-center justify-between z-20 backdrop-blur-sm'>
      <div className='h-full flex items-center gap-4'>
        {user && (
          <button
            type='button'
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
            aria-pressed={sidebarOpen}
            className='w-9 h-9 rounded-lg flex items-center justify-center text-[#324155] hover:bg-gray-100 transition-colors cursor-pointer'
          >
            <PanelLeft className='w-5 h-5' />
          </button>
        )}
        {logoUrl ? (
          <img src={logoUrl} alt={platformName ?? 'Logo'} className='h-8 object-contain' />
        ) : (
          <img
            src='https://storage.googleapis.com/content-generator-ia/ANIMACION%20TRANSPARENTE%203.gif'
            alt='alizia logo by educabot'
            className='w-46 object-contain will-change-auto image-render-pixelated'
          />
        )}
        {platformName && !logoUrl && <span className='text-lg font-semibold text-gray-800'>{platformName}</span>}
      </div>
      <div className='flex items-center gap-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='w-9 h-9 rounded-full bg-[#735fe3] text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors cursor-pointer'
            >
              {avatar}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <div className='px-2 py-1.5'>
              <p className='body-2-medium'>{user?.name}</p>
              <p className='callout-regular text-muted-foreground'>{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className='cursor-pointer hover:bg-[#735fe3]! hover:text-white! focus:bg-[#735fe3]! focus:text-white!'
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span>Cerrar sesion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

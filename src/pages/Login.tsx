import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedOrb } from '@/components/ui/AnimatedOrb';
import { Loader2 } from 'lucide-react';

export function Login() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch {
      // error is already set in authStore
    }
  };

  return (
    <div className='h-screen gradient-background flex flex-col items-center justify-center p-6 overflow-hidden relative'>
      {/* Floating particles background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='absolute w-2 h-2 rounded-full bg-primary/20'
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className='w-full max-w-md flex flex-col relative z-10'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='flex justify-center mb-4 relative'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-32 h-32 rounded-full bg-primary/10 blur-2xl animate-pulse' />
            </div>
            <div className='flex flex-col items-center'>
              <AnimatedOrb size='md' className='mb-4' />
              <h2 className='title-1-regular text-primary'>Bienvenido a Alizia</h2>
              <h3 className='title-2-regular text-muted-foreground'>Inicia sesion para continuar</h3>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className='relative'>
          <div className='absolute -inset-1 bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50' />

          <div className='relative activity-card-bg rounded-3xl border border-[#DAD5F6] overflow-hidden shadow-xl backdrop-blur-sm p-6'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='email' className='body-2-medium text-[#10182B]'>
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='tu@email.com'
                  autoComplete='email'
                  required
                  className='w-full px-4 py-2.5 rounded-xl border border-[#DAD5F6] bg-white/80 text-[#10182B] placeholder:text-[#47566C]/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='password' className='body-2-medium text-[#10182B]'>
                  Contrasena
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Tu contrasena'
                  autoComplete='current-password'
                  required
                  className='w-full px-4 py-2.5 rounded-xl border border-[#DAD5F6] bg-white/80 text-[#10182B] placeholder:text-[#47566C]/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'
                />
              </div>

              {error && (
                <div className='px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={isLoading || !email || !password}
                className='w-full py-2.5 rounded-xl bg-primary text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Iniciando sesion...
                  </>
                ) : (
                  'Iniciar sesion'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-xs text-[#47566C]/60 mt-4'>
          Alizia - Asistente de planificacion educativa con IA
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

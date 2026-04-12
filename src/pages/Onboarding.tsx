import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useConfigStore } from '@/store/configStore';
import { useAuthStore } from '@/store/authStore';
import { ProfileForm } from '@/components/onboarding/ProfileForm';
import { TourOverlay } from '@/components/onboarding/TourOverlay';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { onboardingApi } from '@/services/api';

type OnboardingStep = 'welcome' | 'profile' | 'tour' | 'done';

export function Onboarding() {
  const navigate = useNavigate();
  const orgConfig = useConfigStore((s) => s.orgConfig);
  const getUserRole = useAuthStore((s) => s.getUserRole);

  const profileFields = orgConfig.onboarding?.profile_fields || [];
  const tourSteps = orgConfig.onboarding?.tour_steps || [];
  const allowSkip = orgConfig.onboarding?.allow_skip ?? true;

  const hasProfile = profileFields.length > 0;
  const hasTour = tourSteps.length > 0;

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [profileData, setProfileData] = useState<Record<string, string | string[]>>({});
  const [tourStep, setTourStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleProfileChange = (key: string, value: string | string[]) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  const profileValid = profileFields
    .filter((f) => f.required)
    .every((f) => {
      const val = profileData[f.key];
      if (Array.isArray(val)) return val.length > 0;
      return typeof val === 'string' && val.trim().length > 0;
    });

  const goToNextStep = () => {
    if (step === 'welcome') {
      setStep(hasProfile ? 'profile' : hasTour ? 'tour' : 'done');
    } else if (step === 'profile') {
      setStep(hasTour ? 'tour' : 'done');
    } else if (step === 'tour') {
      setStep('done');
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onboardingApi.complete(profileData);
    } catch {
      // Mock mode — just navigate
    }
    const role = getUserRole();
    navigate(role === 'coordinator' ? '/' : '/', { replace: true });
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  // Calculate progress
  const steps = ['welcome', hasProfile && 'profile', hasTour && 'tour', 'done'].filter(Boolean);
  const currentIdx = steps.indexOf(step);
  const progress = ((currentIdx + 1) / steps.length) * 100;

  return (
    <div className='fixed inset-0 z-50 gradient-background flex flex-col'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-96 h-96 bg-linear-to-br from-[#DAD5F6]/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-80 h-80 bg-linear-to-br from-[#01ceaa]/10 to-transparent rounded-full blur-3xl' />
      </div>

      <div className='relative flex-1 overflow-y-auto py-8 px-6'>
        <div className='max-w-lg mx-auto pb-24'>
          <Progress value={progress} className='mb-8 h-2' />

          {/* Welcome */}
          {step === 'welcome' && (
            <div className='text-center space-y-6 pt-12'>
              <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto'>
                <span className='text-3xl'>👋</span>
              </div>
              <div>
                <h1 className='title-2-bold text-[#2C2C2C]'>
                  Bienvenido a {orgConfig.visual_identity?.platform_name || 'Alizia'}
                </h1>
                <p className='body-2-regular text-gray-600 mt-2'>Vamos a configurar tu perfil en unos pocos pasos.</p>
              </div>
              <Button onClick={goToNextStep} className='gap-2 cursor-pointer'>
                Comenzar
                <ArrowRight className='w-4 h-4' />
              </Button>
              {allowSkip && (
                <div>
                  <button
                    type='button'
                    onClick={handleSkip}
                    className='text-sm text-gray-500 hover:text-gray-700 cursor-pointer'
                  >
                    Omitir por ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {step === 'profile' && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Tu perfil</h2>
                <p className='body-2-regular text-gray-600'>Completa estos datos para personalizar tu experiencia.</p>
              </div>

              <div className='activity-card-bg rounded-2xl p-6'>
                <ProfileForm fields={profileFields} values={profileData} onChange={handleProfileChange} />
              </div>
            </div>
          )}

          {/* Tour */}
          {step === 'tour' && (
            <>
              <div className='text-center space-y-4 pt-12'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Conoce la plataforma</h2>
                <p className='body-2-regular text-gray-600'>Un breve recorrido por las funciones principales.</p>
              </div>
              <TourOverlay
                steps={tourSteps}
                currentStep={tourStep}
                onNext={() => {
                  if (tourStep < tourSteps.length - 1) {
                    setTourStep(tourStep + 1);
                  } else {
                    setStep('done');
                  }
                }}
                onSkip={() => setStep('done')}
              />
            </>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className='text-center space-y-6 pt-12'>
              <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto'>
                <CheckCircle className='w-10 h-10 text-green-600' />
              </div>
              <div>
                <h2 className='title-2-bold text-[#2C2C2C]'>Todo listo</h2>
                <p className='body-2-regular text-gray-600 mt-2'>
                  Tu perfil esta configurado. Ya podes empezar a trabajar.
                </p>
              </div>
              <Button onClick={handleComplete} disabled={isCompleting} className='gap-2 cursor-pointer'>
                {isCompleting ? 'Ingresando...' : 'Ir al dashboard'}
                <ArrowRight className='w-4 h-4' />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer for profile step */}
      {step === 'profile' && (
        <div className='relative backdrop-blur-sm'>
          <div className='max-w-lg mx-auto px-6 py-4 flex justify-between items-center'>
            {allowSkip ? (
              <button
                type='button'
                onClick={handleSkip}
                className='text-sm text-gray-500 hover:text-gray-700 cursor-pointer'
              >
                Omitir
              </button>
            ) : (
              <div />
            )}
            <Button onClick={goToNextStep} disabled={!profileValid} className='gap-2 cursor-pointer'>
              Siguiente
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

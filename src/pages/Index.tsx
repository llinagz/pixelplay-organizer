import { AppStateProvider, useAuthState } from '@/state';
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const WelcomeScreen = lazy(() => import('@/components/WelcomeScreen').then((m) => ({ default: m.WelcomeScreen })));
const TagsConfigScreen = lazy(() => import('@/components/TagsConfigScreen').then((m) => ({ default: m.TagsConfigScreen })));
const Dashboard = lazy(() => import('@/components/Dashboard').then((m) => ({ default: m.Dashboard })));

const AppContent = () => {
  const { authState, onboardingCompletado } = useAuthState();

  // Determinar qué pantalla mostrar según el estado del usuario
  const getScreen = () => {
    if (authState === "anonymous") {
      return <WelcomeScreen key="welcome" />;
    }
    if (!onboardingCompletado) {
      return <TagsConfigScreen key="tags" />;
    }
    return <Dashboard key="dashboard" />;
  };

  // Clave para la animación basada en el estado actual
  const screenKey = authState === "anonymous"
    ? "welcome"
    : !onboardingCompletado
      ? "tags"
      : "dashboard";

  return (
    <div className="min-h-screen bg-background relative scanlines">
      {/* Decoraciones de fondo pixel-art */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Píxeles en las esquinas */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-primary/10" />
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-primary/10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary/10" />
        
        {/* Patrón de rejilla */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-pixel-base">Cargando...</div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getScreen()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

const Index = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default Index;

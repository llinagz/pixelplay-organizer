import { AppProvider, useApp } from '@/context/AppContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { TagsConfigScreen } from '@/components/TagsConfigScreen';
import { Dashboard } from '@/components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent = () => {
  const { state } = useApp();

  // Determine which screen to show
  const getScreen = () => {
    if (!state.user) {
      return <WelcomeScreen key="welcome" />;
    }
    if (!state.user.onboardingCompleted) {
      return <TagsConfigScreen key="tags" />;
    }
    return <Dashboard key="dashboard" />;
  };

  return (
    <div className="min-h-screen bg-background relative scanlines">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Corner pixels */}
        <div className="absolute top-0 left-0 w-8 h-8 bg-primary/10" />
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-primary/10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary/10" />
        
        {/* Grid pattern */}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={!state.user ? 'welcome' : !state.user.onboardingCompleted ? 'tags' : 'dashboard'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {getScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;

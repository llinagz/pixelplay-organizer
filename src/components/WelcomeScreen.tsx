import { useState } from "react";
import { motion } from "framer-motion";
import { PixelButton } from "@/components/PixelButton";
import { PixelInput } from "@/components/PixelInput";
import { PixelCard } from "@/components/PixelCard";
import { useApp } from "@/context/AppContext";
import { useI18n } from "@/i18n/I18nContext";

export const WelcomeScreen = () => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, logIn, existingUsers } = useApp();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      if (existingUsers.includes(trimmed)) await logIn(trimmed);
      else await signUp(trimmed);
    } catch (err) {
      console.error("Error al crear la cuenta:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div className="absolute top-20 left-10 w-4 h-4 bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.div className="absolute top-40 right-20 w-2 h-2 bg-accent" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
      <motion.div className="absolute bottom-32 left-1/4 w-3 h-3 bg-primary" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />

      <PixelCard variant="panel" className="w-full max-w-md">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex justify-center mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="w-3 h-3 bg-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 * i }} />
              ))}
            </div>
          </div>

          <motion.h1 className="text-pixel-2xl text-primary pixel-glow mb-2" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            {t("appTitle")}
          </motion.h1>

          <motion.p className="text-pixel-base text-muted-foreground mb-8" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            {t("welcomeSubtitle")}
          </motion.p>

          <motion.div className="h-1 w-24 mx-auto bg-border mb-8" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <p className="text-pixel-lg text-foreground mb-4">{t("welcomeNameQuestion")}</p>
              <PixelInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t("welcomePlaceholder")} maxLength={20} autoFocus />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <PixelButton type="submit" disabled={!name.trim() || isLoading} className="w-full">
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? t("loading") : t("welcomeStart")}
                  {!isLoading && <span className="animate-blink">▶</span>}
                </span>
              </PixelButton>
            </motion.div>
          </form>

          <motion.div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground text-pixel-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <span>{t("onboardingContinue")}</span>
            <span className="w-2 h-4 bg-primary animate-blink" />
          </motion.div>
        </motion.div>
      </PixelCard>
    </div>
  );
};


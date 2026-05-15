/**
 * Componente raíz de Backlog Pixel.
 *
 * Configura el JazzReactProvider con DemoAuth para persistencia
 * local-first y autenticación sencilla sin contraseñas.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JazzReactProvider } from "jazz-tools/react";
import { BacklogPixelAccount } from "@/schema";
import { I18nProvider } from "@/i18n/I18nContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/** Configuración de sincronización con Jazz Cloud */
const JAZZ_SYNC = {
  peer: "wss://cloud.jazz.tools/?key=backlog-pixel@backlog-pixel.app" as const,
};

const App = () => (
  <JazzReactProvider
    sync={JAZZ_SYNC}
    AccountSchema={BacklogPixelAccount}
  >
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </JazzReactProvider>
);

export default App;

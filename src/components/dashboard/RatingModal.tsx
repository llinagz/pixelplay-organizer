import { motion } from "framer-motion";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { colorPorPuntuacion } from "@/domain/rating";
import { VALORACION_MAX, VALORACION_MIN } from "@/schema";
import { useState } from "react";

interface RatingModalProps {
  isOpen: boolean;
  onConfirm: (valoracion: number | undefined) => void;
}

export const RatingModal = ({ isOpen, onConfirm }: RatingModalProps) => {
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const handleConfirmar = () => {
    onConfirm(seleccion ?? undefined);
    setSeleccion(null);
  };

  const handleOmitir = () => {
    onConfirm(undefined);
    setSeleccion(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80"
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <PixelCard variant="panel" className="w-full max-w-sm">
          <h3 className="text-pixel-lg text-primary mb-1">¡Completado!</h3>
          <p className="text-pixel-sm text-muted-foreground mb-4 uppercase">¿Cómo lo valorarías?</p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: VALORACION_MAX - VALORACION_MIN + 1 }, (_, i) => {
              const v = VALORACION_MIN + i;
              const color = colorPorPuntuacion(v);
              const active = seleccion === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSeleccion(v)}
                  className={`py-2 border-2 text-pixel-base font-bold transition-all ${active ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}
                  style={{ color }}
                >
                  {v}
                </button>
              );
            })}
          </div>
          {seleccion !== null && (
            <motion.p
              key={seleccion}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-pixel-sm text-center mb-4 uppercase"
              style={{ color: colorPorPuntuacion(seleccion) }}
            >
              ★ {seleccion}/10
            </motion.p>
          )}
          <div className="flex gap-2">
            <PixelButton type="button" disabled={seleccion === null} onClick={handleConfirmar}>
              Guardar
            </PixelButton>
            <PixelButton type="button" variant="secondary" onClick={handleOmitir}>
              Omitir
            </PixelButton>
          </div>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
};


import { motion } from "framer-motion";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelInput } from "@/components/PixelInput";
import { ESTADO_COLORS, ESTADO_LABELS, type OcioEstado, useApp } from "@/context/AppContext";
import { useState } from "react";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagId: string;
}

export const AddItemModal = ({ isOpen, onClose, tagId }: AddItemModalProps) => {
  const { addItem } = useApp();
  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState<OcioEstado>("pendiente");

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard variant="panel" className="w-full max-w-sm">
          <h3 className="text-pixel-lg text-primary mb-4">Nuevo Ítem</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!titulo.trim()) return;
              addItem({ titulo: titulo.trim(), tagId, estado });
              setTitulo("");
              setEstado("pendiente");
              onClose();
            }}
            className="space-y-4"
          >
            <PixelInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título..." autoFocus />
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">Estado inicial</p>
              <div className="flex flex-wrap gap-2">
                {(["pendiente", "en_progreso"] as OcioEstado[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEstado(s)}
                    className={`px-3 py-1 border-2 text-pixel-sm uppercase transition-all ${estado === s ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}
                    style={{ color: ESTADO_COLORS[s] }}
                  >
                    {ESTADO_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <PixelButton type="submit" disabled={!titulo.trim()}>
                Añadir
              </PixelButton>
              <PixelButton type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </PixelButton>
            </div>
          </form>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
};


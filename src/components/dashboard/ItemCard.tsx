import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { TrashIcon } from "@/components/PixelIcons";
import { ESTADO_COLORS, ESTADO_LABELS, type OcioEstado } from "@/schema";
import type { OcioItemUI } from "@/context/types";
import { colorPorPuntuacion } from "@/domain/rating";
import { RatingModal } from "./RatingModal";

interface ItemCardProps {
  item: OcioItemUI;
  onUpdateStatus: (estado: OcioEstado, valoracion?: number) => void;
  onDelete: () => void;
}

export const ItemCard = ({ item, onUpdateStatus, onDelete }: ItemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState<OcioEstado | null>(null);

  return (
    <>
      <motion.div layout className="pixel-border-sm bg-card p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 border-2"
              style={{
                backgroundColor: ESTADO_COLORS[item.estado],
                borderColor: ESTADO_COLORS[item.estado],
                boxShadow: `0 0 6px ${ESTADO_COLORS[item.estado]}`,
              }}
            />
            <span className="text-pixel-base text-foreground">{item.titulo}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.valoracion !== undefined && (
              <span className="text-pixel-xs px-2 py-1 border-2" style={{ color: colorPorPuntuacion(item.valoracion), borderColor: colorPorPuntuacion(item.valoracion) }}>
                ★ {item.valoracion}/10
              </span>
            )}
            <span className="text-pixel-xs uppercase px-2 py-1 border-2" style={{ color: ESTADO_COLORS[item.estado], borderColor: ESTADO_COLORS[item.estado] }}>
              {ESTADO_LABELS[item.estado]}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t-2 border-border overflow-hidden"
            >
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">Cambiar estado:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ESTADO_LABELS) as OcioEstado[]).map((s) => (
                  <button
                    key={s}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (s === "completado") {
                        setEstadoPendiente("completado");
                        return;
                      }
                      onUpdateStatus(s);
                    }}
                    className={`px-2 py-1 border-2 text-pixel-xs uppercase transition-all ${item.estado === s ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}
                    style={{ color: ESTADO_COLORS[s] }}
                  >
                    {ESTADO_LABELS[s]}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-border">
                {!showDeleteConfirm ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 border-2 border-destructive text-destructive text-pixel-xs uppercase hover:bg-destructive/20 transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2">
                    <p className="text-pixel-sm text-destructive uppercase">¿Eliminar este ítem?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        className="px-3 py-1 border-2 border-destructive bg-destructive text-destructive-foreground text-pixel-xs uppercase hover:brightness-110 transition-all"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(false);
                        }}
                        className="px-3 py-1 border-2 border-border text-muted-foreground text-pixel-xs uppercase hover:border-primary/50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {estadoPendiente === "completado" && (
          <RatingModal
            isOpen
            onConfirm={(valoracion) => {
              onUpdateStatus("completado", valoracion);
              setEstadoPendiente(null);
              setIsExpanded(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};


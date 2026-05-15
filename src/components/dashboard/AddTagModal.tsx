import { motion } from "framer-motion";
import { PixelButton } from "@/components/PixelButton";
import { PixelCard } from "@/components/PixelCard";
import { PixelInput } from "@/components/PixelInput";
import { useApp, type TagIcon } from "@/context/AppContext";
import {
  BookIcon,
  CakeIcon,
  CartIcon,
  ComicIcon,
  DumbbellIcon,
  FilmIcon,
  GamepadIcon,
  GiftIcon,
  MonitorIcon,
  MusicIcon,
  PopcornIcon,
  TicketIcon,
  TvIcon,
  UtensilsIcon,
} from "@/components/PixelIcons";
import type { FC } from "react";
import { useState } from "react";

const ICON_OPTIONS: { type: TagIcon; component: FC<{ className?: string }> }[] = [
  { type: "gamepad", component: GamepadIcon },
  { type: "book", component: BookIcon },
  { type: "film", component: FilmIcon },
  { type: "music", component: MusicIcon },
  { type: "tv", component: TvIcon },
  { type: "monitor", component: MonitorIcon },
  { type: "popcorn", component: PopcornIcon },
  { type: "comic", component: ComicIcon },
  { type: "utensils", component: UtensilsIcon },
  { type: "ticket", component: TicketIcon },
  { type: "cake", component: CakeIcon },
  { type: "gift", component: GiftIcon },
  { type: "cart", component: CartIcon },
  { type: "dumbbell", component: DumbbellIcon },
];

const COLOR_OPTIONS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316"];

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTagModal = ({ isOpen, onClose }: AddTagModalProps) => {
  const { addTag } = useApp();
  const [nombre, setNombre] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<TagIcon>("gamepad");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

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
          <h3 className="text-pixel-lg text-primary mb-4">Nueva Categoría</h3>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!nombre.trim()) return;
              addTag({ nombre: nombre.trim(), icono: selectedIcon, color: selectedColor });
              setNombre("");
              setSelectedIcon("gamepad");
              setSelectedColor(COLOR_OPTIONS[0]);
              onClose();
            }}
          >
            <PixelInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre..." autoFocus />
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">Icono</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ type, component: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedIcon(type)}
                    className={`p-2 border-2 transition-all ${selectedIcon === type ? "border-primary bg-primary/20" : "border-border hover:border-primary/50"}`}
                    style={{ color: selectedColor }}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 border-4 transition-all ${selectedColor === color ? "border-primary scale-110" : "border-border hover:border-primary/50"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <PixelButton type="submit" disabled={!nombre.trim()}>
                Crear
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


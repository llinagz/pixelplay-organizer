/**
 * Pantalla de configuración de etiquetas — Paso 2 del onboarding.
 *
 * Permite al usuario personalizar sus categorías de ocio
 * antes de empezar a usar el dashboard.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelCard } from '@/components/PixelCard';
import { useApp, type TagIcon } from '@/context/AppContext';
import { PlusIcon, getIconByType } from '@/components/PixelIcons';

/** Colores predefinidos para las etiquetas */
const PRESET_COLORS = [
  '#22c55e', // verde
  '#3b82f6', // azul
  '#a855f7', // morado
  '#ef4444', // rojo
  '#f59e0b', // ámbar
  '#ec4899', // rosa
  '#06b6d4', // cian
  '#84cc16', // lima
];

/** Opciones de icono disponibles */
const ICON_OPTIONS: { id: TagIcon; label: string }[] = [
  { id: 'gamepad', label: 'Mando' },
  { id: 'book', label: 'Libro' },
  { id: 'film', label: 'Cine' },
  { id: 'music', label: 'Música' },
  { id: 'tv', label: 'Series' },
  { id: 'monitor', label: 'PC / Anime' },
  { id: 'popcorn', label: 'Snack' },
  { id: 'comic', label: 'Cómic / Manga' },
  { id: 'utensils', label: 'Comida' },
  { id: 'ticket', label: 'Evento' },
  { id: 'cake', label: 'Fiesta' },
  { id: 'gift', label: 'Regalo' },
  { id: 'cart', label: 'Compra' },
  { id: 'dumbbell', label: 'Deporte' },
];

export const TagsConfigScreen = () => {
  const { nombreUsuario, tags, completeOnboarding, addTag, removeTag } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<TagIcon>('gamepad');

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag({
        nombre: newTagName.trim(),
        icono: selectedIcon,
        color: selectedColor,
      });
      setNewTagName('');
      setIsAdding(false);
    }
  };

  const renderIcon = (iconId: string) => {
    const IconComponent = getIconByType(iconId);
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelCard variant="panel" className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Cabecera */}
          <div className="text-center">
            <motion.h2
              className="text-pixel-xl text-primary pixel-glow mb-2"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
            >
              ¡Hola, {nombreUsuario}!
            </motion.h2>
            <p className="text-pixel-base text-muted-foreground">
              Configura tus categorías de ocio
            </p>
          </div>

          {/* Separador */}
          <div className="h-1 w-full bg-border" />

          {/* Lista de tags */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {tags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixel-border-sm bg-muted p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: tag.color }}>
                      {renderIcon(tag.icono)}
                    </div>
                    <span className="text-pixel-base text-foreground">{tag.nombre}</span>
                  </div>
                  <PixelButton
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag.id)}
                    className="text-destructive hover:bg-destructive/20"
                  >
                    ✕
                  </PixelButton>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Formulario para añadir tag */}
            <AnimatePresence>
              {isAdding ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pixel-border-sm bg-secondary p-4 space-y-4"
                >
                  <PixelInput
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nombre de la categoría..."
                    maxLength={20}
                    autoFocus
                  />

                  {/* Selector de icono */}
                  <div>
                    <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                      Icono
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => setSelectedIcon(icon.id)}
                          className={`p-2 border-2 transition-all ${
                            selectedIcon === icon.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ color: selectedColor }}
                        >
                          {renderIcon(icon.id)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selector de color */}
                  <div>
                    <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                      Color
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 border-4 transition-all ${
                            selectedColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:border-foreground/50'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <PixelButton size="sm" onClick={handleAddTag} disabled={!newTagName.trim()}>
                      Añadir
                    </PixelButton>
                    <PixelButton size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
                      Cancelar
                    </PixelButton>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setIsAdding(true)}
                  className="w-full pixel-border-sm bg-muted/50 p-3 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="text-pixel-sm uppercase">Nueva categoría</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Botón continuar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PixelButton
              onClick={completeOnboarding}
              className="w-full"
              disabled={tags.length === 0}
            >
              <span className="flex items-center justify-center gap-2">
                Ir al Dashboard
                <span className="animate-blink">▶</span>
              </span>
            </PixelButton>
          </motion.div>
        </motion.div>
      </PixelCard>
    </div>
  );
};

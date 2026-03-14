/**
 * Dashboard principal de Backlog Pixel.
 *
 * Muestra las categorías del usuario en un sidebar y los ítems
 * de la categoría seleccionada en el área principal.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelCard } from '@/components/PixelCard';
import { useApp, ESTADO_LABELS, ESTADO_COLORS, type OcioEstado, type TagIcon, type OcioItemUI, type TagUI } from '@/context/AppContext';
import { getIconByType, PlusIcon, TrashIcon, GamepadIcon, BookIcon, FilmIcon, MusicIcon, TvIcon } from '@/components/PixelIcons';
import { VALORACION_MIN, VALORACION_MAX } from '@/schema';

// ─── Opciones de configuración ───────────────────────────────────

const ICON_OPTIONS: { type: TagIcon; component: React.FC<{ className?: string }> }[] = [
  { type: 'gamepad', component: GamepadIcon },
  { type: 'book', component: BookIcon },
  { type: 'film', component: FilmIcon },
  { type: 'music', component: MusicIcon },
  { type: 'tv', component: TvIcon },
];

const COLOR_OPTIONS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f59e0b',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316',
];

// ─── Colores de puntuación (rojo → amarillo → verde) ─────────────

/** Devuelve el color hex según el rango de la puntuación */
const colorPorPuntuacion = (v: number): string => {
  if (v <= 4) return '#ef4444'; // rojo
  if (v <= 7) return '#f59e0b'; // amarillo
  return '#22c55e';             // verde
};

// ─── Modal de valoración ─────────────────────────────────────────

/**
 * Modal que aparece cuando el usuario marca un ítem como "Completado".
 * Permite puntuar del 1 al 10 o saltar la valoración.
 */
const RatingModal = ({
  isOpen,
  onConfirm,
}: {
  isOpen: boolean;
  onConfirm: (valoracion: number | undefined) => void;
}) => {
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
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <PixelCard variant="panel" className="w-full max-w-sm">
          <h3 className="text-pixel-lg text-primary mb-1">¡Completado!</h3>
          <p className="text-pixel-sm text-muted-foreground mb-4 uppercase">
            ¿Cómo lo valorarías?
          </p>

          {/* Cuadrícula de botones 1–10 */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: VALORACION_MAX - VALORACION_MIN + 1 }, (_, i) => {
              const v = VALORACION_MIN + i;
              const color = colorPorPuntuacion(v);
              const estaSeleccionado = seleccion === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSeleccion(v)}
                  className={`py-2 border-2 text-pixel-base font-bold transition-all ${
                    estaSeleccionado
                      ? 'border-primary bg-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ color }}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Muestra la puntuación seleccionada */}
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
            <PixelButton
              type="button"
              disabled={seleccion === null}
              onClick={handleConfirmar}
            >
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

// ─── Modal para añadir ítem ──────────────────────────────────────

const AddItemModal = ({
  isOpen,
  onClose,
  tagId,
}: {
  isOpen: boolean;
  onClose: () => void;
  tagId: string;
}) => {
  const { addItem } = useApp();
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState<OcioEstado>('pendiente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim()) {
      addItem({ titulo: titulo.trim(), tagId, estado });
      setTitulo('');
      setEstado('pendiente');
      onClose();
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <PixelInput
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título..."
              autoFocus
            />
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                Estado inicial
              </p>
              <div className="flex flex-wrap gap-2">
                {(['pendiente', 'en_progreso'] as OcioEstado[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setEstado(s)}
                    className={`px-3 py-1 border-2 text-pixel-sm uppercase transition-all ${
                      estado === s
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
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

// ─── Modal para añadir categoría ─────────────────────────────────

const AddTagModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { addTag } = useApp();
  const [nombre, setNombre] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<TagIcon>('gamepad');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      addTag({ nombre: nombre.trim(), icono: selectedIcon, color: selectedColor });
      setNombre('');
      setSelectedIcon('gamepad');
      setSelectedColor(COLOR_OPTIONS[0]);
      onClose();
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <PixelInput
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre..."
              autoFocus
            />

            {/* Selector de icono */}
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                Icono
              </p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(({ type, component: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedIcon(type)}
                    className={`p-2 border-2 transition-all ${
                      selectedIcon === type
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ color: selectedColor }}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de color */}
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 border-4 transition-all ${
                      selectedColor === color
                        ? 'border-primary scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
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

// ─── Tarjeta de ítem ─────────────────────────────────────────────

const ItemCard = ({
  item,
  onUpdateStatus,
  onDelete,
}: {
  item: OcioItemUI;
  /** Callback para cambiar estado; si el nuevo estado es "completado", incluye la valoración opcional */
  onUpdateStatus: (estado: OcioEstado, valoracion?: number) => void;
  onDelete: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  /** Estado pendiente mientras esperamos la valoración del modal */
  const [estadoPendiente, setEstadoPendiente] = useState<OcioEstado | null>(null);

  /** Gestiona el cambio de estado interceptando "completado" para pedir valoración */
  const handleEstadoClick = (s: OcioEstado, e: React.MouseEvent) => {
    e.stopPropagation();
    if (s === 'completado') {
      // Abrir modal de valoración antes de persistir
      setEstadoPendiente('completado');
    } else {
      onUpdateStatus(s);
    }
  };

  /** Confirma la valoración (o la omite) y persiste el estado completado */
  const handleRatingConfirm = (valoracion: number | undefined) => {
    if (estadoPendiente) {
      onUpdateStatus(estadoPendiente, valoracion);
      setEstadoPendiente(null);
      setIsExpanded(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        className="pixel-border-sm bg-card p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
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
            {/* Mostrar valoración si existe */}
            {item.valoracion !== undefined && (
              <span
                className="text-pixel-xs px-2 py-1 border-2"
                style={{
                  color: colorPorPuntuacion(item.valoracion),
                  borderColor: colorPorPuntuacion(item.valoracion),
                }}
              >
                ★ {item.valoracion}/10
              </span>
            )}
            <span
              className="text-pixel-xs uppercase px-2 py-1 border-2"
              style={{
                color: ESTADO_COLORS[item.estado],
                borderColor: ESTADO_COLORS[item.estado],
              }}
            >
              {ESTADO_LABELS[item.estado]}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t-2 border-border overflow-hidden"
            >
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                Cambiar estado:
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ESTADO_LABELS) as OcioEstado[]).map((s) => (
                  <button
                    key={s}
                    onClick={(e) => handleEstadoClick(s, e)}
                    className={`px-2 py-1 border-2 text-pixel-xs uppercase transition-all ${
                      item.estado === s
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ color: ESTADO_COLORS[s] }}
                  >
                    {ESTADO_LABELS[s]}
                  </button>
                ))}
              </div>

              {/* Sección de eliminar */}
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-pixel-sm text-destructive uppercase">
                      ¿Eliminar este ítem?
                    </p>
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

      {/* Modal de valoración (fuera del layout de la tarjeta) */}
      <AnimatePresence>
        {estadoPendiente === 'completado' && (
          <RatingModal
            isOpen
            onConfirm={handleRatingConfirm}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Dashboard principal ─────────────────────────────────────────

export const Dashboard = () => {
  const { tags, items, nombreUsuario, updateItem, removeItem, logOut } = useApp();
  const [activeTagId, setActiveTagId] = useState<string | null>(
    tags[0]?.id || null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const filteredItems = items.filter((item) => item.tagId === activeTagId);
  const activeTag = tags.find((t) => t.id === activeTagId);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Cabecera */}
      <motion.header
        className="pixel-border bg-card p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-pixel-xl text-primary pixel-glow">
              ORGANIZADOR DE OCIO
            </h1>
            <div className="h-6 w-1 bg-border hidden md:block" />
            <span className="text-pixel-base text-muted-foreground hidden md:block">
              {nombreUsuario}
            </span>
          </div>
          <PixelButton variant="ghost" size="sm" onClick={logOut}>
            Reiniciar
          </PixelButton>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar — Categorías */}
        <motion.aside
          className="lg:w-64 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="pixel-border bg-card p-4">
            <h2 className="text-pixel-lg text-primary mb-4 uppercase">
              Categorías
            </h2>
            <nav className="space-y-2">
              {tags.map((tag, index) => {
                const IconComponent = getIconByType(tag.icono);
                const itemCount = items.filter((i) => i.tagId === tag.id).length;

                return (
                  <motion.button
                    key={tag.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => setActiveTagId(tag.id)}
                    className={`w-full p-3 border-2 flex items-center gap-3 transition-all ${
                      activeTagId === tag.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span style={{ color: tag.color }}>
                      <IconComponent className="w-6 h-6" />
                    </span>
                    <span className="text-pixel-sm text-foreground flex-1 text-left">
                      {tag.nombre}
                    </span>
                    <span className="text-pixel-xs text-muted-foreground px-2 py-1 bg-muted">
                      {itemCount}
                    </span>
                  </motion.button>
                );
              })}

              {/* Botón nueva categoría */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + tags.length * 0.05 }}
                onClick={() => setIsTagModalOpen(true)}
                className="w-full p-3 border-2 border-dashed border-border flex items-center justify-center gap-2 transition-all hover:border-primary/50 hover:bg-muted/50"
              >
                <PlusIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-pixel-sm text-muted-foreground">
                  Nueva categoría
                </span>
              </motion.button>
            </nav>
          </div>
        </motion.aside>

        {/* Contenido principal */}
        <motion.main
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="pixel-border bg-card p-4 min-h-[400px]">
            {activeTag ? (
              <>
                {/* Cabecera de categoría */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-border">
                  <div className="flex items-center gap-3">
                    <span style={{ color: activeTag.color }}>
                      {(() => {
                        const IconComponent = getIconByType(activeTag.icono);
                        return <IconComponent className="w-8 h-8" />;
                      })()}
                    </span>
                    <h2 className="text-pixel-lg text-foreground">
                      {activeTag.nombre}
                    </h2>
                  </div>
                  <PixelButton size="sm" onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Añadir
                    </span>
                  </PixelButton>
                </div>

                {/* Grid de ítems */}
                {filteredItems.length > 0 ? (
                  <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onUpdateStatus={(estado, valoracion) =>
                            updateItem(item.id, valoracion !== undefined
                              ? { estado, valoracion }
                              : { estado })
                          }
                          onDelete={() => removeItem(item.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span
                      className="mb-4 animate-float"
                      style={{ color: activeTag.color }}
                    >
                      {(() => {
                        const IconComponent = getIconByType(activeTag.icono);
                        return <IconComponent className="w-16 h-16" />;
                      })()}
                    </span>
                    <p className="text-pixel-base text-muted-foreground mb-4">
                      No hay ítems en esta categoría
                    </p>
                    <PixelButton size="sm" onClick={() => setIsModalOpen(true)}>
                      Añadir el primero
                    </PixelButton>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-pixel-base text-muted-foreground">
                  Selecciona una categoría
                </p>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      {/* Modal añadir ítem */}
      <AnimatePresence>
        {isModalOpen && activeTagId && (
          <AddItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tagId={activeTagId}
          />
        )}
      </AnimatePresence>

      {/* Modal añadir categoría */}
      <AnimatePresence>
        {isTagModalOpen && (
          <AddTagModal
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

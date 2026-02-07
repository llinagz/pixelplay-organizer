import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton } from '@/components/PixelButton';
import { PixelInput } from '@/components/PixelInput';
import { PixelCard } from '@/components/PixelCard';
import { useApp } from '@/context/AppContext';
import { getIconByType, PlusIcon, StarIcon } from '@/components/PixelIcons';
import { BacklogItem, ItemStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/backlog';

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
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ItemStatus>('backlog');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addItem({ title: title.trim(), tagId, status });
      setTitle('');
      setStatus('backlog');
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título..."
              autoFocus
            />
            <div>
              <p className="text-pixel-sm text-muted-foreground mb-2 uppercase">
                Estado inicial
              </p>
              <div className="flex flex-wrap gap-2">
                {(['backlog', 'playing', 'reading', 'watching'] as ItemStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 border-2 text-pixel-sm uppercase transition-all ${
                      status === s
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ color: STATUS_COLORS[s] }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <PixelButton type="submit" disabled={!title.trim()}>
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

const ItemCard = ({ item, onUpdateStatus }: { item: BacklogItem; onUpdateStatus: (status: ItemStatus) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
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
              backgroundColor: STATUS_COLORS[item.status],
              borderColor: STATUS_COLORS[item.status],
              boxShadow: `0 0 6px ${STATUS_COLORS[item.status]}`,
            }}
          />
          <span className="text-pixel-base text-foreground">{item.title}</span>
        </div>
        <span
          className="text-pixel-xs uppercase px-2 py-1 border-2"
          style={{
            color: STATUS_COLORS[item.status],
            borderColor: STATUS_COLORS[item.status],
          }}
        >
          {STATUS_LABELS[item.status]}
        </span>
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
              {(Object.keys(STATUS_LABELS) as ItemStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(s)}
                  className={`px-2 py-1 border-2 text-pixel-xs uppercase transition-all ${
                    item.status === s
                      ? 'border-primary bg-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  style={{ color: STATUS_COLORS[s] }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Dashboard = () => {
  const { state, updateItem, resetApp } = useApp();
  const [activeTagId, setActiveTagId] = useState<string | null>(
    state.tags[0]?.id || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = state.items.filter((item) => item.tagId === activeTagId);
  const activeTag = state.tags.find((t) => t.id === activeTagId);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <motion.header
        className="pixel-border bg-card p-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-pixel-xl text-primary pixel-glow">
              BACKLOG PIXEL
            </h1>
            <div className="h-6 w-1 bg-border hidden md:block" />
            <span className="text-pixel-base text-muted-foreground hidden md:block">
              {state.user?.name}
            </span>
          </div>
          <PixelButton variant="ghost" size="sm" onClick={resetApp}>
            Reiniciar
          </PixelButton>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Tags */}
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
              {state.tags.map((tag, index) => {
                const IconComponent = getIconByType(tag.icon);
                const itemCount = state.items.filter((i) => i.tagId === tag.id).length;

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
                      {tag.name}
                    </span>
                    <span className="text-pixel-xs text-muted-foreground px-2 py-1 bg-muted">
                      {itemCount}
                    </span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Main content */}
        <motion.main
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="pixel-border bg-card p-4 min-h-[400px]">
            {activeTag ? (
              <>
                {/* Category header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-border">
                  <div className="flex items-center gap-3">
                    <span style={{ color: activeTag.color }}>
                      {(() => {
                        const IconComponent = getIconByType(activeTag.icon);
                        return <IconComponent className="w-8 h-8" />;
                      })()}
                    </span>
                    <h2 className="text-pixel-lg text-foreground">
                      {activeTag.name}
                    </h2>
                  </div>
                  <PixelButton size="sm" onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Añadir
                    </span>
                  </PixelButton>
                </div>

                {/* Items grid */}
                {filteredItems.length > 0 ? (
                  <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onUpdateStatus={(status) =>
                            updateItem(item.id, { status })
                          }
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
                        const IconComponent = getIconByType(activeTag.icon);
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

      {/* Add item modal */}
      <AnimatePresence>
        {isModalOpen && activeTagId && (
          <AddItemModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tagId={activeTagId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

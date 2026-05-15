import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { PixelButton } from "@/components/PixelButton";
import { PlusIcon, getIconByType } from "@/components/PixelIcons";
import { useApp } from "@/context/AppContext";
import { AddItemModal } from "@/components/dashboard/AddItemModal";
import { AddTagModal } from "@/components/dashboard/AddTagModal";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { useI18n } from "@/i18n/I18nContext";

export const Dashboard = () => {
  const { t } = useI18n();
  const {
    tags,
    items,
    nombreUsuario,
    updateItem,
    removeItem,
    removeTag,
    logOut,
    reorderTags,
    syncStatus,
    lastSyncAt,
    syncError,
    linkedDevices,
    isLinked,
    lastConflict,
    retrySync,
    startDeviceLink,
    completeDeviceLink,
    exportData,
    importData,
  } = useApp();

  const [activeTagId, setActiveTagId] = useState<string | null>(tags[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);
  const [pairCode, setPairCode] = useState("");
  const [importValue, setImportValue] = useState("");

  const filteredItems = items.filter((item) => item.tagId === activeTagId);
  const activeTag = tags.find((tag) => tag.id === activeTagId);

  useEffect(() => {
    if (!tags.length) {
      setActiveTagId(null);
      return;
    }
    if (!activeTagId || !tags.some((tag) => tag.id === activeTagId)) {
      setActiveTagId(tags[0]?.id ?? null);
    }
  }, [tags, activeTagId]);

  const syncLabel = useMemo(() => {
    if (syncStatus === "offline") return t("syncStatusOffline");
    if (syncStatus === "syncing") return t("syncStatusSyncing");
    if (syncStatus === "error") return t("syncStatusError");
    return t("syncStatusUpToDate");
  }, [syncStatus, t]);

  const handleGenerateCode = () => {
    setPairCode(startDeviceLink());
  };

  const handleCompleteLink = () => {
    completeDeviceLink(pairCode);
  };

  const handleExport = () => {
    setImportValue(exportData());
  };

  const handleImport = () => {
    importData(importValue);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.header className="pixel-border bg-card p-4 mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-pixel-xl text-primary pixel-glow">{t("dashboardTitle")}</h1>
            <div className="h-6 w-1 bg-border hidden md:block" />
            <span className="text-pixel-base text-muted-foreground hidden md:block">{nombreUsuario}</span>
          </div>
          <div className="flex gap-2">
            <PixelButton variant="ghost" size="sm" onClick={() => setIsSyncPanelOpen((v) => !v)}>
              {t("sync")}: {syncLabel}
            </PixelButton>
            <PixelButton variant="ghost" size="sm" onClick={logOut}>
              Reiniciar
            </PixelButton>
          </div>
        </div>
      </motion.header>

      {isSyncPanelOpen ? (
        <motion.section
          className="pixel-border bg-card p-4 mb-6 space-y-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-3 text-pixel-sm">
            <span>{isLinked ? t("syncLinked") : t("syncNotLinked")}</span>
            <span>
              {t("syncDevices")}: {linkedDevices ?? "-"}
            </span>
            <span>
              {t("syncLastSync")}: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : "-"}
            </span>
          </div>
          {syncError ? <p className="text-pixel-sm text-destructive">{syncError}</p> : null}
          {lastConflict ? <p className="text-pixel-sm text-amber-500">{t("syncConflictNotice")}</p> : null}
          <div className="flex flex-wrap gap-2">
            <PixelButton size="sm" onClick={retrySync}>{t("syncRetry")}</PixelButton>
            <PixelButton size="sm" onClick={handleGenerateCode}>{t("syncGenerateCode")}</PixelButton>
            <PixelButton size="sm" onClick={handleCompleteLink}>{t("syncCompletePair")}</PixelButton>
            <PixelButton size="sm" onClick={handleExport}>{t("syncExport")}</PixelButton>
            <PixelButton size="sm" onClick={handleImport}>{t("syncImport")}</PixelButton>
          </div>
          <textarea
            className="w-full min-h-20 pixel-border-sm bg-background p-2 text-pixel-xs"
            value={pairCode}
            onChange={(event) => setPairCode(event.target.value)}
            placeholder={t("syncPairCodePlaceholder")}
          />
          <textarea
            className="w-full min-h-20 pixel-border-sm bg-background p-2 text-pixel-xs"
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
            placeholder={t("syncNoData")}
          />
        </motion.section>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-6">
        <motion.aside className="lg:w-64 shrink-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="pixel-border bg-card p-4">
            <h2 className="text-pixel-lg text-primary mb-4 uppercase">{t("categories")}</h2>
            <nav className="space-y-2">
              <Reorder.Group axis="y" values={tags} onReorder={(newTags) => reorderTags(newTags.map((tag) => tag.id))} className="space-y-2">
                {tags.map((tag, index) => {
                  const Icon = getIconByType(tag.icono);
                  const itemCount = items.filter((item) => item.tagId === tag.id).length;
                  return (
                    <Reorder.Item
                      key={tag.id}
                      value={tag}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => setActiveTagId(tag.id)}
                      className={`w-full p-3 border-2 flex items-center gap-3 transition-colors cursor-grab active:cursor-grabbing ${activeTagId === tag.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
                    >
                      <span style={{ color: tag.color }}>
                        <Icon className="w-6 h-6" />
                      </span>
                      <span className="text-pixel-sm text-foreground flex-1 text-left">{tag.nombre}</span>
                      <span className="text-pixel-xs text-muted-foreground px-2 py-1 bg-muted">{itemCount}</span>
                      <button
                        type="button"
                        className="text-pixel-xs text-destructive px-2 py-1 border-2 border-destructive/70 hover:bg-destructive/15"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeTag(tag.id);
                        }}
                        aria-label={`Eliminar categoria ${tag.nombre}`}
                      >
                        X
                      </button>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + tags.length * 0.05 }}
                onClick={() => setIsTagModalOpen(true)}
                className="w-full p-3 border-2 border-dashed border-border flex items-center justify-center gap-2 transition-all hover:border-primary/50 hover:bg-muted/50"
              >
                <PlusIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-pixel-sm text-muted-foreground">{t("newCategory")}</span>
              </motion.button>
            </nav>
          </div>
        </motion.aside>

        <motion.main className="flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="pixel-border bg-card p-4 min-h-[400px]">
            {activeTag ? (
              <>
                <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-border">
                  <div className="flex items-center gap-3">
                    <span style={{ color: activeTag.color }}>
                      {(() => {
                        const Icon = getIconByType(activeTag.icono);
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </span>
                    <h2 className="text-pixel-lg text-foreground">{activeTag.nombre}</h2>
                  </div>
                  <PixelButton size="sm" onClick={() => setIsModalOpen(true)}>
                    <span className="flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Anadir
                    </span>
                  </PixelButton>
                </div>
                {filteredItems.length > 0 ? (
                  <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onUpdateStatus={(estado, valoracion) =>
                            updateItem(item.id, valoracion !== undefined ? { estado, valoracion } : { estado })
                          }
                          onDelete={() => removeItem(item.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="mb-4 animate-float" style={{ color: activeTag.color }}>
                      {(() => {
                        const Icon = getIconByType(activeTag.icono);
                        return <Icon className="w-16 h-16" />;
                      })()}
                    </span>
                    <p className="text-pixel-base text-muted-foreground mb-4">No hay items en esta categoria</p>
                    <PixelButton size="sm" onClick={() => setIsModalOpen(true)}>
                      Anadir el primero
                    </PixelButton>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-pixel-base text-muted-foreground">Selecciona una categoria</p>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      <AnimatePresence>
        {isModalOpen && activeTagId ? (
          <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tagId={activeTagId} />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {isTagModalOpen ? <AddTagModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} /> : null}
      </AnimatePresence>
    </div>
  );
};

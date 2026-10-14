"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DriveFolderItem, BreadcrumbItem } from "@/types";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  HardDrive,
  RefreshCw,
  Search,
  Camera,
  FolderTree,
  ArrowRight,
  Sparkles,
  Calendar,
  Check,
  CheckSquare,
  Square,
  Archive,
  Download,
  X,
  Loader2,
  FolderDown,
} from "lucide-react";
import JSZip from "jszip";

interface SelectedFolderMeta {
  id: string;
  name: string;
}

interface FolderExplorerProps {
  onSelectFolderToCatalog: (folder: SelectedFolderMeta) => void;
  onSelectMultipleFolders: (folders: SelectedFolderMeta[]) => void;
  onScanEntireDrive: () => void;
}

export default function FolderExplorer({
  onSelectFolderToCatalog,
  onSelectMultipleFolders,
  onScanEntireDrive,
}: FolderExplorerProps) {
  const [folders, setFolders] = useState<DriveFolderItem[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string>("root");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Mi Unidad" },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFolder, setSearchFolder] = useState<string>("");
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Multi-folder selection state
  const [selectedFolderMap, setSelectedFolderMap] = useState<Map<string, string>>(new Map());
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  // Fetch folders for current parent folder
  const loadFolders = useCallback(async (parentId: string) => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const res = await fetch(`/api/drive/folders?parentId=${encodeURIComponent(parentId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron obtener las carpetas de Google Drive");
      }

      setFolders(data.folders || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al explorar carpetas";
      console.error("Error cargando carpetas:", err);
      setErrorNotice(msg);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders(currentParentId);
  }, [currentParentId, loadFolders]);

  // Navigate deeper into a subfolder
  const handleOpenFolder = (folder: DriveFolderItem) => {
    setCurrentParentId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchFolder("");
  };

  // Navigate to an earlier breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentParentId(target.id);
    setSearchFolder("");
  };

  // Toggle selection of a folder
  const handleToggleFolderSelect = (folder: DriveFolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolderMap((prev) => {
      const next = new Map(prev);
      if (next.has(folder.id)) {
        next.delete(folder.id);
      } else {
        next.set(folder.id, folder.name);
      }
      return next;
    });
  };

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchFolder.toLowerCase())
  );

  const allFilteredSelected =
    filteredFolders.length > 0 &&
    filteredFolders.every((f) => selectedFolderMap.has(f.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedFolderMap(new Map());
    } else {
      const next = new Map(selectedFolderMap);
      filteredFolders.forEach((f) => next.set(f.id, f.name));
      setSelectedFolderMap(next);
    }
  };

  const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name || "Mi Unidad";

  // Catalog all selected folders together
  const handleCatalogSelectedFolders = () => {
    const selectedList: SelectedFolderMeta[] = Array.from(selectedFolderMap.entries()).map(
      ([id, name]) => ({ id, name })
    );
    if (selectedList.length === 1) {
      onSelectFolderToCatalog(selectedList[0]);
    } else if (selectedList.length > 1) {
      onSelectMultipleFolders(selectedList);
    }
  };

  // Direct Batch Download of all RAWs from selected folders into a ZIP
  const handleBatchDownloadZip = async () => {
    try {
      setIsBatchDownloading(true);
      const folderIds = Array.from(selectedFolderMap.keys());
      setBatchProgress(`Buscando archivos RAW en ${folderIds.length} carpetas...`);

      // 1. Fetch file list across all selected folders
      const res = await fetch(`/api/drive/files?folderIds=${encodeURIComponent(folderIds.join(","))}`);
      const data = await res.json();
      const files = data.files || [];

      if (files.length === 0) {
        setBatchProgress("No se encontraron archivos en estas carpetas.");
        setTimeout(() => {
          setBatchProgress(null);
          setIsBatchDownloading(false);
        }, 3000);
        return;
      }

      setBatchProgress(`Empaquetando ${files.length} archivos en archivo ZIP...`);
      const zip = new JSZip();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBatchProgress(`Descargando (${i + 1}/${files.length}): ${file.name}`);

        const fileRes = await fetch(
          `/api/drive/download?fileId=${file.id}&fileName=${encodeURIComponent(file.name)}`
        );
        const blob = await fileRes.blob();
        zip.file(file.name, blob);
      }

      setBatchProgress("Comprimiendo paquete ZIP final...");
      const content = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `Lote_${selectedFolderMap.size}_Carpetas_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);

      setBatchProgress("¡Descarga de lote completada con éxito!");
      setTimeout(() => {
        setBatchProgress(null);
        setIsBatchDownloading(false);
      }, 2500);
    } catch (err) {
      console.error("Error en descarga en lote:", err);
      setBatchProgress("Ocurrió un error en la descarga del lote.");
      setTimeout(() => {
        setBatchProgress(null);
        setIsBatchDownloading(false);
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      
      {/* Hero Welcome & Selection Context */}
      <div className="bg-dark-900/80 border border-dark-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nikon-yellow/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-nikon-yellow rounded">
                Explorador de Sesiones
              </span>
              <span className="text-xs text-zinc-400 font-mono">Multi-Carpeta & Lotes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-nikon-amber" />
              Árbol de Carpetas de Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Usa las casillas para **seleccionar varias carpetas a la vez** y catalogarlas juntas en una sola galería, o descargarlas en lote directamente en formato ZIP.
            </p>
          </div>

          {/* Quick Option to Scan Entire Drive */}
          <button
            type="button"
            onClick={onScanEntireDrive}
            className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-zinc-200 bg-dark-950 hover:bg-dark-800 border border-dark-700 hover:border-nikon-amber/50 rounded-xl transition-all shadow-md group flex-shrink-0"
            title="Escanear todo Google Drive completo"
          >
            <HardDrive className="w-4 h-4 text-nikon-yellow transition-transform group-hover:scale-110" />
            <div className="text-left">
              <span className="block font-bold text-white">Escanear Todo Drive</span>
              <span className="text-[10px] text-zinc-400 block font-normal">Búsqueda global multiformato</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform ml-1" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigator & Batch Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900 border border-dark-800 rounded-xl p-3 px-4">
        {/* Breadcrumbs */}
        <nav aria-label="Ruta de carpetas" className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <span className="text-zinc-500 flex items-center gap-1 mr-1">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
            Ruta:
          </span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />}
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(idx)}
                  disabled={isLast}
                  className={`px-2 py-1 rounded-md transition-colors truncate max-w-[180px] ${
                    isLast
                      ? "bg-dark-800 text-nikon-yellow font-bold border border-dark-700"
                      : "text-zinc-400 hover:text-white hover:bg-dark-850"
                  }`}
                  title={crumb.name}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Multi-Selection Toggle & Search */}
        <div className="flex items-center gap-3">
          {filteredFolders.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white bg-dark-950 border border-dark-700 rounded-lg transition-colors font-mono"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-nikon-yellow" />
                  <span>Deseleccionar todo</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Seleccionar todo ({filteredFolders.length})</span>
                </>
              )}
            </button>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFolder}
              onChange={(e) => setSearchFolder(e.target.value)}
              placeholder="Filtrar carpetas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-dark-950 border border-dark-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-nikon-amber font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => loadFolders(currentParentId)}
            disabled={isLoading}
            title="Recargar carpetas"
            className="p-1.5 text-zinc-400 hover:text-white bg-dark-950 border border-dark-700 rounded-lg hover:border-dark-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-nikon-yellow" : ""}`} />
          </button>
        </div>
      </div>

      {/* Catalog Current Level Banner */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-nikon-amber/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-nikon-yellow/10 text-nikon-yellow border border-nikon-yellow/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Catalogar: <span className="text-nikon-yellow font-mono">{currentFolderName}</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Mapea y extrae todos los archivos (RAW, JPG, PNG, etc.) que estén dentro de este nivel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onSelectFolderToCatalog({
              id: currentParentId,
              name: currentFolderName,
            })
          }
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Catalogar Esta Carpeta</span>
        </button>
      </div>

      {/* Folders Grid View */}
      {isLoading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-900 border border-dark-800 shadow-xl mb-3">
            <div className="absolute w-10 h-10 rounded-full border-2 border-dark-700/80 border-t-nikon-yellow border-r-nikon-amber animate-spin" />
            <Folder className="w-5 h-5 text-zinc-300 relative z-10" />
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            Explorando carpetas en Google Drive...
          </p>
        </div>
      ) : filteredFolders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFolders.map((folder) => {
            const isSelected = selectedFolderMap.has(folder.id);

            return (
              <div
                key={folder.id}
                className={`group relative flex flex-col justify-between p-4 bg-dark-900 border rounded-xl transition-all duration-200 ${
                  isSelected
                    ? "border-nikon-amber ring-1 ring-nikon-amber/50 shadow-xl shadow-amber-500/10"
                    : "border-dark-800 hover:border-dark-600 hover:shadow-xl hover:shadow-black/60"
                }`}
              >
                {/* Selection Checkbox (Top Right) */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFolderSelect(folder, e)}
                  className={`absolute top-3.5 right-3.5 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-nikon-yellow text-black shadow-md shadow-amber-500/20 scale-105"
                      : "bg-black/60 border border-white/30 text-transparent hover:border-white hover:bg-black/80"
                  }`}
                  aria-label={`Seleccionar carpeta ${folder.name}`}
                  title="Marcar carpeta para selección múltiple"
                >
                  <Check className={`w-4 h-4 stroke-[3] ${isSelected ? "text-black" : "opacity-0"}`} />
                </button>

                <div className="space-y-3 pr-8">
                  {/* Header: Folder Icon & Name */}
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => handleOpenFolder(folder)}
                      className="p-2.5 rounded-xl bg-dark-950 border border-dark-700/80 group-hover:border-nikon-amber/50 group-hover:bg-dark-800 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Folder className="w-6 h-6 text-nikon-yellow transition-transform group-hover:scale-105" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => handleOpenFolder(folder)}
                        className="text-sm font-semibold text-white hover:text-nikon-amber transition-colors truncate cursor-pointer font-mono"
                        title={folder.name}
                      >
                        {folder.name}
                      </h4>
                      {folder.modifiedTimeFormatted && (
                        <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {folder.modifiedTimeFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 mt-3 border-t border-dark-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenFolder(folder)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-dark-950 hover:bg-dark-800 border border-dark-700/80 rounded-lg transition-colors font-mono"
                    title="Abrir y ver subcarpetas"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Subcarpetas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectFolderToCatalog({
                        id: folder.id,
                        name: folder.name,
                      })
                    }
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-lg shadow-md transition-all active:scale-95"
                    title={`Catalogar tomas RAW de ${folder.name}`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Catalogar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-dark-900/40 border border-dashed border-dark-800 rounded-2xl p-6">
          <Folder className="w-10 h-10 text-dark-700 mb-3" />
          <h4 className="text-sm font-semibold text-white mb-1">
            No hay más subcarpetas aquí
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Esta carpeta puede contener directamente archivos de fotos o multimedia. Puedes iniciar la catalogación ahora.
          </p>
          <button
            type="button"
            onClick={() =>
              onSelectFolderToCatalog({
                id: currentParentId,
                name: currentFolderName,
              })
            }
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-md"
          >
            <Camera className="w-4 h-4" />
            <span>Catalogar RAWs de esta carpeta</span>
          </button>
        </div>
      )}

      {/* Floating Multi-Folder Batch Bar */}
      {selectedFolderMap.size > 0 && (
        <aside
          aria-label="Panel de carpetas seleccionadas"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-dark-900/95 border border-nikon-amber/50 rounded-2xl shadow-2xl shadow-black backdrop-blur-xl ring-1 ring-white/10">
            {/* Status Summary */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-nikon-yellow/20 text-nikon-yellow font-bold text-xs font-mono">
                {selectedFolderMap.size}
              </div>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide">
                  {selectedFolderMap.size} {selectedFolderMap.size === 1 ? "carpeta seleccionada" : "carpetas seleccionadas"}
                </p>
                <p className="text-[11px] text-zinc-400 truncate max-w-xs">
                  {Array.from(selectedFolderMap.values()).join(", ")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {batchProgress && (
                <span className="text-[11px] font-mono text-nikon-yellow mr-2 animate-pulse truncate max-w-[180px]">
                  {batchProgress}
                </span>
              )}

              {/* Action 1: Catalog selected folders together in unified gallery */}
              <button
                type="button"
                disabled={isBatchDownloading}
                onClick={handleCatalogSelectedFolders}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                title="Catalogar y cachear todas las tomas RAW de las carpetas seleccionadas en una sola galería"
              >
                <Camera className="w-4 h-4" />
                <span>Catalogar Juntas</span>
              </button>

              {/* Action 2: Direct batch download as ZIP */}
              <button
                type="button"
                disabled={isBatchDownloading}
                onClick={handleBatchDownloadZip}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-100 bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-xl transition-all shadow disabled:opacity-60 cursor-pointer"
                title="Descargar todos los RAWs de estas carpetas en un solo paquete ZIP"
              >
                {isBatchDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-nikon-yellow" />
                ) : (
                  <Archive className="w-4 h-4 text-nikon-yellow" />
                )}
                <span>Descargar Lote (ZIP)</span>
              </button>

              {/* Clear Selection */}
              <button
                type="button"
                disabled={isBatchDownloading}
                onClick={() => setSelectedFolderMap(new Map())}
                className="p-2 text-zinc-400 hover:text-white bg-dark-950 border border-dark-800 rounded-xl"
                title="Deseleccionar todas las carpetas"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

    </div>
  );
}

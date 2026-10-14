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
} from "lucide-react";

interface FolderExplorerProps {
  onSelectFolderToCatalog: (folder: { id: string; name: string }) => void;
  onScanEntireDrive: () => void;
}

export default function FolderExplorer({
  onSelectFolderToCatalog,
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

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchFolder.toLowerCase())
  );

  const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name || "Mi Unidad";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome & Selection Context */}
      <div className="bg-dark-900/80 border border-dark-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nikon-yellow/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-nikon-yellow rounded">
                Explorador de Sesiones
              </span>
              <span className="text-xs text-zinc-400 font-mono">Google Drive Direct</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-nikon-amber" />
              Árbol de Carpetas de tu Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Selecciona la carpeta exacta que deseas catalogar. Así decides exactamente qué sesiones indexar sin saturar el sistema y descargando todas las tomas RAW sin límite de 100 archivos.
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
              <span className="text-[10px] text-zinc-400 block font-normal">Búsqueda global (.NEF)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform ml-1" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigator & Controls */}
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

        {/* Search inside current folder & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
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

      {/* Catalog Current Folder Directly Banner */}
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
              Mapea y extrae todas las fotos RAW (.NEF) que estén directamente en esta carpeta.
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
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className="group flex flex-col justify-between p-4 bg-dark-900 border border-dark-800 hover:border-dark-600 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-black/60"
            >
              <div className="space-y-3">
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
                  <span>Catalogar RAWs</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-dark-900/40 border border-dashed border-dark-800 rounded-2xl p-6">
          <Folder className="w-10 h-10 text-dark-700 mb-3" />
          <h4 className="text-sm font-semibold text-white mb-1">
            No hay más subcarpetas aquí
          </h4>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Esta carpeta puede contener directamente archivos fotográficos RAW (.NEF). Puedes iniciar la catalogación ahora.
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
    </div>
  );
}

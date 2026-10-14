"use client";

import React, { useState } from "react";
import { DriveRawFile } from "@/types";
import { Download, X, HardDrive, Loader2, Archive, FolderDown } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import JSZip from "jszip";

interface SelectionActionBarProps {
  selectedIds: Set<string>;
  allFiles: DriveRawFile[];
  onClearSelection: () => void;
}

export default function SelectionActionBar({
  selectedIds,
  allFiles,
  onClearSelection,
}: SelectionActionBarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);

  if (selectedIds.size === 0) {
    return null;
  }

  // Calculate selected files and total size
  const selectedFiles = allFiles.filter((f) => selectedIds.has(f.id));
  const totalSizeBytes = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  /**
   * Bundles selected RAW files into a ZIP archive for clean single-package download
   */
  const handleZipDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(`Preparando paquete ZIP (${selectedFiles.length} archivos)...`);

      const zip = new JSZip();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setDownloadProgress(`Comprimiendo (${i + 1}/${selectedFiles.length}): ${file.name}`);

        const response = await fetch(
          `/api/drive/download?fileId=${file.id}&fileName=${encodeURIComponent(file.name)}`
        );
        const blob = await response.blob();
        zip.file(file.name, blob);
      }

      setDownloadProgress("Generando archivo ZIP...");
      const content = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `Nikon_RAW_Export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);

      setDownloadProgress("¡Descarga de paquete completada!");
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating ZIP:", error);
      setDownloadProgress("Error al generar archivo.");
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 3000);
    }
  };

  /**
   * Sequential browser download directly to the user's local Windows downloads directory
   */
  const handleSequentialDownload = async () => {
    try {
      setIsDownloading(true);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setDownloadProgress(`Descargando (${i + 1}/${selectedFiles.length}): ${file.name}`);

        const url = `/api/drive/download?fileId=${file.id}&fileName=${encodeURIComponent(
          file.name
        )}`;

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Small delay to prevent browser download throttling
        await new Promise((res) => setTimeout(res, 400));
      }

      setDownloadProgress("¡Descarga de tomas completada!");
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 2500);
    } catch (err) {
      console.error("Error en descarga local:", err);
      setDownloadProgress("Ocurrió un error al descargar.");
      setTimeout(() => {
        setDownloadProgress(null);
        setIsDownloading(false);
      }, 3000);
    }
  };

  const handlePrimaryDownload = () => {
    if (selectedFiles.length === 1) {
      handleSequentialDownload();
    } else {
      handleZipDownload();
    }
  };

  return (
    <aside
      aria-label="Panel de selección de archivos"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-dark-900/95 border border-nikon-amber/40 rounded-2xl shadow-2xl shadow-black backdrop-blur-xl ring-1 ring-white/10">
        
        {/* Selection Status Summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-nikon-yellow/20 text-nikon-yellow font-bold text-xs font-mono">
            {selectedIds.size}
          </div>
          <div>
            <p className="text-xs font-semibold text-white tracking-wide">
              {selectedIds.size} {selectedIds.size === 1 ? "toma RAW seleccionada" : "tomas RAW seleccionadas"}
            </p>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-zinc-500" />
              Peso total: {formatBytes(totalSizeBytes)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Progress or status toast */}
          {downloadProgress && (
            <span className="text-[11px] font-mono text-nikon-yellow mr-2 animate-pulse truncate max-w-[200px]">
              {downloadProgress}
            </span>
          )}

          {/* Primary Action Button: Smart local download */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={handlePrimaryDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            title={selectedFiles.length > 1 ? "Descargar paquete comprimido (.zip) con las tomas seleccionadas" : "Descargar archivo RAW original"}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : selectedFiles.length > 1 ? (
              <Archive className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Download className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>
              {selectedFiles.length > 1
                ? "Descargar Seleccionadas (ZIP)"
                : "Enviar a Descarga Local"}
            </span>
          </button>

          {/* Secondary action: Sequential individual downloads if multiple */}
          {selectedFiles.length > 1 && (
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleSequentialDownload}
              title="Descargar archivos sueltos uno a uno"
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-xl transition-colors disabled:opacity-50"
            >
              <FolderDown className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">Sueltos</span>
            </button>
          )}

          {/* Clear selection button */}
          <button
            type="button"
            onClick={onClearSelection}
            disabled={isDownloading}
            title="Deseleccionar todos"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-dark-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

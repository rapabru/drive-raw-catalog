"use client";

import React, { useState } from "react";
import { X, Folder, HelpCircle, Check } from "lucide-react";

interface DriveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: string;
  onApplyFolderId: (id: string | undefined) => void;
}

export default function DriveFolderModal({
  isOpen,
  onClose,
  currentFolderId,
  onApplyFolderId,
}: DriveFolderModalProps) {
  const [folderInput, setFolderInput] = useState(currentFolderId || "");

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = folderInput.trim();
    onApplyFolderId(trimmed === "" ? undefined : trimmed);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-nikon-amber" />
            <h3 className="text-base font-semibold text-white">
              Alcance de Búsqueda en Drive
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-dark-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <p className="text-zinc-400">
            Puedes indexar todo tu Google Drive o limitar la búsqueda a una carpeta específica (ej: la carpeta donde subes tus tarjetas de memoria).
          </p>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5 font-mono">
              ID de Carpeta de Google Drive (Opcional):
            </label>
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="Ej: 1A2b3C4d5E6F7G8H9..."
              className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-nikon-amber font-mono"
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              * Deja este campo vacío para escanear todo tu almacenamiento de Drive.
            </p>
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-800 text-zinc-400 text-[11px] space-y-1">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-nikon-amber" /> ¿Dónde encontrar el ID de carpeta?
            </span>
            <p>
              Abre la carpeta en Google Drive en tu navegador y copia la serie de letras y números al final de la URL:
              <br />
              <span className="font-mono text-zinc-300">drive.google.com/drive/folders/<strong>[ID_DE_CARPETA]</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-dark-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Filtro</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, Folder, HelpCircle, Check, FolderTree, HardDrive } from "lucide-react";

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
    onApplyFolderId(trimmed === "" || trimmed === "root" || trimmed === "all" ? undefined : trimmed);
    onClose();
  };

  const handleSelectRoot = () => {
    setFolderInput("");
    onApplyFolderId(undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-nikon-amber" />
            <h3 className="text-base font-semibold text-white">
              Alcance de Google Drive
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
          {/* Quick Root Option */}
          <div className="space-y-2">
            <label className="block text-zinc-300 font-medium font-mono">
              Alcance de Búsqueda:
            </label>
            <button
              type="button"
              onClick={handleSelectRoot}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all ${
                !currentFolderId
                  ? "bg-dark-800 border-nikon-amber text-white ring-1 ring-nikon-amber/40"
                  : "bg-dark-950 border-dark-800 text-zinc-300 hover:bg-dark-800/60 hover:border-dark-700"
              }`}
            >
              <HardDrive className={`w-5 h-5 ${!currentFolderId ? "text-nikon-yellow" : "text-zinc-500"}`} />
              <div>
                <p className="font-semibold text-xs text-white">Todo mi Google Drive (Raíz)</p>
                <p className="text-[11px] text-zinc-400">Escanea y cataloga todos los archivos y fotos de tu cuenta</p>
              </div>
            </button>
          </div>

          <div className="border-t border-dark-800 pt-3">
            <label className="block text-zinc-300 font-medium mb-1.5 font-mono">
              O filtrar por ID de Carpeta específica:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Folder className="w-4 h-4 text-zinc-500" />
              </div>
              <input
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Pega el ID de carpeta (ej: 1A2b3C4d5E6F7G8H9...)"
                className="w-full pl-9 pr-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-nikon-amber font-mono text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-800 text-zinc-400 text-[11px] space-y-1">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-nikon-amber" /> ¿Cómo obtener el ID de una carpeta?
            </span>
            <p>
              Abre la carpeta de tu sesión en Google Drive y copia los caracteres al final de la URL en la barra de direcciones:
              <br />
              <span className="font-mono text-zinc-300 break-all">
                drive.google.com/drive/folders/<strong>[ID_DE_CARPETA]</strong>
              </span>
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
            <span>Aplicar Carpeta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

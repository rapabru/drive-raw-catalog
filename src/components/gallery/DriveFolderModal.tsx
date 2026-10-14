"use client";

import React, { useState } from "react";
import { X, Folder, HelpCircle, Check, FolderTree, Sparkles } from "lucide-react";
import { DemoFolderInfo, MOCK_FOLDERS } from "@/lib/constants";

interface DriveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId?: string;
  onApplyFolderId: (id: string | undefined) => void;
  availableFolders?: DemoFolderInfo[];
}

export default function DriveFolderModal({
  isOpen,
  onClose,
  currentFolderId,
  onApplyFolderId,
  availableFolders = MOCK_FOLDERS,
}: DriveFolderModalProps) {
  const [folderInput, setFolderInput] = useState(currentFolderId || "");

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = folderInput.trim();
    onApplyFolderId(trimmed === "" || trimmed === "all" ? undefined : trimmed);
    onClose();
  };

  const handleQuickSelect = (folderId: string) => {
    onApplyFolderId(folderId === "all" ? undefined : folderId);
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
              Alcance y Carpetas de Google Drive
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
          {/* Quick Demo Folders Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-zinc-300 font-medium mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-nikon-yellow" /> Sesiones y Carpetas Disponibles:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableFolders.map((folder) => {
                const isSelected =
                  (!currentFolderId && folder.id === "all") ||
                  currentFolderId === folder.id;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleQuickSelect(folder.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-dark-800 border-nikon-amber text-white ring-1 ring-nikon-amber/40"
                        : "bg-dark-950 border-dark-800 text-zinc-300 hover:bg-dark-800/60 hover:border-dark-700"
                    }`}
                  >
                    <Folder className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? "text-nikon-yellow" : "text-zinc-500"}`} />
                    <div className="min-w-0">
                      <p className="font-semibold truncate text-[11px]">{folder.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{folder.count} tomas RAW</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-dark-800 pt-3">
            <label className="block text-zinc-300 font-medium mb-1.5 font-mono">
              O ingresa un ID de Carpeta de Drive personalizado:
            </label>
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="Ej: 1A2b3C4d5E6F7G8H9..."
              className="w-full px-3 py-2 bg-dark-950 border border-dark-700 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-nikon-amber font-mono"
            />
          </div>

          <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-800 text-zinc-400 text-[11px] space-y-1">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-nikon-amber" /> ¿Cómo filtrar por carpeta en Drive?
            </span>
            <p>
              Copia el código al final de la URL de tu carpeta en Google Drive:
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
            <span>Aplicar Carpeta</span>
          </button>
        </div>
      </div>
    </div>
  );
}

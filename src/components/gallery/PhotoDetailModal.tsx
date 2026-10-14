"use client";

import React from "react";
import { DriveRawFile } from "@/types";
import { X, Download, HardDrive, Calendar, Folder, Camera, Aperture, Clock, ShieldCheck } from "lucide-react";

interface PhotoDetailModalProps {
  file: DriveRawFile | null;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function PhotoDetailModal({
  file,
  onClose,
  isSelected,
  onToggleSelect,
}: PhotoDetailModalProps) {
  if (!file) return null;

  const downloadUrl = `/api/drive/download?fileId=${file.id}&fileName=${encodeURIComponent(
    file.name
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-5xl bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl shadow-black flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left: Image Preview Display */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px] overflow-hidden p-4">
          {file.thumbnailLink ? (
            <img
              src={file.thumbnailLink}
              alt={file.name}
              className="max-w-full max-h-[75vh] object-contain rounded shadow-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500">
              <Camera className="w-16 h-16 mb-2 text-dark-700" />
              <span>Sin vista previa disponible</span>
            </div>
          )}

          {/* Nikon Badge */}
          <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold font-mono tracking-wider text-black bg-nikon-yellow rounded shadow">
            NIKON RAW (.NEF)
          </span>
        </div>

        {/* Right: Technical Inspector & Actions */}
        <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between bg-dark-900 border-t md:border-t-0 md:border-l border-dark-800">
          <div>
            {/* Header / Close */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white font-mono break-all leading-tight">
                  {file.name}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{file.mimeType}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Technical Metadata list */}
            <div className="space-y-3 pt-3 border-t border-dark-800 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" /> Peso:
                </span>
                <span className="font-semibold text-white">{file.sizeFormatted}</span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Modificación:
                </span>
                <span>{file.modifiedTimeFormatted}</span>
              </div>

              <div className="flex flex-col gap-1 text-zinc-300 pt-2 border-t border-dark-800/60">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" /> Ruta en Google Drive:
                </span>
                <span className="text-[11px] text-zinc-300 bg-dark-950 p-2 rounded border border-dark-800 break-all">
                  {file.folderPath}
                </span>
              </div>

              {/* Camera Exif if present */}
              <div className="pt-3 border-t border-dark-800/60 space-y-2">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Ajustes de Disparo
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-dark-950 p-2 rounded border border-dark-800">
                    <span className="text-zinc-500 block text-[10px]">Cámara</span>
                    <span className="text-zinc-200">{file.cameraModel || "Nikon"}</span>
                  </div>
                  <div className="bg-dark-950 p-2 rounded border border-dark-800">
                    <span className="text-zinc-500 block text-[10px]">ISO</span>
                    <span className="text-zinc-200">{file.iso || "N/A"}</span>
                  </div>
                  <div className="bg-dark-950 p-2 rounded border border-dark-800">
                    <span className="text-zinc-500 block text-[10px]">Velocidad</span>
                    <span className="text-zinc-200">{file.shutterSpeed || "N/A"}</span>
                  </div>
                  <div className="bg-dark-950 p-2 rounded border border-dark-800">
                    <span className="text-zinc-500 block text-[10px]">Apertura</span>
                    <span className="text-zinc-200">{file.aperture || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 space-y-2 border-t border-dark-800">
            <button
              onClick={() => onToggleSelect(file.id)}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl border transition-all ${
                isSelected
                  ? "bg-dark-800 text-nikon-amber border-nikon-amber"
                  : "bg-dark-800 text-zinc-200 border-dark-700 hover:text-white"
              }`}
            >
              {isSelected ? "Quitar de la selección" : "Agregar a selección múltiple"}
            </button>

            <a
              href={downloadUrl}
              download={file.name}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-bold text-black bg-nikon-yellow hover:bg-nikon-amber rounded-xl shadow-lg shadow-amber-500/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar RAW Original</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

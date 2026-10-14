"use client";

import React, { useState } from "react";
import { DriveRawFile } from "@/types";
import { Check, Calendar, HardDrive, Folder, Camera, ZoomIn } from "lucide-react";
import Image from "next/image";

interface PhotoCardProps {
  file: DriveRawFile;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showDetails: boolean;
  onOpenPreview: (file: DriveRawFile) => void;
}

export default function PhotoCard({
  file,
  isSelected,
  onToggleSelect,
  showDetails,
  onOpenPreview,
}: PhotoCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div
      className={`group relative flex flex-col bg-dark-900 border rounded-xl overflow-hidden transition-all duration-200 ${
        isSelected
          ? "border-nikon-amber ring-2 ring-nikon-amber/30 shadow-lg shadow-black/80"
          : "border-dark-800 hover:border-dark-600 hover:shadow-md hover:shadow-black/60"
      }`}
    >
      {/* Thumbnail Area */}
      <div
        onClick={() => onOpenPreview(file)}
        className="relative aspect-[3/2] w-full bg-dark-950 cursor-pointer overflow-hidden flex items-center justify-center select-none"
      >
        {/* Skeleton / Placeholder */}
        {imgLoading && (
          <div className="absolute inset-0 bg-dark-850 animate-pulse flex items-center justify-center">
            <Camera className="w-8 h-8 text-dark-700 animate-pulse" />
          </div>
        )}

        {/* Thumbnail Image */}
        {file.thumbnailLink && !imgError ? (
          <img
            src={file.thumbnailLink}
            alt={file.name}
            loading="lazy"
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              imgLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-10 h-10 text-dark-600 mb-2" />
            <span className="text-[11px] font-mono text-zinc-500">RAW .NEF</span>
          </div>
        )}

        {/* Hover zoom icon indicator */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <ZoomIn className="w-5 h-5 text-zinc-200" />
          </div>
        </div>

        {/* Top Badges: Nikon format tag */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider uppercase bg-black/80 text-nikon-yellow backdrop-blur-md rounded border border-nikon-yellow/30 shadow">
            .NEF
          </span>
          {file.cameraModel && (
            <span className="hidden group-hover:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-dark-950/80 text-zinc-300 rounded backdrop-blur-md">
              {file.cameraModel}
            </span>
          )}
        </div>

        {/* Selection Checkbox (always accessible top-right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
            isSelected
              ? "bg-nikon-yellow text-black shadow-md shadow-amber-500/20 scale-105"
              : "bg-black/60 border border-white/30 text-transparent hover:border-white hover:bg-black/80"
          }`}
          aria-label={`Seleccionar ${file.name}`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${isSelected ? "text-black" : "opacity-0"}`} />
        </button>
      </div>

      {/* Primary Caption: File Name & Size */}
      <div className="p-3 bg-dark-900 border-t border-dark-800">
        <div className="flex items-center justify-between gap-2">
          <h3
            onClick={() => onOpenPreview(file)}
            title={file.name}
            className="text-xs font-semibold text-zinc-100 hover:text-nikon-amber truncate cursor-pointer font-mono"
          >
            {file.name}
          </h3>
          <span className="text-[11px] font-mono text-zinc-400 font-medium flex-shrink-0">
            {file.sizeFormatted}
          </span>
        </div>

        {/* Interactive Metadata Panel (toggled by showDetails) */}
        {showDetails && (
          <div className="mt-2.5 pt-2.5 border-t border-dark-800/80 space-y-1.5 text-[11px] text-zinc-400 font-mono animate-fadeIn">
            {/* Google Drive Path */}
            <div className="flex items-center gap-1.5 text-zinc-400 truncate" title={file.folderPath}>
              <Folder className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="truncate">{file.folderPath}</span>
            </div>

            {/* Modification Date */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span>{file.modifiedTimeFormatted}</span>
            </div>

            {/* Camera settings / EXIF if available */}
            {(file.shutterSpeed || file.aperture || file.iso) && (
              <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 border-t border-dark-800/40">
                {file.iso && <span>ISO {file.iso}</span>}
                {file.shutterSpeed && <span>{file.shutterSpeed}</span>}
                {file.aperture && <span>{file.aperture}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

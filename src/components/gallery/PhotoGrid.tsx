"use client";

import React, { useMemo, useState } from "react";
import { DriveRawFile } from "@/types";
import PhotoCard from "./PhotoCard";
import { HardDrive, CheckSquare, Square, ArrowDownUp, AlertCircle, Camera } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface PhotoGridProps {
  files: DriveRawFile[];
  searchQuery: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  showDetails: boolean;
  onOpenPreview: (file: DriveRawFile) => void;
  isLoading: boolean;
}

export default function PhotoGrid({
  files,
  searchQuery,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  showDetails,
  onOpenPreview,
  isLoading,
}: PhotoGridProps) {
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "raw" | "image" | "other">("all");

  // Compute category distribution
  const counts = useMemo(() => {
    return {
      all: files.length,
      raw: files.filter((f) => f.category === "raw").length,
      image: files.filter((f) => f.category === "image").length,
      other: files.filter((f) => f.category !== "raw" && f.category !== "image").length,
    };
  }, [files]);

  // Filter files by search query and category
  const filteredFiles = useMemo(() => {
    let result = files;

    if (categoryFilter === "raw") {
      result = result.filter((f) => f.category === "raw");
    } else if (categoryFilter === "image") {
      result = result.filter((f) => f.category === "image");
    } else if (categoryFilter === "other") {
      result = result.filter((f) => f.category !== "raw" && f.category !== "image");
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.folderPath.toLowerCase().includes(q) ||
          f.extension.toLowerCase().includes(q) ||
          (f.cameraModel && f.cameraModel.toLowerCase().includes(q))
      );
    }

    // Sort files
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === "date") {
        cmp = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime();
      } else if (sortBy === "size") {
        cmp = a.size - b.size;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [files, categoryFilter, searchQuery, sortBy, sortOrder]);

  // Compute total size of all filtered files
  const totalVolume = useMemo(() => {
    return filteredFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [filteredFiles]);

  const allFilteredSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedIds.has(f.id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      onClearSelection();
    } else {
      onSelectAll(filteredFiles.map((f) => f.id));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-900 border border-dark-800 shadow-2xl mb-4">
          {/* Anillo circular de enfoque concéntrico que gira con simetría perfecta */}
          <div className="absolute w-11 h-11 rounded-full border-2 border-dark-700/80 border-t-nikon-yellow border-r-nikon-amber animate-spin" />
          {/* Icono de cámara estático en el centro exacto */}
          <Camera className="w-5 h-5 text-zinc-100 relative z-10" />
        </div>
        <h3 className="text-base font-medium text-white mb-1">
          Catalogando archivos de Google Drive...
        </h3>
        <p className="text-xs text-zinc-500">
          Extrayendo miniaturas y metadatos de las fotos y archivos
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Grid Subheader / Stats & Batch Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-1 py-2 border-b border-dark-800/80 text-xs">
        {/* Left: Summary Count & Total Size */}
        <div className="flex flex-wrap items-center gap-3 text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-nikon-yellow" />
            {filteredFiles.length} {filteredFiles.length === 1 ? "archivo" : "archivos"}
          </span>
          <span className="text-zinc-600">&bull;</span>
          <span className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
            Volumen: {formatBytes(totalVolume)}
          </span>

          {/* Quick Format Pills */}
          <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-dark-800 text-[11px] font-mono ml-0 sm:ml-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                categoryFilter === "all"
                  ? "bg-dark-800 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos ({counts.all})
            </button>
            {counts.raw > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("raw")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  categoryFilter === "raw"
                    ? "bg-nikon-yellow text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                RAW ({counts.raw})
              </button>
            )}
            {counts.image > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("image")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  categoryFilter === "image"
                    ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                JPG / PNG ({counts.image})
              </button>
            )}
            {counts.other > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("other")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  categoryFilter === "other"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Otros ({counts.other})
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Batch Selection & Sorting */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Select all toggle */}
          <button
            type="button"
            onClick={toggleSelectAllFiltered}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-dark-900 border border-dark-800 hover:border-dark-700 rounded-lg transition-colors font-mono"
          >
            {allFilteredSelected ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-nikon-yellow" />
                <span>Deseleccionar todo ({filteredFiles.length})</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-zinc-400" />
                <span>Seleccionar todo ({filteredFiles.length})</span>
              </>
            )}
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 rounded-lg px-2 py-1 text-xs text-zinc-300">
            <ArrowDownUp className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-") as ["name" | "date" | "size", "asc" | "desc"];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-transparent text-zinc-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="date-desc" className="bg-dark-900 text-zinc-200">Más recientes</option>
              <option value="date-asc" className="bg-dark-900 text-zinc-200">Más antiguos</option>
              <option value="name-asc" className="bg-dark-900 text-zinc-200">Nombre (A-Z)</option>
              <option value="name-desc" className="bg-dark-900 text-zinc-200">Nombre (Z-A)</option>
              <option value="size-desc" className="bg-dark-900 text-zinc-200">Mayor peso (MB)</option>
              <option value="size-asc" className="bg-dark-900 text-zinc-200">Menor peso (MB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Adaptive CSS Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <PhotoCard
              key={file.id}
              file={file}
              isSelected={selectedIds.has(file.id)}
              onToggleSelect={onToggleSelect}
              showDetails={showDetails}
              onOpenPreview={onOpenPreview}
            />
          ))}
        </div>
      ) : (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-dark-900/50 border border-dashed border-dark-800 rounded-2xl p-8">
          <AlertCircle className="w-10 h-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            No se encontraron archivos
          </h3>
          <p className="text-xs text-zinc-400 max-w-md">
            {searchQuery
              ? `No hay coincidencias para el término "${searchQuery}". Prueba cambiando el término de búsqueda o filtro de formato.`
              : "No se encontraron archivos en la carpeta seleccionada de Google Drive."}
          </p>
        </div>
      )}
    </div>
  );
}

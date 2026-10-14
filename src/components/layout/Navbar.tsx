"use client";

import React from "react";
import { Camera, Search, SlidersHorizontal, LogOut, LogIn, RefreshCw, FolderTree, LayoutGrid } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenFolderModal: () => void;
  currentFolderId?: string;
  currentFolderName?: string;
  currentView: "tree" | "gallery";
  onSwitchView: (view: "tree" | "gallery") => void;
  hasCatalogedFiles: boolean;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  showDetails,
  onToggleDetails,
  onRefresh,
  isLoading,
  onOpenFolderModal,
  currentFolderId,
  currentFolderName,
  currentView,
  onSwitchView,
  hasCatalogedFiles,
}: NavbarProps) {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-dark-900/95 backdrop-blur-md border-b border-dark-800 transition-colors">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => onSwitchView("tree")}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-dark-800 border border-dark-700 group-hover:border-nikon-amber/60 transition-colors">
                <Camera className="w-5 h-5 text-nikon-yellow transition-transform group-hover:scale-105" />
                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[8px] font-black tracking-tighter text-black bg-nikon-yellow rounded">
                  RAW
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Drive RAW <span className="text-zinc-500 font-normal">Catalog</span>
                </span>
                <span className="block text-[10px] text-zinc-400 -mt-1 font-mono">
                  MULTIFORMAT & RAW SUITE
                </span>
              </div>
            </button>

            {/* Folder Scope Indicator */}
            <button
              onClick={() => onSwitchView("tree")}
              title="Cambiar carpeta en el Árbol de Carpetas"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-zinc-300 bg-dark-800 border border-dark-700 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
            >
              <FolderTree className="w-3.5 h-3.5 text-nikon-amber flex-shrink-0" />
              <span className="truncate max-w-[240px]">
                {currentFolderName
                  ? currentFolderName.startsWith("Carpeta:") || currentFolderName.startsWith("Lote")
                    ? currentFolderName
                    : `Carpeta: ${currentFolderName}`
                  : currentFolderId
                  ? `Carpeta: ${currentFolderId.slice(0, 10)}...`
                  : "Explorador de Carpetas"}
              </span>
            </button>
          </div>

          {/* View Switcher Tabs (Árbol vs Galería) */}
          <div className="flex items-center bg-dark-950 p-1 rounded-xl border border-dark-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => onSwitchView("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === "tree"
                  ? "bg-dark-800 text-nikon-yellow font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Árbol de Carpetas</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchView("gallery")}
              disabled={!hasCatalogedFiles && currentView === "tree"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === "gallery"
                  ? "bg-dark-800 text-nikon-yellow font-bold shadow-sm"
                  : hasCatalogedFiles
                  ? "text-zinc-400 hover:text-white"
                  : "text-zinc-600 cursor-not-allowed opacity-50"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Galería RAW</span>
            </button>
          </div>

          {/* Instant Search Bar (Active in gallery mode) */}
          {currentView === "gallery" && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar en esta sesión..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-dark-950 border border-dark-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-nikon-amber focus:ring-1 focus:ring-nikon-amber transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {/* Action Controls & User Session */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Refresh button */}
            {currentView === "gallery" && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                title="Actualizar catálogo desde Drive"
                className="p-2 text-zinc-400 hover:text-white bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-nikon-yellow" : ""}`} />
              </button>
            )}

            {/* Toggle de Detalles / Metadatos */}
            {currentView === "gallery" && (
              <button
                onClick={onToggleDetails}
                type="button"
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                  showDetails
                    ? "bg-nikon-yellow text-black border-nikon-yellow font-semibold shadow-md shadow-amber-500/10"
                    : "bg-dark-800 text-zinc-300 border-dark-700 hover:bg-dark-750 hover:text-white hover:border-dark-600"
                }`}
                title="Alternar vista de metadatos (MB, ruta, fecha, cámara)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {showDetails ? "Ocultar Metadatos" : "Mostrar Metadatos"}
                </span>
                <span className="md:hidden">Info</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-dark-800">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Usuario"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-dark-600 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-zinc-200">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-medium text-white truncate max-w-[130px]">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Cerrar Sesión"
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-dark-800">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

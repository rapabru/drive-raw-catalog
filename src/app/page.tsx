"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { DriveRawFile } from "@/types";
import { DemoFolderInfo, MOCK_FOLDERS } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import SelectionActionBar from "@/components/gallery/SelectionActionBar";
import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import DriveFolderModal from "@/components/gallery/DriveFolderModal";
import { Info, LogIn } from "lucide-react";
import Link from "next/link";

function CatalogContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get("demo") === "true";

  const [files, setFiles] = useState<DriveRawFile[]>([]);
  const [availableFolders, setAvailableFolders] = useState<DemoFolderInfo[]>(MOCK_FOLDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Search & Metadata controls
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [previewFile, setPreviewFile] = useState<DriveRawFile | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  // Fetch files from API
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/drive/files";
      const params = new URLSearchParams();
      if (currentFolderId) params.append("folderId", currentFolderId);
      if (forceDemo) params.append("demo", "true");
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.files) {
        setFiles(data.files);
        setIsDemo(Boolean(data.isDemo));
      }
      if (data.folders) {
        setAvailableFolders(data.folders);
      }
    } catch (err) {
      console.error("Error cargando archivos RAW:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, forceDemo]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Preview navigation calculations
  const previewIndex = previewFile ? files.findIndex((f) => f.id === previewFile.id) : -1;
  const hasPrev = previewIndex > 0;
  const hasNext = previewIndex >= 0 && previewIndex < files.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrev) {
      setPreviewFile(files[previewIndex - 1]);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      setPreviewFile(files[previewIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-zinc-100 flex flex-col selection:bg-nikon-amber selection:text-black">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails((prev) => !prev)}
        isDemo={isDemo}
        onRefresh={loadFiles}
        isLoading={isLoading}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        currentFolderId={currentFolderId}
      />

      {/* Demo Notice Banner */}
      {isDemo && (
        <aside
          aria-label="Aviso de demostración"
          className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200"
        >
          <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Modo Demostración Activo:</strong> Estás explorando el catálogo Nikon (.NEF) con tomas de alta resolución y metadatos EXIF. Puedes filtrar sesiones, cambiar el toggle de metadatos y probar la descarga de archivos.
              </span>
            </div>
            {status !== "authenticated" && (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1 bg-nikon-yellow text-black font-semibold rounded-lg hover:bg-nikon-amber transition-colors flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar Google Drive</span>
              </Link>
            )}
          </div>
        </aside>
      )}

      {/* Main Catalog View */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PhotoGrid
          files={files}
          searchQuery={searchQuery}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          showDetails={showDetails}
          onOpenPreview={(file) => setPreviewFile(file)}
          isLoading={isLoading}
        />
      </main>

      {/* Floating Selection & Download Action Bar */}
      <SelectionActionBar
        selectedIds={selectedIds}
        allFiles={files}
        onClearSelection={handleClearSelection}
      />

      {/* High-res Photo Detail Modal with Prev/Next controls */}
      <PhotoDetailModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        isSelected={previewFile ? selectedIds.has(previewFile.id) : false}
        onToggleSelect={handleToggleSelect}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Google Drive Folder Scope Selector Modal */}
      <DriveFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        currentFolderId={currentFolderId}
        onApplyFolderId={(id) => setCurrentFolderId(id)}
        availableFolders={availableFolders}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-950 flex items-center justify-center text-zinc-400 font-mono text-xs">
          Iniciando Drive RAW Catalog...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

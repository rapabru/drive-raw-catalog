"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DriveRawFile } from "@/types";
import Navbar from "@/components/layout/Navbar";
import PhotoGrid from "@/components/gallery/PhotoGrid";
import SelectionActionBar from "@/components/gallery/SelectionActionBar";
import PhotoDetailModal from "@/components/gallery/PhotoDetailModal";
import DriveFolderModal from "@/components/gallery/DriveFolderModal";
import { Camera, AlertCircle } from "lucide-react";

function CatalogContent() {
  const { status } = useSession();
  const router = useRouter();

  const [files, setFiles] = useState<DriveRawFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Search & Metadata controls
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [previewFile, setPreviewFile] = useState<DriveRawFile | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch real Google Drive files from API
  const loadFiles = useCallback(async () => {
    if (status !== "authenticated") return;

    setIsLoading(true);
    setErrorNotice(null);

    try {
      let url = "/api/drive/files";
      if (currentFolderId) {
        url += `?folderId=${encodeURIComponent(currentFolderId)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Error al consultar Google Drive");
      }

      setFiles(data.files || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con Google Drive";
      console.error("Error cargando archivos RAW:", err);
      setErrorNotice(msg);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadFiles();
    }
  }, [status, loadFiles]);

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

  // If session is still loading or user is unauthenticated
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center p-4">
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-900 border border-dark-800 shadow-2xl mb-3">
          <div className="absolute w-10 h-10 rounded-full border-2 border-dark-700/80 border-t-nikon-yellow border-r-nikon-amber animate-spin" />
          <Camera className="w-5 h-5 text-zinc-100 relative z-10" />
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Verificando sesión segura con Google...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-zinc-100 flex flex-col selection:bg-nikon-amber selection:text-black">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails((prev) => !prev)}
        onRefresh={loadFiles}
        isLoading={isLoading}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        currentFolderId={currentFolderId}
      />

      {/* Error notification if Drive query fails */}
      {errorNotice && (
        <aside
          aria-label="Aviso de error"
          className="w-full bg-red-950/40 border-b border-red-800/40 px-4 py-2.5 text-xs text-red-200"
        >
          <div className="max-w-[1920px] mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Error en Google Drive:</strong> {errorNotice}. Verifica que la Google Drive API esté habilitada y que tu cuenta tenga permisos de acceso.
            </span>
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

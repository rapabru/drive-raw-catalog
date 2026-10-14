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
import FolderExplorer from "@/components/folders/FolderExplorer";
import { Camera, AlertCircle, ArrowLeft, FolderTree } from "lucide-react";

function CatalogContent() {
  const { status } = useSession();
  const router = useRouter();

  // Navigation View: 'tree' (default starting screen) or 'gallery'
  const [currentView, setCurrentView] = useState<"tree" | "gallery">("tree");

  // Files and Active Folder
  const [files, setFiles] = useState<DriveRawFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<{ id?: string; name: string }>({
    id: undefined,
    name: "Mi Unidad",
  });

  // Search & Metadata controls
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [previewFile, setPreviewFile] = useState<DriveRawFile | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Catalog / fetch RAW files for a specific folder without 100-file limit
  const catalogFolder = useCallback(
    async (folderId?: string, folderName?: string) => {
      if (status !== "authenticated") return;

      setIsLoading(true);
      setErrorNotice(null);
      setCurrentView("gallery");
      setSelectedIds(new Set());

      setActiveFolder({
        id: folderId,
        name: folderName || (folderId ? "Carpeta de Drive" : "Todo Google Drive"),
      });

      try {
        let url = "/api/drive/files";
        if (folderId && folderId !== "all" && folderId !== "root") {
          url += `?folderId=${encodeURIComponent(folderId)}`;
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
        const msg = err instanceof Error ? err.message : "Error al catalogar Google Drive";
        console.error("Error catalogando archivos RAW:", err);
        setErrorNotice(msg);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [status, router]
  );

  // Catalog / fetch RAW files for MULTIPLE folders together
  const catalogMultipleFolders = useCallback(
    async (foldersList: Array<{ id: string; name: string }>) => {
      if (status !== "authenticated" || foldersList.length === 0) return;

      setIsLoading(true);
      setErrorNotice(null);
      setCurrentView("gallery");
      setSelectedIds(new Set());

      const folderIds = foldersList.map((f) => f.id);
      const namesSummary =
        foldersList.length <= 2
          ? foldersList.map((f) => f.name).join(", ")
          : `${foldersList[0].name}, ${foldersList[1].name} (+${foldersList.length - 2} más)`;

      setActiveFolder({
        id: folderIds.join(","),
        name: `Lote (${foldersList.length} carpetas: ${namesSummary})`,
      });

      try {
        const url = `/api/drive/files?folderIds=${encodeURIComponent(folderIds.join(","))}`;
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
        const msg = err instanceof Error ? err.message : "Error al catalogar lote de carpetas";
        console.error("Error catalogando archivos RAW:", err);
        setErrorNotice(msg);
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [status, router]
  );

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

  // If session is checking or unauthenticated
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
        onRefresh={() => catalogFolder(activeFolder.id, activeFolder.name)}
        isLoading={isLoading}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        currentFolderId={activeFolder.id}
        currentFolderName={activeFolder.name}
        currentView={currentView}
        onSwitchView={setCurrentView}
        hasCatalogedFiles={files.length > 0}
      />

      {/* Error notification if Drive query fails */}
      {errorNotice && (
        <aside
          aria-label="Aviso de error"
          className="w-full bg-red-950/40 border-b border-red-800/40 px-4 py-2.5 text-xs text-red-200"
        >
          <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                <strong>Error en Google Drive:</strong> {errorNotice}
              </span>
            </div>
            <button
              onClick={() => setCurrentView("tree")}
              className="text-xs underline text-red-300 hover:text-white"
            >
              Volver al Árbol de Carpetas
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === "tree" ? (
          /* Initial Screen: Google Drive Folder Tree */
          <FolderExplorer
            onSelectFolderToCatalog={(folder) => catalogFolder(folder.id, folder.name)}
            onSelectMultipleFolders={catalogMultipleFolders}
            onScanEntireDrive={() => catalogFolder(undefined, "Todo Google Drive")}
          />
        ) : (
          /* Gallery View: RAW Photos of Selected Folder */
          <div className="space-y-4">
            {/* Gallery Header Bar with Back Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-dark-900 border border-dark-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView("tree")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-xl transition-all"
                  title="Volver a explorar otras carpetas"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cambiar de Carpeta</span>
                </button>
                <div className="border-l border-dark-700 pl-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-zinc-400 font-normal">Sesión:</span>{" "}
                    <span className="text-nikon-yellow font-mono">{activeFolder.name}</span>
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    {isLoading
                      ? "Escaneando archivos en Google Drive..."
                      : `${files.length} ${files.length === 1 ? "archivo catalogado" : "archivos catalogados"}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentView("tree")}
                className="hidden sm:flex items-center gap-1.5 text-xs text-nikon-amber hover:text-nikon-yellow transition-colors font-mono"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Explorar Árbol de Carpetas</span>
              </button>
            </div>

            {/* Photo Grid with NO 100-file limit */}
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
          </div>
        )}
      </main>

      {/* Floating Selection & Download Action Bar */}
      {currentView === "gallery" && (
        <SelectionActionBar
          selectedIds={selectedIds}
          allFiles={files}
          onClearSelection={handleClearSelection}
        />
      )}

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
        currentFolderId={activeFolder.id}
        onApplyFolderId={(id) => catalogFolder(id)}
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

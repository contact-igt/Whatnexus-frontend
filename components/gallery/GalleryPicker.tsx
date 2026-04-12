"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, X, FileText, Video, File } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { fetchMediaAssets, uploadMedia, deleteMediaAsset, MediaAsset } from "@/services/gallery/galleryApi";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glassCard";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

import { FilterType, ViewMode, GalleryFilters, ACCEPT_MAP } from "./types";
import { GalleryToolbar }    from "./GalleryToolbar";
import { GalleryGridCard }   from "./GalleryGridCard";
import { GalleryListRow, GalleryListHeader } from "./GalleryListRow";
import { GalleryEmptyState } from "./GalleryEmptyState";
import { GridSkeletons, ListSkeletons } from "./GallerySkeletons";
import { MediaPreviewDrawer } from "./MediaPreviewDrawer";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GalleryPickerProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSelect:     (asset: MediaAsset) => void;
  approvedOnly?: boolean;
  fileType?:    "image" | "video" | "document" | "all";
}

// ─── File validation ──────────────────────────────────────────────────────────

function validateFile(file: File, filterType: FilterType): string | null {
  const mb = file.size / 1024 / 1024;
  const kb = file.size / 1024;
  const allowed = ACCEPT_MAP[filterType].split(",");

  if (filterType !== "all" && !allowed.includes(file.type)) {
    return `Invalid file type. Please select a ${filterType} file.`;
  }
  if (file.type.startsWith("image/")) {
    if (kb < 5)  return "Image too small. Minimum 5 KB.";
    if (mb > 2)  return "Image too large. Maximum 2 MB.";
  } else if (file.type.startsWith("video/")) {
    if (kb < 10) return "Video too small. Minimum 10 KB.";
    if (mb > 10) return "Video too large. Maximum 10 MB.";
  } else {
    if (kb < 1)  return "Document too small. Minimum 1 KB.";
    if (mb > 10) return "Document too large. Maximum 10 MB.";
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GalleryPicker: React.FC<GalleryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  approvedOnly = false,
  fileType     = "all",
}) => {
  const { isDarkMode } = useTheme();
  const tenantId       = useSelector((state: any) => state.auth?.user?.tenant_id);

  // ── Core state ──────────────────────────────────────────────────────────────
  const [mediaAssets,    setMediaAssets]    = useState<MediaAsset[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalItems,     setTotalItems]     = useState(0);

  // ── Selection / Preview ─────────────────────────────────────────────────────
  const [selectedAsset,  setSelectedAsset]  = useState<MediaAsset | null>(null);
  const [previewAsset,   setPreviewAsset]   = useState<MediaAsset | null>(null);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [confirmId,      setConfirmId]      = useState<string | null>(null);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver,     setIsDragOver]     = useState(false);

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [viewMode,       setViewMode]       = useState<ViewMode>("grid");
  const [filters,        setFilters]        = useState<GalleryFilters>({
    filterType: (fileType as FilterType) || "all",
    search:     "",
    sortField:  "date",
    sortDir:    "desc",
    page:       1,
  });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setFilters((f) => ({ ...f, page: 1 }));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  // Helper to patch filters
  const patchFilters = useCallback((patch: Partial<GalleryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const loadMediaAssets = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMediaAssets({
        tenant_id:    tenantId,
        type:         filters.filterType === "all" ? undefined : filters.filterType,
        search:       debouncedSearch || undefined,
        approved_only: undefined,
        page:         filters.page,
        limit:        20,
      });
      setMediaAssets(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load media assets.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [tenantId, filters.filterType, filters.page, debouncedSearch]);

  useEffect(() => { if (isOpen) loadMediaAssets(); }, [isOpen, loadMediaAssets]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(null);
      setPreviewAsset(null);
      setDrawerOpen(false);
      setFilters({
        filterType: (fileType as FilterType) || "all",
        search:     "",
        sortField:  "date",
        sortDir:    "desc",
        page:       1,
      });
    }
  }, [isOpen, fileType]);

  // ESC to close drawer or modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) { setDrawerOpen(false); setPreviewAsset(null); }
        else if (isOpen) { setSelectedAsset(null); onClose(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, drawerOpen]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    if (!file || !tenantId) return;
    const err = validateFile(file, filters.filterType);
    if (err) { toast.error(err); return; }

    setUploading(true);
    setUploadProgress(0);
    try {
      const uploadResult = await uploadMedia(file, tenantId, { folder: "root", tags: [] }, setUploadProgress);
      toast.success("File uploaded successfully.");

      // Reload the list so the new asset appears
      await loadMediaAssets();

      // Auto-select the newly uploaded asset (not blocked when approvedOnly=false)
      if (!approvedOnly && uploadResult?.data) {
        const newAsset: MediaAsset = {
          id:             uploadResult.data.asset_id,
          media_asset_id: uploadResult.data.asset_id,
          tenant_id:      tenantId,
          file_name:      uploadResult.data.file_name,
          file_type:      uploadResult.data.file_type as MediaAsset["file_type"],
          mime_type:      uploadResult.data.mime_type,
          file_size:      uploadResult.data.file_size,
          media_handle:   uploadResult.data.media_handle,
          preview_url:    uploadResult.data.preview_url,
          tags:           uploadResult.data.tags,
          folder:         uploadResult.data.folder,
          is_approved:    uploadResult.data.is_approved,
          is_deleted:     false,
          templates_used: [],
          campaigns_used: [],
          created_at:     uploadResult.data.created_at,
          updated_at:     uploadResult.data.created_at,
        };
        setSelectedAsset(newAsset);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const deleteAsset = async (assetId: string) => {
    try {
      await deleteMediaAsset(assetId, tenantId);
      toast.success("Asset deleted.");
      await loadMediaAssets();
      if (selectedAsset?.media_asset_id === assetId || selectedAsset?.id === assetId) {
        setSelectedAsset(null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Delete failed.");
    }
  };

  const handleDeleteFromCard = async (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmId(assetId);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    await deleteAsset(confirmId);
    setConfirmId(null);
  };

  const handleLocalSelect = (asset: MediaAsset) => {
    const isAlreadySelected = 
      selectedAsset?.media_asset_id === asset.media_asset_id || 
      selectedAsset?.id === asset.id;
    
    if (isAlreadySelected) {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedAsset) return;
    onSelect(selectedAsset);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAsset(null);
    onClose();
  };

  const openDrawer = (asset: MediaAsset) => {
    setPreviewAsset(asset);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    // Delay clearing asset so close animation plays
    setTimeout(() => setPreviewAsset(null), 300);
  };

  const handleSelectFromDrawer = (asset: MediaAsset) => {
    onSelect(asset);
    closeDrawer();
    onClose();
  };

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <GlassCard
          isDarkMode={isDarkMode}
          className={cn(
            "w-full max-w-5xl flex flex-col overflow-hidden",
            "max-h-[88vh] rounded-2xl",
            isDarkMode ? "bg-[#0c0d11] border-white/8" : "bg-white border-slate-200"
          )}
        >

          {/* ── Modal Header ──────────────────────────────────────────────── */}
          <div
            className={cn(
              "flex items-center justify-between gap-4 px-6 py-4 border-b shrink-0",
              isDarkMode
                ? "border-white/6 bg-linear-to-r from-white/[0.03] to-transparent"
                : "border-slate-100 bg-linear-to-r from-slate-50 to-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                isDarkMode ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"
              )}>
                <ImageIcon size={16} className="text-emerald-500" />
              </div>
              <div>
                <h2 className={cn("text-[15px] font-bold leading-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                  {approvedOnly ? "Select Approved Media" : "Select Media"}
                </h2>
                <p className={cn("text-[11px]", isDarkMode ? "text-white/35" : "text-slate-500")}>
                  Pick from your gallery or upload a new file
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                isDarkMode
                  ? "text-white/30 hover:bg-white/8 hover:text-white/80"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Toolbar ───────────────────────────────────────────────────── */}
          <GalleryToolbar
            filters={filters}
            viewMode={viewMode}
            isDarkMode={isDarkMode}
            uploading={uploading}
            uploadProgress={uploadProgress}
            isDragOver={isDragOver}
            totalItems={totalItems}
            fileType={fileType as FilterType}
            onFiltersChange={patchFilters}
            onViewMode={setViewMode}
            onUpload={uploadFile}
            onDragOver={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) await uploadFile(file);
            }}
          />

          {/* ── Gallery body ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Error state */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p className={cn("text-sm font-semibold", isDarkMode ? "text-red-400" : "text-red-600")}>
                  Failed to load assets
                </p>
                <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-slate-500")}>{error}</p>
                <button
                  type="button"
                  onClick={loadMediaAssets}
                  className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && !error && (
              viewMode === "grid"
                ? <GridSkeletons isDarkMode={isDarkMode} count={8} />
                : <ListSkeletons isDarkMode={isDarkMode} count={6} />
            )}

            {/* Empty state */}
            {!loading && !error && mediaAssets.length === 0 && (
              <GalleryEmptyState
                filterType={filters.filterType}
                isDarkMode={isDarkMode}
                onUploadClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
              />
            )}

            {/* ── Grid view ─────────────────────────────────────────────── */}
            {!loading && !error && mediaAssets.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {mediaAssets.map((asset) => {
                  const isDisabled = approvedOnly ? !asset.is_approved : false;
                  const isSelected =
                    selectedAsset?.media_asset_id === asset.media_asset_id ||
                    selectedAsset?.id === asset.id;
                  return (
                    <GalleryGridCard
                      key={asset.id}
                      asset={asset}
                      isSelected={isSelected}
                      isDisabled={isDisabled}
                      isDarkMode={isDarkMode}
                      onSelect={handleLocalSelect}
                      onPreview={openDrawer}
                      onDelete={handleDeleteFromCard}
                    />
                  );
                })}
              </div>
            )}

            {/* ── List view ─────────────────────────────────────────────── */}
            {!loading && !error && mediaAssets.length > 0 && viewMode === "list" && (
              <div>
                <GalleryListHeader isDarkMode={isDarkMode} showCheckbox={true} />
                <div className="space-y-1">
                  {mediaAssets.map((asset) => {
                    const assetSelected =
                      selectedAsset?.media_asset_id === asset.media_asset_id ||
                      selectedAsset?.id === asset.id;
                    const isDisabled = approvedOnly
                      ? !asset.is_approved
                      : !!selectedAsset && !assetSelected;
                    return (
                      <GalleryListRow
                        key={asset.id}
                        asset={asset}
                        isSelected={assetSelected}
                        isDisabled={isDisabled}
                        isDarkMode={isDarkMode}
                        showCheckbox={true}
                        onSelect={handleLocalSelect}
                        onPreview={openDrawer}
                        onDelete={handleDeleteFromCard}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div
            className={cn(
              "px-6 pt-3 pb-4 border-t shrink-0",
              isDarkMode ? "border-white/6 bg-white/[0.015]" : "border-slate-100 bg-slate-50/60"
            )}
          >
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mb-3">
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={(p) => patchFilters({ page: p })}
                  totalItems={totalItems}
                  itemsPerPage={20}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Footer action bar */}
            <div className="flex items-center justify-between gap-3">
              {/* Selected asset preview */}
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedAsset ? (
                  <>
                    {/* Thumbnail / icon */}
                    <div className={cn(
                      "w-9 h-9 rounded-lg overflow-hidden shrink-0 border flex items-center justify-center",
                      isDarkMode ? "border-emerald-500/30" : "border-emerald-200"
                    )}
                      style={{
                        background: selectedAsset.file_type === "image" && selectedAsset.preview_url
                          ? undefined
                          : selectedAsset.file_type === "video"
                            ? "#a78bfa18"
                            : selectedAsset.file_type === "document"
                              ? "#fbbf2418"
                              : "#94a3b818"
                      }}
                    >
                      {selectedAsset.file_type === "image" && selectedAsset.preview_url ? (
                        <img src={selectedAsset.preview_url} alt="" className="w-full h-full object-cover" />
                      ) : selectedAsset.file_type === "video" ? (
                        <Video size={17} style={{ color: "#a78bfa" }} />
                      ) : selectedAsset.file_type === "document" ? (
                        <FileText size={17} style={{ color: "#fbbf24" }} />
                      ) : (
                        <File size={17} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-[12px] font-semibold truncate leading-tight", isDarkMode ? "text-white/85" : "text-slate-800")}>
                        {selectedAsset.file_name}
                      </p>
                      <p className={cn("text-[10px]", isDarkMode ? "text-emerald-400/80" : "text-emerald-600")}>
                        Selected
                      </p>
                    </div>
                  </>
                ) : (
                  <span className={cn("text-xs", isDarkMode ? "text-white/20" : "text-slate-400")}>
                    No file selected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    isDarkMode
                      ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  )}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedAsset}
                  className={cn(
                    "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                    selectedAsset
                      ? "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-500/30"
                      : isDarkMode
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                  )}
                >
                  Select Media
                </button>
              </div>
            </div>
          </div>

        </GlassCard>
      </div>

      {/* ── Preview Drawer (rendered outside modal so it slides over) ─────── */}
      <MediaPreviewDrawer
        asset={previewAsset}
        isOpen={drawerOpen}
        isDarkMode={isDarkMode}
        fromPicker
        onClose={closeDrawer}
        onDelete={deleteAsset}
        onSelect={handleSelectFromDrawer}
      />
      <ConfirmationModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Media Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isDarkMode={isDarkMode}
      />
    </>
  );
};

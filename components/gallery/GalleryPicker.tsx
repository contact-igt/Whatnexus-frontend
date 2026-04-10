"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, Eye, Grid3X3, ImageIcon, List, Search, Trash2, Upload, X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchMediaAssets, uploadMedia, deleteMediaAsset, MediaAsset } from "../../services/gallery/galleryApi";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glassCard";
import { Pagination } from "@/components/ui/pagination";
import { MediaAssetPreviewModal } from "@/components/gallery/MediaAssetPreviewModal";

// ─── Props (unchanged) ───────────────────────────────────────────────────────

interface GalleryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  approvedOnly?: boolean;
  fileType?: "image" | "video" | "document" | "all";
}

// ─── Constants ───────────────────────────────────────────────────────────────

type FilterType = "all" | "image" | "video" | "document";

const FILTER_TABS: { id: FilterType; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "image",    label: "Images" },
  { id: "video",    label: "Videos" },
  { id: "document", label: "Documents" },
];

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,video/mp4,video/3gpp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Thumbnail background when no image preview
const THUMB_BG: Record<string, string> = {
  image:    "#2a1a1a",
  video:    "#1a1a2e",
  document: "#1a2a1a",
};

// Emoji icon per file type
const TYPE_EMOJI: Record<string, string> = {
  image:    "🖼️",
  video:    "🎬",
  document: "📄",
};

// Top-left badge on thumbnail
const TYPE_BADGE: Record<string, { label: string; bg: string }> = {
  image:    { label: "IMG",   bg: "#1a5fa8" },
  video:    { label: "VIDEO", bg: "#7c3aed" },
  document: { label: "DOC",   bg: "#c47c1a" },
};

// Color of the type label in card info row
const TYPE_LABEL_COLOR: Record<string, string> = {
  image:    "#4f8ef7",
  video:    "#a78bfa",
  document: "#f5a623",
};

// Per-filter empty state subtitle
const EMPTY_SUBTITLE: Record<FilterType, string> = {
  all:      "Upload your first file using the button above",
  image:    "No images uploaded yet",
  video:    "No videos uploaded yet",
  document: "No documents uploaded yet",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.06)",
        animation: "gallerypulse 1.5s ease-in-out infinite",
      }}
    >
      <div style={{ aspectRatio: "1/1", background: "#222" }} />
      <div style={{ padding: "8px 10px" }}>
        <div style={{ height: 10, width: "70%", background: "#2a2a2a", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 8,  width: "45%", background: "#2a2a2a", borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const GalleryPicker: React.FC<GalleryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  approvedOnly = false,
  fileType = "all",
}) => {
  const { isDarkMode } = useTheme();

  const [mediaAssets,    setMediaAssets]    = useState<MediaAsset[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [selectedAsset,  setSelectedAsset]  = useState<MediaAsset | null>(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType,     setFilterType]     = useState<FilterType>((fileType as FilterType) || "all");
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalItems,     setTotalItems]     = useState(0);
  const [uploading,      setUploading]      = useState(false);
  const [previewAsset,   setPreviewAsset]   = useState<MediaAsset | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);

  // Debounce search 300ms before sending to API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadMediaAssets = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const response = await fetchMediaAssets({
        tenant_id:    tenantId,
        type:         filterType === "all" ? undefined : filterType,
        search:       debouncedSearch || undefined,
        approved_only: approvedOnly,
        page,
        limit: 20,
      });

      setMediaAssets(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (error) {
      console.error("Error loading media assets:", error);
      toast.error("Failed to load media assets");
    } finally {
      setLoading(false);
    }
  }, [approvedOnly, filterType, page, debouncedSearch, tenantId]);

  useEffect(() => {
    if (isOpen) loadMediaAssets();
  }, [isOpen, loadMediaAssets]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(null);
      setSearchTerm("");
      setDebouncedSearch("");
      setPage(1);
      setFilterType((fileType as FilterType) || "all");
      setPreviewAsset(null);
    }
  }, [isOpen, fileType]);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const uploadSelectedFile = async (file?: File | null, clearInput?: () => void) => {
    if (!file || !tenantId) return;

    const mb = file.size / 1024 / 1024;
    const kb = file.size / 1024;

    // Client-side validation
    if (file.type.startsWith("image/")) {
      if (kb < 5)  { toast.error("Image too small. Minimum 5KB"); clearInput?.(); return; }
      if (mb > 2)  { toast.error("Image too large. Maximum 2MB"); clearInput?.(); return; }
    } else if (file.type.startsWith("video/")) {
      if (kb < 10) { toast.error("Video too small. Minimum 10KB"); clearInput?.(); return; }
      if (mb > 10) { toast.error("Video too large. Maximum 10MB"); clearInput?.(); return; }
    } else {
      if (kb < 1)  { toast.error("Document too small. Minimum 1KB"); clearInput?.(); return; }
      if (mb > 10) { toast.error("Document too large. Maximum 10MB"); clearInput?.(); return; }
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadMedia(file, tenantId, { folder: "root", tags: [] }, setUploadProgress);
      toast.success("Media uploaded successfully");
      await loadMediaAssets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      clearInput?.();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await uploadSelectedFile(file, () => { event.target.value = ""; });
  };

  // ── Selection ──────────────────────────────────────────────────────────────

  // Passes full asset object to parent and closes modal
  const handleConfirmSelection = () => {
    if (!selectedAsset) return;
    onSelect(selectedAsset);
    onClose();
  };

  // Cancel: close modal, clear selection, do NOT call onSelect
  const handleCancel = () => {
    setSelectedAsset(null);
    onClose();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteAssetById = async (assetId: string) => {
    try {
      await deleteMediaAsset(assetId, tenantId);
      toast.success("Media deleted successfully");
      await loadMediaAssets();
      if (selectedAsset?.media_asset_id === assetId || selectedAsset?.id === assetId) {
        setSelectedAsset(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete media asset");
    }
  };

  const handleDeleteAsset = async (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    await deleteAssetById(assetId);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes gallerypulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>

      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
        <GlassCard
          isDarkMode={isDarkMode}
          className={cn(
            "w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden rounded-[2rem]",
            isDarkMode ? "bg-[#111114]/95 border-white/10" : "bg-white/95 border-slate-200"
          )}
        >

          {/* ── Header ── */}
          <div className={cn(
            "flex items-start justify-between gap-4 px-6 py-5 border-b shrink-0",
            isDarkMode ? "border-white/10" : "border-slate-200"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-500">
                <ImageIcon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em]">Media Gallery</span>
              </div>
              <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                {approvedOnly ? "Select Approved Media" : "Select Media"}
              </h2>
              <p className={cn("text-xs", isDarkMode ? "text-white/45" : "text-slate-500")}>
                Pick from your existing gallery or upload a new file without leaving this flow.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className={cn(
                "p-2 rounded-xl transition-all shrink-0",
                isDarkMode
                  ? "text-white/50 hover:bg-white/10 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Toolbar: search + filter tabs + upload ── */}
          <div className={cn(
            "px-6 py-4 border-b space-y-3 shrink-0",
            isDarkMode ? "border-white/10" : "border-slate-200"
          )}>
            {/* Search + Upload */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4",
                  isDarkMode ? "text-white/30" : "text-slate-400"
                )} />
                <input
                  type="text"
                  placeholder="Search by filename or tags"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all",
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400"
                  )}
                />
              </div>
              <label
                className={cn(
                  "h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border-2 border-dashed",
                  isDragOver ? "border-emerald-300" : "border-transparent",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  await uploadSelectedFile(droppedFile);
                }}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                  accept={ACCEPTED_TYPES}
                />
              </label>
              <div className={cn("flex items-center rounded-xl border px-1", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
                <button type="button" onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg", viewMode === "grid" ? "text-emerald-500" : (isDarkMode ? "text-white/50" : "text-slate-500"))}><Grid3X3 size={14} /></button>
                <button type="button" onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg", viewMode === "list" ? "text-emerald-500" : (isDarkMode ? "text-white/50" : "text-slate-500"))}><List size={14} /></button>
              </div>
            </div>
            {uploading && (
              <div className="w-full">
                <div className={cn("h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-white/10" : "bg-slate-200")}>
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Filter tabs — replaces dropdown */}
            <div className="flex gap-2 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setFilterType(tab.id); setPage(1); }}
                  style={
                    filterType === tab.id
                      ? {
                          background: "#25d366",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }
                      : {
                          background: "transparent",
                          color: "#888",
                          borderRadius: 6,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 500,
                          border: "1px solid #444",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grid area ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Loading: 6 skeleton cards */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>

            /* Empty state */
            ) : mediaAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <span style={{ fontSize: 32, lineHeight: 1, color: isDarkMode ? "#94a3b8" : "#64748b" }}>No files</span>
                <div>
                  <p className={cn("text-sm font-semibold", isDarkMode ? "text-white/60" : "text-slate-700")}>
                    No media found
                  </p>
                  <p className={cn("text-xs mt-1", isDarkMode ? "text-white/35" : "text-slate-500")}>
                    {EMPTY_SUBTITLE[filterType]}
                  </p>
                </div>
              </div>

            /* Media grid */
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {mediaAssets.map((asset) => {
                  const isSelected = selectedAsset?.media_asset_id === asset.media_asset_id
                    || selectedAsset?.id === asset.id;
                  const assetId   = asset.media_asset_id || String(asset.id);
                  const hasPreview = asset.file_type === "image" && !!asset.preview_url;
                  const thumbBg   = hasPreview ? undefined : (THUMB_BG[asset.file_type] || "#1a1a1a");
                  const canDelete = !asset.is_approved;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className="group cursor-pointer"
                      style={{
                        borderRadius: 10,
                        overflow: "hidden",
                        border: isSelected
                          ? "2px solid #25d366"
                          : isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37,211,102,0.2)" : "none",
                        background: isDarkMode ? "#18181c" : "#fff",
                        transition: "border 0.15s, box-shadow 0.15s",
                      }}
                    >
                      {/* ── Thumbnail ── */}
                      <div
                        style={{
                          aspectRatio: "1/1",
                          position: "relative",
                          background: thumbBg,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 40,
                          userSelect: "none",
                        }}
                      >
                        {hasPreview ? (
                          <img
                            src={asset.preview_url!}
                            alt={asset.file_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          TYPE_EMOJI[asset.file_type] || "FILE"
                        )}

                        {/* Selected checkmark overlay */}
                        {isSelected && (
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(37,211,102,0.18)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}>
                            <Check size={30} />
                          </div>
                        )}

                        {/* Type badge — top left */}
                        {TYPE_BADGE[asset.file_type] && (
                          <span style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            background: TYPE_BADGE[asset.file_type].bg,
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 5px",
                            borderRadius: 3,
                            letterSpacing: "0.04em",
                          }}>
                            {TYPE_BADGE[asset.file_type].label}
                          </span>
                        )}

                        {/* Approval badge — top right */}
                        <span style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: asset.is_approved ? "#25d366" : "#f5a623",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 3,
                        }}>
                          {asset.is_approved ? "Approved" : "Pending"}
                        </span>
                      </div>

                      {/* ── Card info ── */}
                      <div style={{ padding: "8px 10px" }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isDarkMode ? "#fff" : "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: 4,
                          }}
                          title={asset.file_name}
                        >
                          {asset.file_name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              color: TYPE_LABEL_COLOR[asset.file_type] || "#888",
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}>
                              {asset.file_type}
                            </span>
                            <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>
                              {formatFileSize(asset.file_size)}
                            </span>
                          </div>

                          {/* Delete button — visible on card hover, only if not approved */}
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewAsset(asset);
                              }}
                              style={{
                                background: "transparent",
                                border: "1px solid #333",
                                borderRadius: 5,
                                padding: "4px 8px",
                                fontSize: 11,
                                color: "#666",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.borderColor = "#555";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#666";
                                e.currentTarget.style.borderColor = "#333";
                              }}
                              title="View"
                            >
                              <Eye size={12} />
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAsset(assetId, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  padding: "2px 4px",
                                  color: "#ef4444",
                                  borderRadius: 4,
                                  lineHeight: 0,
                                }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {mediaAssets.map((asset) => {
                  const assetId = asset.media_asset_id || String(asset.id);
                  return (
                    <div key={asset.id} className={cn("rounded-xl border p-3 flex items-center justify-between gap-3", isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white")}>
                      <div className="min-w-0" onClick={() => setSelectedAsset(asset)}>
                        <p className={cn("text-sm font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")}>{asset.file_name}</p>
                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                          {asset.file_type.toUpperCase()} • {formatFileSize(asset.file_size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPreviewAsset(asset)} className={cn("text-xs px-2 py-1 rounded border", isDarkMode ? "border-white/20 text-white/70" : "border-slate-300 text-slate-700")}>View</button>
                        {!asset.is_approved && (
                          <button type="button" onClick={(e) => handleDeleteAsset(assetId, e as any)} className="text-xs px-2 py-1 rounded border border-red-400 text-red-500">Delete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className={cn(
            "px-6 py-4 border-t shrink-0",
            isDarkMode ? "border-white/10" : "border-slate-200"
          )}>
            {totalPages > 1 && (
              <div className="mb-3">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={totalItems}
                  itemsPerPage={20}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              {/* Cancel — closes modal, does NOT call onSelect */}
              <button
                onClick={handleCancel}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isDarkMode
                    ? "bg-white/5 text-white hover:bg-white/10"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Cancel
              </button>

              {/* Select Media — disabled styling when no selection */}
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedAsset}
                style={{
                  background:    selectedAsset ? "#25d366" : "#333",
                  color:         selectedAsset ? "#fff"    : "#666",
                  cursor:        selectedAsset ? "pointer" : "not-allowed",
                  padding:       "10px 20px",
                  borderRadius:  12,
                  fontSize:      14,
                  fontWeight:    600,
                  border:        "none",
                  transition:    "background 0.15s, color 0.15s",
                }}
              >
                Select Media
              </button>
            </div>
          </div>

        </GlassCard>
      </div>

      <MediaAssetPreviewModal
        isOpen={!!previewAsset}
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
        onDelete={deleteAssetById}
        fromPicker
        onSelect={(asset) => {
          onSelect(asset);
          setPreviewAsset(null);
          onClose();
        }}
      />
    </>
  );
};

"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Image as ImageTypeIcon,
  ImageIcon,
  Music,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchMediaAssets, uploadMedia, deleteMediaAsset, MediaAsset } from "../../services/gallery/galleryApi";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glassCard";
import { Pagination } from "@/components/ui/pagination";

interface GalleryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  approvedOnly?: boolean;
  fileType?: "image" | "video" | "document" | "audio" | "all";
}

export const GalleryPicker: React.FC<GalleryPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  approvedOnly = false,
  fileType = "all",
}) => {
  const { isDarkMode } = useTheme();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>(fileType);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [uploading, setUploading] = useState(false);

  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);

  const loadMediaAssets = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      const response = await fetchMediaAssets({
        tenant_id: tenantId,
        type: filterType === "all" ? undefined : filterType,
        search: searchTerm || undefined,
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
  }, [approvedOnly, filterType, page, searchTerm, tenantId]);

  useEffect(() => {
    if (isOpen) {
      loadMediaAssets();
    }
  }, [isOpen, loadMediaAssets]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAsset(null);
      setSearchTerm("");
      setPage(1);
      setFilterType(fileType);
    }
  }, [isOpen, fileType]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tenantId) return;

    setUploading(true);
    try {
      await uploadMedia(file, tenantId, {
        folder: "root",
        tags: [],
      });
      toast.success("Media uploaded successfully");
      await loadMediaAssets();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleConfirmSelection = () => {
    if (!selectedAsset) return;
    onSelect(selectedAsset);
    onClose();
  };

  const handleDeleteAsset = async (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this media asset?")) {
      return;
    }

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

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageTypeIcon className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <GlassCard
        isDarkMode={isDarkMode}
        className={cn(
          "w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden rounded-[2rem]",
          isDarkMode ? "bg-[#111114]/95 border-white/10" : "bg-white/95 border-slate-200"
        )}
      >
        <div className={cn(
          "flex items-start justify-between gap-4 px-6 py-5 border-b",
          isDarkMode ? "border-white/10" : "border-slate-200"
        )}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-500">
              <ImageIcon size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em]">
                Media Gallery
              </span>
            </div>
            <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
              {approvedOnly ? "Select Approved Media" : "Select Media"}
            </h2>
            <p className={cn("text-xs", isDarkMode ? "text-white/45" : "text-slate-500")}>
              Pick from your existing gallery or upload a new file without leaving this flow.
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl transition-all",
              isDarkMode ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={cn(
          "px-6 py-5 border-b space-y-4",
          isDarkMode ? "border-white/10" : "border-slate-200"
        )}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4",
                  isDarkMode ? "text-white/30" : "text-slate-400"
                )}
              />
              <input
                type="text"
                placeholder="Search by filename or tags"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all",
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400"
                )}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className={cn(
                "px-4 py-3 rounded-xl border text-sm outline-none transition-all min-w-[170px]",
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              )}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="audio">Audio</option>
            </select>
            <label className="h-12 px-5 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Uploading..." : "Upload Media"}</span>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className={cn("text-sm", isDarkMode ? "text-white/50" : "text-slate-500")}>
                Loading media assets...
              </div>
            </div>
          ) : mediaAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-white/5" : "bg-slate-100"
              )}>
                <ImageIcon className={cn("w-7 h-7", isDarkMode ? "text-white/20" : "text-slate-300")} />
              </div>
              <p className={cn("mt-4 text-sm font-semibold", isDarkMode ? "text-white/60" : "text-slate-700")}>
                No media assets found
              </p>
              <p className={cn("mt-1 text-xs", isDarkMode ? "text-white/35" : "text-slate-500")}>
                Try a different filter or upload your first media file.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {mediaAssets.map((asset) => {
                const isSelected = selectedAsset?.media_asset_id === asset.media_asset_id || selectedAsset?.id === asset.id;

                return (
                  <button
                    type="button"
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={cn(
                      "relative text-left rounded-2xl border p-4 transition-all duration-200",
                      isSelected
                        ? isDarkMode
                          ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                          : "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
                        : isDarkMode
                          ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center",
                        isSelected
                          ? isDarkMode ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"
                          : isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-600"
                      )}>
                        {getFileTypeIcon(asset.file_type)}
                      </div>
                      <div className="flex items-center gap-2">
                        {asset.is_approved && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {!asset.is_approved && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAsset(asset.media_asset_id || asset.id, e)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              isDarkMode ? "bg-red-500/10 text-red-300 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                            )}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className={cn("text-sm font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")} title={asset.file_name}>
                        {asset.file_name}
                      </p>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className={cn("capitalize", isDarkMode ? "text-white/45" : "text-slate-500")}>
                          {asset.file_type}
                        </span>
                        <span className={cn(isDarkMode ? "text-white/45" : "text-slate-500")}>
                          {formatFileSize(asset.file_size)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={cn(
          "px-6 py-4 border-t space-y-4",
          isDarkMode ? "border-white/10" : "border-slate-200"
        )}>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={20}
              isDarkMode={isDarkMode}
            />
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedAsset}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Select Media
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

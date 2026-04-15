"use client";

import React from "react";
import { Search, Upload, Grid3X3, List, X, Image as ImgIcon, Video, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterType, ViewMode, FILTER_TABS, GalleryFilters } from "./types";

interface Props {
  filters: GalleryFilters;
  viewMode: ViewMode;
  isDarkMode: boolean;
  uploading: boolean;
  uploadProgress: number;
  isDragOver: boolean;
  totalItems: number;
  fileType: FilterType;
  onFiltersChange: (patch: Partial<GalleryFilters>) => void;
  onViewMode: (v: ViewMode) => void;
  onUploadTrigger: (event?: React.SyntheticEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  all: <Layers size={11} />,
  image: <ImgIcon size={11} />,
  video: <Video size={11} />,
  document: <FileText size={11} />,
};

export function GalleryToolbar({
  filters, viewMode, isDarkMode, uploading, uploadProgress,
  isDragOver, totalItems, fileType,
  onFiltersChange, onViewMode, onUploadTrigger, onDragOver, onDragLeave, onDrop,
}: Props) {
  return (
    <div className={cn("px-5 pt-3 pb-0 shrink-0", isDarkMode ? "bg-[#0c0d11]" : "bg-white")}>

      {/* ── Row 1: Search + Upload + View toggle ──────────────────────── */}
      <div className="flex gap-2 items-center mb-3">

        {/* Search */}
        <div className="flex-1 relative">
          <Search
            size={14}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
              isDarkMode ? "text-white/25" : "text-slate-400"
            )}
          />
          <input
            type="text"
            placeholder="Search files…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
            className={cn(
              "w-full pl-9 pr-8 py-2 rounded-xl border text-sm outline-none transition-all duration-200",
              isDarkMode
                ? "bg-white/4 border-white/8 text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:bg-white/6 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.07)]"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400/60 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.07)]"
            )}
            aria-label="Search media"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ search: "", page: 1 })}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all",
                isDarkMode ? "text-white/30 hover:text-white/70 hover:bg-white/10" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              )}
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Upload */}
        <button
          type="button"
          className={cn(
            "h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5",
            "cursor-pointer transition-all whitespace-nowrap select-none",
            "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-500/20",
            isDragOver && "ring-2 ring-emerald-300 scale-[1.03]",
            uploading && "opacity-60 cursor-not-allowed pointer-events-none"
          )}
          onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onUploadTrigger}
        >
          <Upload size={13} />
          <span>{uploading ? `${uploadProgress}%` : "Upload"}</span>
        </button>

        {/* View toggle */}
        <div className={cn(
          "flex items-center rounded-xl border p-0.5 gap-0.5 shrink-0",
          isDarkMode ? "border-white/8 bg-white/[0.03]" : "border-slate-200 bg-slate-50"
        )}>
          {(["grid", "list"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewMode(v)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === v
                  ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-white text-emerald-600 shadow-sm"
                  : isDarkMode ? "text-white/30 hover:text-white/65" : "text-slate-400 hover:text-slate-600"
              )}
              title={v === "grid" ? "Grid view" : "List view"}
            >
              {v === "grid" ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Upload progress bar ─────────────────────────────────────────── */}
      {uploading && (
        <div className={cn("h-0.5 rounded-full overflow-hidden mb-3", isDarkMode ? "bg-white/8" : "bg-slate-200")}>
          <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {/* ── Row 2: Filter tabs ─────────────────────────────────────────── */}
      <div className={cn(
        "flex items-center gap-1 border-b pb-0 overflow-x-auto no-scrollbar",
        isDarkMode ? "border-white/6" : "border-slate-200"
      )}>
        {FILTER_TABS.map((tab) => {
          const restricted = fileType !== "all" && tab.id !== fileType;
          const active = filters.filterType === tab.id;
          const icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              disabled={restricted}
              onClick={() => !restricted && onFiltersChange({ filterType: tab.id, page: 1 })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-px",
                active
                  ? "border-emerald-500 text-emerald-500"
                  : restricted
                    ? isDarkMode ? "border-transparent text-white/15 cursor-not-allowed" : "border-transparent text-slate-300 cursor-not-allowed"
                    : isDarkMode
                      ? "border-transparent text-white/40 hover:text-white/75"
                      : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {icon}
              {tab.label}
            </button>
          );
        })}

        {totalItems > 0 && (
          <span className={cn("ml-auto text-[11px] px-1 shrink-0 pb-2", isDarkMode ? "text-white/20" : "text-slate-400")}>
            {totalItems.toLocaleString()} file{totalItems !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

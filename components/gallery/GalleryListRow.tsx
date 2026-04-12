"use client";

import React, { useState } from "react";
import { Eye, Trash2, Download, FileText, Image as ImageIcon, Video, ChevronUp, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaAsset } from "@/services/gallery/galleryApi";
import { TYPE_COLOR, formatFileSize, formatDate, forceDownload } from "./types";

interface Props {
  asset:         MediaAsset;
  isSelected:    boolean;
  isDisabled:    boolean;
  isDarkMode:    boolean;
  showCheckbox?: boolean;
  onSelect:      (asset: MediaAsset) => void;
  onPreview:     (asset: MediaAsset) => void;
  onDelete:      (assetId: string, e: React.MouseEvent) => void;
}

const FileIcon = ({ type, color }: { type: string; color: string }) => {
  const cls = "w-5 h-5";
  if (type === "image")    return <ImageIcon className={cls} style={{ color }} />;
  if (type === "video")    return <Video     className={cls} style={{ color }} />;
  return                          <FileText  className={cls} style={{ color }} />;
};

const COL_CHECK = "w-10 shrink-0";
const COL_FILE  = "flex-1 min-w-[200px]";
const COL_TYPE  = "w-36 hidden sm:block";
const COL_SIZE  = "w-28 hidden md:block";
const COL_DATE  = "w-40 hidden lg:block";
const COL_ACTS  = "w-28 shrink-0";

const HEADER_COLS: { label: string; cls: string; align?: string; sortable?: boolean }[] = [
  { label: "Product",      cls: COL_FILE, sortable: false },
  { label: "Status",       cls: COL_TYPE, sortable: false, align: "text-center" },
  { label: "File Size",    cls: COL_SIZE, sortable: false },
  { label: "Date Added",   cls: COL_DATE, sortable: false },
  { label: "Actions",      cls: COL_ACTS, align: "text-right" },
];

export function GalleryListHeader({ isDarkMode, showCheckbox = false }: { isDarkMode: boolean; showCheckbox?: boolean }) {
  const labelCls = cn(
    "text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors",
    isDarkMode ? "text-white/40 group-hover:text-white/70" : "text-slate-500 group-hover:text-slate-800"
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-3 border-b sticky top-0 z-10",
        isDarkMode ? "bg-[#0f1015] border-white/[0.06]" : "bg-[#f8fafc] border-slate-200"
      )}
    >
      {/* spacer / checkbox header — only shown in picker */}
      {showCheckbox && <div className={COL_CHECK} />}

      {HEADER_COLS.map(({ label, cls, align, sortable }) => (
        <div
          key={label}
          className={cn(cls, align, "group cursor-pointer")}
        >
          <span className={cn(labelCls, align === 'text-center' && 'justify-center', align === 'text-right' && 'justify-end')}>
            {label}
            {sortable && (
              <div className="flex flex-col -space-y-1 opacity-20 group-hover:opacity-100 transition-opacity">
                <ChevronUp size={10} strokeWidth={3} />
                <ChevronDown size={10} strokeWidth={3} />
              </div>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GalleryListRow({
  asset, isSelected, isDisabled, isDarkMode,
  showCheckbox = false,
  onSelect, onPreview, onDelete,
}: Props) {
  const [imgError, setImgError] = useState(false);

  const assetId     = asset.media_asset_id || String(asset.id);
  const canDelete   = true;
  const color       = TYPE_COLOR[asset.file_type] || "#94a3b8";
  const downloadUrl = asset.preview_url || asset.media_url || asset.url || "";
  const hasThumb    = asset.file_type === "image" && !!asset.preview_url && !imgError;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-6 py-4.5 border-b transition-all duration-150 overflow-hidden relative",
        isDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        isSelected
          ? isDarkMode
            ? "bg-emerald-500/5 border-l-2 border-l-emerald-500"
            : "bg-emerald-50/40 border-l-2 border-l-emerald-500"
          : "bg-transparent hover:bg-white/2",
        isDarkMode ? "border-white/[0.04]" : "border-slate-100"
      )}
      onClick={() => !isDisabled && onSelect(asset)}
    >
      {/* Selected Indicator Bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-emerald-500" />
      )}

      {/* Checkbox — only in picker mode */}
      {showCheckbox && (
        <div className={COL_CHECK}>
          <div className={cn(
            "w-4.5 h-4.5 rounded border transition-all flex items-center justify-center",
            isSelected
              ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20"
              : isDarkMode
                ? "border-white/10 bg-white/5 group-hover:border-white/20"
                : "border-slate-300 bg-white group-hover:border-slate-400"
          )}>
            {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
          </div>
        </div>
      )}


      {/* Avatar Content */}
      <div className={cn(COL_FILE, "flex items-center gap-3")}>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border",
            isDarkMode ? "border-white/8" : "border-slate-200"
          )}
          style={{
            background: hasThumb
              ? undefined
              : color + "18",
          }}
        >
          {hasThumb ? (
            <img
              src={asset.preview_url!}
              alt={asset.file_name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <FileIcon type={asset.file_type} color={color} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn("text-[13px] font-semibold truncate leading-tight", isDarkMode ? "text-white/90" : "text-slate-800")}
            title={asset.file_name}
          >
            {asset.file_name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn("text-[11px]", isDarkMode ? "text-white/30" : "text-slate-500")}>
              {asset.file_type === 'image' ? 'Media Asset' : asset.file_type}
            </span>
          </div>
        </div>
      </div>

      {/* Type badge */}
      <div className={cn(COL_TYPE, "hidden sm:flex items-center justify-center")}>
        <span
          className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full border",
            asset.is_approved
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          )}
        >
          {asset.is_approved ? "Approved" : "Pending"}
        </span>
      </div>

      {/* Size */}
      <div className={cn(COL_SIZE, "text-[12px] font-mono tabular-nums", isDarkMode ? "text-white/40" : "text-slate-500")}>
        {formatFileSize(asset.file_size)}
      </div>

      {/* Date */}
      <div className={cn(COL_DATE, "text-[12px]", isDarkMode ? "text-white/30" : "text-slate-400")}>
        {formatDate(asset.createdAt || asset.created_at)}
      </div>

      {/* Actions */}
      <div
        className={cn(COL_ACTS, "flex items-center justify-end gap-1")}
        onClick={(e) => e.stopPropagation()}
      >
        {!isDisabled && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={() => onPreview(asset)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                isDarkMode
                  ? "text-white/35 hover:bg-white/8 hover:text-white/80"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
              title="Preview"
            >
              <Eye size={14} />
            </button>

            {downloadUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); forceDownload(downloadUrl, asset.file_name); }}
                className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isDarkMode
                    ? "text-white/35 hover:bg-white/8 hover:text-white/80"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                )}
                title="Download"
              >
                <Download size={14} />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={(e) => onDelete(assetId, e)}
                className="p-1.5 rounded-lg text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

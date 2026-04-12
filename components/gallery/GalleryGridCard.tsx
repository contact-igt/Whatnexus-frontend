"use client";

import React, { useState } from "react";
import { Check, Eye, Trash2, Download, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaAsset } from "@/services/gallery/galleryApi";
import { TYPE_BADGE, TYPE_COLOR, THUMB_BG, TYPE_EMOJI, formatFileSize, formatDate, forceDownload } from "./types";

interface Props {
  asset: MediaAsset;
  isSelected: boolean;
  isDisabled: boolean;
  isDarkMode: boolean;
  isDeleted?: boolean;
  onSelect: (asset: MediaAsset) => void;
  onPreview: (asset: MediaAsset) => void;
  onDelete: (assetId: string, e: React.MouseEvent) => void;
  onRestore?: (assetId: string, e: React.MouseEvent) => void;
}

export function GalleryGridCard({
  asset, isSelected, isDisabled, isDarkMode,
  isDeleted = false,
  onSelect, onPreview, onDelete, onRestore,
}: Props) {
  const [imgError, setImgError] = useState(false);

  const assetId = asset.media_asset_id || String(asset.id);
  const hasPreview = asset.file_type === "image" && !!asset.preview_url && !imgError;
  const canDelete = true;
  const badge = TYPE_BADGE[asset.file_type];
  const color = TYPE_COLOR[asset.file_type] || "#94a3b8";
  const downloadUrl = asset.preview_url || asset.media_url || asset.url || "";

  return (
    <div
      onClick={() => !isDisabled && onSelect(asset)}
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-200",
        isDisabled
          ? "cursor-not-allowed"
          : "cursor-pointer",
        isSelected
          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-transparent shadow-xl shadow-emerald-500/25"
          : isDisabled
            ? isDarkMode
              ? "border border-white/5 opacity-60"
              : "border border-slate-200 opacity-60"
            : isDarkMode
              ? "border border-white/[0.07] hover:border-white/18 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5"
              : "border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5"
      )}
      style={{ background: isDarkMode ? "#0f1015" : "#ffffff" }}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "1/1",
          background: hasPreview
            ? undefined
            : isDarkMode
              ? (THUMB_BG[asset.file_type] || "#16171e")
              : "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
        }}
      >
        {hasPreview ? (
          <img
            src={asset.preview_url!}
            alt={asset.file_name}
            className="w-full h-full object-cover block transition-all duration-500 group-hover:scale-105 group-hover:blur-sm"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="select-none opacity-80 transition-all duration-500 group-hover:blur-sm">{TYPE_EMOJI[asset.file_type] || "📁"}</span>
        )}

        {/* Bottom gradient for readability */}
        {hasPreview && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
        )}

        {/* ── Hover overlay ───────────────────────────────────────────────── */}
        {!isDisabled && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300",
            "bg-black/0 group-hover:bg-black/40 opacity-0 group-hover:opacity-100 z-20"
          )}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPreview(asset); }}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
              title="Preview"
            >
              <Eye size={15} />
            </button>

            {downloadUrl && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); forceDownload(downloadUrl, asset.file_name); }}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                title="Download"
              >
                <Download size={15} />
              </button>
            )}

            {isDeleted ? (
              onRestore && (
                <button
                  type="button"
                  onClick={(e) => onRestore(assetId, e)}
                  className="w-9 h-9 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                  title="Restore"
                >
                  <RotateCcw size={15} />
                </button>
              )
            ) : (
              canDelete && (
                <button
                  type="button"
                  onClick={(e) => onDelete(assetId, e)}
                  className="w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )
            )}
          </div>
        )}

        {/* ── Selected tint overlay ─────────────────────────────────────── */}
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/15 ring-2 ring-inset ring-emerald-500/60 pointer-events-none rounded-t-2xl" />
        )}

        {/* ── Pending disabled overlay ──────────────────────────────────── */}
        {isDisabled && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm bg-amber-500/85 text-white flex items-center gap-1">
              <Clock size={10} strokeWidth={3} />
              Pending
            </span>
          </div>
        )}

        {/* ── Type badge — top-left ──────────────────────────────────────── */}
        {badge && !isSelected && !isDisabled && (
          <span
            className="absolute top-2.5 left-2.5 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm"
            style={{ background: badge.color + "dd" }}
          >
            {badge.label}
          </span>
        )}

        {/* ── Selected checkmark — top-right ────────────────────────────── */}
        {isSelected ? (
          <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 flex items-center justify-center pointer-events-none z-10">
            <Check size={13} strokeWidth={3} className="text-white" />
          </div>
        ) : asset.is_approved && (
          /* ── Approval badge — top-right (approved assets only) ───────── */
          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm bg-emerald-500/85 text-white">
            ✓ Approved
          </span>
        )}
      </div>

      {/* ── Card info ─────────────────────────────────────────────────────── */}
      <div className={cn(
        "px-3.5 py-3 space-y-1.5 border-t transition-colors duration-200",
        isSelected
          ? isDarkMode ? "border-emerald-500/25 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50/60"
          : isDarkMode ? "border-white/6" : "border-slate-100"
      )}>
        <p
          className={cn("text-[12px] font-semibold truncate leading-tight", isDarkMode ? "text-white/90" : "text-slate-800")}
          title={asset.file_name}
        >
          {asset.file_name}
        </p>
        <div className="flex items-center justify-between gap-1">
          {isDisabled ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 flex items-center gap-1">
              <Clock size={9} />
              Pending
            </span>
          ) : (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md capitalize"
              style={{ color, background: color + "18" }}
            >
              {asset.file_type}
            </span>
          )}
          <span className={cn("text-[11px] font-mono tabular-nums", isDarkMode ? "text-white/35" : "text-slate-400")}>
            {formatFileSize(asset.file_size)}
          </span>
        </div>
        <p className={cn("text-[10px]", isDarkMode ? "text-white/22" : "text-slate-400")}>
          {formatDate(asset.createdAt || asset.created_at)}
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X, Download, Trash2, Copy, Check, FileText, Image as ImageIcon,
  Video, Calendar, HardDrive, Tag, CheckCircle2, Clock,
} from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { MediaAsset } from "@/services/gallery/galleryApi";
import { formatFileSize, formatDate, forceDownload } from "./types";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

interface Props {
  asset:      MediaAsset | null;
  isOpen:     boolean;
  isDarkMode: boolean;
  fromPicker: boolean;
  onClose:    () => void;
  onDelete?:  (assetId: string) => Promise<void> | void;
  onSelect?:  (asset: MediaAsset) => void;
}

const isValidUrl = (v?: string | null) =>
  !!v && /^(https?:\/\/|blob:|\/)/i.test(v);

function CopyButton({
  value, isDarkMode,
}: { value: string; isDarkMode: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all flex-shrink-0",
        copied
          ? "bg-emerald-500/20 text-emerald-500"
          : isDarkMode
            ? "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function InfoRow({
  icon, label, value, isDarkMode,
}: { icon: React.ReactNode; label: string; value: string; isDarkMode: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={cn("flex-shrink-0", isDarkMode ? "text-white/30" : "text-slate-400")}>{icon}</span>
      <span className={cn("text-xs w-24 flex-shrink-0", isDarkMode ? "text-white/40" : "text-slate-500")}>{label}</span>
      <span className={cn("text-xs font-medium flex-1 text-right truncate", isDarkMode ? "text-white/80" : "text-slate-700")} title={value}>
        {value}
      </span>
    </div>
  );
}

export function MediaPreviewDrawer({
  asset, isOpen, isDarkMode, fromPicker,
  onClose, onDelete, onSelect,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const canDelete   = !!asset;
  const downloadUrl = useMemo(() => {
    if (!asset) return "";
    return isValidUrl(asset.preview_url) ? asset.preview_url!
      : isValidUrl(asset.media_url)  ? asset.media_url!
      : isValidUrl(asset.url)        ? asset.url!
      : "";
  }, [asset]);

  const imageUrl = useMemo(() => {
    if (!asset || asset.file_type !== "image") return "";
    return downloadUrl;
  }, [asset, downloadUrl]);

  const videoUrl = useMemo(() => {
    if (!asset || asset.file_type !== "video") return "";
    const src = asset.preview_url || asset.media_url || asset.url || asset.media_handle;
    return isValidUrl(src) ? src! : "";
  }, [asset]);

  const confirmDelete = async () => {
    if (!asset || !onDelete) return;
    setDeleting(true);
    await onDelete(asset.media_asset_id || String(asset.id));
    setDeleting(false);
    setShowConfirm(false);
  };

  if (!mounted) return null;

  // Overlay + slide-in drawer
  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-1000 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 h-screen z-[1001] flex flex-col w-full max-w-[600px]",
          "transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
          isDarkMode ? "bg-black border-l border-white/[0.08]" : "bg-white border-l border-slate-200"
        )}
      >
        {!asset ? null : (
          <>
            {/* ── Drawer Header ─────────────────────────────────────────── */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4 border-b flex-shrink-0",
                isDarkMode ? "border-white/[0.08]" : "border-slate-200"
              )}
            >
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold uppercase tracking-wider mb-0.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                  Preview
                </p>
                <h3
                  className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-slate-900")}
                  title={asset.file_name}
                >
                  {asset.file_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 transition-all",
                  isDarkMode ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                )}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable body ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">

              {/* Media preview */}
              <div
                className={cn(
                  "mx-4 mt-4 rounded-xl overflow-hidden flex items-center justify-center",
                  isDarkMode ? "bg-[#0c0d11]" : "bg-slate-100"
                )}
                style={{ minHeight: 200, maxHeight: 280 }}
              >
                {asset.file_type === "image" && (
                  imageUrl
                    ? <img src={imageUrl} alt={asset.file_name} className="max-w-full max-h-[280px] object-contain" />
                    : <span className={cn("text-4xl font-bold", isDarkMode ? "text-white/10" : "text-slate-300")}>IMG</span>
                )}
                {asset.file_type === "video" && (
                  videoUrl
                    ? <video controls className="max-h-[280px] w-full rounded-xl"><source src={videoUrl} /></video>
                    : <span className={cn("text-4xl font-bold", isDarkMode ? "text-white/10" : "text-slate-300")}>VIDEO</span>
                )}
                {asset.file_type === "document" && (
                  asset.preview_url
                    ? <iframe src={`${asset.preview_url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[450px] border-0" title={asset.file_name} />
                    : <div className="flex flex-col items-center gap-2 py-10">
                        <FileText className={cn("w-12 h-12", isDarkMode ? "text-amber-400/40" : "text-amber-400")} strokeWidth={1} />
                        <span className={cn("text-sm font-semibold", isDarkMode ? "text-white/50" : "text-slate-600")}>
                          {asset.file_name}
                        </span>
                      </div>
                )}
              </div>

              {/* ── Details ──────────────────────────────────────────────── */}
              <div className="px-5 pt-4 pb-2">
                <p className={cn("text-[11px] font-semibold uppercase tracking-wider mb-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                  Details
                </p>
                <div className={cn("divide-y", isDarkMode ? "divide-white/[0.06]" : "divide-slate-100")}>
                  <InfoRow icon={<HardDrive size={13} />}  label="File size"  value={formatFileSize(asset.file_size)} isDarkMode={isDarkMode} />
                  <InfoRow icon={<Tag size={13} />}        label="MIME type"  value={asset.mime_type}                isDarkMode={isDarkMode} />
                  <InfoRow icon={<Calendar size={13} />}   label="Uploaded"   value={formatDate(asset.createdAt || asset.created_at)}   isDarkMode={isDarkMode} />
                  <InfoRow
                    icon={asset.is_approved ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Clock size={13} className="text-amber-500" />}
                    label="Status"
                    value={asset.is_approved ? "Approved" : "Pending approval"}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* ── Removed media and URL handle sections per user request ───────────────────────────────────────── */}
            </div>

            {/* ── Footer actions ─────────────────────────────────────────── */}
            <div
              className={cn(
                "px-5 py-4 border-t flex items-center justify-between gap-3 flex-shrink-0",
                isDarkMode ? "border-white/[0.08]" : "border-slate-200"
              )}
            >
              <div className="flex items-center gap-2">
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={13} />
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}

                {downloadUrl && (
                  <button
                    type="button"
                    onClick={() => forceDownload(downloadUrl, asset.file_name)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                      isDarkMode
                        ? "text-white/60 border border-white/10 hover:bg-white/[0.07] hover:text-white"
                        : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <Download size={13} />
                    Download
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                    isDarkMode
                      ? "text-white/50 hover:bg-white/[0.07] hover:text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  Close
                </button>

                {fromPicker && onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(asset)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Media Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleting}
        isDarkMode={isDarkMode}
      />
    </>
    , document.body);
}

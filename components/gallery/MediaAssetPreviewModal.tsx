"use client";

import { useMemo, useState } from "react";
import { MediaAsset } from "@/services/gallery/galleryApi";

interface MediaAssetPreviewModalProps {
  isOpen: boolean;
  asset: MediaAsset | null;
  onClose: () => void;
  onDelete?: (assetId: string) => Promise<void> | void;
  fromPicker?: boolean;
  onSelect?: (asset: MediaAsset) => void;
}

const isLikelyUrl = (value?: string | null) => {
  if (!value) return false;
  return /^(https?:\/\/|blob:|\/)/i.test(value);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getUsageCount = (value: unknown): number => {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
};

export function MediaAssetPreviewModal({
  isOpen,
  asset,
  onClose,
  onDelete,
  fromPicker = false,
  onSelect,
}: MediaAssetPreviewModalProps) {
  const [copiedKey, setCopiedKey] = useState<"handle" | "url" | null>(null);

  const canDelete = useMemo(() => {
    return !!asset && !asset.is_approved;
  }, [asset]);

  const playableVideoUrl = useMemo(() => {
    if (!asset || asset.file_type !== "video") return "";
    const source = asset.preview_url || asset.media_url || asset.url || asset.media_handle;
    return isLikelyUrl(source) ? source : "";
  }, [asset]);

  const downloadableUrl = useMemo(() => {
    if (!asset) return "";
    const source = asset.preview_url || asset.media_url || asset.url || "";
    return isLikelyUrl(source) ? source : "";
  }, [asset]);

  const imageUrl = useMemo(() => {
    if (!asset || asset.file_type !== "image") return "";
    const source = asset.preview_url || asset.media_url || asset.url || "";
    return isLikelyUrl(source) ? source : "";
  }, [asset]);

  const templateUsageCount = getUsageCount(asset?.templates_used);
  const campaignUsageCount = getUsageCount(asset?.campaigns_used);

  const copyValue = async (value: string, key: "handle" | "url") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleDeleteClick = async () => {
    if (!asset || !onDelete) return;
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    await onDelete(asset.media_asset_id || String(asset.id));
    onClose();
  };

  if (!isOpen || !asset) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f1115",
          border: "1px solid #22252b",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 24,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={asset.file_name}
          >
            {asset.file_name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#171a21",
              border: "none",
              color: "#7f8794",
              width: 28,
              height: 28,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            X
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          {asset.file_type === "image" && (
            imageUrl ? (
              <img
                src={imageUrl}
                alt={asset.file_name}
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  background: "#111",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                  background: "#0a0a0a",
                  borderRadius: 8,
                  color: "#666",
                }}
              >
                <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>IMG</span>
                <span style={{ color: "#fff" }}>Image preview not available</span>
              </div>
            )
          )}

          {asset.file_type === "video" && (
            playableVideoUrl ? (
              <video controls width="100%" style={{ maxHeight: 300, background: "#111", borderRadius: 8 }}>
                <source src={playableVideoUrl} />
              </video>
            ) : (
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                  background: "#0a0a0a",
                  borderRadius: 8,
                  color: "#666",
                  textAlign: "center",
                  padding: 16,
                }}
              >
                <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>VID</span>
                <span style={{ color: "#fff" }}>Video preview not available</span>
                <span style={{ fontSize: 12 }}>
                  {asset.media_handle
                    ? "Use media handle to send via WhatsApp"
                    : "Playable preview is unavailable"}
                </span>
              </div>
            )
          )}

          {asset.file_type === "document" && (
            asset.preview_url ? (
              <iframe src={asset.preview_url} width="100%" height="300px" style={{ border: "none", borderRadius: 8 }} />
            ) : (
              <div
                style={{
                  minHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                  background: "#0a0a0a",
                  borderRadius: 8,
                  color: "#666",
                  padding: 16,
                }}
              >
                <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>DOC</span>
                <span style={{ color: "#fff", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={asset.file_name}>
                  {asset.file_name}
                </span>
                {downloadableUrl && (
                  <a
                    href={downloadableUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 4,
                      color: "#000",
                      background: "#25d366",
                      borderRadius: 5,
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Download
                  </a>
                )}
              </div>
            )
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>File Name</span>
          <span style={{ color: "#fff", marginLeft: 8, textAlign: "right" }}>{asset.file_name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>Type</span>
          <span style={{ color: "#fff", marginLeft: 8, textAlign: "right" }}>{asset.mime_type}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>Size</span>
          <span style={{ color: "#fff", marginLeft: 8, textAlign: "right" }}>{formatFileSize(asset.file_size)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>Status</span>
          <span style={{ color: asset.is_approved ? "#25d366" : "#f5a623", marginLeft: 8, textAlign: "right" }}>
            {asset.is_approved ? "Approved" : "Pending"}
          </span>
        </div>

        <div style={{ marginTop: 10, color: "#7f8794", fontSize: 12 }}>WhatsApp Media Handle</div>
        <div style={{ background: "#0a0d12", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#25d366",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={asset.media_handle}
          >
            {asset.media_handle}
          </span>
          <button
            type="button"
            onClick={() => copyValue(asset.media_handle, "handle")}
            style={{
              background: "#25d366",
              color: "#000",
              border: "none",
              borderRadius: 5,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {copiedKey === "handle" ? "Copied!" : "Copy"}
          </button>
        </div>

        {asset.preview_url && (
          <>
            <div style={{ marginTop: 10, color: "#7f8794", fontSize: 12 }}>Preview URL</div>
            <div style={{ background: "#0a0d12", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, margin: "8px 0" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#25d366",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={asset.preview_url}
              >
                {asset.preview_url}
              </span>
              <button
                type="button"
                onClick={() => copyValue(asset.preview_url || "", "url")}
                style={{
                  background: "#25d366",
                  color: "#000",
                  border: "none",
                  borderRadius: 5,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {copiedKey === "url" ? "Copied!" : "Copy"}
              </button>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>Used in Templates</span>
          <span style={{ marginLeft: 8, textAlign: "right", color: templateUsageCount > 0 ? "#25d366" : "#7f8794" }}>
            {templateUsageCount > 0
              ? `Used in ${templateUsageCount} template${templateUsageCount > 1 ? "s" : ""}`
              : "Not used in any template"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e232d", fontSize: 13 }}>
          <span style={{ color: "#7f8794" }}>Used in Campaigns</span>
          <span style={{ marginLeft: 8, textAlign: "right", color: campaignUsageCount > 0 ? "#25d366" : "#7f8794" }}>
            {campaignUsageCount > 0
              ? `Used in ${campaignUsageCount} campaign${campaignUsageCount > 1 ? "s" : ""}`
              : "Not used in any campaign"}
          </span>
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                style={{
                  background: "transparent",
                  border: "1px solid #e74c3c",
                  color: "#e74c3c",
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #313846",
                color: "#7f8794",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {fromPicker && onSelect && (
              <button
                type="button"
                onClick={() => onSelect(asset)}
                style={{
                  background: "#25d366",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Select This Media
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Gallery Types ────────────────────────────────────────────────────

export type FilterType = "all" | "image" | "video" | "document";
export type ViewMode  = "grid" | "list";
export type SortField = "date" | "name" | "size";
export type SortDir   = "asc"  | "desc";

export interface GalleryFilters {
  filterType:    FilterType;
  search:        string;
  sortField:     SortField;
  sortDir:       SortDir;
  page:          number;
}

export const FILTER_TABS: { id: FilterType; label: string; emoji: string }[] = [
  { id: "all",      label: "All",       emoji: "🗂️" },
  { id: "image",    label: "Images",    emoji: "🖼️" },
  { id: "video",    label: "Videos",    emoji: "🎬" },
  { id: "document", label: "Documents", emoji: "📄" },
];

export const ACCEPT_MAP: Record<FilterType, string> = {
  all:      "image/jpeg,image/png,image/webp,video/mp4,video/3gpp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  image:    "image/jpeg,image/png,image/webp",
  video:    "video/mp4,video/3gpp",
  document: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  image:    { label: "IMG",   color: "#3b82f6" },
  video:    { label: "VIDEO", color: "#8b5cf6" },
  document: { label: "DOC",   color: "#f59e0b" },
};

export const TYPE_COLOR: Record<string, string> = {
  image:    "#60a5fa",
  video:    "#a78bfa",
  document: "#fbbf24",
};

export const THUMB_BG: Record<string, string> = {
  image:    "#1e2a3b",
  video:    "#1e1b2e",
  document: "#1e2a1e",
};

export const TYPE_EMOJI: Record<string, string> = {
  image:    "🖼️",
  video:    "🎬",
  document: "📄",
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso?: string | number | null): string {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return String(iso);
  }
}

export const forceDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed, using fallback:", error);
    window.open(url, "_blank");
  }
};

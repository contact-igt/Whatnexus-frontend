"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ImageIcon, Search, RefreshCw, X, HardDrive, CheckCircle,
  Clock, Upload, Grid3X3, List, FileText, Image as ImgIcon, Video,
} from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { PageTransition } from '@/components/ui/pageTransition';
import { useSelector } from 'react-redux';
import { fetchMediaAssets, fetchMediaStats, deleteMediaAsset, restoreMediaAsset, MediaAsset, uploadMedia } from '@/services/gallery/galleryApi';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { MediaPreviewDrawer } from '@/components/gallery/MediaPreviewDrawer';
import { GalleryGridCard } from '@/components/gallery/GalleryGridCard';
import { GalleryListRow, GalleryListHeader } from '@/components/gallery/GalleryListRow';
import { GridSkeletons, ListSkeletons } from '@/components/gallery/GallerySkeletons';
import { formatFileSize } from '@/components/gallery/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'all' | 'image' | 'video' | 'document' | 'approved' | 'pending' | 'deleted';
type ViewMode = 'grid' | 'list';

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'document', label: 'Documents' },
  { id: 'approved', label: 'Approved' },
  { id: 'pending', label: 'Pending' },
  { id: 'deleted', label: 'Deleted' },
];

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "video/mp4", "video/3gpp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, isDarkMode, onClick,
  colorStyles,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; isDarkMode: boolean;
  onClick?: () => void;
  colorStyles?: { bg: string; border: string; text: string; fill?: string; progress?: number; };
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(onClick && "cursor-pointer")}
    >
      <GlassCard
        isDarkMode={isDarkMode}
        className={cn(
          "p-6 transition-all",
          onClick && "hover:scale-[1.02] active:scale-[0.99]",
          colorStyles && isDarkMode ? cn(colorStyles.bg, colorStyles.border) : ""
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            colorStyles && isDarkMode ? colorStyles.text : (isDarkMode ? "text-white/40" : "text-slate-500")
          )}>
            {label}
          </span>
          <span className={cn(
            colorStyles && isDarkMode ? colorStyles.text : (isDarkMode ? "text-white/40" : "text-slate-400")
          )}>
            {icon}
          </span>
        </div>
        <p className={cn(
          "text-3xl font-bold",
          colorStyles && isDarkMode ? colorStyles.text : (isDarkMode ? "text-white" : "text-slate-900")
        )}>
          {value}
        </p>
        <p className={cn("text-xs mt-1", isDarkMode ? "text-white/40" : "text-slate-500")}>
          {sub}
        </p>
        {/* {colorStyles?.progress !== undefined && colorStyles?.fill && (
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", colorStyles.fill)}
              style={{ width: `${colorStyles.progress}%` }}
            />
          </div>
        )} */}
      </GlassCard>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const { isDarkMode } = useTheme();
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssets, setTotalAssets] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const [globalStats, setGlobalStats] = useState({
    totalAssets: 0,
    images: 0,
    videos: 0,
    docs: 0,
    approved: 0,
    pending: 0,
    totalSize: 0,
  });

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(searchQuery), 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadAssets = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const isDeletedTab = activeTab === 'deleted';
      const res = await fetchMediaAssets({
        tenant_id: tenantId,
        type: !isDeletedTab && !['all', 'approved', 'pending'].includes(activeTab) ? activeTab : undefined,
        search: debouncedQ || undefined,
        approved_only: !isDeletedTab && activeTab === 'approved' ? true : undefined,
        pending_only: !isDeletedTab && activeTab === 'pending' ? true : undefined,
        show_deleted: isDeletedTab ? true : undefined,
        page: currentPage,
        limit: 20,
      });
      setMediaAssets(res.data);
      setTotalPages(res.totalPages);
      setTotalAssets(res.total);
    } catch {
      toast.error("Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  }, [tenantId, activeTab, debouncedQ, currentPage]);

  const loadGlobalStats = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await fetchMediaStats();
      setGlobalStats({
        totalAssets: res.data.total,
        images: res.data.images,
        videos: res.data.videos,
        docs: res.data.documents,
        approved: res.data.approved,
        pending: res.data.pending,
        totalSize: res.data.totalSize,
      });
    } catch {
      console.error("Failed to load global media stats");
    }
  }, [tenantId]);

  useEffect(() => { loadAssets(); }, [loadAssets]);
  useEffect(() => { loadGlobalStats(); }, [loadGlobalStats]);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const uploadFile = async (file: File) => {
    if (!file || !tenantId) return;
    const mb = file.size / 1024 / 1024;
    const kb = file.size / 1024;
    if (file.type.startsWith('image/')) {
      if (kb < 5) { toast.error('Image too small. Min 5 KB.'); return; }
      if (mb > 2) { toast.error('Image too large. Max 2 MB.'); return; }
    } else if (file.type.startsWith('video/')) {
      if (kb < 10) { toast.error('Video too small. Min 10 KB.'); return; }
      if (mb > 10) { toast.error('Video too large. Max 10 MB.'); return; }
    } else {
      if (kb < 1) { toast.error('Doc too small. Min 1 KB.'); return; }
      if (mb > 10) { toast.error('Doc too large. Max 10 MB.'); return; }
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadMedia(file, tenantId, { folder: 'root', tags: [] }, setUploadProgress);
      toast.success('Upload successful!');
      await loadAssets();
      await loadGlobalStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteAsset = async (assetId: string) => {
    if (!tenantId) return;
    try {
      await deleteMediaAsset(assetId, tenantId);
      toast.success('Deleted successfully.');
      await loadAssets();
      await loadGlobalStats();
      if (previewAsset?.media_asset_id === assetId || String(previewAsset?.id) === assetId) {
        setDrawerOpen(false);
        setTimeout(() => setPreviewAsset(null), 300);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Delete failed.';
      const code = e?.response?.data?.error_code;
      if (code === 'ASSET_IN_USE') {
        toast.error(`Cannot delete: ${msg}`);
      } else if (code === 'NOT_FOUND') {
        toast.error('Asset not found. It may have already been deleted.');
      } else {
        toast.error(msg);
      }
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

  // ── Restore ────────────────────────────────────────────────────────────────
  const restoreAsset = async (assetId: string) => {
    if (!tenantId) return;
    try {
      await restoreMediaAsset(assetId);
      toast.success('Asset restored successfully.');
      await loadAssets();
      await loadGlobalStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Restore failed.');
    }
  };

  const handleRestoreFromCard = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRestoreId(assetId);
  };

  const confirmRestore = async () => {
    if (!restoreId) return;
    await restoreAsset(restoreId);
    setRestoreId(null);
  };

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const openDrawer = (asset: MediaAsset) => {
    setPreviewAsset(asset);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setPreviewAsset(null), 300);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageTransition>
      <div className="h-full overflow-y-auto px-6 md:px-10 py-8 space-y-7 max-w-[1600px] mx-auto pb-32 no-scrollbar">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-500">
              <ImageIcon size={15} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Media Management</span>
            </div>
            <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
              Media Library
            </h1>
            <p className={cn("text-sm", isDarkMode ? 'text-white/35' : 'text-slate-500')}>
              {totalAssets > 0 ? `${totalAssets.toLocaleString()} assets` : 'No assets yet'} · Manage and organize your media files
            </p>
          </div>

          {/* Upload CTA */}
          <label
            className={cn(
              "inline-flex h-11 items-center gap-2 px-5 rounded-xl font-bold text-xs uppercase tracking-wide",
              "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 cursor-pointer transition-all",
              "hover:bg-emerald-500 active:scale-95 border-2 border-dashed",
              isDragOver ? "border-emerald-300 scale-[1.02]" : "border-transparent",
              uploading && "opacity-60 pointer-events-none"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) await uploadFile(f);
            }}
          >
            <Upload size={14} />
            <span>{uploading ? `Uploading ${uploadProgress}%…` : 'Upload Media'}</span>
            <input
              type="file"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
              className="hidden"
              disabled={uploading}
              accept={ACCEPTED_TYPES}
            />
          </label>
        </div>

        {/* ── Upload Progress ────────────────────────────────────────────────── */}
        {uploading && (
          <div className={cn("h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-white/10" : "bg-slate-200")}>
            <div className="h-full bg-emerald-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        {/* ── Stats Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total" value={globalStats.totalAssets} sub="library"
            icon={<HardDrive className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          />

          <StatCard
            label="Images" value={globalStats.images} sub="library"
            icon={<ImgIcon className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            colorStyles={{ bg: "bg-sky-500/5", border: "border-sky-500/20", text: "text-sky-500" }}
            onClick={() => { setActiveTab('image'); setCurrentPage(1); }}
          />

          <StatCard
            label="Videos" value={globalStats.videos} sub="library"
            icon={<Video className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            colorStyles={{ bg: "bg-violet-500/5", border: "border-violet-500/20", text: "text-violet-500" }}
            onClick={() => { setActiveTab('video'); setCurrentPage(1); }}
          />

          <StatCard
            label="Documents" value={globalStats.docs} sub="library"
            icon={<FileText className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            colorStyles={{ bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-500" }}
            onClick={() => { setActiveTab('document'); setCurrentPage(1); }}
          />

          <StatCard
            label="Approved" value={globalStats.approved} sub="library"
            icon={<CheckCircle className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            colorStyles={{ bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-500", fill: "bg-emerald-500", progress: globalStats.totalAssets ? Math.round((globalStats.approved / globalStats.totalAssets) * 100) : 0 }}
            onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
          />

          <StatCard
            label="Storage" value={formatFileSize(globalStats.totalSize)} sub="library"
            icon={<HardDrive className="w-5 h-5" />}
            isDarkMode={isDarkMode}
            colorStyles={{ bg: "bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-500" }}
          />
        </div>

        {/* ── Search + Refresh + View Toggle ────────────────────────────────── */}
        <div className="flex gap-2.5 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={15} className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none", isDarkMode ? 'text-white/25' : 'text-slate-400')} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename or tags…"
              className={cn(
                "w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200",
                isDarkMode
                  ? 'bg-white/4 border-white/8 text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:bg-white/6 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn("absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all", isDarkMode ? 'text-white/30 hover:text-white/70 hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={loadAssets}
            disabled={loading}
            className={cn(
              "h-[42px] px-4 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2",
              isDarkMode
                ? 'bg-white/4 border-white/8 text-white/60 hover:bg-white/8 hover:text-white/90'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-xs font-bold tracking-wide">Refresh</span>
          </button>

          {/* View mode pill toggle */}
          <div className={cn(
            "flex items-center rounded-xl border p-1 gap-0.5",
            isDarkMode ? "border-white/8 bg-white/[0.03]" : "border-slate-200 bg-slate-50"
          )}>
            {(['grid', 'list'] as ViewMode[]).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setViewMode(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 text-xs font-bold",
                  viewMode === v
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                      : "bg-white text-emerald-600 shadow-sm border border-slate-200"
                    : isDarkMode
                      ? "text-white/35 hover:text-white/65"
                      : "text-slate-400 hover:text-slate-600"
                )}
                title={v === 'grid' ? 'Grid view' : 'List view'}
              >
                {v === 'grid' ? <Grid3X3 size={13} /> : <List size={13} />}
                <span className="hidden sm:inline capitalize">{v}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className={cn("flex gap-1 border-b overflow-x-auto no-scrollbar", isDarkMode ? "border-white/[0.07]" : "border-slate-200")}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={cn(
                "px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px",
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : isDarkMode
                    ? 'border-transparent text-white/45 hover:text-white/80'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.label}
              {tab.id === 'approved' && globalStats.approved > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/15 text-emerald-500 font-bold">{globalStats.approved}</span>
              )}
              {tab.id === 'pending' && globalStats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/15 text-amber-500 font-bold">{globalStats.pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Gallery Grid / List ────────────────────────────────────────────── */}
        <GlassCard isDarkMode={isDarkMode} className="p-5">
          {/* Loading */}
          {loading && (viewMode === 'grid'
            ? <GridSkeletons isDarkMode={isDarkMode} count={8} />
            : <ListSkeletons isDarkMode={isDarkMode} count={6} />
          )}

          {/* Empty */}
          {!loading && mediaAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center", isDarkMode ? "bg-white/[0.04] border border-white/[0.07]" : "bg-slate-100 border border-slate-200")}>
                <ImageIcon className={cn("w-9 h-9", isDarkMode ? "text-white/15" : "text-slate-300")} strokeWidth={1} />
              </div>
              <div className="space-y-1">
                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-700')}>
                  {searchQuery ? 'No results found' : 'No assets yet'}
                </p>
                <p className={cn("text-xs", isDarkMode ? 'text-white/35' : 'text-slate-500')}>
                  {searchQuery ? 'Try a different search term.' : 'Upload your first media file to get started.'}
                </p>
              </div>
            </div>
          )}

          {/* Grid */}
          {!loading && mediaAssets.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {mediaAssets.map(asset => (
                <GalleryGridCard
                  key={asset.media_asset_id}
                  asset={asset}
                  isSelected={false}
                  isDisabled={activeTab !== 'deleted' && !asset.is_approved}
                  isDeleted={activeTab === 'deleted'}
                  isDarkMode={isDarkMode}
                  onSelect={activeTab === 'deleted' ? () => { } : openDrawer}
                  onPreview={activeTab === 'deleted' ? () => { } : openDrawer}
                  onDelete={handleDeleteFromCard}
                  onRestore={handleRestoreFromCard}
                />
              ))}
            </div>
          )}

          {/* List */}
          {!loading && mediaAssets.length > 0 && viewMode === 'list' && (
            <div>
              <GalleryListHeader isDarkMode={isDarkMode} showCheckbox={false} />
              <div className="space-y-1">
                {mediaAssets.map(asset => (
                  <GalleryListRow
                    key={asset.media_asset_id}
                    asset={asset}
                    isSelected={false}
                    isDisabled={activeTab !== 'deleted' && !asset.is_approved}
                    isDeleted={activeTab === 'deleted'}
                    isDarkMode={isDarkMode}
                    showCheckbox={false}
                    onSelect={activeTab === 'deleted' ? () => { } : openDrawer}
                    onPreview={activeTab === 'deleted' ? () => { } : openDrawer}
                    onDelete={handleDeleteFromCard}
                    onRestore={handleRestoreFromCard}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className={cn("mt-5 pt-4 border-t", isDarkMode ? "border-white/[0.07]" : "border-slate-200")}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalAssets}
                itemsPerPage={20}
                isDarkMode={isDarkMode}
              />
            </div>
          )}
        </GlassCard>

        {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
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

        {/* ── Restore Confirmation Modal ─────────────────────────────────────── */}
        <ConfirmationModal
          isOpen={!!restoreId}
          onClose={() => setRestoreId(null)}
          onConfirm={confirmRestore}
          title="Restore Media Asset"
          message="Restore this asset? It will become visible in the gallery again."
          confirmText="Restore"
          isDarkMode={isDarkMode}
        />

        {/* ── Preview Drawer ─────────────────────────────────────────────────── */}
        <MediaPreviewDrawer
          asset={previewAsset}
          isOpen={drawerOpen}
          isDarkMode={isDarkMode}
          fromPicker={false}
          onClose={closeDrawer}
          onDelete={deleteAsset}
        />
      </div>
    </PageTransition>
  );
}

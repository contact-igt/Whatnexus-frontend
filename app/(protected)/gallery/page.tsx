"use client";

import { useState, useEffect, useMemo } from 'react';
import { ImageIcon, Plus, Search, RefreshCw, X, HardDrive, CheckCircle, Clock, Upload, Trash2, Eye, Grid3X3, List } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { PageTransition } from '@/components/ui/pageTransition';
import { useSelector } from 'react-redux';
import { fetchMediaAssets, deleteMediaAsset, MediaAsset, uploadMedia } from '@/services/gallery/galleryApi';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { MediaAssetPreviewModal } from '@/components/gallery/MediaAssetPreviewModal';

type TabType = 'all' | 'image' | 'video' | 'document' | 'approved' | 'pending';

const ACCEPTED_TYPES = [
    "image/jpeg", "image/png", "image/webp",
    "video/mp4", "video/3gpp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

const formatDate = (d: string) => {
    if (!d || isNaN(new Date(d).getTime())) return 'Just now';
    return new Date(d).toLocaleDateString('en-IN');
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
// Single media card for the grid
function MediaCard({
    asset,
    isDarkMode,
    onDelete,
    onPreview,
}: {
    asset: MediaAsset;
    isDarkMode: boolean;
    onDelete: (asset: MediaAsset) => void;
    onPreview: (asset: MediaAsset) => void;
}) {
    const typeEmoji: Record<string, string> = {
        image: 'ðŸ–¼ï¸',
        video: 'ðŸŽ¬',
        document: 'ðŸ“„',
    };

    return (
        <div className={cn(
            "rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition-all hover:border-white/20",
            isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
        )}
            onClick={() => onPreview(asset)}
        >
            {/* Thumbnail */}
            <div
                className={cn(
                    "flex items-center justify-center text-4xl select-none",
                    isDarkMode ? "bg-white/5" : "bg-slate-50"
                )}
                style={{ aspectRatio: '4/3', overflow: 'hidden' }}
            >
                {asset.file_type === 'image' && asset.preview_url ? (
                    <img
                        src={asset.preview_url}
                        alt={asset.file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                            const parent = e.currentTarget.parentElement as HTMLElement;
                            e.currentTarget.style.display = 'none';
                            parent.textContent = 'ðŸ–¼ï¸';
                        }}
                    />
                ) : (
                    typeEmoji[asset.file_type] || 'ðŸ“Ž'
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                <p
                    className={cn("text-xs font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")}
                    title={asset.file_name}
                >
                    {asset.file_name}
                </p>
                <div className="flex items-center justify-between gap-1">
                    <span className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-slate-500")}>
                        {formatFileSize(asset.file_size)}
                    </span>
                    <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide",
                        asset.is_approved
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                    )}>
                        {asset.is_approved ? 'Approved' : 'Pending'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className={cn("text-[10px]", isDarkMode ? "text-white/30" : "text-slate-400")}>
                        {formatDate(asset.created_at)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); onPreview(asset); }}
                            title="View"
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
                        >
                            <Eye size={12} />
                        </button>
                        {!asset.is_approved && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(asset);
                                }}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    isDarkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                                )}
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GalleryPage() {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAssets, setTotalAssets] = useState(0);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);

    const loadMediaAssets = async () => {
        if (!tenantId) return;

        setLoading(true);
        try {
            const response = await fetchMediaAssets({
                tenant_id: tenantId,
                type: activeTab === 'all' || activeTab === 'approved' || activeTab === 'pending' ? undefined : activeTab,
                search: searchQuery || undefined,
                approved_only: activeTab === 'approved' ? true : undefined,
                pending_only: activeTab === 'pending' ? true : undefined,
                page: currentPage,
                limit: 20,
            });

            setMediaAssets(response.data);
            setTotalPages(response.totalPages);
            setTotalAssets(response.total);
        } catch (error) {
            console.error("Error loading media assets:", error);
            toast.error("Failed to load media assets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMediaAssets();
    }, [activeTab, searchQuery, currentPage, tenantId]);

    const stats = useMemo(() => {
        const total = totalAssets;
        const approved = mediaAssets.filter(a => a.is_approved).length;
        const pending = mediaAssets.filter(a => !a.is_approved).length;
        const totalSize = mediaAssets.reduce((sum, a) => sum + a.file_size, 0);

        const fmtSize = (bytes: number) => {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        };

        return { total, approved, pending, totalSize: fmtSize(totalSize) };
    }, [mediaAssets, totalAssets]);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'all',      label: 'All' },
        { id: 'image',    label: 'Images' },
        { id: 'video',    label: 'Videos' },
        { id: 'document', label: 'Documents' },
        { id: 'approved', label: 'Approved' },
        { id: 'pending',  label: 'Pending' },
    ];

    const uploadSelectedFile = async (file: File, clearInput?: () => void) => {
        if (!file || !tenantId) return;

        const mb = file.size / 1024 / 1024;
        const kb = file.size / 1024;

        // Client-side validation before sending to server
        if (file.type.startsWith('image/')) {
            if (kb < 5)  { toast.error('Image too small. Minimum 5KB');  event.target.value = ''; return; }
            if (mb > 2)  { toast.error('Image too large. Maximum 2MB');  event.target.value = ''; return; }
        } else if (file.type.startsWith('video/')) {
            if (kb < 10) { toast.error('Video too small. Minimum 10KB'); event.target.value = ''; return; }
            if (mb > 10) { toast.error('Video too large. Maximum 10MB'); event.target.value = ''; return; }
        } else {
            if (kb < 1)  { toast.error('Document too small. Minimum 1KB');  event.target.value = ''; return; }
            if (mb > 10) { toast.error('Document too large. Maximum 10MB'); event.target.value = ''; return; }
        }

        setUploading(true);
        setUploadProgress(0);
        try {
            await uploadMedia(file, tenantId, { folder: "root", tags: [] }, setUploadProgress);
            toast.success("Media uploaded successfully");
            await loadMediaAssets();
        } catch (error: any) {
            console.error("Error uploading file:", error);
            toast.error(error.response?.data?.message || "Failed to upload file");
        } finally {
            setUploading(false);
            setUploadProgress(0);
            clearInput?.();
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        await uploadSelectedFile(file as File, () => {
            event.target.value = '';
        });
    };

    const deleteAssetById = async (assetId: string) => {
        if (!tenantId) return;
        try {
            await deleteMediaAsset(assetId, tenantId);
            toast.success("Media deleted successfully");
            await loadMediaAssets();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete media");
        }
    };

    const handleDelete = async () => {
        if (!selectedAssetId) return;
        await deleteAssetById(selectedAssetId);
        setIsConfirmationModalOpen(false);
        setSelectedAssetId(null);
    };

    const openDeleteConfirmation = (id: string) => {
        setSelectedAssetId(id);
        setIsConfirmationModalOpen(true);
    };

    const handleDeleteClick = (asset: MediaAsset) => {
        openDeleteConfirmation(asset.media_asset_id || String(asset.id));
    };

    return (
        <PageTransition>
            <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-emerald-500">
                            <ImageIcon size={16} className="animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Media Management</span>
                        </div>
                        <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Media Gallery
                        </h1>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <label
                            className={cn(
                                "h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer border-2 border-dashed",
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
                                await uploadSelectedFile(droppedFile as File);
                            }}
                        >
                            <Upload size={16} />
                            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={uploading}
                                accept={ACCEPTED_TYPES}
                            />
                        </label>
                        {uploading && (
                            <div className="w-full max-w-xs">
                                <div className={cn("h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-white/10" : "bg-slate-200")}>
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className={cn("text-[10px] mt-1 text-right", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    {uploadProgress}%
                                </p>
                            </div>
                        )}
                        <p className={cn("text-[10px]", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            ðŸ–¼ Images: JPEG/PNG/WebP Â· 5KBâ€“2MB &nbsp;|&nbsp; â–¶ Videos: MP4/3GP Â· 10KBâ€“10MB &nbsp;|&nbsp; ðŸ“„ Documents: PDF/Word Â· 1KBâ€“10MB
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-blue-500/10" : "bg-blue-100")}>
                                <HardDrive className={cn("w-6 h-6", isDarkMode ? "text-blue-400" : "text-blue-600")} />
                            </div>
                            <div>
                                <p className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>Total Assets</p>
                                <p className={cn("text-[10px]", isDarkMode ? "text-white/25" : "text-slate-400")}>all pages</p>
                                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{stats.total}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-100")}>
                                <CheckCircle className={cn("w-6 h-6", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
                            </div>
                            <div>
                                <p className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>Approved</p>
                                <p className={cn("text-[10px]", isDarkMode ? "text-white/25" : "text-slate-400")}>this page</p>
                                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{stats.approved}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-yellow-500/10" : "bg-yellow-100")}>
                                <Clock className={cn("w-6 h-6", isDarkMode ? "text-yellow-400" : "text-yellow-600")} />
                            </div>
                            <div>
                                <p className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>Pending</p>
                                <p className={cn("text-[10px]", isDarkMode ? "text-white/25" : "text-slate-400")}>this page</p>
                                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{stats.pending}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", isDarkMode ? "bg-purple-500/10" : "bg-purple-100")}>
                                <HardDrive className={cn("w-6 h-6", isDarkMode ? "text-purple-400" : "text-purple-600")} />
                            </div>
                            <div>
                                <p className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>Total Size</p>
                                <p className={cn("text-[10px]", isDarkMode ? "text-white/25" : "text-slate-400")}>this page</p>
                                <p className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{stats.totalSize}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by filename or tags"
                            className={cn(
                                "w-full pl-12 pr-12 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                            )}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={cn(
                                    "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all hover:bg-white/10",
                                    isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                                )}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => loadMediaAssets()}
                        disabled={loading}
                        className={cn(
                            "px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                            loading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <div className={cn("flex items-center rounded-xl border px-2", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={cn("p-2 rounded-lg", viewMode === 'grid' ? "text-emerald-500" : (isDarkMode ? "text-white/50" : "text-slate-500"))}
                            title="Grid view"
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={cn("p-2 rounded-lg", viewMode === 'list' ? "text-emerald-500" : (isDarkMode ? "text-white/50" : "text-slate-500"))}
                            title="List view"
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                            className={cn(
                                "px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-500'
                                    : isDarkMode
                                        ? 'border-transparent text-white/50 hover:text-white/80'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Media Grid */}
                <GlassCard isDarkMode={isDarkMode} className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw size={24} className={cn("animate-spin", isDarkMode ? "text-white/30" : "text-slate-400")} />
                        </div>
                    ) : mediaAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                                <ImageIcon size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                            </div>
                            <div className="space-y-2 mt-4">
                                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    {searchQuery ? 'No media found matching your search' : 'No media assets yet'}
                                </p>
                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    {searchQuery ? 'Try adjusting your search terms' : 'Upload your first media file to get started'}
                                </p>
                            </div>
                            {!searchQuery && (
                                <label className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2 cursor-pointer">
                                    <Plus size={14} />
                                    Upload Media
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept={ACCEPTED_TYPES}
                                    />
                                </label>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            {mediaAssets.map((asset) => (
                                <MediaCard
                                    key={asset.id}
                                    asset={asset}
                                    isDarkMode={isDarkMode}
                                    onDelete={handleDeleteClick}
                                    onPreview={setPreviewAsset}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {mediaAssets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className={cn(
                                        "rounded-xl border p-3 flex items-center justify-between gap-3",
                                        isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white",
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className={cn("text-sm font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")}>{asset.file_name}</p>
                                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                            {asset.file_type.toUpperCase()} • {formatFileSize(asset.file_size)} • {formatDate(asset.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPreviewAsset(asset)}
                                            className={cn("text-xs px-2 py-1 rounded border", isDarkMode ? "border-white/20 text-white/70" : "border-slate-300 text-slate-700")}
                                        >
                                            View
                                        </button>
                                        {!asset.is_approved && (
                                            <button
                                                onClick={() => handleDeleteClick(asset)}
                                                className={cn("text-xs px-2 py-1 rounded border border-red-400 text-red-500")}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && totalPages > 1 && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={totalAssets}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    )}
                </GlassCard>

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isConfirmationModalOpen}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Delete Media Asset"
                    message="Are you sure you want to delete this media asset? This action cannot be undone."
                    confirmText="Delete"
                    variant="danger"
                    isDarkMode={isDarkMode}
                />

                <MediaAssetPreviewModal
                    isOpen={!!previewAsset}
                    asset={previewAsset}
                    onClose={() => setPreviewAsset(null)}
                    onDelete={deleteAssetById}
                />
            </div>
        </PageTransition>
    );
}




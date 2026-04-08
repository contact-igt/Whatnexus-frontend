"use client";

import { useState, useEffect, useMemo } from 'react';
import { ImageIcon, Plus, Search, RefreshCw, X, HardDrive, CheckCircle, Clock, Upload } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { PageTransition } from '@/components/ui/pageTransition';
import { useSelector } from 'react-redux';
import { fetchMediaAssets, deleteMediaAsset, MediaAsset, uploadMedia } from '@/services/gallery/galleryApi';
import { toast } from 'sonner';
import { DataTable, ColumnDef } from '@/components/ui/dataTable';
import { Pagination } from '@/components/ui/pagination';
import { ActionMenu } from "@/components/ui/actionMenu";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

type TabType = 'all' | 'image' | 'video' | 'document' | 'audio' | 'approved' | 'pending';

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
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);

    // Load media assets
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

    // Calculate stats
    const stats = useMemo(() => {
        const total = totalAssets;
        const approved = mediaAssets.filter(a => a.is_approved).length;
        const pending = mediaAssets.filter(a => !a.is_approved).length;
        const totalSize = mediaAssets.reduce((sum, a) => sum + a.file_size, 0);
        
        const formatSize = (bytes: number) => {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
            if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
        };

        return { total, approved, pending, totalSize: formatSize(totalSize) };
    }, [mediaAssets, totalAssets]);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'image', label: 'Images' },
        { id: 'video', label: 'Videos' },
        { id: 'document', label: 'Documents' },
        { id: 'audio', label: 'Audio' },
        { id: 'approved', label: 'Approved' },
        { id: 'pending', label: 'Pending' },
    ];

    // Handle file upload
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
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!selectedAssetId || !tenantId) return;

        try {
            await deleteMediaAsset(selectedAssetId, tenantId);
            toast.success("Media deleted successfully");
            await loadMediaAssets();
            setIsConfirmationModalOpen(false);
            setSelectedAssetId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete media");
        }
    };

    const openDeleteConfirmation = (id: string) => {
        setSelectedAssetId(id);
        setIsConfirmationModalOpen(true);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const columns: ColumnDef<MediaAsset>[] = useMemo(() => [
        {
            field: 'file_name',
            headerName: 'File Name',
            width: 250,
            renderCell: ({ row }) => (
                <p className={cn("text-sm font-semibold truncate", isDarkMode ? 'text-white' : 'text-slate-800')}>
                    {row.file_name}
                </p>
            )
        },
        {
            field: 'file_type',
            headerName: 'Type',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded capitalize",
                    isDarkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
                )}>
                    {row.file_type}
                </span>
            )
        },
        {
            field: 'file_size',
            headerName: 'Size',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    {formatFileSize(row.file_size)}
                </span>
            )
        },
        {
            field: 'is_approved',
            headerName: 'Status',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                    row.is_approved
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                )}>
                    {row.is_approved ? 'Approved' : 'Pending'}
                </span>
            )
        },
        {
            field: 'created_at',
            headerName: 'Uploaded',
            align: 'center',
            headerAlign: 'center',
            width: 150,
            renderCell: ({ row }) => (
                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    {formatDate(row.created_at)}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            align: 'center',
            headerAlign: 'center',
            width: 100,
            renderCell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                        isDarkMode={isDarkMode}
                        isDelete={!row.is_approved}
                        onDelete={() => openDeleteConfirmation(row.id)}
                    />
                </div>
            )
        }
    ], [isDarkMode]);

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
                    <label className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer">
                        <Upload size={16} />
                        <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />
                    </label>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                isDarkMode ? "bg-blue-500/10" : "bg-blue-100"
                            )}>
                                <HardDrive className={cn(
                                    "w-6 h-6",
                                    isDarkMode ? "text-blue-400" : "text-blue-600"
                                )} />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-xs font-medium",
                                    isDarkMode ? "text-white/40" : "text-slate-500"
                                )}>
                                    Total Assets
                                </p>
                                <p className={cn(
                                    "text-[10px]",
                                    isDarkMode ? "text-white/25" : "text-slate-400"
                                )}>
                                    all pages
                                </p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                isDarkMode ? "bg-emerald-500/10" : "bg-emerald-100"
                            )}>
                                <CheckCircle className={cn(
                                    "w-6 h-6",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )} />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-xs font-medium",
                                    isDarkMode ? "text-white/40" : "text-slate-500"
                                )}>
                                    Approved
                                </p>
                                <p className={cn(
                                    "text-[10px]",
                                    isDarkMode ? "text-white/25" : "text-slate-400"
                                )}>
                                    this page
                                </p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {stats.approved}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                isDarkMode ? "bg-yellow-500/10" : "bg-yellow-100"
                            )}>
                                <Clock className={cn(
                                    "w-6 h-6",
                                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                                )} />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-xs font-medium",
                                    isDarkMode ? "text-white/40" : "text-slate-500"
                                )}>
                                    Pending
                                </p>
                                <p className={cn(
                                    "text-[10px]",
                                    isDarkMode ? "text-white/25" : "text-slate-400"
                                )}>
                                    this page
                                </p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {stats.pending}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                isDarkMode ? "bg-purple-500/10" : "bg-purple-100"
                            )}>
                                <HardDrive className={cn(
                                    "w-6 h-6",
                                    isDarkMode ? "text-purple-400" : "text-purple-600"
                                )} />
                            </div>
                            <div>
                                <p className={cn(
                                    "text-xs font-medium",
                                    isDarkMode ? "text-white/40" : "text-slate-500"
                                )}>
                                    Total Size
                                </p>
                                <p className={cn(
                                    "text-[10px]",
                                    isDarkMode ? "text-white/25" : "text-slate-400"
                                )}>
                                    this page
                                </p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {stats.totalSize}
                                </p>
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

                {/* Media Table */}
                <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={mediaAssets}
                        isLoading={loading}
                        isDarkMode={isDarkMode}
                        emptyState={
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                )}>
                                    <ImageIcon size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                </div>
                                <div className="space-y-2 mt-4 text-center">
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
                                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        />
                                    </label>
                                )}
                            </div>
                        }
                    />

                    {(!loading && totalPages > 1) && (
                        <div className="p-4 border-t border-white/5">
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
            </div>
        </PageTransition>
    );
}

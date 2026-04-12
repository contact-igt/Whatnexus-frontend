"use client";

import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon, Video, FileText, Loader2, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadProps {
    isDarkMode: boolean;
    label?: string;
    accept: string;
    uploadedUrl?: string | null;
    onFileSelected: (file: File) => void;
    onRemove: () => void;
    placeholder?: string;
    uploadType: 'image' | 'video' | 'document';
    disabled?: boolean;
    isUploading?: boolean;
    compact?: boolean; // Reduced size variant for use inside form panels
    fileName?: string | null; // Optional: Display actual filename if available
    onPickFromGallery?: () => void;
}

export const FileUpload = ({
    isDarkMode,
    label,
    accept,
    uploadedUrl,
    onFileSelected,
    onRemove,
    placeholder = "Click to upload or drag and drop",
    uploadType,
    disabled = false,
    isUploading = false,
    compact = false,
    fileName = null,
    onPickFromGallery,
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) return;
        onFileSelected(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleClick = () => {
        if (!disabled && !isUploading) {
            if (onPickFromGallery) {
                onPickFromGallery();
            } else {
                fileInputRef.current?.click();
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const iconSize = compact ? 18 : 32;

    const getIcon = () => {
        switch (uploadType) {
            case 'image': return <ImageIcon size={iconSize} />;
            case 'video': return <Video size={iconSize} />;
            case 'document': return <FileText size={iconSize} />;
        }
    };

    const getTypeLabel = () => {
        switch (uploadType) {
            case 'image': return 'Image';
            case 'video': return 'Video';
            case 'document': return 'Document';
        }
    };

    const hasContent = !!uploadedUrl;
    const isInteractive = !disabled && !isUploading;

    // compact: taller portrait card (h-64), narrower container controlled by parent (w-2/5)
    const previewHeight = compact ? 'h-64' : 'h-80';
    const emptyPadding = compact ? 'py-12' : 'py-20';

    return (
        <div className="w-full">
            {label && (
                <label className={cn(
                    "text-xs font-semibold mb-2 block ml-1",
                    isDarkMode ? 'text-white/70' : 'text-slate-700'
                )}>
                    {label}
                </label>
            )}

            <div
                onClick={handleClick}
                onDrop={(e) => isInteractive && handleDrop(e)}
                onDragOver={(e) => isInteractive && handleDragOver(e)}
                onDragLeave={() => isInteractive && handleDragLeave()}
                className={cn(
                    "relative w-full rounded-xl border-2 border-dashed transition-all overflow-hidden",
                    (!isInteractive) ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                    isDragging && isInteractive && "border-emerald-500 bg-emerald-500/5",
                    !isDragging && isDarkMode && (!isInteractive ? "border-white/10 bg-white/5" : "border-white/20 hover:border-emerald-500/50 bg-white/5"),
                    !isDragging && !isDarkMode && (!isInteractive ? "border-slate-200 bg-slate-50" : "border-slate-300 hover:border-emerald-500 bg-slate-50")
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    disabled={disabled || isUploading}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                />

                {isUploading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                        <Loader2 className={cn("animate-spin text-emerald-400", compact ? "mb-1" : "mb-2")} size={compact ? 20 : 32} />
                        <p className={cn("text-white font-medium", compact ? "text-xs" : "text-sm")}>Uploading...</p>
                    </div>
                )}

                {hasContent ? (
                    <div className="relative">
                        {uploadType === 'image' && (
                            <img
                                src={uploadedUrl!}
                                alt="Preview"
                                className={cn("w-full object-cover", previewHeight)}
                            />
                        )}
                        {uploadType === 'video' && (
                            <video
                                src={uploadedUrl!}
                                className={cn("w-full object-cover", previewHeight)}
                                controls
                            />
                        )}
                        {uploadType === 'document' && (
                            <div className={cn("flex items-center gap-3", compact ? "p-3" : "p-4")}>
                                <div className={cn(
                                    "rounded-lg flex-shrink-0",
                                    compact ? "p-2" : "p-3",
                                    isDarkMode ? "bg-purple-500/10" : "bg-purple-100"
                                )}>
                                    <FileText size={compact ? 18 : 24} className="text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-medium truncate",
                                        compact ? "text-xs" : "text-[13px]",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        {fileName || 'Document uploaded'}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <CheckCircle size={compact ? 10 : 12} className="text-emerald-500" />
                                        <p className={cn(compact ? "text-[10px]" : "text-xs", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                            Click to change
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(uploadType === 'image' || uploadType === 'video') && (
                            <div className={cn(
                                "absolute left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2",
                                compact ? "bottom-1.5 py-0.5" : "bottom-2 py-1"
                            )}>
                                <CheckCircle size={compact ? 10 : 12} className="text-emerald-400" />
                                <span className={cn("text-white font-medium", compact ? "text-[10px]" : "text-xs")}>Successfully Uploaded</span>
                            </div>
                        )}

                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                className={cn(
                                    "absolute right-2 rounded-full transition-all z-10",
                                    compact ? "top-1.5 p-1" : "top-2 p-1.5",
                                    isDarkMode
                                        ? "bg-black/60 hover:bg-black/80 text-white"
                                        : "bg-white/90 hover:bg-white text-slate-900 shadow-lg"
                                )}
                            >
                                <X size={compact ? 12 : 16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={cn(
                        "flex flex-col items-center justify-center px-4",
                        emptyPadding
                    )}>
                        <div className={cn(
                            "rounded-full",
                            compact ? "p-2 mb-2" : "p-3 mb-3",
                            isDarkMode ? "bg-white/5" : "bg-slate-200"
                        )}>
                            {getIcon()}
                        </div>
                        {onPickFromGallery && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPickFromGallery();
                                }}
                                className={cn("flex items-center mb-1 hover:opacity-80 transition-opacity z-10", compact ? "gap-1.5" : "gap-2")}
                            >
                                <Upload size={compact ? 13 : 16} className="text-emerald-500" />
                                <p className={cn(
                                    "font-medium hover:underline",
                                    compact ? "text-xs" : "text-sm",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )}>
                                    Pick {getTypeLabel()} from gallery
                                </p>
                            </button>
                        )}
                        {!onPickFromGallery && (
                            <div className={cn("flex items-center mb-1", compact ? "gap-1.5" : "gap-2")}>
                                <Upload size={compact ? 13 : 16} className="text-emerald-500" />
                                <p className={cn(
                                    "font-medium",
                                    compact ? "text-xs" : "text-sm",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    Upload {getTypeLabel()}
                                </p>
                            </div>
                        )}
                        <p className={cn(
                            "text-center",
                            compact ? "text-[10px]" : "text-xs",
                            isDarkMode ? "text-white/40" : "text-slate-500"
                        )}>
                            {placeholder}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

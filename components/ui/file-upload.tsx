"use client";

import { cn } from "@/lib/utils";
import { Upload, X, Image as ImageIcon, Video, FileText } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadProps {
    isDarkMode: boolean;
    label?: string;
    accept: string;
    value?: string;
    onChange: (file: File | null, preview: string) => void;
    placeholder?: string;
    uploadType: 'image' | 'video' | 'document';
    disabled?: boolean;
}

export const FileUpload = ({
    isDarkMode,
    label,
    accept,
    value,
    onChange,
    placeholder = "Click to upload or drag and drop",
    uploadType,
    disabled = false
}: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (!file) {
            onChange(null, '');
            return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(file, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null, '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getIcon = () => {
        switch (uploadType) {
            case 'image':
                return <ImageIcon size={32} />;
            case 'video':
                return <Video size={32} />;
            case 'document':
                return <FileText size={32} />;
        }
    };

    const getTypeLabel = () => {
        switch (uploadType) {
            case 'image':
                return 'Image';
            case 'video':
                return 'Video';
            case 'document':
                return 'Document';
        }
    };

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
                onClick={() => !disabled && handleClick()}
                onDrop={(e) => !disabled && handleDrop(e)}
                onDragOver={(e) => !disabled && handleDragOver(e)}
                onDragLeave={() => !disabled && handleDragLeave()}
                className={cn(
                    "relative w-full rounded-xl border-2 border-dashed transition-all overflow-hidden",
                    disabled ? "cursor-not-allowed opacity-60 grayscale-[0.5]" : "cursor-pointer",
                    isDragging && !disabled && "border-emerald-500 bg-emerald-500/5",
                    !isDragging && isDarkMode && (disabled ? "border-white/10 bg-white/5" : "border-white/20 hover:border-emerald-500/50 bg-white/5"),
                    !isDragging && !isDarkMode && (disabled ? "border-slate-200 bg-slate-50" : "border-slate-300 hover:border-emerald-500 bg-slate-50")
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                />

                {value ? (
                    <div className="relative">
                        {uploadType === 'image' && (
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                            />
                        )}
                        {uploadType === 'video' && (
                            <video
                                src={value}
                                className="w-full h-48 object-cover"
                                controls
                            />
                        )}
                        {uploadType === 'document' && (
                            <div className="flex items-center gap-3 p-4">
                                <div className={cn(
                                    "p-3 rounded-lg",
                                    isDarkMode ? "bg-purple-500/10" : "bg-purple-100"
                                )}>
                                    <FileText size={24} className="text-purple-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium truncate",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        Document uploaded
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDarkMode ? "text-white/50" : "text-slate-500"
                                    )}>
                                        Click to change
                                    </p>
                                </div>
                            </div>
                        )}

                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                className={cn(
                                    "absolute top-2 right-2 p-1.5 rounded-full transition-all",
                                    isDarkMode
                                        ? "bg-black/60 hover:bg-black/80 text-white"
                                        : "bg-white/90 hover:bg-white text-slate-900 shadow-lg"
                                )}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                        <div className={cn(
                            "p-3 rounded-full mb-3",
                            isDarkMode ? "bg-white/5" : "bg-slate-200"
                        )}>
                            {getIcon()}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <Upload size={16} className="text-emerald-500" />
                            <p className={cn(
                                "text-sm font-medium",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}>
                                Upload {getTypeLabel()}
                            </p>
                        </div>
                        <p className={cn(
                            "text-xs text-center",
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

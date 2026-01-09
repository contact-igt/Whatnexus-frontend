"use client";

import { useRef, useState } from 'react';
import { Upload, FileText, Globe, Trash2, CheckCircle2, Clock, Plus, FileUp, Loader2, Link2, File } from 'lucide-react';
import { ActionMenu } from "@/components/ui/action-menu";
import { GlassCard } from "@/components/ui/glass-card";
import { KNOWLEDGE_SOURCES } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { useActivateKnowledgeMutation, useDeleteKnowledgeById, useGetKnowledgesQuery, useKnowledgeByIdQuery, useUpdateKnowledgeMutation, useUploadKnowledgeMutation } from '@/hooks/useUploadKnowledge';

interface DataSourceProps {
    isDarkMode: boolean;
    setSelectedItem: any;
    isDragging: boolean;
    uploadedData: any;
    setUploadedData: any;
    setIsDragging: any;
    handleDragEnter: any;
    handleDragOver: any;
    handleDragLeave: any;
    handleDrop: any;
    handleUploadFile: any;
    handleDeleteClick: any;
    handleEdit: any;
    handleView: any;
    uploading: boolean;
}

type TabType = 'data-sources' | 'prompts';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getFileIcon = (type: string) => {
    switch (type) {
        case 'pdf':
        case 'file':
            return 'text-red-500';
        case 'url':
            return 'text-blue-500';
        case 'text':
            return 'text-purple-500';
        default:
            return 'text-emerald-500';
    }
};

const getFileIconBg = (type: string, isDarkMode: boolean) => {
    switch (type) {
        case 'pdf':
        case 'file':
            return isDarkMode ? 'bg-red-500/10' : 'bg-red-50';
        case 'url':
            return isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50';
        case 'text':
            return isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50';
        default:
            return isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50';
    }
};

export const DataSource = ({ isDarkMode, setSelectedItem, isDragging, uploadedData, setUploadedData, setIsDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleUploadFile, handleDeleteClick, handleEdit, handleView, uploading }: DataSourceProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: knowledgeData, isLoading: isKnowledgeLoading, isError } = useGetKnowledgesQuery();
    const { mutate: uploadKnowledgeMutate, isPending } = useUploadKnowledgeMutation();
    const { mutate: activateKnowledgeMutate, isPending: isActivatePending } = useActivateKnowledgeMutation();
    const { mutate: updateKnowledgeMutate } = useUpdateKnowledgeMutation();
    const [activeTab, setActiveTab] = useState<TabType>('data-sources');
    const [isUpdating, setIsUpdating] = useState<{ status: boolean, type: any }>({
        status: false,
        type: null
    });
    const [error, setError] = useState({
        documentTitle: "",
        text: "",
        websiteUrlTitle: "",
        websiteUrl: "",
        textContent: "",
        urlTitle: "",
        textTitle: ""
    });
    const [inputValue, setInputValue] = useState({
        documentTitle: "",
        text: "",
        websiteUrlTitle: "",
        websiteUrl: "",
        textContent: "",
        urlTitle: "",
        textTitle: ""
    });

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteFile = (index: number) => {
        setUploadedData((prev: any) => prev?.filter((_: any, i: number) => i !== index))
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputValue((prev) => ({ ...prev, [name]: value }));
        if (value.trim()) {
            setError((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleUploadKnowledge = async (type: 'file' | 'text' | 'url') => {
        const defaultTitle = "Ophthall conclave conference";
        console.log("uploadedData", uploadedData)
        if (type === 'file') {
            setIsUpdating({ status: true, type: "file" })
            if (uploadedData.length === 0) {
                return;
            }
            if (!inputValue.documentTitle.trim()) {
                setError((prev) => ({ ...prev, documentTitle: "Document title is required" }))
                setIsUpdating({ status: false, type: null })
                return;
            }
            if (inputValue.documentTitle.trim().length < 3 || inputValue.documentTitle.trim().length > 100) {
                setError((prev) => ({ ...prev, documentTitle: "Title must be between 3 and 100 characters" }))
                setIsUpdating({ status: false, type: null })
                return;
            }
            uploadKnowledgeMutate({
                title: inputValue.documentTitle,
                file_name: uploadedData ? uploadedData[0]?.name?.replace(/\.[^/.]+$/, "")
                    ?.replace(/\s*\(\d+\)$/, "") : "",
                type: "file",
                text: uploadedData[0]?.text,
                source_url: '',
                file: ""
            }, {
                onSuccess: () => {
                    setUploadedData([]);
                    setInputValue((prev) => ({ ...prev, documentTitle: "" }));
                    setIsUpdating({ status: false, type: null });
                },
                onError: () => {
                    setIsUpdating({ status: false, type: null });
                }
            });

        } else if (type === 'text') {
            setIsUpdating({ status: true, type: "text" })
            let hasError = false;
            const newError = { ...error };

            if (!inputValue.textTitle.trim()) {
                newError.textTitle = "Content title is required";
                hasError = true;
            } else if (inputValue.textTitle.trim().length < 3 || inputValue.textTitle.trim().length > 100) {
                newError.textTitle = "Title must be between 3 and 100 characters";
                hasError = true;
            }

            if (!inputValue.textContent.trim()) {
                newError.textContent = "Text content is required";
                hasError = true;
            } else if (inputValue.textContent.trim().length < 10) {
                newError.textContent = "Content must be at least 10 characters";
                hasError = true;
            } else if (inputValue.textContent.trim().length > 5000) {
                newError.textContent = "Content cannot exceed 5000 characters";
                hasError = true;
            }

            if (hasError) {
                setError(newError);
                setIsUpdating({ status: false, type: null });
                return;
            }

            uploadKnowledgeMutate({
                title: inputValue.textTitle,
                file_name: inputValue.textTitle,
                type: 'text',
                text: inputValue.textContent.trim(),
                source_url: '',
                file: ''
            },
                {
                    onSuccess: () => {
                        setInputValue((prev) => ({ ...prev, textContent: "", textTitle: "" }));
                        setIsUpdating({ status: false, type: null });
                    },
                    onError: () => {
                        setIsUpdating({ status: false, type: null });
                    }
                });
        } else if (type === 'url') {
            setIsUpdating({ status: true, type: "url" })
            let hasError = false;
            const newError = { ...error };

            if (!inputValue.websiteUrlTitle.trim()) {
                newError.websiteUrlTitle = "Title is required";
                hasError = true;
            } else if (inputValue.websiteUrlTitle.trim().length < 3 || inputValue.websiteUrlTitle.trim().length > 100) {
                newError.websiteUrlTitle = "Title must be between 3 and 100 characters";
                hasError = true;
            }

            if (!inputValue.websiteUrl.trim()) {
                newError.websiteUrl = "Website URL is required";
                hasError = true;
            } else {
                try {
                    const url = new URL(inputValue.websiteUrl);
                    if (url.protocol !== "http:" && url.protocol !== "https:") {
                        newError.websiteUrl = "Please enter a valid URL including http:// or https://";
                        hasError = true;
                    }
                } catch (e) {
                    newError.websiteUrl = "Please enter a valid URL including http:// or https://";
                    hasError = true;
                }
            }


            if (hasError) {
                setError(newError);
                setIsUpdating({ status: false, type: null });
                return;
            }

            uploadKnowledgeMutate({
                title: inputValue.websiteUrlTitle,
                file_name: inputValue.websiteUrlTitle,
                type: 'url',
                text: '',
                source_url: inputValue.websiteUrl.trim(),
                file: ''
            }, {
                onSuccess: () => {
                    setInputValue((prev) => ({ ...prev, websiteUrl: "", websiteUrlTitle: "" }));
                    setIsUpdating({ status: false, type: null });
                },
                onError: () => {
                    setIsUpdating({ status: false, type: null });
                }
            });
        }
    };

    const handleToggleActive = (id: string, isActive: string) => {
        const status = {
            status: isActive == "active" ? "inactive" : "active"
        }
        activateKnowledgeMutate({
            id, data: status
        })
    }
    console.log("uploadedData", uploadedData)
    console.log("knowledgeData", knowledgeData);

    console.log("documentTitle", inputValue?.documentTitle)
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Documents Card */}
                <GlassCard isDarkMode={isDarkMode} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="p-6">
                    <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Upload Documents
                    </h3>
                    <p className={cn("text-xs mb-6", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Drag & drop your files here or click below to browse
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleUploadFile}
                        className="hidden"
                        multiple={false}
                    />

                    <div
                        onClick={handleFileButtonClick}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group relative",
                            isDragging
                                ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
                                : 'hover:border-emerald-500/50',
                            isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
                            uploading && 'pointer-events-none opacity-60'
                        )}
                    >

                        <>
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                                isDragging ? 'scale-110 bg-emerald-500/20' : '',
                                isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                            )}>
                                <FileUp className="text-emerald-500" size={28} />
                            </div>
                            <div className="text-center">
                                <button
                                    type="button"
                                    disabled={uploading || isPending || uploadedData?.length == 1}
                                    className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    Click here to select files
                                </button>
                                <p className={cn("text-xs mt-3", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    Supported formats: PDF, DOCX, DOC, TXT (Max 5MB)
                                </p>
                            </div>
                        </>
                        {isDragging && (
                            <div className="absolute inset-0 rounded-xl border-2 border-emerald-500 bg-emerald-500/5 flex items-center justify-center">
                                <p className="text-emerald-500 font-semibold">Drop files here</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Uploaded Files Card */}
                <GlassCard isDarkMode={isDarkMode} className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Uploaded Files
                            </h3>
                            <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                Recently uploaded documents
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto no-scrollbar">
                        {uploading ? (
                            <div className="flex flex-col items-center justify-center h-[200px]">
                                <Loader2 className={cn("animate-spin mb-3", isDarkMode ? 'text-white/40' : 'text-slate-400')} size={32} />
                                <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    Loading files...
                                </p>
                            </div>
                        ) : uploadedData.length > 0 ? (
                            uploadedData.map((item: any, i: number) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "p-3 rounded-lg border transition-all hover:border-emerald-500/30 group",
                                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                getFileIconBg(item.type, isDarkMode)
                                            )}>
                                                {item.type === 'url' ? (
                                                    <Globe className={getFileIcon(item.type)} size={16} />
                                                ) : (
                                                    <FileText className={getFileIcon(item.type)} size={16} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn("text-sm font-semibold truncate", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {item?.name || item?.source_url || 'Untitled'}
                                                </h4>
                                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                    {item.type.toUpperCase()} • {formatDate(item?.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFile(i)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                                                isDarkMode ? 'hover:bg-red-500/10 text-white/40 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                            )}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-center">
                                <FileText className={cn("mb-3", isDarkMode ? 'text-white/20' : 'text-slate-300')} size={40} />
                                <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    No files uploaded yet
                                </p>
                                <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                    Upload documents to see them here
                                </p>
                            </div>
                        )}
                    </div>

                    {uploadedData.length > 0 && !isKnowledgeLoading && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className={cn("text-xs font-semibold mb-1.5 block", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                                    Document Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={inputValue.documentTitle}
                                    onChange={handleInputChange}
                                    placeholder="Enter a title for this document"
                                    className={cn(
                                        "w-full px-3 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                                        isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                                        error.documentTitle ? "border-red-500" : ""
                                    )}
                                    name="documentTitle"
                                />
                                <p className="text-red-500 text-xs font-bold mt-2">
                                    {error.documentTitle}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        if (uploadedData.length > 0) {
                                            handleUploadKnowledge('file');
                                        }
                                    }}
                                    disabled={uploadedData.length === 0 || isPending}
                                    className={cn(
                                        "px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                    )}
                                >
                                    {isPending && isUpdating.status == true && isUpdating.type == "file" ? "Uploading..." : "Upload Document"}
                                </button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Add Website URL and Add Text Content - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Website URL Card */}
                <GlassCard isDarkMode={isDarkMode} className="p-6">
                    <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Add Website URL
                    </h3>
                    <p className={cn("text-xs mb-5", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Crawl your website for information.
                    </p>

                    <div className="space-y-7">
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={inputValue.websiteUrlTitle}
                                onChange={handleInputChange}
                                placeholder="Enter a title for this URL"
                                className={cn(
                                    "w-full px-3 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                                    error.websiteUrlTitle ? "border-red-500" : ""
                                )}
                                name="websiteUrlTitle"
                            />
                            <p className="text-red-500 text-xs font-bold mt-2">
                                {error.websiteUrlTitle}
                            </p>
                        </div>
                        <div className="relative">
                            <h4 className={cn("text-xs font-semibold mb-1.5", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                                Website URL <span className="text-red-500">*</span>
                            </h4>
                            <div className="relative">
                                <Globe className={cn("absolute left-3 top-6 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} size={18} />
                                <input
                                    type="url"
                                    value={inputValue.websiteUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://cityhospital.com/services"
                                    className={cn(
                                        "w-full pl-11 pr-4 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                                        isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                                        error.websiteUrl ? "border-red-500" : ""
                                    )}
                                    name="websiteUrl"
                                />
                                <p className="text-red-500 text-xs font-bold mt-2">
                                    {error.websiteUrl}
                                </p>
                            </div>
                        </div>

                        <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                            The AI will automatically re-crawl this URL every 24 hours.
                        </p>
                        <button onClick={() => {
                            handleUploadKnowledge("url")
                        }} disabled={isPending || uploading} className={cn("w-full px-6 py-2.5 flex justify-center items-center rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20", (isPending || uploading) && 'opacity-50 cursor-not-allowed')}>
                            {isPending && isUpdating.status == true && isUpdating.type == "url" ? <Loader2 className={cn("animate-spin w-6 h-6", isDarkMode ? 'text-white/40' : 'text-slate-400')} size={32} /> : "Add"}
                        </button>
                    </div>
                </GlassCard>

                {/* Add Text Content Card */}
                <GlassCard isDarkMode={isDarkMode} className="p-6">
                    <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Add Text Content
                    </h3>
                    <p className={cn("text-xs mb-4", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Directly add text information for training.
                    </p>

                    <div className="space-y-4">
                        <div className='mb-4'>
                            <label className={cn("text-xs font-semibold mb-1.5 block", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                                Content Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={inputValue.textTitle}
                                onChange={handleInputChange}
                                placeholder="Enter a title for this content"
                                className={cn(
                                    "w-full px-3 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mb-1",
                                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                                    error.textTitle ? "border-red-500" : ""
                                )}
                                name="textTitle"
                            />
                            <p className="text-red-500 text-xs font-bold mt-1">
                                {error.textTitle}
                            </p>
                        </div>

                        <h4 className={cn("text-xs font-semibold mb-1.5", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                            Content Text <span className="text-red-500">*</span>
                        </h4>
                        <textarea
                            placeholder="Enter text content here... (e.g. FAQs, policies, procedures)"
                            rows={4}
                            value={inputValue.textContent}
                            onChange={handleInputChange}
                            className={cn(
                                "w-full px-4 py-3 mb-0 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
                                error.textContent ? "border-red-500" : ""
                            )}
                            name="textContent"
                        />
                        <p className="text-red-500 text-xs font-bold my-2">
                            {error.textContent}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                            <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                {inputValue.textContent.length} characters
                            </span>
                            <button onClick={() => {
                                handleUploadKnowledge("text")
                            }} disabled={isPending || uploading} className={cn("px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20", (isPending || uploading) && 'opacity-50 cursor-not-allowed')}>
                                {isPending && isUpdating.status == true && isUpdating.type == "text" ? <Loader2 className={cn("animate-spin w-6 h-6", isDarkMode ? 'text-white/40' : 'text-slate-400')} size={32} /> : "Add Content"}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Active Sources
                        </h3>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Content currently finding the AI's responses.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {isKnowledgeLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-xl border animate-pulse",
                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg shrink-0",
                                            isDarkMode ? 'bg-white/10' : 'bg-slate-200'
                                        )} />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn("h-4 w-32 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                <div className={cn("h-5 w-16 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                            </div>
                                            <div className={cn("h-3 w-20 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className={cn("w-11 h-6 rounded-full", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                        <div className={cn("w-8 h-8 rounded-lg", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : knowledgeData?.data?.map((source: any, index: number) => {
                        const createdAt = new Date(source?.created_at).getTime();
                        const now = Date.now();
                        const isProcessing = now - createdAt < 5 * 60 * 1000;
                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-xl border transition-all hover:border-emerald-500/30 group",
                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                        )}>
                                            {source?.type === "file" && (
                                                <File className="text-emerald-500" size={20} />
                                            )}
                                            {
                                            source?.type === "text" && (
                                                <FileText className="text-emerald-500" size={20} />
                                            )
                                            }
                                            {source?.type === "url" && (
                                                <Link2 className="text-emerald-500" size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h4 className={cn("text-sm font-semibold truncate max-w-[300px]", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {source.title || source.file_name}
                                                </h4>
                                                {!isProcessing ? (
                                                    <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <CheckCircle2 size={12} />
                                                        <span className="text-xs font-semibold">Trained</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                                        <Clock size={12} />
                                                        <span className="text-xs font-semibold">Processing</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className='flex items-center space-x-3'>
                                                {source?.type === "file" && (
                                                    <p className={cn('text-xs truncate max-w-[200px]', isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                        {source?.file_name}
                                                    </p>
                                                )}
                                                {source?.type === "url" && (
                                                    <a href={source?.source_url} target="_blank" rel="noopener noreferrer" className={cn('text-xs truncate w-auto hover:underline flex items-center', isDarkMode ? 'text-blue-400/80' : 'text-blue-500')}>
                                                        <Link2 size={10} className="mr-1" />
                                                        {source?.source_url}
                                                    </a>
                                                )}
                                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                    {formatDate(source?.created_at || new Date().toISOString())}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer mx-3">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={source.status == "active" ? true : false}
                                            onChange={() => handleToggleActive(source.id, source.status)}
                                        />
                                        <div className={cn(
                                            "w-11 h-6 rounded-full peer transition-all",
                                            "peer-checked:bg-emerald-600",
                                            isDarkMode ? 'bg-white/10' : 'bg-slate-300'
                                        )}>
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all",
                                                source.status == "active" ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                    </label>
                                    <ActionMenu
                                        isDarkMode={isDarkMode}
                                        isView={source?.type == "text" || source?.type == "file"}
                                        isEdit={source?.type == "text" || source?.type == "file"}
                                        onView={() => handleView(source, 'knowledge')}
                                        onEdit={() => handleEdit(source, 'knowledge')}
                                        onDelete={() => handleDeleteClick(source, 'knowledge')}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </GlassCard>
        </div>
    )
}
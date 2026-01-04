
"use client";

import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Globe, Trash2, CheckCircle2, Clock, Plus, FileUp, Loader2, Type, AlignLeft, Link2 } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { KNOWLEDGE_SOURCES } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { extractTextFromFile } from '@/utils/ocr';
import { DataSource } from './dataSource';
import { ActionMenu } from "@/components/ui/action-menu";
import { Modal } from "@/components/ui/modal";
import { useDeletePromptMutation, usePromptByIdQuery, useUpdatePromptMutation, useGetPromptConfigurationQuery, useActivatePromptMutation } from '@/hooks/usePromptQuery';
import { toast } from "sonner";
import { useDeleteKnowledgeById, useKnowledgeByIdQuery, useUpdateKnowledgeMutation } from '@/hooks/useUploadKnowledge';
import { PromptConfiguration } from './promptConfiguration';
import { Settings } from './settings';

interface KnowledgeViewProps {
    isDarkMode: boolean;
}

type TabType = 'data-sources' | 'prompts' | 'settings';


export const KnowledgeView = ({ isDarkMode }: KnowledgeViewProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('data-sources');
    const [uploading, setUploading] = useState(false);
    const { mutate: activatePromptMutate } = useActivatePromptMutation();

    const [uploadedData, setUploadedData] = useState<Array<{ name: string, size: string, date: string, type: string, fileObj?: File, text: string }>>([]);
    const [isUpdating, setIsUpdating] = useState<{ status: boolean, type: any }>({
        status: false,
        type: null
    });
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ item: any, mode?: string } | null>(null);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    const [editContent, setEditContent] = useState<{ name?: any, prompt?: any, text?: any }>({
        name: "",
        prompt: "",
        text: ""
    });
    const { data: knowledgeDetailsById, refetch: refetchKnowledgeById, isLoading: isKnowledgeByIdLoading } = useKnowledgeByIdQuery(selectedItem?.item?.id, selectedItem?.mode ?? "knowledge");
    const { data: promptDetailsById, isLoading: isPromptByIdLoading } = usePromptByIdQuery(selectedItem?.item?.id, selectedItem?.mode ?? "prompt");
    const [isDragging, setIsDragging] = useState(false);
    const { mutate: updateKnowledgeMutate } = useUpdateKnowledgeMutation();
    const { mutate: updatePromptMutute } = useUpdatePromptMutation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ item: any, type: string } | null>(null);

    const { mutate: deleteKnowledgeMutate } = useDeleteKnowledgeById();
    const { mutate: deletePromptMutate } = useDeletePromptMutation();
    const isView = viewMode === "view";
    const isEdit = viewMode === "edit";
    const isKnowledge = selectedItem?.mode === "knowledge";
    const isPrompt = selectedItem?.mode === "prompt";
    const knowledgeTabs = [
        { value: "data-sources", label: "Data Sources" },
        { value: "prompts", label: "Prompts" },
        { value: "settings", label: "Settings" }
    ];

    useEffect(() => {
        const storedTab = localStorage.getItem("selectedTab");
        if (storedTab) {
            setActiveTab(storedTab as TabType);
        }
    }, []);

    const handleTabChange = (value: TabType) => {
        setActiveTab(value);
        localStorage.setItem("selectedTab", value);
    };

    const dialogTitle = isKnowledge
        ? isView
            ? "View Knowledge"
            : "Edit Knowledge"
        : isPrompt
            ? isView
                ? "View Prompt"
                : "Edit Prompt"
            : "Edit Source";

    const dialogDescription = isKnowledge
        ? isView
            ? "View the details of your knowledge source."
            : "Make changes to your knowledge source."
        : isPrompt
            ? isView
                ? "View the details of your prompt."
                : "Make changes to your prompt source."
            : "Edit source details.";

    const handleView = (item: any, mode: string) => {
        setSelectedItem({ item, mode });
        setViewMode('view');
        setIsViewModalOpen(true);
    };

    const handleEdit = (item: any, mode: string) => {
        setSelectedItem({ item, mode });
        setViewMode('edit');
        setIsViewModalOpen(true);
    };
    console.log("isPrompt", isPrompt)
    console.log("selectedItem", selectedItem?.mode)
    const handleUpdate = () => {
        if (!selectedItem) return;
        if (selectedItem?.mode == "knowledge") {
            const knowledgePayload: {
                title: string;
                text?: string;
            } = {
                title: "Ophthall conclave conference",
                text: editContent?.text
            }
            updateKnowledgeMutate({
                id: selectedItem.item.id,
                data: knowledgePayload
            });
        }
        else if (selectedItem?.mode == "prompt") {
            const promptPayload: {
                name: string;
                prompt?: string;
            } = {
                name: editContent?.name ? editContent?.name : selectedItem.item.name,
                prompt: editContent?.prompt ? editContent?.prompt : selectedItem.item.prompt
            }
            updatePromptMutute({
                id: selectedItem.item.id,
                data: promptPayload
            })
        }
        setIsViewModalOpen(false);
    };

    const handleDeleteClick = (item: any, type: string) => {
        console.log("item", item)
        setItemToDelete({ item, type });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete?.type == "knowledge") {
            deleteKnowledgeMutate(itemToDelete.item.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
        else if (itemToDelete?.type == "prompt") {
            deletePromptMutate(itemToDelete.item.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };
    useEffect(() => {
        if (
            isViewModalOpen &&
            selectedItem?.item?.id &&
            selectedItem?.mode === "knowledge"
        ) {
            refetchKnowledgeById();
        }
    }, [isViewModalOpen]);
    const processFiles = async (files: FileList | null) => {
        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
        if (!files || files.length === 0) return;
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            // "application/vnd.ms-powerpoint",
            // "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];
        setUploading(true);
        const validFiles: File[] = [];

        Array.from(files).forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                setUploading(false);
                toast.error(`File not allowed`);
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setUploading(false);
                toast.error(`File too large`);
                return;
            }
            validFiles.push(file);
        });

        if (validFiles.length === 0) return;
        // Add files to uploaded files list
        const newFiles = await Promise.all(validFiles.map(async (file) => {
            const text = await extractTextFromFile(file);
            return {
                name: file?.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                type: file.type.includes("pdf") ? "pdf" : file.type.includes("word") ? "doc" : "txt",
                fileObj: file,
                text
            }
        }));
        setUploading(false);
        console.log("newFiles", newFiles)
        setUploadedData(prev => [...newFiles, ...prev]);
    };

    const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        console.log("files", e.target.files)
        e.target.value = "";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };


    useEffect(() => {
        if (isViewModalOpen && knowledgeDetailsById && selectedItem?.mode == "knowledge") {
            const data = knowledgeDetailsById.data || knowledgeDetailsById;
            const content = data?.raw_text;
            setEditContent({ text: content });
        }
        else if (isViewModalOpen && promptDetailsById && selectedItem?.mode == "prompt") {
            const data = promptDetailsById.data || promptDetailsById;
            const content = data?.prompt;
            setEditContent({ name: data?.name, prompt: content });
        }
    }, [knowledgeDetailsById, promptDetailsById, viewMode, isViewModalOpen]);
    console.log("promptDetailsById", promptDetailsById)
    console.log("viewMode", viewMode);
    console.log("selectedItem", selectedItem);
    console.log("uploadedData", uploadedData);
    console.log("selectedItem", selectedItem)
    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Knowledge Base
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Train your AI assistant with your hospital's documents and website data.
                </p>
            </div>

            <div className={cn("flex items-center space-x-1 p-1 rounded-xl w-fit", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                {
                    knowledgeTabs?.map((tab) => (
                        <button
                            onClick={() => handleTabChange(tab?.value as TabType)}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                activeTab === tab?.value
                                    ? (isDarkMode ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md')
                                    : (isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-700')
                            )}
                        >
                            {tab?.label}
                        </button>
                    ))
                }
            </div>

            {activeTab === 'data-sources' && (
                <DataSource
                    isDarkMode={isDarkMode}
                    setSelectedItem={setSelectedItem}
                    isDragging={isDragging}
                    uploadedData={uploadedData}
                    setUploadedData={setUploadedData}
                    setIsDragging={setIsDragging}
                    handleDragEnter={handleDragEnter}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleUploadFile={handleUploadFile}
                    handleDeleteClick={handleDeleteClick}
                    handleEdit={handleEdit}
                    handleView={handleView}
                    uploading={uploading}
                />
            )}

            {activeTab === 'prompts' && (
                <PromptConfiguration
                    isDarkMode={isDarkMode}
                    setSelectedItem={setSelectedItem}
                    isDragging={isDragging}
                    uploadedData={uploadedData}
                    setUploadedData={setUploadedData}
                    setIsDragging={setIsDragging}
                    handleDragEnter={handleDragEnter}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleUploadFile={handleUploadFile}
                    handleDeleteClick={handleDeleteClick}
                    handleEdit={handleEdit}
                    handleView={handleView}
                    uploading={uploading}
                />
            )}
            {
                activeTab === 'settings' && (
                    <Settings
                        isDarkMode={isDarkMode}
                        handleEdit={handleEdit}
                        handleView={handleView}
                    />
                )
            }
            {/* View/Edit Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title={dialogTitle}
                description={dialogDescription}
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                isDarkMode
                                    ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            {isView ? "Close" : "Cancel"}
                        </button>
                        {isEdit && (
                            <button
                                onClick={handleUpdate}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                    isDarkMode
                                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
                                )}
                                disabled={isUpdating.status}
                            >
                                {isUpdating.status && <Loader2 className="animate-spin" size={14} />}
                                <span>Save Changes</span>
                            </button>
                        )}
                    </div>
                }
            >
                <div className="space-y-5">
                    {isKnowledge && (
                        <>
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Title
                                </label>
                                <div className="relative">
                                    <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        <Type size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={isView}
                                        value={isEdit ? (editContent?.name || selectedItem?.item?.title || selectedItem?.item?.file_name) : (selectedItem?.item?.title || selectedItem?.item?.file_name)}
                                        onChange={(e) => setEditContent({ ...editContent, name: e.target.value })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                            isView && "opacity-60 cursor-not-allowed",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                        )}
                                    />
                                </div>
                            </div>

                            {(selectedItem?.item?.type === 'text' || selectedItem?.item?.text) && (
                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Content
                                    </label>
                                    <div className="relative">
                                        <div className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                            <AlignLeft size={16} />
                                        </div>
                                        <textarea
                                            rows={10}
                                            disabled={isView}
                                            value={isEdit ? (editContent?.text || selectedItem?.item?.text) : (editContent?.text || selectedItem?.item?.text || selectedItem?.item?.raw_text || "")}
                                            onChange={(e) => setEditContent({ ...editContent, text: e.target.value })}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
                                                isView && "opacity-60 cursor-not-allowed",
                                                isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedItem?.item?.source_url && (
                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Source URL
                                    </label>
                                    <div className="relative">
                                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                            <Link2 size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            disabled
                                            value={selectedItem?.item?.source_url}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none opacity-60 cursor-not-allowed",
                                                isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white'
                                                    : 'bg-white border-slate-200 text-slate-900'
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {isPrompt && (
                        <>
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Name
                                </label>
                                <div className="relative">
                                    <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        <Type size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        disabled={isView}
                                        value={isEdit ? (editContent?.name || selectedItem?.item?.name) : selectedItem?.item?.name}
                                        onChange={(e) => setEditContent({ ...editContent, name: e.target.value })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                            isView && "opacity-60 cursor-not-allowed",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                        )}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Instructions
                                </label>
                                <div className="relative">
                                    <div className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        <AlignLeft size={16} />
                                    </div>
                                    <textarea
                                        rows={10}
                                        disabled={isView}
                                        value={isEdit ? (editContent?.prompt || selectedItem?.item?.prompt) : selectedItem?.item?.prompt}
                                        onChange={(e) => setEditContent({ ...editContent, prompt: e.target.value })}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
                                            isView && "opacity-60 cursor-not-allowed",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                        )}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={itemToDelete?.type === "prompt" ? "Delete Prompt?" : "Delete Knowledge Source?"}
                description={itemToDelete?.type === "prompt" ? "Are you sure you want to delete this prompt? This action cannot be undone." : "Are you sure you want to delete this knowledge source? This action cannot be undone."}
                isDarkMode={isDarkMode}
                className="max-w-md"
                footer={
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                isDarkMode
                                    ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg",
                                isDarkMode
                                    ? 'bg-red-500 hover:bg-red-600 border border-red-500/50'
                                    : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            )}
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="hidden"></div>
            </Modal>
        </div>
    );
};
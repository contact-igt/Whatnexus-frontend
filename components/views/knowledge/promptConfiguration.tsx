
"use client";

import { useRef, useState } from 'react';
import { Upload, FileText, FileUp, Loader2 } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { ActionMenu } from "@/components/ui/action-menu";
import { useGetPromptConfigurationQuery, useActivatePromptMutation, useCreatePromptMutation } from '@/hooks/usePromptQuery';
import { toast } from "sonner";
import { extractTextFromFile } from '@/utils/ocr';

interface PromptConfigurationProps {
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
interface PromptItem {
    id: string;
    aiName: string;
    type: 'text' | 'file';
    content: string;
    fileObj?: File;
    createdAt: Date;
}

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatDisplayKnowledge = (type: string, data: any): string => {
    switch (type) {
        case "text":
            return data?.text
                ? data.text.length > 120
                    ? `${data.text.slice(0, 120)}...`
                    : data.text
                : "Text content";

        case "url":
            return data?.source_url || "Website URL";

        case "pdf":
            return data?.file_name || data?.file_url || "Uploaded file";

        default:
            return "knowledge source";
    }
};

export const PromptConfiguration = ({ isDarkMode, setSelectedItem, isDragging, uploadedData, setUploadedData, setIsDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleUploadFile, handleDeleteClick, handleEdit, handleView, uploading }: PromptConfigurationProps) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [aiName, setAiName] = useState("");
    const [inputType, setInputType] = useState<'text' | 'file'>('text');
    const [promptText, setPromptText] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [promptsList, setPromptsList] = useState<PromptItem[]>([]);
    const { data: promptsData, isLoading: isPromptsLoading, isError } = useGetPromptConfigurationQuery();
    const { mutate: createPromptMutate, isPending: isCreatePromptPending } = useCreatePromptMutation();
    const { mutate: activatePromptMutate, isPending: isActivatePromptPending } = useActivatePromptMutation();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = async (file: File) => {
        const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload TXT, PDF, or DOC/DOCX.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size exceeds 5MB limit.");
            return;
        }
        setIsUploading(true);
        try {
            const text = await extractTextFromFile(file);
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                text: text,
                file: file
            }
            setSelectedFile(fileData as any);
        } catch (error) {
            console.error("Text extraction failed:", error);
            toast.error("Failed to extract text from file");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddPrompt = () => {
        if (!aiName.trim()) {
            toast.error("Please enter a name.");
            return;
        }

        if (inputType === 'text' && !promptText.trim()) {
            toast.error("Please enter prompt instructions.");
            return;
        }
        else if (inputType === 'file' && !selectedFile) {
            toast.error("Please select a file.");
            return;
        }

        if (inputType === "text") {
            if (!promptText.trim()) {
                toast.error("Please enter prompt instructions.");
                return;
            }
            if (promptText.trim().length < 10) {
                toast.error("Prompt instructions must be at least 10 characters long.");
                return;
            }
            createPromptMutate({
                name: aiName.trim(),
                prompt: promptText.trim()
            }, {
                onSuccess: () => {
                    setAiName("");
                    setPromptText("");
                }
            });
        }
        else if (inputType === "file") {
            if (!selectedFile) {
                toast.error("Please select a file.");
                return;
            }
            createPromptMutate({
                name: aiName.trim(),
                prompt: selectedFile?.text
            }, {
                onSuccess: () => {
                    setAiName("");
                    setPromptText("");
                    setSelectedFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                }
            });
        }
    };

    const handleToggleActive = (id: string, isActive: string) => {
        activatePromptMutate({ id, data: { is_active: isActive == "true" ? "false" : "true" } });
    };

    // Helper to handle local drag and drop
    const handleLocalDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // setIsDragging(false); // Local drag state needed if separate from props. 
        // Assuming parent props `isDragging` works for the whole page or we use specific handler. 
        // For now, let's just process the file.
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleLocalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        // setIsDragging(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Configuration */}
            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Add New Configuration
                </h3>
                <p className={cn("text-xs mb-6", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                    Configure AI persona and instructions.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Name
                        </label>
                        <input
                            type="text"
                            value={aiName}
                            onChange={(e) => setAiName(e.target.value)}
                            placeholder="e.g. Receptionist Bot"
                            className={cn(
                                "w-full px-4 py-2.5 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                                isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                            )}
                        />
                    </div>

                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Prompt Source
                        </label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setInputType('text')}
                                className={cn(
                                    "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    inputType === 'text'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : isDarkMode ? 'border border-white/10 text-white/70 hover:bg-white/10' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                            >
                                <FileText className="inline-block mr-2" size={16} />
                                Text Input
                            </button>
                            <button
                                onClick={() => setInputType('file')}
                                className={cn(
                                    "flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                    inputType === 'file'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : isDarkMode ? 'border border-white/10 text-white/70 hover:bg-white/10' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                            >
                                <Upload className="inline-block mr-2" size={16} />
                                Upload File
                            </button>
                        </div>
                    </div>

                    {inputType === 'text' ? (
                        <div className="animate-in fade-in duration-300">
                            <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Prompt Instructions
                            </label>
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder="Enter detailed instructions for the AI..."
                                rows={8}
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                            <p className={cn("text-xs mt-2 text-right", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                {promptText.length} characters
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Upload Prompt File
                            </label>

                            {!selectedFile ? (
                                <>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        onDragOver={handleLocalDragOver}
                                        onDrop={handleLocalDrop}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center space-y-3 transition-all cursor-pointer group hover:border-emerald-500/50",
                                            isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
                                            isUploading && 'opacity-50 pointer-events-none'
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                                            isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                        )}>
                                            {isUploading ? (
                                                <Loader2 className="text-emerald-500 animate-spin" size={24} />
                                            ) : (
                                                <FileUp className="text-emerald-500" size={24} />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                Click to upload or drag & drop
                                            </p>
                                            <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                TXT, PDF, DOC (Max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className={cn(
                                    "relative p-4 rounded-xl border flex items-center justify-between group",
                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                                )}>
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                                        )}>
                                            <FileText className="text-blue-500" size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("text-sm font-medium truncate", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {selectedFile.name}
                                            </p>
                                            <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileRef.current) fileRef.current.value = "";
                                        }}
                                        className={cn(
                                            "text-sm font-medium transition-colors",
                                            isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                                        )}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleAddPrompt}
                        disabled={isCreatePromptPending || isUploading}
                        className="w-full px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {(isCreatePromptPending) && <Loader2 className="animate-spin" size={16} />}
                        <span>Save Configuration</span>
                    </button>
                </div>
            </GlassCard>

            {/* Configured Prompts */}
            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Configured Prompts
                        </h3>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Manage AI personalities and system prompts.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {isPromptsLoading ? (
                        <div className="flex flex-col items-center justify-center h-[200px]">
                            <Loader2 className={cn("animate-spin mb-3", isDarkMode ? 'text-white/40' : 'text-slate-400')} size={32} />
                            <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                Loading prompts...
                            </p>
                        </div>
                    ) : promptsData?.data?.length > 0 ? (
                        promptsData.data.map((prompt: any) => (
                            <div
                                key={prompt.id}
                                className={cn(
                                    "p-4 rounded-xl border transition-all hover:border-emerald-500/30 group",
                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                                        )}>
                                            <FileText className="text-blue-500" size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn("text-sm font-semibold mb-0.5", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {prompt.name}
                                            </h4>
                                            <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {formatDate(prompt.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                disabled={promptsData?.data?.every((prompt: any)=> prompt?.is_active == "false") ? false : prompt.is_active == "true" ? false : true}
                                                checked={prompt.is_active == "true" ? true : false}
                                                onChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                                            />
                                            <div className={cn(
                                                "w-11 h-6 rounded-full peer transition-all",
                                                "peer-checked:bg-emerald-600",
                                                "peer-disabled:opacity-40 peer-disabled:cursor-not-allowed",
                                                isDarkMode ? 'bg-white/10' : 'bg-slate-300'
                                            )}>
                                                <div className={cn(
                                                    "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all",
                                                    "peer-checked:translate-x-5",
                                                    prompt.is_active == "true" ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </div>
                                        </label>
                                        <ActionMenu
                                            isDarkMode={isDarkMode}
                                            isView={true}
                                            isEdit={true}
                                            onView={() => handleView(prompt, 'prompt')}
                                            onEdit={() => handleEdit(prompt, 'prompt')}
                                            onDelete={() => handleDeleteClick(prompt, 'prompt')}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center">
                            <FileText className={cn("mb-3", isDarkMode ? 'text-white/20' : 'text-slate-300')} size={40} />
                            <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                No prompts configured
                            </p>
                            <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                Create a new configuration to get started
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
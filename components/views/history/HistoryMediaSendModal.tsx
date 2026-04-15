"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    X, Image as ImageIcon, Film, FileText, Upload, Loader2, Send, Search,
    CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Play, Pause, Download,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useUploadTemplateMediaMutation } from "@/hooks/useTemplateQuery";
import { useTemplates } from "@/hooks/useTemplates";
import { useSendTemplateMessageMutation } from "@/hooks/useMessagesQuery";
import { toast } from "sonner";
import { ProcessedTemplate } from "@/components/campaign/templateSelectionModal";

type MediaType = "image" | "video" | "document";

interface HistoryMediaSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    selectedChat: { phone: string; contact_id: string; name?: string } | null;
    /** Pre-select a media tab on open */
    initialMediaType?: MediaType;
}

const MEDIA_CONFIG: Record<
    MediaType,
    { label: string; accept: string; hint: string; icon: React.ElementType; color: string; bg: string }
> = {
    image: {
        label: "Image",
        accept: "image/jpeg,image/png,image/webp",
        hint: "JPG, PNG, WEBP · max 5 MB",
        icon: ImageIcon,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    video: {
        label: "Video",
        accept: "video/mp4",
        hint: "MP4 · max 16 MB",
        icon: Film,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    document: {
        label: "Document",
        accept: "application/pdf",
        hint: "PDF · max 100 MB",
        icon: FileText,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
};

const STEPS = ["Upload Media", "Select Template", "Send"] as const;
type Step = 0 | 1 | 2;

export const HistoryMediaSendModal = ({
    isOpen,
    onClose,
    isDarkMode,
    selectedChat,
    initialMediaType = "image",
}: HistoryMediaSendModalProps) => {
    const [activeMedia, setActiveMedia] = useState<MediaType>(initialMediaType);
    const [step, setStep] = useState<Step>(0);

    // Upload state
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaFileName, setMediaFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Template selection state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);

    const { mutateAsync: uploadMedia } = useUploadTemplateMediaMutation();
    const { templates: apiTemplates, loading: templatesLoading } = useTemplates();
    const { mutate: sendTemplate, isPending: isSending } = useSendTemplateMessageMutation();

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveMedia(initialMediaType);
            setStep(0);
            setMediaUrl("");
            setMediaFileName("");
            setIsUploading(false);
            setSelectedTemplate(null);
            setSearchQuery("");
        }
    }, [isOpen, initialMediaType]);

    // Reset upload when media type changes
    useEffect(() => {
        setMediaUrl("");
        setMediaFileName("");
        setSelectedTemplate(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [activeMedia]);

    if (!isOpen || !selectedChat) return null;

    const config = MEDIA_CONFIG[activeMedia];
    const MediaIcon = config.icon;

    // Filter approved templates that match the active media type
    const matching = useMemo(() => {
        return apiTemplates
            .filter((t) => {
                const status = (t.status || "").toLowerCase();
                if (status !== "approved") return false;
                const headerComp = Array.isArray(t.components)
                    ? t.components.find(
                          (c: any) =>
                              c.component_type?.toLowerCase() === "header" ||
                              c.type?.toLowerCase() === "header"
                      )
                    : null;
                const hFmt = (
                    headerComp?.header_format ||
                    headerComp?.format ||
                    t.header_type ||
                    ""
                ).toLowerCase();
                return hFmt === activeMedia;
            })
            .map((t): ProcessedTemplate => {
                const bodyComp = Array.isArray(t.components)
                    ? t.components.find(
                          (c: any) =>
                              c.component_type?.toLowerCase() === "body" ||
                              c.type?.toLowerCase() === "body"
                      )
                    : null;
                const footerComp = Array.isArray(t.components)
                    ? t.components.find(
                          (c: any) =>
                              c.component_type?.toLowerCase() === "footer" ||
                              c.type?.toLowerCase() === "footer"
                      )
                    : null;
                const bodyText =
                    bodyComp?.text_content || bodyComp?.text || t.body || "No description";
                const footerText = footerComp?.text_content || footerComp?.text || "";

                // Buttons
                let allButtons: any[] = [];
                let buttonVariables: any[] = [];
                const buttonsComp = Array.isArray(t.components)
                    ? t.components.find(
                          (c: any) =>
                              c.component_type?.toLowerCase() === "buttons" ||
                              c.type?.toLowerCase() === "buttons"
                      )
                    : null;
                if (buttonsComp) {
                    try {
                        let btns = buttonsComp.text_content
                            ? typeof buttonsComp.text_content === "string"
                                ? JSON.parse(buttonsComp.text_content)
                                : buttonsComp.text_content
                            : buttonsComp.buttons || [];
                        if (Array.isArray(btns)) {
                            allButtons = btns.map((btn: any, idx: number) => ({
                                index: idx,
                                type: btn.type,
                                text: btn.text,
                                url: btn.url || null,
                            }));
                            btns.forEach((btn: any, idx: number) => {
                                if (btn.type === "URL" && btn.url?.includes("{{1}}")) {
                                    buttonVariables.push({ index: idx, text: btn.text });
                                }
                            });
                        }
                    } catch {}
                }

                const bodyVarCount = (t.variables || []).length;
                return {
                    id: t.template_id || t.id || "",
                    name: t.name || t.template_name || t.id || "Untitled",
                    category: (t.category?.toLowerCase() as any) || "marketing",
                    description: bodyText,
                    type: activeMedia,
                    variables: bodyVarCount + buttonVariables.length,
                    variableArray: t.variables || [],
                    buttonVariables,
                    allButtons,
                    headerText: "",
                    footerText,
                    bodyText,
                    originalDetails: t,
                };
            })
            .filter(
                (t) =>
                    !searchQuery ||
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [apiTemplates, activeMedia, searchQuery]);

    /* ── Handlers ── */

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setMediaFileName(file.name);
        try {
            const response = await uploadMedia({ file, type: activeMedia });
            const url = response?.url;
            if (url) {
                setMediaUrl(url);
                toast.success("Media uploaded successfully!");
            } else {
                throw new Error("No URL returned from upload");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message || err.message || "Failed to upload media";
            toast.error(msg);
            setMediaFileName("");
            setMediaUrl("");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSend = () => {
        if (!selectedTemplate || !selectedChat) return;

        // Build header component payload
        const mediaParam: any = { type: activeMedia };
        if (activeMedia === "image") mediaParam.image = { link: mediaUrl };
        else if (activeMedia === "video") mediaParam.video = { link: mediaUrl };
        else if (activeMedia === "document")
            mediaParam.document = { link: mediaUrl, filename: mediaFileName || "document.pdf" };

        const components: any[] = [{ type: "header", parameters: [mediaParam] }];

        sendTemplate(
            {
                phone: selectedChat.phone,
                contact_id: selectedChat.contact_id,
                template_id: selectedTemplate.id,
                components,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    const canProceedStep0 = !!mediaUrl && !isUploading;
    const canProceedStep1 = !!selectedTemplate;

    /* ── Render ── */

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full flex flex-col overflow-hidden p-0"
                style={{ maxWidth: "820px", maxHeight: "92vh" } as any}
            >
                {/* ── Modal Header ── */}
                <div
                    className={cn(
                        "px-6 py-4 border-b flex items-center justify-between shrink-0",
                        isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {/* Media type tabs */}
                        {(["image", "video", "document"] as MediaType[]).map((type) => {
                            const Icon = MEDIA_CONFIG[type].icon;
                            const active = activeMedia === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => { setActiveMedia(type); setStep(0); }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                        active
                                            ? type === "image"
                                                ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                                : type === "video"
                                                    ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
                                                    : "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                                            : isDarkMode
                                                ? "border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                                                : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    <Icon size={13} />
                                    {MEDIA_CONFIG[type].label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={onClose}
                        className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isDarkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"
                        )}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Step Progress ── */}
                <div
                    className={cn(
                        "px-6 py-3 border-b flex items-center gap-2 shrink-0",
                        isDarkMode ? "border-white/10 bg-black/10" : "border-slate-100 bg-slate-50"
                    )}
                >
                    {STEPS.map((label, idx) => {
                        const done = step > idx;
                        const active = step === idx;
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all",
                                        done
                                            ? "bg-emerald-500 text-white"
                                            : active
                                                ? activeMedia === "image"
                                                    ? "bg-blue-500 text-white"
                                                    : activeMedia === "video"
                                                        ? "bg-purple-500 text-white"
                                                        : "bg-orange-500 text-white"
                                                : isDarkMode
                                                    ? "bg-white/10 text-white/30"
                                                    : "bg-slate-200 text-slate-400"
                                    )}
                                >
                                    {done ? <CheckCircle2 size={13} /> : idx + 1}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-semibold",
                                        active
                                            ? isDarkMode ? "text-white" : "text-slate-900"
                                            : isDarkMode ? "text-white/30" : "text-slate-400"
                                    )}
                                >
                                    {label}
                                </span>
                                {idx < STEPS.length - 1 && (
                                    <ChevronRight size={14} className={isDarkMode ? "text-white/20" : "text-slate-300"} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Step Body ── */}
                <div className="flex-1 overflow-y-auto min-h-0">

                    {/* STEP 0 — Upload Media */}
                    {step === 0 && (
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                                    <MediaIcon size={18} className={config.color} />
                                </div>
                                <div>
                                    <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Upload {config.label}
                                    </p>
                                    <p className={cn("text-[11px]", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                        {config.hint}
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={config.accept}
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {!mediaUrl ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={cn(
                                        "w-full flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-14 transition-all group",
                                        isUploading
                                            ? "opacity-60 cursor-not-allowed"
                                            : isDarkMode
                                                ? "border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20"
                                                : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                                    )}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={36} className={cn("animate-spin", isDarkMode ? "text-white/40" : "text-slate-400")} />
                                            <p className={cn("text-sm font-medium", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                Uploading…
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105", config.bg)}>
                                                <MediaIcon size={30} className={config.color} />
                                            </div>
                                            <div className="text-center">
                                                <p className={cn("text-sm font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                    Click to upload {config.label.toLowerCase()}
                                                </p>
                                                <p className={cn("text-[11px] mt-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                    {config.hint}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                                                isDarkMode ? "bg-white/10 text-white hover:bg-white/15" : "bg-white text-slate-700 shadow border border-slate-200 hover:bg-slate-50"
                                            )}>
                                                <Upload size={13} /> Browse {config.label}
                                            </span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    {/* Preview */}
                                    {activeMedia === "image" && (
                                        <div className="relative rounded-xl overflow-hidden">
                                            <img
                                                src={mediaUrl}
                                                alt="preview"
                                                className="w-full max-h-64 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        </div>
                                    )}
                                    {activeMedia === "video" && (
                                        <div className="relative rounded-xl overflow-hidden bg-black">
                                            <video
                                                ref={videoRef}
                                                src={mediaUrl}
                                                className="w-full max-h-52 object-contain"
                                                onPlay={() => setIsVideoPlaying(true)}
                                                onPause={() => setIsVideoPlaying(false)}
                                                onEnded={() => setIsVideoPlaying(false)}
                                            />
                                            <button
                                                className="absolute inset-0 flex items-center justify-center group/pv"
                                                onClick={() => {
                                                    if (!videoRef.current) return;
                                                    isVideoPlaying
                                                        ? videoRef.current.pause()
                                                        : videoRef.current.play();
                                                }}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full bg-black/60 flex items-center justify-center transition-all",
                                                    isVideoPlaying ? "opacity-0 group-hover/pv:opacity-100" : "opacity-100"
                                                )}>
                                                    {isVideoPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                    {activeMedia === "document" && (
                                        <div className={cn(
                                            "flex items-center gap-3 p-4 rounded-xl border",
                                            isDarkMode ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-200"
                                        )}>
                                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                                                <FileText size={20} className="text-orange-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-slate-800")}>
                                                    {mediaFileName}
                                                </p>
                                                <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                                                    ✓ Uploaded successfully
                                                </p>
                                            </div>
                                            <a
                                                href={mediaUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={cn("p-2 rounded-lg", isDarkMode ? "hover:bg-white/10 text-white/50" : "hover:bg-slate-100 text-slate-500")}
                                            >
                                                <Download size={15} />
                                            </a>
                                        </div>
                                    )}

                                    {/* Uploaded indicator row */}
                                    <div className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border",
                                        isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            <p className={cn("text-xs font-semibold truncate max-w-[260px]", isDarkMode ? "text-white" : "text-slate-800")}>
                                                {mediaFileName || `${config.label} ready`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setMediaUrl("");
                                                setMediaFileName("");
                                                setIsVideoPlaying(false);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className={cn(
                                                "text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors",
                                                isDarkMode ? "bg-white/10 text-white/60 hover:bg-white/15" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            Replace
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 1 — Select Template */}
                    {step === 1 && (
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
                                    <MediaIcon size={18} className={config.color} />
                                </div>
                                <div>
                                    <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Choose a {config.label} Template
                                    </p>
                                    <p className={cn("text-[11px]", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                        Only approved templates with a {config.label.toLowerCase()} header are shown
                                    </p>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search size={15} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search templates…"
                                    className={cn(
                                        "w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20",
                                        isDarkMode
                                            ? "bg-black/20 border-white/10 text-white placeholder:text-white/30"
                                            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                                    )}
                                />
                            </div>

                            {/* Template list */}
                            {templatesLoading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Loader2 size={32} className={cn("animate-spin", isDarkMode ? "text-white/30" : "text-slate-300")} />
                                    <p className={cn("text-xs mt-3", isDarkMode ? "text-white/40" : "text-slate-400")}>Loading templates…</p>
                                </div>
                            ) : matching.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle size={36} className={isDarkMode ? "text-white/20" : "text-slate-300"} />
                                    <p className={cn("text-sm font-semibold mt-3", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                        No approved {config.label.toLowerCase()} templates found
                                    </p>
                                    <p className={cn("text-xs mt-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        Create and approve a template with a {config.label.toLowerCase()} header first.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                                    {matching.map((t) => {
                                        const selected = selectedTemplate?.id === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => setSelectedTemplate(t)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01]",
                                                    selected
                                                        ? "border-emerald-500 bg-emerald-500/10"
                                                        : isDarkMode
                                                            ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                                                        <MediaIcon size={15} className={config.color} />
                                                    </div>
                                                    {selected && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                                                </div>
                                                <p className={cn("text-sm font-bold mt-2 truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {t.name}
                                                </p>
                                                <p className={cn("text-[11px] mt-1 line-clamp-2", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                    {t.description}
                                                </p>
                                                {t.variables > 0 && (
                                                    <span className={cn(
                                                        "inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded",
                                                        isDarkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {t.variables} variable{t.variables > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2 — Confirm & Send */}
                    {step === 2 && selectedTemplate && (
                        <div className="p-6 space-y-5">
                            <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Review &amp; Send
                            </p>

                            {/* Summary card */}
                            <div className={cn(
                                "rounded-2xl border p-4 space-y-4",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                            )}>
                                {/* Recipient */}
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? "text-white/40" : "text-slate-400")}>To</span>
                                    <span className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-800")}>
                                        {selectedChat.name || selectedChat.phone}
                                    </span>
                                </div>

                                {/* Media */}
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? "text-white/40" : "text-slate-400")}>{config.label}</span>
                                    {activeMedia === "image" && (
                                        <img src={mediaUrl} alt="thumb" className="w-12 h-10 rounded-lg object-cover" />
                                    )}
                                    {activeMedia === "video" && (
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-purple-400" : "text-purple-600")}>
                                            🎬 {mediaFileName}
                                        </span>
                                    )}
                                    {activeMedia === "document" && (
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-orange-400" : "text-orange-600")}>
                                            📄 {mediaFileName}
                                        </span>
                                    )}
                                </div>

                                {/* Template */}
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? "text-white/40" : "text-slate-400")}>Template</span>
                                    <span className={cn("text-sm font-bold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                        {selectedTemplate.name}
                                    </span>
                                </div>

                                {/* Body preview */}
                                <div className={cn(
                                    "rounded-xl p-3 mt-1",
                                    isDarkMode ? "bg-black/20" : "bg-white border border-slate-100"
                                )}>
                                    <p className={cn("text-[11px] leading-relaxed whitespace-pre-wrap", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                        {selectedTemplate.description}
                                    </p>
                                    {selectedTemplate.footerText && (
                                        <p className={cn("text-[10px] mt-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                            {selectedTemplate.footerText}
                                        </p>
                                    )}
                                </div>

                                {selectedTemplate.variables > 0 && (
                                    <div className={cn(
                                        "flex items-center gap-2 p-2.5 rounded-lg",
                                        isDarkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
                                    )}>
                                        <AlertCircle size={14} className="text-amber-400 shrink-0" />
                                        <p className={cn("text-[11px] font-medium", isDarkMode ? "text-amber-300" : "text-amber-700")}>
                                            This template has {selectedTemplate.variables} variable{selectedTemplate.variables > 1 ? "s" : ""} — they will be sent blank. Use the standard "Send Template" flow to fill variables.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer Actions ── */}
                <div
                    className={cn(
                        "px-6 py-4 border-t flex items-center justify-between shrink-0",
                        isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/50"
                    )}
                >
                    <div className="flex items-center gap-2">
                        {step > 0 && (
                            <button
                                onClick={() => setStep((s) => (s - 1) as Step)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                    isDarkMode
                                        ? "border-white/10 text-white/60 hover:bg-white/5"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                isDarkMode ? "text-white/50 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            Cancel
                        </button>
                    </div>

                    {step < 2 ? (
                        <button
                            onClick={() => setStep((s) => (s + 1) as Step)}
                            disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md",
                                (step === 0 ? canProceedStep0 : canProceedStep1)
                                    ? activeMedia === "image"
                                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
                                        : activeMedia === "video"
                                            ? "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20"
                                            : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                                    : isDarkMode
                                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            Next <ChevronRight size={15} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSend}
                            disabled={isSending || !selectedTemplate}
                            className="px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <><Loader2 size={14} className="animate-spin" /> Sending…</>
                            ) : (
                                <><Send size={14} /> Send Now</>
                            )}
                        </button>
                    )}
                </div>
            </GlassCard>
        </div>,
        document.body
    );
};

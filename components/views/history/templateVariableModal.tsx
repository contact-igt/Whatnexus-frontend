"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Variable, Image, Video, FileText, Upload, Loader2, MapPin, Play, Pause, ImageIcon, Film, Phone, ExternalLink, Reply } from "lucide-react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { ProcessedTemplate } from "@/components/campaign/templateSelectionModal";
import { useUploadTemplateMediaMutation } from "@/hooks/useTemplateQuery";
import { toast } from "@/lib/toast";

interface TemplateVariableModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: ProcessedTemplate | null;
    onSend: (components: any[]) => void;
    isDarkMode: boolean;
    isPending: boolean;
}

export const TemplateVariableModal = ({
    isOpen,
    onClose,
    template,
    onSend,
    isDarkMode,
    isPending
}: TemplateVariableModalProps) => {
    const [headerValues, setHeaderValues] = useState<string[]>([]);
    const [bodyValues, setBodyValues] = useState<string[]>([]);
    const [headerErrors, setHeaderErrors] = useState<string[]>([]);
    const [bodyErrors, setBodyErrors] = useState<string[]>([]);
    // Media header state
    const [mediaUrl, setMediaUrl] = useState<string>("");
    const [mediaError, setMediaError] = useState<string>("");
    const [mediaFileName, setMediaFileName] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // Button variables state
    const [buttonValues, setButtonValues] = useState<string[]>([]);
    const [buttonErrors, setButtonErrors] = useState<string[]>([]);
    // Location state
    const [locationParams, setLocationParams] = useState({
        latitude: "",
        longitude: "",
        name: "",
        address: ""
    });
    const [locationErrors, setLocationErrors] = useState({
        latitude: "",
        longitude: "",
        name: "",
        address: ""
    });

    // Upload mutation
    const { mutateAsync: uploadMedia } = useUploadTemplateMediaMutation();

    // Check if template has media header
    const hasMediaHeader = template?.type === 'image' || template?.type === 'video' || template?.type === 'document';
    const hasLocationHeader = template?.type === 'location';
    const mediaType = template?.type;

    // Detect variables on template change
    useEffect(() => {
        if (template) {
            // Count header text variables (only for text headers)
            const headerVars = (hasMediaHeader || hasLocationHeader) ? 0 : (template.headerText?.match(/\{\{\d+\}\}/g) || []).length;
            setHeaderValues(new Array(headerVars).fill(""));
            setHeaderErrors(new Array(headerVars).fill(""));

            // Reset media URL and location
            setMediaUrl("");
            setMediaError("");
            setMediaFileName("");
            setLocationParams({ latitude: "", longitude: "", name: "", address: "" });
            setLocationErrors({ latitude: "", longitude: "", name: "", address: "" });

            // Count body variables - use variables property if available, otherwise regex
            const bodyVars = template.variables || (template.description?.match(/\{\{\d+\}\}/g) || []).length;
            setBodyValues(new Array(bodyVars).fill(""));
            setBodyErrors(new Array(bodyVars).fill(""));

            // Button variables
            const btnVars = template.buttonVariables?.length || 0;
            setButtonValues(new Array(btnVars).fill(""));
            setButtonErrors(new Array(btnVars).fill(""));
        }
    }, [template, hasMediaHeader, hasLocationHeader]);

    if (!isOpen || !template) return null;

    const getUploadType = (type?: string): 'image' | 'video' | 'document' => {
        if (type === 'image') return 'image';
        if (type === 'video') return 'video';
        return 'document';
    };

    const handleFileUpload = async (file: File) => {
        if (!file || !template) return;

        const uploadType = getUploadType(template.type);
        setIsUploading(true);
        setMediaFileName(file.name);
        setMediaError("");

        try {
            const response = await uploadMedia({ file, type: uploadType });
            const url = response?.url;
            if (url) {
                setMediaUrl(url);
                toast.success("Media uploaded successfully!");
            } else {
                throw new Error("No URL returned");
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err.message || "Failed to upload media";
            setMediaError(errorMsg);
            toast.error(errorMsg);
            setMediaFileName("");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleSubmit = () => {
        let hasError = false;

        // Validate media URL for media templates
        if (hasMediaHeader) {
            if (!mediaUrl || mediaUrl.trim() === "") {
                setMediaError("Media is required - upload a file or enter URL");
                hasError = true;
            } else {
                setMediaError("");
            }
        }

        // Validate location for location templates
        if (hasLocationHeader) {
            const newLocationErrors = { latitude: "", longitude: "", name: "", address: "" };
            if (!locationParams.latitude.trim()) {
                newLocationErrors.latitude = "Latitude is required";
                hasError = true;
            }
            if (!locationParams.longitude.trim()) {
                newLocationErrors.longitude = "Longitude is required";
                hasError = true;
            }
            if (!locationParams.name.trim()) {
                newLocationErrors.name = "Location name is required";
                hasError = true;
            }
            if (!locationParams.address.trim()) {
                newLocationErrors.address = "Address is required";
                hasError = true;
            }
            setLocationErrors(newLocationErrors);
        }

        // Validate header text variables
        const newHeaderErrors = headerValues.map(val => (!val || val.trim() === "") ? "This field is required" : "");
        setHeaderErrors(newHeaderErrors);
        if (newHeaderErrors.some(e => e)) hasError = true;

        // Validate body variables
        const newBodyErrors = bodyValues.map(val => (!val || val.trim() === "") ? "This field is required" : "");
        setBodyErrors(newBodyErrors);
        if (newBodyErrors.some(e => e)) hasError = true;

        // Validate button variables
        const newButtonErrors = buttonValues.map(val => (!val || val.trim() === "") ? "This field is required" : "");
        setButtonErrors(newButtonErrors);
        if (newButtonErrors.some(e => e)) hasError = true;

        if (hasError) return;

        const components = [];

        // Construct Header Component Payload
        if (hasMediaHeader && mediaUrl) {
            // Media header (image/video/document)
            const mediaParam: any = {
                type: mediaType,
            };
            if (mediaType === 'image') {
                mediaParam.image = { link: mediaUrl };
            } else if (mediaType === 'video') {
                mediaParam.video = { link: mediaUrl };
            } else if (mediaType === 'document') {
                mediaParam.document = { link: mediaUrl, filename: mediaFileName || "document" };
            }
            components.push({
                type: "header",
                parameters: [mediaParam]
            });
        } else if (hasLocationHeader) {
            // Location header
            components.push({
                type: "header",
                parameters: [{
                    type: "location",
                    location: {
                        latitude: parseFloat(locationParams.latitude),
                        longitude: parseFloat(locationParams.longitude),
                        name: locationParams.name,
                        address: locationParams.address
                    }
                }]
            });
        } else if (headerValues.length > 0) {
            // Text header with variables
            components.push({
                type: "header",
                parameters: headerValues.map(val => ({
                    type: "text",
                    text: val
                }))
            });
        }

        // Construct Body Component Payload
        if (bodyValues.length > 0) {
            components.push({
                type: "body",
                parameters: bodyValues.map(val => ({
                    type: "text",
                    text: val
                }))
            });
        }

        // Construct Button Component Payload
        if (buttonValues.length > 0 && template.buttonVariables) {
            template.buttonVariables.forEach((btnVar, idx) => {
                components.push({
                    type: "button",
                    sub_type: "url",
                    index: btnVar.index,
                    parameters: [{
                        type: "text",
                        text: buttonValues[idx]
                    }]
                });
            });
        }

        onSend(components);
        onClose();
    };

    const renderPreview = (text: string, values: string[]) => {
        if (!text) return null;
        let preview = text;
        values.forEach((val, i) => {
            preview = preview.replace(`{{${i + 1}}}`, `[${val || `{{${i + 1}}}`}]`);
        });
        return preview;
    };

    const getMediaIcon = () => {
        if (mediaType === 'image') return <Image size={16} className="text-blue-500" />;
        if (mediaType === 'video') return <Video size={16} className="text-purple-500" />;
        if (mediaType === 'document') return <FileText size={16} className="text-orange-500" />;
        return null;
    };

    const getAcceptedFileTypes = () => {
        if (mediaType === 'image') return "image/jpeg,image/png";
        if (mediaType === 'video') return "video/mp4";
        if (mediaType === 'document') return "application/pdf";
        return "*/*";
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full flex flex-col overflow-hidden p-0"
                style={{ maxWidth: '900px', maxHeight: '90vh' } as any}
            >
                {/* ── Header ── */}
                <div className={cn(
                    "px-6 py-4 border-b flex justify-between items-center shrink-0",
                    isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/50"
                )}>
                    <div className="flex items-center gap-2.5">
                        <Variable size={18} className="text-emerald-500" />
                        <h2 className={cn("text-base font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Customize Template
                        </h2>
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide", isDarkMode ? "bg-white/8 text-white/50" : "bg-slate-100 text-slate-500")}>
                            {template.name}
                        </span>
                    </div>
                    <button onClick={onClose} className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500")}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Two-column body ── */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* LEFT: Inputs */}
                    <div className={cn(
                        "w-[55%] flex flex-col border-r overflow-y-auto",
                        isDarkMode ? "border-white/10" : "border-slate-200"
                    )}>
                        <div className="p-5 space-y-6">

                            {/* ── Media Upload ── */}
                            {hasMediaHeader && (
                                <div className="space-y-2.5">
                                    <label className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                        {getMediaIcon()}
                                        {mediaType === 'image' ? 'Image Header' : mediaType === 'video' ? 'Video Header' : 'Document Header'}
                                    </label>

                                    <input ref={fileInputRef} type="file" accept={getAcceptedFileTypes()} onChange={handleFileSelect} className="hidden" />

                                    {!mediaUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className={cn(
                                                "w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 transition-all",
                                                mediaError ? "border-red-500 bg-red-500/5"
                                                    : isDarkMode ? "border-white/10 bg-white/3 hover:bg-white/6 hover:border-emerald-500/40" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400/50",
                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                            )}
                                        >
                                            {isUploading ? (
                                                <><Loader2 size={26} className={cn("animate-spin", isDarkMode ? "text-white/40" : "text-slate-400")} /><span className={cn("text-xs", isDarkMode ? "text-white/40" : "text-slate-400")}>Uploading…</span></>
                                            ) : (
                                                <>
                                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
                                                        mediaType === 'image' ? isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
                                                            : mediaType === 'video' ? isDarkMode ? "bg-purple-500/10" : "bg-purple-50"
                                                                : isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
                                                    )}>
                                                        {mediaType === 'image' && <ImageIcon size={22} className="text-blue-400" />}
                                                        {mediaType === 'video' && <Film size={22} className="text-purple-400" />}
                                                        {mediaType === 'document' && <FileText size={22} className="text-orange-400" />}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={cn("text-sm font-semibold", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                            {mediaType === 'image' ? 'Upload Photo' : mediaType === 'video' ? 'Upload Video' : 'Upload Document'}
                                                        </p>
                                                        <p className={cn("text-[11px] mt-0.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                            {mediaType === 'image' && 'JPG, PNG · max 5 MB'}
                                                            {mediaType === 'video' && 'MP4 · max 16 MB'}
                                                            {mediaType === 'document' && 'PDF · max 100 MB'}
                                                        </p>
                                                    </div>
                                                    <span className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold", isDarkMode ? "bg-white/10 text-white/70" : "bg-white text-slate-600 shadow-sm border border-slate-200")}>
                                                        Browse
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className={cn("flex items-center gap-3 p-3 rounded-xl border", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                                mediaType === 'image' ? "bg-blue-500/15" : mediaType === 'video' ? "bg-purple-500/15" : "bg-orange-500/15"
                                            )}>
                                                {mediaType === 'image' && <ImageIcon size={16} className="text-blue-400" />}
                                                {mediaType === 'video' && <Film size={16} className="text-purple-400" />}
                                                {mediaType === 'document' && <FileText size={16} className="text-orange-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-semibold truncate", isDarkMode ? "text-white" : "text-slate-800")}>
                                                    {mediaFileName || (mediaType === 'image' ? 'Image uploaded' : mediaType === 'video' ? 'Video uploaded' : 'Document uploaded')}
                                                </p>
                                                <p className={cn("text-[10px] mt-0.5 text-emerald-500 font-medium")}>✓ Ready to send</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn("text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors", isDarkMode ? "bg-white/10 text-white/60 hover:bg-white/15" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                                            >
                                                Replace
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setMediaUrl(""); setMediaFileName(""); setIsVideoPlaying(false); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    )}
                                    {mediaError && <p className="text-red-500 text-[11px]">{mediaError}</p>}
                                </div>
                            )}

                            {/* ── Location Header ── */}
                            {hasLocationHeader && (
                                <div className="space-y-2.5">
                                    <label className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                        <MapPin size={13} className="text-rose-500" /> Location Header
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['latitude', 'longitude'] as const).map(field => (
                                            <div key={field} className="flex flex-col gap-1">
                                                <label className={cn("text-xs font-medium capitalize", isDarkMode ? "text-white/70" : "text-slate-700")}>{field} <span className="text-red-500">*</span></label>
                                                <input type="text" value={locationParams[field]}
                                                    onChange={(e) => { setLocationParams(p => ({ ...p, [field]: e.target.value })); if (locationErrors[field]) setLocationErrors(err => ({ ...err, [field]: "" })); }}
                                                    placeholder={field === 'latitude' ? '37.7749' : '-122.4194'}
                                                    className={cn("w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all",
                                                        locationErrors[field] ? "border-red-500 focus:ring-red-500/20" : isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20")}
                                                />
                                                {locationErrors[field] && <p className="text-red-500 text-[10px]">{locationErrors[field]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    {(['name', 'address'] as const).map(field => (
                                        <div key={field} className="flex flex-col gap-1">
                                            <label className={cn("text-xs font-medium capitalize", isDarkMode ? "text-white/70" : "text-slate-700")}>{field === 'name' ? 'Location Name' : 'Address'} <span className="text-red-500">*</span></label>
                                            <input type="text" value={locationParams[field]}
                                                onChange={(e) => { setLocationParams(p => ({ ...p, [field]: e.target.value })); if (locationErrors[field]) setLocationErrors(err => ({ ...err, [field]: "" })); }}
                                                placeholder={field === 'name' ? 'e.g., Our Clinic' : 'e.g., 123 Main St, City'}
                                                className={cn("w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all",
                                                    locationErrors[field] ? "border-red-500 focus:ring-red-500/20" : isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20")}
                                            />
                                            {locationErrors[field] && <p className="text-red-500 text-[10px]">{locationErrors[field]}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Header Text Variables ── */}
                            {headerValues.length > 0 && (
                                <div className="space-y-2.5">
                                    <label className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/50" : "text-slate-500")}>Header Variables</label>
                                    {headerValues.map((val, i) => (
                                        <div key={`hv-${i}`} className="flex flex-col gap-1">
                                            <label className={cn("text-xs font-medium", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                Variable {`{{${i + 1}}}`} <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" value={val}
                                                onChange={(e) => { const n = [...headerValues]; n[i] = e.target.value; setHeaderValues(n); if (headerErrors[i]) { const e2 = [...headerErrors]; e2[i] = ""; setHeaderErrors(e2); } }}
                                                placeholder={`Value for {{${i + 1}}}`}
                                                className={cn("w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all",
                                                    headerErrors[i] ? "border-red-500 focus:ring-red-500/20 bg-red-500/5" : isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20")} />
                                            {headerErrors[i] && <p className="text-red-500 text-[11px]">{headerErrors[i]}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Body Variables ── */}
                            {bodyValues.length > 0 && (
                                <div className="space-y-2.5">
                                    <label className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/50" : "text-slate-500")}>Body Variables</label>
                                    {bodyValues.map((val, i) => (
                                        <div key={`bv-${i}`} className="flex flex-col gap-1">
                                            <label className={cn("text-xs font-medium", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                Variable {`{{${i + 1}}}`} <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" value={val}
                                                onChange={(e) => { const n = [...bodyValues]; n[i] = e.target.value; setBodyValues(n); if (bodyErrors[i]) { const e2 = [...bodyErrors]; e2[i] = ""; setBodyErrors(e2); } }}
                                                placeholder={`Value for {{${i + 1}}}`}
                                                className={cn("w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all",
                                                    bodyErrors[i] ? "border-red-500 focus:ring-red-500/20 bg-red-500/5" : isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20")} />
                                            {bodyErrors[i] && <p className="text-red-500 text-[11px]">{bodyErrors[i]}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Button Variables ── */}
                            {buttonValues.length > 0 && template.buttonVariables && (
                                <div className="space-y-2.5">
                                    <label className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/50" : "text-slate-500")}>Button Variables</label>
                                    {template.buttonVariables.map((btnVar: any, i: number) => (
                                        <div key={`btn-${i}`} className="flex flex-col gap-1">
                                            <label className={cn("text-xs font-medium", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                "{btnVar.text}" URL Suffix <span className="text-red-500">*</span>
                                            </label>
                                            <input type="text" value={buttonValues[i] || ""}
                                                onChange={(e) => { const n = [...buttonValues]; n[i] = e.target.value; setButtonValues(n); if (buttonErrors[i]) { const e2 = [...buttonErrors]; e2[i] = ""; setButtonErrors(e2); } }}
                                                placeholder="Enter URL suffix..."
                                                className={cn("w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all",
                                                    buttonErrors[i] ? "border-red-500 focus:ring-red-500/20 bg-red-500/5" : isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20")} />
                                            {buttonErrors[i] && <p className="text-red-500 text-[11px]">{buttonErrors[i]}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: WhatsApp Preview */}
                    <div className={cn(
                        "w-[45%] flex flex-col overflow-y-auto",
                        isDarkMode
                            ? "bg-[#0b141a]"
                            : "bg-[#e5ddd5]"
                    )}
                        style={{
                            backgroundImage: isDarkMode
                                ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3C/svg%3E")'
                                : undefined,
                        }}
                    >
                        <div className={cn("px-3 py-2 text-center text-[10px] font-semibold sticky top-0 z-10", isDarkMode ? "text-white/30 bg-[#0b141a]" : "text-slate-500 bg-[#e5ddd5]")}>
                            Preview
                        </div>
                        <div className="flex-1 px-4 py-3 flex flex-col gap-3">
                            {/* WhatsApp message bubble */}
                            <div className="flex justify-end">
                                <div
                                    className="rounded-lg overflow-hidden shadow-md relative"
                                    style={{
                                        background: isDarkMode ? '#025144' : '#dcf8c6',
                                        maxWidth: '260px',
                                        width: '100%',
                                        borderRadius: '8px 0px 8px 8px',
                                    }}
                                >
                                    {/* ── MEDIA HEADER ── */}
                                    {hasMediaHeader && (
                                        <>
                                            {mediaType === 'image' && (
                                                mediaUrl ? (
                                                    <img src={mediaUrl} alt="header" className="w-full object-cover block" style={{ maxHeight: '180px' }} />
                                                ) : (
                                                    <div className="w-full flex items-center justify-center" style={{ aspectRatio: '4/3', background: isDarkMode ? '#1a3530' : '#c8e6c9' }}>
                                                        <ImageIcon size={28} className={isDarkMode ? "text-white/20" : "text-slate-400/50"} />
                                                    </div>
                                                )
                                            )}
                                            {mediaType === 'video' && (
                                                mediaUrl ? (
                                                    <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                                                        <video ref={videoRef} src={mediaUrl} className="w-full h-full object-contain"
                                                            onPlay={() => setIsVideoPlaying(true)} onPause={() => setIsVideoPlaying(false)} onEnded={() => setIsVideoPlaying(false)} />
                                                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer group/pv"
                                                            onClick={() => { if (!videoRef.current) return; isVideoPlaying ? videoRef.current.pause() : videoRef.current.play(); }}>
                                                            <div className={cn("w-10 h-10 rounded-full bg-black/55 flex items-center justify-center transition-all",
                                                                isVideoPlaying ? "opacity-0 group-hover/pv:opacity-100" : "opacity-100")}>
                                                                {isVideoPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center" style={{ aspectRatio: '16/9', background: isDarkMode ? '#0d1f1c' : '#b2dfdb' }}>
                                                        <Play size={28} className={isDarkMode ? "text-white/20" : "text-slate-400/50"} />
                                                    </div>
                                                )
                                            )}
                                            {mediaType === 'document' && (
                                                <div className={cn("flex items-center gap-2.5 px-3 py-2.5", isDarkMode ? "bg-[#1a2f2c]" : "bg-[#b2dfca]")}>
                                                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-orange-500/20">
                                                        <FileText size={15} className="text-orange-400" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <p className={cn("text-[11px] font-semibold truncate", isDarkMode ? "text-white" : "text-slate-800")}>
                                                            {mediaFileName || 'document.pdf'}
                                                        </p>
                                                        <span className={cn("text-[9px]", isDarkMode ? "text-white/40" : "text-slate-400")}>PDF · {mediaUrl ? '✓ Ready' : 'Not uploaded'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ── BUBBLE BODY ── */}
                                    <div className="px-2.5 pt-2 pb-2">
                                        {/* Header text */}
                                        {template.headerText && !hasMediaHeader && !hasLocationHeader && (
                                            <p className={cn("text-[12px] font-bold leading-snug mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {renderPreview(template.headerText, headerValues)}
                                            </p>
                                        )}

                                        {/* Body text */}
                                        {template.description && (
                                            <p className={cn("text-[11px] leading-relaxed whitespace-pre-wrap", isDarkMode ? "text-white/90" : "text-slate-800")}>
                                                {renderPreview(template.description, bodyValues)}
                                            </p>
                                        )}

                                        {/* Footer */}
                                        {template.footerText && (
                                            <p className={cn("text-[10px] mt-1", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                {template.footerText}
                                            </p>
                                        )}

                                        {/* Timestamp */}
                                        <div className="flex justify-end mt-1">
                                            <span className={cn("text-[9px]", isDarkMode ? "text-white/35" : "text-slate-400")}>
                                                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── BUTTONS ── */}
                                    {template.allButtons && template.allButtons.length > 0 && (
                                        <div className={cn("border-t", isDarkMode ? "border-white/10" : "border-black/10")}>
                                            {template.allButtons.map((btn: any, i: number) => {
                                                const isQuickReply = btn.type?.toUpperCase() === 'QUICK_REPLY';
                                                const isPhone = btn.type?.toUpperCase() === 'PHONE_NUMBER';
                                                const isUrl = btn.type?.toUpperCase() === 'URL';
                                                return (
                                                    <div key={i} className={cn(
                                                        "flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold",
                                                        i > 0 && (isDarkMode ? "border-t border-white/10" : "border-t border-black/10"),
                                                        isQuickReply
                                                            ? isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                                            : isPhone
                                                                ? isDarkMode ? "text-blue-400" : "text-blue-600"
                                                                : isDarkMode ? "text-sky-400" : "text-sky-600"
                                                    )}>
                                                        {isQuickReply && <Reply size={11} />}
                                                        {isPhone && <Phone size={11} />}
                                                        {isUrl && <ExternalLink size={11} />}
                                                        {btn.text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer Actions ── */}
                <div className={cn(
                    "px-6 py-3.5 border-t flex justify-end gap-3 shrink-0",
                    isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50/50"
                )}>
                    <button
                        onClick={onClose}
                        className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", isDarkMode ? "bg-white/10 hover:bg-white/15 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20"
                    >
                        <Send size={14} />
                        {isPending ? "Sending…" : "Send Template"}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

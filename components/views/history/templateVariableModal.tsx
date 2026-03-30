"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Variable, Image, Video, FileText, Link, Upload, Loader2, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { ProcessedTemplate } from "@/components/campaign/templateSelectionModal";
import { useUploadTemplateMediaMutation } from "@/hooks/useTemplateQuery";
import { toast } from "sonner";

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
    const fileInputRef = useRef<HTMLInputElement>(null);
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-lg flex flex-col overflow-hidden p-0"
            >
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-2">
                        <Variable size={20} className="text-emerald-500" />
                        <h2 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Customize Template
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <X size={20} className={isDarkMode ? 'text-white/60' : 'text-slate-600'} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Media Header Input (Image/Video/Document) */}
                    {hasMediaHeader && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                {getMediaIcon()}
                                {mediaType === 'image' && 'Image Header'}
                                {mediaType === 'video' && 'Video Header'}
                                {mediaType === 'document' && 'Document Header'}
                            </h3>
                            <div className={cn(
                                "p-4 rounded-lg border-2 border-dashed",
                                mediaError ? "border-red-500" : isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                            )}>
                                {/* File Upload Section */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={getAcceptedFileTypes()}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {!mediaUrl ? (
                                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                        <div className={cn(
                                            "p-3 rounded-full",
                                            isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                        )}>
                                            {isUploading ? (
                                                <Loader2 size={24} className="text-emerald-500 animate-spin" />
                                            ) : (
                                                <Upload size={24} className="text-emerald-500" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                                                    "bg-emerald-500 hover:bg-emerald-600 text-white",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                                )}
                                            >
                                                {isUploading ? "Uploading..." : `Upload ${mediaType?.charAt(0).toUpperCase()}${mediaType?.slice(1)}`}
                                            </button>
                                            <p className={cn("text-[10px] mt-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                {mediaType === 'image' && 'JPG, PNG (max 5MB)'}
                                                {mediaType === 'video' && 'MP4 (max 16MB)'}
                                                {mediaType === 'document' && 'PDF (max 100MB)'}
                                            </p>
                                        </div>

                                        {/* URL Input Alternative */}
                                        <div className="w-full pt-3 border-t border-white/10">
                                            <label className={cn("text-xs font-medium flex items-center gap-1 mb-2", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                                <Link size={12} />
                                                Or paste URL
                                            </label>
                                            <input
                                                type="url"
                                                value={mediaUrl}
                                                onChange={(e) => {
                                                    setMediaUrl(e.target.value);
                                                    if (mediaError) setMediaError("");
                                                }}
                                                placeholder={`https://...`}
                                                className={cn(
                                                    "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                    isDarkMode
                                                        ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                                )}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* Preview uploaded/entered media */
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {getMediaIcon()}
                                            <div className="min-w-0">
                                                <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {mediaFileName || "Media URL"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMediaUrl("");
                                                setMediaFileName("");
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}

                                {mediaError && (
                                    <p className="text-red-500 text-[11px] mt-2 animate-in slide-in-from-top-1">
                                        {mediaError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location Header Input */}
                    {hasLocationHeader && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-2", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                <MapPin size={16} className="text-rose-500" />
                                Location Header
                            </h3>
                            <div className={cn(
                                "p-4 rounded-lg border",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                            )}>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col space-y-1">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Latitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={locationParams.latitude}
                                            onChange={(e) => {
                                                setLocationParams(p => ({ ...p, latitude: e.target.value }));
                                                if (locationErrors.latitude) setLocationErrors(err => ({ ...err, latitude: "" }));
                                            }}
                                            placeholder="e.g., 37.7749"
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                locationErrors.latitude ? "border-red-500 focus:ring-red-500/20" :
                                                    isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                            )}
                                        />
                                        {locationErrors.latitude && <p className="text-red-500 text-[10px]">{locationErrors.latitude}</p>}
                                    </div>
                                    <div className="flex flex-col space-y-1">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Longitude <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={locationParams.longitude}
                                            onChange={(e) => {
                                                setLocationParams(p => ({ ...p, longitude: e.target.value }));
                                                if (locationErrors.longitude) setLocationErrors(err => ({ ...err, longitude: "" }));
                                            }}
                                            placeholder="e.g., -122.4194"
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                locationErrors.longitude ? "border-red-500 focus:ring-red-500/20" :
                                                    isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                            )}
                                        />
                                        {locationErrors.longitude && <p className="text-red-500 text-[10px]">{locationErrors.longitude}</p>}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1 mt-3">
                                    <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                        Location Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={locationParams.name}
                                        onChange={(e) => {
                                            setLocationParams(p => ({ ...p, name: e.target.value }));
                                            if (locationErrors.name) setLocationErrors(err => ({ ...err, name: "" }));
                                        }}
                                        placeholder="e.g., Our Clinic"
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                            locationErrors.name ? "border-red-500 focus:ring-red-500/20" :
                                                isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                    : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                        )}
                                    />
                                    {locationErrors.name && <p className="text-red-500 text-[10px]">{locationErrors.name}</p>}
                                </div>
                                <div className="flex flex-col space-y-1 mt-3">
                                    <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={locationParams.address}
                                        onChange={(e) => {
                                            setLocationParams(p => ({ ...p, address: e.target.value }));
                                            if (locationErrors.address) setLocationErrors(err => ({ ...err, address: "" }));
                                        }}
                                        placeholder="e.g., 123 Main St, City"
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                            locationErrors.address ? "border-red-500 focus:ring-red-500/20" :
                                                isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                    : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                        )}
                                    />
                                    {locationErrors.address && <p className="text-red-500 text-[10px]">{locationErrors.address}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header Text Variables */}
                    {headerValues.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Header Variables
                            </h3>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono mb-2">
                                {template.headerText}
                            </div>
                            <div className="grid gap-3">
                                {headerValues.map((val, i) => (
                                    <div key={`header-${i}`} className="flex flex-col space-y-1">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Variable {'{{'}{i + 1}{'}}'}
                                            <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => {
                                                const newValues = [...headerValues];
                                                newValues[i] = e.target.value;
                                                setHeaderValues(newValues);
                                                if (headerErrors[i]) {
                                                    const newErrs = [...headerErrors];
                                                    newErrs[i] = "";
                                                    setHeaderErrors(newErrs);
                                                }
                                            }}
                                            placeholder={`Enter value for {{${i + 1}}}...`}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                headerErrors[i]
                                                    ? "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                                                    : isDarkMode
                                                        ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                            )}
                                        />
                                        {headerErrors[i] && (
                                            <p className="text-red-500 text-[11px] ml-0.5 animate-in slide-in-from-top-1">
                                                {headerErrors[i]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Body Variables */}
                    {bodyValues.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Body Variables
                            </h3>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono mb-2 whitespace-pre-wrap">
                                {renderPreview(template.description, bodyValues)}
                            </div>
                            <div className="grid gap-3">
                                {bodyValues.map((val, i) => (
                                    <div key={`body-${i}`} className="flex flex-col space-y-1">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Variable {'{{'}{i + 1}{'}}'}
                                            <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => {
                                                const newValues = [...bodyValues];
                                                newValues[i] = e.target.value;
                                                setBodyValues(newValues);
                                                if (bodyErrors[i]) {
                                                    const newErrs = [...bodyErrors];
                                                    newErrs[i] = "";
                                                    setBodyErrors(newErrs);
                                                }
                                            }}
                                            placeholder={`Enter value for {{${i + 1}}}...`}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                bodyErrors[i]
                                                    ? "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                                                    : isDarkMode
                                                        ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                            )}
                                        />
                                        {bodyErrors[i] && (
                                            <p className="text-red-500 text-[11px] ml-0.5 animate-in slide-in-from-top-1">
                                                {bodyErrors[i]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Button Variables (URL suffix) */}
                    {buttonValues.length > 0 && template.buttonVariables && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Button Variables
                            </h3>
                            <div className="grid gap-3">
                                {template.buttonVariables.map((btnVar: any, i: number) => (
                                    <div key={`button-${i}`} className="flex flex-col space-y-1">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Button "{btnVar.text}" - URL Suffix
                                            <span className="text-red-500 ml-0.5">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={buttonValues[i] || ""}
                                            onChange={(e) => {
                                                const newValues = [...buttonValues];
                                                newValues[i] = e.target.value;
                                                setButtonValues(newValues);
                                                if (buttonErrors[i]) {
                                                    const newErrs = [...buttonErrors];
                                                    newErrs[i] = "";
                                                    setButtonErrors(newErrs);
                                                }
                                            }}
                                            placeholder={`Enter URL suffix value...`}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 outline-none",
                                                buttonErrors[i]
                                                    ? "border-red-500 focus:ring-red-500/20 bg-red-500/5"
                                                    : isDarkMode
                                                        ? "bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:ring-emerald-500/20"
                                                        : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20"
                                            )}
                                        />
                                        {buttonErrors[i] && (
                                            <p className="text-red-500 text-[11px] ml-0.5 animate-in slide-in-from-top-1">
                                                {buttonErrors[i]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                            "bg-emerald-500 hover:bg-emerald-600 text-white",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        <Send size={14} />
                        {isPending ? "Sending..." : "Send Template"}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

"use client";

import { useState } from 'react';
import { Zap, Plus, X, Link, Phone, Copy, ShoppingBag, Package, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InteractiveActionType, CTAButton, CTAType, MPMSection } from './templateTypes';
import { generateId } from './templateUtils';

interface InteractiveActionsSectionProps {
    isDarkMode: boolean;
    actionType: InteractiveActionType;
    onActionTypeChange: (type: InteractiveActionType) => void;
    ctaButtons: CTAButton[];
    onCTAButtonsChange: (buttons: CTAButton[]) => void;
    quickReplies: string[];
    onQuickRepliesChange: (replies: string[]) => void;
    ctaErrors?: any[];
    disabled?: boolean;
    isCarousel?: boolean;
}

const COUNTRY_CODES = [
    { value: '+91', label: '🇮🇳 India (+91)' },
    { value: '+1', label: '🇺🇸 USA (+1)' },
    { value: '+44', label: '🇬🇧 UK (+44)' },
    { value: '+971', label: '🇦🇪 UAE (+971)' },
    { value: '+65', label: '🇸🇬 Singapore (+65)' },
    { value: '+61', label: '🇦🇺 Australia (+61)' },
    { value: '+966', label: '🇸🇦 Saudi Arabia (+966)' },
    { value: '+92', label: '🇵🇰 Pakistan (+92)' },
    { value: '+880', label: '🇧🇩 Bangladesh (+880)' },
    { value: '+62', label: '🇮🇩 Indonesia (+62)' },
    { value: '+60', label: '🇲🇾 Malaysia (+60)' },
    { value: '+63', label: '🇵🇭 Philippines (+63)' },
    { value: '+84', label: '🇻🇳 Vietnam (+84)' },
    { value: '+234', label: '🇳🇬 Nigeria (+234)' },
    { value: '+27', label: '🇿🇦 South Africa (+27)' },
    { value: '+20', label: '🇪🇬 Egypt (+20)' },
    { value: '+55', label: '🇧🇷 Brazil (+55)' },
    { value: '+52', label: '🇲🇽 Mexico (+52)' },
    { value: '+33', label: '🇫🇷 France (+33)' },
    { value: '+49', label: '🇩🇪 Germany (+49)' },
    { value: '+39', label: '🇮🇹 Italy (+39)' },
    { value: '+34', label: '🇪🇸 Spain (+34)' },
    { value: '+7', label: '🇷🇺 Russia (+7)' },
    { value: '+86', label: '🇨🇳 China (+86)' },
    { value: '+81', label: '🇯🇵 Japan (+81)' },
    { value: '+82', label: '🇰🇷 South Korea (+82)' },
];

// ─── MPM Section Editor ──────────────────────────────────────────────────────
interface MPMSectionEditorProps {
    isDarkMode: boolean;
    sections: MPMSection[];
    onChange: (sections: MPMSection[]) => void;
    disabled?: boolean;
}

const MPMSectionEditor = ({ isDarkMode, sections, onChange, disabled }: MPMSectionEditorProps) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(sections.length > 0 ? 0 : null);

    const addSection = () => {
        if (sections.length >= 10) return;
        const newSections = [...sections, { title: `Section ${sections.length + 1}`, productRetailerIds: [''] }];
        onChange(newSections);
        setExpandedIdx(newSections.length - 1);
    };

    const removeSection = (idx: number) => {
        const updated = sections.filter((_, i) => i !== idx);
        onChange(updated);
        setExpandedIdx(updated.length > 0 ? Math.min(idx, updated.length - 1) : null);
    };

    const updateSectionTitle = (idx: number, title: string) => {
        const updated = sections.map((s, i) => i === idx ? { ...s, title } : s);
        onChange(updated);
    };

    const addProduct = (sectionIdx: number) => {
        const updated = sections.map((s, i) => i === sectionIdx
            ? { ...s, productRetailerIds: [...s.productRetailerIds, ''] }
            : s
        );
        onChange(updated);
    };

    const updateProduct = (sectionIdx: number, productIdx: number, value: string) => {
        const updated = sections.map((s, i) => i === sectionIdx
            ? { ...s, productRetailerIds: s.productRetailerIds.map((p, pi) => pi === productIdx ? value : p) }
            : s
        );
        onChange(updated);
    };

    const removeProduct = (sectionIdx: number, productIdx: number) => {
        const updated = sections.map((s, i) => i === sectionIdx
            ? { ...s, productRetailerIds: s.productRetailerIds.filter((_, pi) => pi !== productIdx) }
            : s
        );
        onChange(updated);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className={cn("text-[11px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                    Product Sections ({sections.length}/10)
                </p>
                {!disabled && (
                    <button
                        type="button"
                        onClick={addSection}
                        disabled={sections.length >= 10}
                        className={cn(
                            "py-1 px-3 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                        )}
                    >
                        <Plus size={11} />
                        Add Section
                    </button>
                )}
            </div>

            {sections.length === 0 && (
                <div className={cn(
                    "rounded-xl border border-dashed text-center py-6",
                    isDarkMode ? 'border-white/10 text-white/30' : 'border-slate-200 text-slate-400'
                )}>
                    <Package size={20} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[11px]">No sections yet. Add at least one section with products.</p>
                </div>
            )}

            {sections.map((section, idx) => (
                <div key={idx} className={cn(
                    "rounded-xl border overflow-hidden",
                    isDarkMode ? 'border-white/10 bg-white/3' : 'border-slate-200 bg-slate-50/50'
                )}>
                    {/* Section Header */}
                    <button
                        type="button"
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100/50'
                        )}
                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    >
                        <div className="flex items-center gap-2">
                            <Package size={14} className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} />
                            <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                {section.title || `Section ${idx + 1}`}
                            </span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                isDarkMode ? 'bg-white/10 text-white/50' : 'bg-slate-200 text-slate-500'
                            )}>
                                {section.productRetailerIds.filter(p => p.trim()).length} products
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeSection(idx); }}
                                    className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                            {expandedIdx === idx ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
                        </div>
                    </button>

                    {/* Section Body */}
                    {expandedIdx === idx && (
                        <div className={cn("px-4 pb-4 space-y-3 border-t", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                            {/* Section Title Input */}
                            <div className="pt-3">
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Section Title"
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateSectionTitle(idx, e.target.value)}
                                    placeholder="e.g. Best Sellers, New Arrivals"
                                    disabled={disabled}
                                />
                            </div>

                            {/* Products */}
                            <div className="space-y-2">
                                <p className={cn("text-[11px] font-semibold", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Product Retailer IDs
                                </p>
                                {section.productRetailerIds.map((productId, pIdx) => (
                                    <div key={pIdx} className="flex gap-2 items-center">
                                        <div className="flex-1">
                                            <Input
                                                isDarkMode={isDarkMode}
                                                type="text"
                                                value={productId}
                                                onChange={(e) => updateProduct(idx, pIdx, e.target.value)}
                                                placeholder={`Product Retailer ID ${pIdx + 1}`}
                                                disabled={disabled}
                                            />
                                        </div>
                                        {!disabled && section.productRetailerIds.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(idx, pIdx)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!disabled && (
                                    <button
                                        type="button"
                                        onClick={() => addProduct(idx)}
                                        className={cn(
                                            "w-full py-2 rounded-lg border border-dashed text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all",
                                            isDarkMode
                                                ? 'border-white/10 text-white/40 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5'
                                                : 'border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                        )}
                                    >
                                        <Plus size={12} />
                                        Add Product
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const InteractiveActionsSection = ({
    isDarkMode,
    actionType,
    onActionTypeChange,
    ctaButtons,
    onCTAButtonsChange,
    quickReplies,
    onQuickRepliesChange,
    ctaErrors = [],
    disabled = false,
    isCarousel = false
}: InteractiveActionsSectionProps) => {

    const addCTAButton = (type: CTAType) => {
        const urlButtons = ctaButtons.filter(b => b.type === 'URL').length;
        const phoneButtons = ctaButtons.filter(b => b.type === 'PHONE').length;
        const copyCodeButtons = ctaButtons.filter(b => b.type === 'COPY_CODE').length;
        const commerceButtons = ctaButtons.filter(b => (b.type === 'CATALOG' || b.type === 'MPM')).length;

        // Carousel specific limit check
        const maxTotalButtons = isCarousel ? 2 : 3;
        if (ctaButtons.length >= maxTotalButtons) return;

        if (type === 'URL' && urlButtons >= 2) return;
        if (type === 'PHONE' && phoneButtons >= 1) return;
        if (type === 'COPY_CODE' && copyCodeButtons >= 1) return;
        if ((type === 'CATALOG' || type === 'MPM') && commerceButtons >= 1) return;

        const newButton: CTAButton = {
            id: generateId(),
            type,
            label: type === 'URL' ? 'Visit Website' :
                   type === 'PHONE' ? 'Call Us' :
                   type === 'COPY_CODE' ? 'Copy Code' :
                   type === 'CATALOG' ? 'View Catalog' : 'View Products',
            value: type === 'PHONE' ? '+91 ' : '',
            ...(type === 'MPM' ? { mpmSections: [{ title: 'Section 1', productRetailerIds: [''] }] } : {}),
        };
        onCTAButtonsChange([...ctaButtons, newButton]);
    };

    const updateCTAButton = (id: string, field: keyof CTAButton, value: any) => {
        onCTAButtonsChange(
            ctaButtons.map(btn => btn.id === id ? { ...btn, [field]: value } : btn)
        );
    };

    const removeCTAButton = (id: string) => {
        onCTAButtonsChange(ctaButtons.filter(btn => btn.id !== id));
    };

    const addQuickReply = () => {
        if (quickReplies.length >= 3) return; // maximum of 3 quick reply button is applicable
        onQuickRepliesChange([...quickReplies, '']);
    };

    const updateQuickReply = (index: number, value: string) => {
        if (value.length > 25) return; // Max 25 characters
        const newReplies = [...quickReplies];
        newReplies[index] = value;
        onQuickRepliesChange(newReplies);
    };

    const removeQuickReply = (index: number) => {
        onQuickRepliesChange(quickReplies.filter((_, i) => i !== index));
    };

    const isAuthMode = actionType === 'Authentication';
    const showCTA = !isAuthMode && (actionType === 'CTA' || actionType === 'All');
    const showQuickReplies = !isAuthMode && !isCarousel && (actionType === 'QuickReplies' || actionType === 'All');

    // Filter action types for Carousel
    const allowedActionTypes: InteractiveActionType[] = isCarousel
        ? ['None', 'CTA']
        : ['None', 'CTA', 'QuickReplies', 'All'];

    const renderCTAButtonFields = (button: CTAButton, index: number) => {
        // ─── CATALOG Button ───────────────────────────────────────────────────
        if (button.type === 'CATALOG') {
            return (
                <div className={cn("rounded-xl border p-4 space-y-3", isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold flex items-center gap-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            <ShoppingBag size={14} className="text-emerald-500" />
                            🛍️ Catalog Button
                        </span>
                        {!disabled && (
                            <button type="button" onClick={() => removeCTAButton(button.id)} className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Info Banner */}
                    <div className={cn(
                        "rounded-lg p-3 border text-[11px] leading-relaxed",
                        isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    )}>
                        📦 This button opens your WhatsApp Business catalog. Users can browse and order products directly. No URL needed.
                    </div>

                    {/* Button Label */}
                    <Input
                        isDarkMode={isDarkMode}
                        label="Button Label"
                        type="text"
                        value={button.label}
                        onChange={(e) => updateCTAButton(button.id, 'label', e.target.value.slice(0, 25))}
                        placeholder="e.g. View Catalog (max 25 chars)"
                        error={ctaErrors?.[index]?.label?.message}
                        disabled={disabled}
                    />

                    {/* Thumbnail Product Retailer ID (optional) */}
                    <Input
                        isDarkMode={isDarkMode}
                        label="Thumbnail Product Retailer ID (optional)"
                        type="text"
                        value={button.thumbnailProductRetailerId || ''}
                        onChange={(e) => updateCTAButton(button.id, 'thumbnailProductRetailerId', e.target.value)}
                        placeholder="e.g. PROD-001 — used as thumbnail in catalog preview"
                        disabled={disabled}
                    />

                    <span className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                        {button.label.length}/25 characters
                    </span>
                </div>
            );
        }

        // ─── MPM Button ───────────────────────────────────────────────────────
        if (button.type === 'MPM') {
            return (
                <div className={cn("rounded-xl border p-4 space-y-4", isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')}>
                    <div className="flex items-center justify-between">
                        <span className={cn("text-xs font-bold flex items-center gap-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            <Package size={14} className="text-violet-500" />
                            🛍️ Multi-Product Message (MPM)
                        </span>
                        {!disabled && (
                            <button type="button" onClick={() => removeCTAButton(button.id)} className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Info Banner */}
                    <div className={cn(
                        "rounded-lg p-3 border text-[11px] leading-relaxed",
                        isDarkMode ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-violet-50 border-violet-200 text-violet-700'
                    )}>
                        🗂️ MPM lets you send multiple product sections in one message. Users can browse and add products to cart from within the chat.
                    </div>

                    {/* Button Label */}
                    <Input
                        isDarkMode={isDarkMode}
                        label="Button Label"
                        type="text"
                        value={button.label}
                        onChange={(e) => updateCTAButton(button.id, 'label', e.target.value.slice(0, 25))}
                        placeholder="e.g. View Products (max 25 chars)"
                        error={ctaErrors?.[index]?.label?.message}
                        disabled={disabled}
                    />

                    {/* Thumbnail Product Retailer ID */}
                    <Input
                        isDarkMode={isDarkMode}
                        label="Thumbnail Product Retailer ID"
                        type="text"
                        value={button.mpmThumbnailProductRetailerId || ''}
                        onChange={(e) => updateCTAButton(button.id, 'mpmThumbnailProductRetailerId', e.target.value)}
                        placeholder="e.g. PROD-001 — shown as message header thumbnail"
                        disabled={disabled}
                    />

                    <span className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                        {button.label.length}/25 characters
                    </span>

                    {/* MPM Sections */}
                    <div className={cn("rounded-xl border p-3 space-y-3", isDarkMode ? 'border-white/10 bg-white/3' : 'border-slate-200 bg-white/70')}>
                        <MPMSectionEditor
                            isDarkMode={isDarkMode}
                            sections={button.mpmSections || []}
                            onChange={(sections) => updateCTAButton(button.id, 'mpmSections', sections)}
                            disabled={disabled}
                        />
                    </div>
                </div>
            );
        }

        // ─── Standard Buttons (URL, PHONE, COPY_CODE) ────────────────────────
        return (
            <div key={button.id} className={cn(
                "p-4 rounded-xl border space-y-3",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            )}>
                <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        {button.type === 'URL' ? '🔗 URL Button' :
                         button.type === 'PHONE' ? '📞 Phone Button' :
                         '📋 Copy Code'}
                    </span>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => removeCTAButton(button.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <Input
                    isDarkMode={isDarkMode}
                    type="text"
                    value={button.label}
                    onChange={(e) => updateCTAButton(button.id, 'label', e.target.value.slice(0, 25))}
                    placeholder="Button Label (max 25 chars)"
                    error={ctaErrors && ctaErrors[index]?.label?.message}
                    disabled={disabled}
                />
                {button.type === 'PHONE' ? (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="w-[180px] shrink-0">
                                <Select
                                    isDarkMode={isDarkMode}
                                    label="Code"
                                    value={button.value.split(' ')[0] || '+91'}
                                    onChange={(val: string) => {
                                        const parts = button.value.split(' ');
                                        const num = parts.slice(1).join(' ');
                                        updateCTAButton(button.id, 'value', `${val} ${num}`);
                                    }}
                                    options={COUNTRY_CODES}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Mobile Number"
                                    type="text"
                                    value={button.value.split(' ').slice(1).join(' ') || ''}
                                    onChange={(e) => {
                                        const parts = button.value.split(' ');
                                        const cc = parts[0] || '';
                                        updateCTAButton(button.id, 'value', `${cc} ${e.target.value}`);
                                    }}
                                    placeholder="e.g. 9876543210"
                                    variant="secondary"
                                    error={ctaErrors?.[index]?.value?.message?.toLowerCase().includes('phone') || ctaErrors?.[index]?.value?.message?.toLowerCase().includes('digit') ? ctaErrors[index].value.message : undefined}
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                        {(!ctaErrors?.[index]?.value?.message && ctaErrors?.[index]?.label?.message) && (
                            <p className="text-[10px] text-red-500 ml-1">
                                {ctaErrors[index].label.message}
                            </p>
                        )}
                    </div>
                ) : (
                    <Input
                        isDarkMode={isDarkMode}
                        type="text"
                        value={button.value}
                        onChange={(e) => updateCTAButton(button.id, 'value', e.target.value)}
                        placeholder={
                            button.type === 'URL' ? 'https://example.com' :
                                button.type === 'COPY_CODE' ? 'CODE123' :
                                'Value'
                        }
                        disabled={disabled}
                        error={ctaErrors && ctaErrors[index]?.value?.message}
                    />
                )}
                <span className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    {button.label.length}/25 characters
                    {button.type === 'PHONE' && " • Use international format"}
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Zap size={16} className="text-emerald-500" />
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Interactive Actions
                </h3>
            </div>

            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                {isCarousel
                    ? "Add common Call to Action buttons that will be applied to all your carousel cards. Maximum 2 buttons are allowed."
                    : "In addition to your message, you can send actions with your message. Maximum 25 characters are allowed in CTA button title & Quick Replies."
                }
            </p>

            {/* Action Type Radio Group — hide for Authentication mode */}
            {!isAuthMode && (
                <div className={cn(
                    "grid gap-3",
                    isCarousel ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
                )}>
                    {allowedActionTypes.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onActionTypeChange(type)}
                            disabled={disabled}
                            className={cn(
                                "py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all",
                                actionType === type
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {type === 'CTA' ? 'Call to Actions' : type === 'QuickReplies' ? 'Quick Replies' : type}
                        </button>
                    ))}
                </div>
            )}

            {/* Authentication OTP Button — locked, read-only */}
            {isAuthMode && (
                <div className={cn(
                    "rounded-xl p-4 border space-y-3",
                    isDarkMode ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200'
                )}>
                    <p className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-violet-400' : 'text-violet-700')}>
                        🔐 OTP Button — Managed by Meta
                    </p>
                    <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                    )}>
                        <Copy size={16} className={isDarkMode ? 'text-violet-400' : 'text-violet-600'} />
                        <div>
                            <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>Copy Code</p>
                            <p className={cn("text-[10px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Type: OTP · otp_type: COPY_CODE · Auto-added by Meta</p>
                        </div>
                        <span className={cn(
                            "ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                            isDarkMode ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
                        )}>LOCKED</span>
                    </div>
                    <p className={cn("text-[10px]", isDarkMode ? 'text-violet-400/60' : 'text-violet-600')}>
                        This button is automatically added by Meta for all Authentication templates. It cannot be customized.
                    </p>
                </div>
            )}

            {/* CTA Buttons Section */}
            {showCTA && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Call to Action Buttons
                        </h4>
                    </div>

                    {/* Add CTA Buttons */}
                    {!disabled && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => addCTAButton('URL')}
                                disabled={ctaButtons.filter(b => b.type === 'URL').length >= 2}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Link size={14} />
                                URL ({ctaButtons.filter(b => b.type === 'URL').length}/2)
                            </button>
                            <button
                                type="button"
                                onClick={() => addCTAButton('PHONE')}
                                disabled={ctaButtons.some(b => b.type === 'PHONE') || ctaButtons.length >= 3}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Phone size={14} />
                                Phone Number ({ctaButtons.some(b => b.type === 'PHONE') ? '1' : '0'}/1)
                            </button>
                            <button
                                type="button"
                                onClick={() => addCTAButton('COPY_CODE')}
                                disabled={ctaButtons.some(b => b.type === 'COPY_CODE')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Copy size={14} />
                                Copy Code ({ctaButtons.some(b => b.type === 'COPY_CODE') ? '1' : '0'}/1)
                            </button>
                            <button
                                type="button"
                                onClick={() => addCTAButton('CATALOG')}
                                disabled={ctaButtons.some(b => b.type === 'CATALOG' || b.type === 'MPM')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <ShoppingBag size={14} />
                                Catalog ({ctaButtons.some(b => b.type === 'CATALOG') ? '1' : '0'}/1)
                            </button>
                            <button
                                type="button"
                                onClick={() => addCTAButton('MPM')}
                                disabled={ctaButtons.some(b => b.type === 'MPM' || b.type === 'CATALOG')}
                                className={cn(
                                    "py-2 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Package size={14} />
                                MPM ({ctaButtons.some(b => b.type === 'MPM') ? '1' : '0'}/1)
                            </button>
                        </div>
                    )}

                    {/* CTA Button Inputs */}
                    {ctaButtons.map((button, index) => (
                        <div key={button.id}>
                            {renderCTAButtonFields(button, index)}
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Replies Section */}
            {showQuickReplies && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Quick Replies
                        </h4>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={addQuickReply}
                                disabled={quickReplies.length >= 3}
                                className={cn(
                                    "py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-40'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40'
                                )}
                            >
                                <Plus size={12} />
                                Add Reply ({quickReplies.length}/3)
                            </button>
                        )}
                    </div>

                    {quickReplies.map((reply, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1">
                                <Input
                                    isDarkMode={isDarkMode}
                                    type="text"
                                    value={reply}
                                    onChange={(e) => updateQuickReply(index, e.target.value)}
                                    placeholder={`Quick Reply ${index + 1}`}
                                    maxLength={25}
                                    disabled={disabled}
                                />
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => removeQuickReply(index)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            <span className={cn("text-xs min-w-[40px]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                {reply.length}/25
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

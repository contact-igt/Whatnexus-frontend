"use client";

import { useTheme } from "@/hooks/useTheme";
import {
    useGetPricingRulesQuery,
    useCreatePricingRuleMutation,
    useUpdatePricingRuleMutation,
    useDeletePricingRuleMutation,
    useGetAiPricingRulesQuery,
    useCreateAiPricingRuleMutation,
    useUpdateAiPricingRuleMutation,
    useDeleteAiPricingRuleMutation,
} from "@/hooks/useManagementQuery";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, DollarSign, Percent, Globe, Cpu, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";

export const PricingView = () => {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<"whatsapp" | "ai">("whatsapp");

    // ─── WhatsApp Pricing ───────────────────────────────────────
    const { data: response, isLoading, isError, error } = useGetPricingRulesQuery();

    useEffect(() => {
        if (isError) {
            console.error("[PricingView] API Error:", error);
            toast.error("Failed to fetch pricing rules");
        }
    }, [isError, error]);

    const createMutation = useCreatePricingRuleMutation();
    const updateMutation = useUpdatePricingRuleMutation();
    const deleteMutation = useDeletePricingRuleMutation();

    const pricingRules = response?.data || [];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        category: "marketing",
        country: "IN",
        rate: "",
        markup_percent: "0",
    });

    // ─── AI Model Pricing ──────────────────────────────────────
    const { data: aiResponse, isLoading: isAiLoading } = useGetAiPricingRulesQuery();
    const aiCreateMutation = useCreateAiPricingRuleMutation();
    const aiUpdateMutation = useUpdateAiPricingRuleMutation();
    const aiDeleteMutation = useDeleteAiPricingRuleMutation();

    const aiPricingRules = aiResponse?.data || [];

    const [isAiAddOpen, setIsAiAddOpen] = useState(false);
    const [isAiEditOpen, setIsAiEditOpen] = useState(false);
    const [isAiDeleteOpen, setIsAiDeleteOpen] = useState(false);
    const [aiDeleteRuleId, setAiDeleteRuleId] = useState<number | null>(null);
    const [selectedAiRule, setSelectedAiRule] = useState<any>(null);
    const [aiErrors, setAiErrors] = useState<Record<string, string>>({});

    const [aiFormData, setAiFormData] = useState({
        model: "gpt-4o-mini",
        description: "",
        recommended_for: "both",
        category: "mid-tier",
        input_rate: "",
        output_rate: "",
        markup_percent: "0",
        usd_to_inr_rate: "85",
        is_active: "true",
    });

    useEffect(() => {
        if (!isAiAddOpen) {
            setAiFormData({ model: "gpt-4o-mini", description: "", recommended_for: "both", category: "mid-tier", input_rate: "", output_rate: "", markup_percent: "0", usd_to_inr_rate: "85", is_active: "true" });
            setAiErrors({});
        }
    }, [isAiAddOpen]);

    useEffect(() => {
        if (!isAiEditOpen) {
            setSelectedAiRule(null);
            setAiErrors({});
        }
    }, [isAiEditOpen]);

    const handleAiChange = (field: string, value: string) => {
        setAiFormData((prev) => ({ ...prev, [field]: value }));
        if (aiErrors[field]) setAiErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validateAi = (isEdit = false) => {
        const e: Record<string, string> = {};
        if (!isEdit && !aiFormData.model?.trim()) e.model = "Model name is required";
        if (!aiFormData.input_rate?.trim()) e.input_rate = "Input rate is required";
        else if (isNaN(parseFloat(aiFormData.input_rate)) || parseFloat(aiFormData.input_rate) < 0) e.input_rate = "Enter a valid positive number";
        if (!aiFormData.output_rate?.trim()) e.output_rate = "Output rate is required";
        else if (isNaN(parseFloat(aiFormData.output_rate)) || parseFloat(aiFormData.output_rate) < 0) e.output_rate = "Enter a valid positive number";
        if (isNaN(parseFloat(aiFormData.markup_percent)) || parseFloat(aiFormData.markup_percent) < 0) e.markup_percent = "Enter a valid positive number";
        if (isNaN(parseFloat(aiFormData.usd_to_inr_rate)) || parseFloat(aiFormData.usd_to_inr_rate) <= 0) e.usd_to_inr_rate = "Enter a valid positive number";
        setAiErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAiAdd = () => {
        if (!validateAi()) return;
        aiCreateMutation.mutate({
            model: aiFormData.model.trim(),
            description: aiFormData.description.trim() || undefined,
            recommended_for: aiFormData.recommended_for as "input" | "output" | "both",
            category: aiFormData.category as "premium" | "mid-tier" | "budget" | "reasoning",
            input_rate: parseFloat(aiFormData.input_rate),
            output_rate: parseFloat(aiFormData.output_rate),
            markup_percent: parseFloat(aiFormData.markup_percent),
            usd_to_inr_rate: parseFloat(aiFormData.usd_to_inr_rate),
        }, { onSuccess: () => setIsAiAddOpen(false) });
    };

    const handleAiEdit = () => {
        if (!selectedAiRule || !validateAi(true)) return;
        aiUpdateMutation.mutate({
            id: selectedAiRule.id,
            data: {
                description: aiFormData.description.trim() || undefined,
                recommended_for: aiFormData.recommended_for as "input" | "output" | "both",
                category: aiFormData.category as "premium" | "mid-tier" | "budget" | "reasoning",
                input_rate: parseFloat(aiFormData.input_rate),
                output_rate: parseFloat(aiFormData.output_rate),
                markup_percent: parseFloat(aiFormData.markup_percent),
                usd_to_inr_rate: parseFloat(aiFormData.usd_to_inr_rate),
                is_active: aiFormData.is_active === "true",
            },
        }, { onSuccess: () => setIsAiEditOpen(false) });
    };

    const openAiEdit = (rule: any) => {
        setSelectedAiRule(rule);
        setAiFormData({
            model: rule.model,
            description: rule.description || "",
            recommended_for: rule.recommended_for || "both",
            category: rule.category || "mid-tier",
            input_rate: rule.input_rate?.toString() || "",
            output_rate: rule.output_rate?.toString() || "",
            markup_percent: rule.markup_percent?.toString() || "0",
            usd_to_inr_rate: rule.usd_to_inr_rate?.toString() || "85",
            is_active: rule.is_active !== false ? "true" : "false",
        });
        setAiErrors({});
        setIsAiEditOpen(true);
    };

    const handleAiDelete = (id: number) => {
        setAiDeleteRuleId(id);
        setIsAiDeleteOpen(true);
    };

    const confirmAiDelete = () => {
        if (aiDeleteRuleId !== null) {
            aiDeleteMutation.mutate(aiDeleteRuleId, {
                onSuccess: () => { setIsAiDeleteOpen(false); setAiDeleteRuleId(null); },
            });
        }
    };

    // Reset form & errors when modals open/close
    useEffect(() => {
        if (!isAddOpen) {
            setFormData({ category: "marketing", country: "IN", rate: "", markup_percent: "0" });
            setErrors({});
        }
    }, [isAddOpen]);

    useEffect(() => {
        if (!isEditOpen) {
            setSelectedRule(null);
            setErrors({});
        }
    }, [isEditOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = (isEdit = false) => {
        const newErrors: Record<string, string> = {};

        if (!isEdit && !formData.category?.trim()) {
            newErrors.category = "Category is required";
        }
        if (!formData.country?.trim()) {
            newErrors.country = "Country code is required";
        }
        if (!formData.rate?.trim()) {
            newErrors.rate = "Base rate is required";
        } else if (isNaN(parseFloat(formData.rate)) || parseFloat(formData.rate) < 0) {
            newErrors.rate = "Enter a valid positive number";
        }
        if (!formData.markup_percent?.trim() && formData.markup_percent !== "0") {
            newErrors.markup_percent = "Markup percentage is required";
        } else if (isNaN(parseFloat(formData.markup_percent)) || parseFloat(formData.markup_percent) < 0) {
            newErrors.markup_percent = "Enter a valid positive number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = () => {
        if (!validate()) return;
        createMutation.mutate(
            {
                category: formData.category,
                country: formData.country,
                rate: parseFloat(formData.rate),
                markup_percent: parseFloat(formData.markup_percent),
            },
            {
                onSuccess: () => setIsAddOpen(false),
            }
        );
    };

    const handleEdit = () => {
        if (!selectedRule || !validate(true)) return;
        updateMutation.mutate(
            {
                id: selectedRule.id,
                data: {
                    rate: parseFloat(formData.rate),
                    markup_percent: parseFloat(formData.markup_percent),
                },
            },
            {
                onSuccess: () => setIsEditOpen(false),
            }
        );
    };

    const handleDelete = (id: number) => {
        setDeleteRuleId(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (deleteRuleId !== null) {
            deleteMutation.mutate(deleteRuleId, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeleteRuleId(null);
                },
            });
        }
    };

    const openEdit = (rule: any) => {
        setSelectedRule(rule);
        setFormData({
            category: rule.category,
            country: rule.country,
            rate: rule.rate.toString(),
            markup_percent: rule.markup_percent.toString(),
        });
        setErrors({});
        setIsEditOpen(true);
    };

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in fade-in zoom-in-95 duration-500 no-scrollbar pb-32">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pricing &amp; Rates</h1>
                    <p className={cn("mt-2 text-sm", isDarkMode ? "text-white/50" : "text-slate-500")}>
                        Manage WhatsApp message rates and AI model pricing with markups.
                    </p>
                </div>

                <button
                    onClick={() => activeTab === "whatsapp" ? setIsAddOpen(true) : setIsAiAddOpen(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
                {[
                    { key: "whatsapp" as const, label: "WhatsApp Messages", icon: Globe },
                    { key: "ai" as const, label: "AI Models", icon: Cpu },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            activeTab === tab.key
                                ? isDarkMode
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                : isDarkMode
                                    ? "text-white/50 hover:text-white/80 hover:bg-white/5"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* WhatsApp Pricing Table */}
            {activeTab === "whatsapp" && (
                <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                    <Table isDarkMode={isDarkMode}>
                        <TableHeader isDarkMode={isDarkMode}>
                            <TableRow isDarkMode={isDarkMode}>
                                <TableHead isDarkMode={isDarkMode}>Category</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Country Code</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Base Rate ($)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Markup (%)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Final Rate ($)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="center" width="100px">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow isDarkMode={isDarkMode}>
                                    <TableCell align="center" colSpan={6}>
                                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                            Loading pricing rules...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : pricingRules.length === 0 ? (
                                <TableRow isDarkMode={isDarkMode}>
                                    <TableCell align="center" colSpan={6}>
                                        <div className="flex items-center justify-center h-32 text-gray-500">
                                            No pricing rules found.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pricingRules.map((rule: any, idx: number) => (
                                    <TableRow
                                        key={rule.id}
                                        isDarkMode={isDarkMode}
                                        isLast={idx === pricingRules.length - 1}
                                    >
                                        <TableCell>
                                            <span className="font-medium capitalize">{rule.category}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{rule.country}</span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span>${parseFloat(rule.rate).toFixed(4)}</span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span>{parseFloat(rule.markup_percent).toFixed(1)}%</span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span className="text-emerald-400 font-medium">
                                                ${(parseFloat(rule.rate) * (1 + parseFloat(rule.markup_percent) / 100)).toFixed(4)}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center" width="100px">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        isDarkMode
                                                            ? "text-white/40 hover:bg-white/10 hover:text-white"
                                                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                                    )}
                                                    onClick={() => openEdit(rule)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                                                    onClick={() => handleDelete(rule.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </GlassCard>
            )}

            {/* AI Model Pricing Table */}
            {activeTab === "ai" && (
                <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                    <Table isDarkMode={isDarkMode}>
                        <TableHeader isDarkMode={isDarkMode}>
                            <TableRow isDarkMode={isDarkMode}>
                                <TableHead isDarkMode={isDarkMode}>Model</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Input ($/1M)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Input (₹/1M)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Output ($/1M)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Output (₹/1M)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Markup (%)</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="center">Status</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="center" width="100px">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isAiLoading ? (
                                <TableRow isDarkMode={isDarkMode}>
                                    <TableCell align="center" colSpan={8}>
                                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                            Loading AI pricing rules...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : aiPricingRules.length === 0 ? (
                                <TableRow isDarkMode={isDarkMode}>
                                    <TableCell align="center" colSpan={8}>
                                        <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                            <Cpu className="w-6 h-6 mb-2 opacity-40" />
                                            <p>No AI pricing rules configured.</p>
                                            <p className="text-xs mt-1 opacity-60">Add rules for gpt-4o and gpt-4o-mini to start.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                aiPricingRules.map((rule: any, idx: number) => {
                                    const usdToInr = parseFloat(rule.usd_to_inr_rate) || 85;
                                    const markup = parseFloat(rule.markup_percent) || 0;
                                    const inputRateUsd = parseFloat(rule.input_rate);
                                    const outputRateUsd = parseFloat(rule.output_rate);
                                    const inputRateInr = inputRateUsd * usdToInr * (1 + markup / 100);
                                    const outputRateInr = outputRateUsd * usdToInr * (1 + markup / 100);

                                    return (
                                        <TableRow
                                            key={rule.id}
                                            isDarkMode={isDarkMode}
                                            isLast={idx === aiPricingRules.length - 1}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Cpu className={cn("w-4 h-4", isDarkMode ? "text-violet-400" : "text-violet-600")} />
                                                    <span className="font-medium">{rule.model}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <ArrowDownToLine className={cn("w-3 h-3", isDarkMode ? "text-cyan-400" : "text-cyan-600")} />
                                                    <span>${inputRateUsd.toFixed(2)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell align="right">
                                                <span className="text-cyan-400">₹{inputRateInr.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <ArrowUpFromLine className={cn("w-3 h-3", isDarkMode ? "text-violet-400" : "text-violet-600")} />
                                                    <span>${outputRateUsd.toFixed(2)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell align="right">
                                                <span className="text-violet-400">₹{outputRateInr.toFixed(2)}</span>
                                            </TableCell>
                                            <TableCell align="right">
                                                <span>{markup.toFixed(1)}%</span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-xs font-semibold",
                                                    rule.is_active
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {rule.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center" width="100px">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            isDarkMode
                                                                ? "text-white/40 hover:bg-white/10 hover:text-white"
                                                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                                                        )}
                                                        onClick={() => openAiEdit(rule)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                                                        onClick={() => handleAiDelete(rule.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </GlassCard>
            )}

            {/* ── Add Rule Modal ─────────────────────────────────────────── */}
            <Drawer
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add Pricing Rule"
                description="Create a new rate for a country & message category"
                isDarkMode={isDarkMode}
                className="font-sans max-w-xl"
                footer={
                    <div className="flex justify-end font-sans space-x-3 pt-4">
                        <button
                            onClick={() => setIsAddOpen(false)}
                            disabled={createMutation.isPending}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={createMutation.isPending}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
                        >
                            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {createMutation.isPending ? "Saving..." : "Save Rule"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-sans">
                    <Select
                        isDarkMode={isDarkMode}
                        label="Category"
                        value={formData.category}
                        onChange={(value) => handleChange("category", value)}
                        options={[
                            { value: "marketing", label: "Marketing" },
                            { value: "utility", label: "Utility" },
                            { value: "authentication", label: "Authentication" },
                            { value: "service", label: "Service / Free" },
                        ]}
                        error={errors.category}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Country Code"
                        icon={Globe}
                        placeholder="e.g., IN, US, GB, Global"
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        error={errors.country}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Base Rate (₹)"
                        icon={DollarSign}
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 0.0107"
                        value={formData.rate}
                        onChange={(e) => handleChange("rate", e.target.value)}
                        error={errors.rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Markup Percentage (%)"
                        icon={Percent}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 10"
                        value={formData.markup_percent}
                        onChange={(e) => handleChange("markup_percent", e.target.value)}
                        error={errors.markup_percent}
                        required
                    />
                </div>
            </Drawer>

            {/* ── Edit Rule Modal ────────────────────────────────────────── */}
            <Drawer
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={`Edit Pricing Rule`}
                description={selectedRule ? `${selectedRule.category} / ${selectedRule.country}` : ""}
                isDarkMode={isDarkMode}
                className="font-sans max-w-xl"
                footer={
                    <div className="flex justify-end font-sans space-x-3 pt-4">
                        <button
                            onClick={() => setIsEditOpen(false)}
                            disabled={updateMutation.isPending}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={updateMutation.isPending}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
                        >
                            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-sans">
                    <Input
                        isDarkMode={isDarkMode}
                        label="Base Rate (₹)"
                        icon={DollarSign}
                        type="number"
                        step="0.0001"
                        value={formData.rate}
                        onChange={(e) => handleChange("rate", e.target.value)}
                        error={errors.rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Markup Percentage (%)"
                        icon={Percent}
                        type="number"
                        step="0.01"
                        value={formData.markup_percent}
                        onChange={(e) => handleChange("markup_percent", e.target.value)}
                        error={errors.markup_percent}
                        required
                    />
                </div>
            </Drawer>

            {/* ── Delete Confirmation Modal ──────────────────────────── */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => { setIsDeleteOpen(false); setDeleteRuleId(null); }}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Delete Pricing Rule
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure you want to delete this pricing rule? This cannot be undone.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => { setIsDeleteOpen(false); setDeleteRuleId(null); }}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Rule'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── AI Add Rule Drawer ────────────────────────────────── */}
            <Drawer
                isOpen={isAiAddOpen}
                onClose={() => setIsAiAddOpen(false)}
                title="Add AI Model Pricing"
                description="Configure pricing for an AI model with input/output token rates"
                isDarkMode={isDarkMode}
                className="font-sans max-w-xl"
                footer={
                    <div className="flex justify-end font-sans space-x-3 pt-4">
                        <button
                            onClick={() => setIsAiAddOpen(false)}
                            disabled={aiCreateMutation.isPending}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAiAdd}
                            disabled={aiCreateMutation.isPending}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
                        >
                            {aiCreateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {aiCreateMutation.isPending ? "Saving..." : "Save Rule"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-sans">
                    <Select
                        isDarkMode={isDarkMode}
                        label="AI Model"
                        value={aiFormData.model}
                        onChange={(value) => handleAiChange("model", value)}
                        options={[
                            { value: "gpt-4o", label: "GPT-4o (Flagship)" },
                            { value: "gpt-4o-mini", label: "GPT-4o-mini (Budget)" },
                            { value: "gpt-4o-audio-preview", label: "GPT-4o Audio Preview" },
                            { value: "gpt-4.1", label: "GPT-4.1 (Premium)" },
                            { value: "gpt-4.1-mini", label: "GPT-4.1-mini (Mid-tier)" },
                            { value: "gpt-4.1-nano", label: "GPT-4.1-nano (Ultra Budget)" },
                            { value: "gpt-4.5", label: "GPT-4.5 (Most Capable)" },
                            { value: "o4-mini", label: "o4-mini (Reasoning)" },
                            { value: "o3-mini", label: "o3-mini (Reasoning)" },
                            { value: "o1", label: "o1 (Flagship Reasoning)" },
                            { value: "o1-mini", label: "o1-mini (Reasoning Budget)" },
                            { value: "o3", label: "o3 (Advanced Reasoning)" },
                            { value: "o3-pro", label: "o3-pro (Professional Reasoning)" },
                            { value: "gpt-5", label: "GPT-5 (Most Powerful)" },
                            { value: "gpt-5-mini", label: "GPT-5-mini (Next-gen Budget)" },
                            { value: "gpt-4.5-mini", label: "GPT-4.5-mini (Mid-tier)" },
                            { value: "gpt-4.5-nano", label: "GPT-4.5-nano (Ultra Budget)" },
                        ]}
                        error={aiErrors.model}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Description"
                        icon={Cpu}
                        placeholder="e.g., Best for fast, affordable processing"
                        value={aiFormData.description}
                        onChange={(e) => handleAiChange("description", e.target.value)}
                    />
                    <Select
                        isDarkMode={isDarkMode}
                        label="Recommended For"
                        value={aiFormData.recommended_for}
                        onChange={(value) => handleAiChange("recommended_for", value)}
                        options={[
                            { value: "input", label: "Input Processing" },
                            { value: "output", label: "Output Generation" },
                            { value: "both", label: "Both" },
                        ]}
                    />
                    <Select
                        isDarkMode={isDarkMode}
                        label="Category"
                        value={aiFormData.category}
                        onChange={(value) => handleAiChange("category", value)}
                        options={[
                            { value: "premium", label: "Premium" },
                            { value: "mid-tier", label: "Mid-tier" },
                            { value: "budget", label: "Budget" },
                            { value: "reasoning", label: "Reasoning" },
                        ]}
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Input Token Rate ($ per 1M tokens)"
                        icon={ArrowDownToLine}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2.50"
                        value={aiFormData.input_rate}
                        onChange={(e) => handleAiChange("input_rate", e.target.value)}
                        error={aiErrors.input_rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Output Token Rate ($ per 1M tokens)"
                        icon={ArrowUpFromLine}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 10.00"
                        value={aiFormData.output_rate}
                        onChange={(e) => handleAiChange("output_rate", e.target.value)}
                        error={aiErrors.output_rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Markup Percentage (%)"
                        icon={Percent}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 20"
                        value={aiFormData.markup_percent}
                        onChange={(e) => handleAiChange("markup_percent", e.target.value)}
                        error={aiErrors.markup_percent}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="USD to INR Exchange Rate"
                        icon={RefreshCw}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 85.00"
                        value={aiFormData.usd_to_inr_rate}
                        onChange={(e) => handleAiChange("usd_to_inr_rate", e.target.value)}
                        error={aiErrors.usd_to_inr_rate}
                        required
                    />
                </div>
            </Drawer>

            {/* ── AI Edit Rule Drawer ───────────────────────────────── */}
            <Drawer
                isOpen={isAiEditOpen}
                onClose={() => setIsAiEditOpen(false)}
                title="Edit AI Model Pricing"
                description={selectedAiRule ? `${selectedAiRule.model}` : ""}
                isDarkMode={isDarkMode}
                className="font-sans max-w-xl"
                footer={
                    <div className="flex justify-end font-sans space-x-3 pt-4">
                        <button
                            onClick={() => setIsAiEditOpen(false)}
                            disabled={aiUpdateMutation.isPending}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAiEdit}
                            disabled={aiUpdateMutation.isPending}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
                        >
                            {aiUpdateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {aiUpdateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 font-sans">
                    <Input
                        isDarkMode={isDarkMode}
                        label="Description"
                        icon={Cpu}
                        placeholder="e.g., Best for fast, affordable processing"
                        value={aiFormData.description}
                        onChange={(e) => handleAiChange("description", e.target.value)}
                    />
                    <Select
                        isDarkMode={isDarkMode}
                        label="Recommended For"
                        value={aiFormData.recommended_for}
                        onChange={(value) => handleAiChange("recommended_for", value)}
                        options={[
                            { value: "input", label: "Input Processing" },
                            { value: "output", label: "Output Generation" },
                            { value: "both", label: "Both" },
                        ]}
                    />
                    <Select
                        isDarkMode={isDarkMode}
                        label="Category"
                        value={aiFormData.category}
                        onChange={(value) => handleAiChange("category", value)}
                        options={[
                            { value: "premium", label: "Premium" },
                            { value: "mid-tier", label: "Mid-tier" },
                            { value: "budget", label: "Budget" },
                            { value: "reasoning", label: "Reasoning" },
                        ]}
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Input Token Rate ($ per 1M tokens)"
                        icon={ArrowDownToLine}
                        type="number"
                        step="0.01"
                        value={aiFormData.input_rate}
                        onChange={(e) => handleAiChange("input_rate", e.target.value)}
                        error={aiErrors.input_rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Output Token Rate ($ per 1M tokens)"
                        icon={ArrowUpFromLine}
                        type="number"
                        step="0.01"
                        value={aiFormData.output_rate}
                        onChange={(e) => handleAiChange("output_rate", e.target.value)}
                        error={aiErrors.output_rate}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Markup Percentage (%)"
                        icon={Percent}
                        type="number"
                        step="0.01"
                        value={aiFormData.markup_percent}
                        onChange={(e) => handleAiChange("markup_percent", e.target.value)}
                        error={aiErrors.markup_percent}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="USD to INR Exchange Rate"
                        icon={RefreshCw}
                        type="number"
                        step="0.01"
                        value={aiFormData.usd_to_inr_rate}
                        onChange={(e) => handleAiChange("usd_to_inr_rate", e.target.value)}
                        error={aiErrors.usd_to_inr_rate}
                        required
                    />
                    <div className="flex items-center justify-between">
                        <span className={cn("text-sm font-medium", isDarkMode ? "text-white/70" : "text-slate-700")}>Active</span>
                        <button
                            type="button"
                            onClick={() => handleAiChange("is_active", aiFormData.is_active === "true" ? "false" : "true")}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                aiFormData.is_active === "true" ? "bg-emerald-600" : isDarkMode ? "bg-white/10" : "bg-slate-200"
                            )}
                        >
                            <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                                aiFormData.is_active === "true" ? "translate-x-6" : "translate-x-1"
                            )} />
                        </button>
                    </div>
                </div>
            </Drawer>

            {/* ── AI Delete Confirmation Modal ──────────────────────── */}
            <Modal
                isOpen={isAiDeleteOpen}
                onClose={() => { setIsAiDeleteOpen(false); setAiDeleteRuleId(null); }}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Delete AI Pricing Rule
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure? The system will fall back to hardcoded rates for this model.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => { setIsAiDeleteOpen(false); setAiDeleteRuleId(null); }}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmAiDelete}
                            disabled={aiDeleteMutation.isPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {aiDeleteMutation.isPending ? 'Deleting...' : 'Delete Rule'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

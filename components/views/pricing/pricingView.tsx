"use client";

import { useTheme } from "@/hooks/useTheme";
import {
    useGetPricingRulesQuery,
    useCreatePricingRuleMutation,
    useUpdatePricingRuleMutation,
    useDeletePricingRuleMutation,
} from "@/hooks/useManagementQuery";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, DollarSign, Percent, Globe } from "lucide-react";
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
    const { data: response, isLoading, isError, error } = useGetPricingRulesQuery();

    useEffect(() => {
        if (isError) {
            console.error("[PricingView] API Error:", error);
            toast.error("Failed to fetch pricing rules");
        }
        console.log("[PricingView] API Response:", response);
    }, [isError, error, response]);

    const createMutation = useCreatePricingRuleMutation();
    const updateMutation = useUpdatePricingRuleMutation();
    const deleteMutation = useDeletePricingRuleMutation();

    const pricingRules = response?.data || [];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        category: "marketing",
        country: "IN",
        rate: "",
        markup_percent: "0",
    });

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
        if (confirm("Are you sure you want to delete this pricing rule?")) {
            deleteMutation.mutate(id);
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
                        Manage base WhatsApp API rates and platform markup percentages by country and category.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Rule
                </button>
            </div>

            {/* Table */}
            <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                <Table isDarkMode={isDarkMode}>
                    <TableHeader isDarkMode={isDarkMode}>
                        <TableRow isDarkMode={isDarkMode}>
                            <TableHead isDarkMode={isDarkMode}>Category</TableHead>
                            <TableHead isDarkMode={isDarkMode}>Country Code</TableHead>
                            <TableHead isDarkMode={isDarkMode} align="right">Base Rate</TableHead>
                            <TableHead isDarkMode={isDarkMode} align="right">Markup (%)</TableHead>
                            <TableHead isDarkMode={isDarkMode} align="right">Final Rate</TableHead>
                            <TableHead isDarkMode={isDarkMode} align="center" width="100px">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow isDarkMode={isDarkMode}>
                                <TableCell align="center">
                                    <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                        Loading pricing rules...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : pricingRules.length === 0 ? (
                            <TableRow isDarkMode={isDarkMode}>
                                <TableCell align="center">
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
                                        <span>₹{parseFloat(rule.rate).toFixed(4)}</span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span>{parseFloat(rule.markup_percent).toFixed(1)}%</span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-emerald-400 font-medium">
                                            ₹{(parseFloat(rule.rate) * (1 + parseFloat(rule.markup_percent) / 100)).toFixed(4)}
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
        </div>
    );
};

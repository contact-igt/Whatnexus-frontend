"use client";

import { useState } from 'react';
import { Loader2, CheckCircle2, Shield, Phone, MessageCircle, Key, Edit, XCircle, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface WhatsAppConnectionListProps {
    isDarkMode: boolean;
    handleToggleActive: (id: string, status: string) => void;
    handleDeleteClick: (id: string) => void;
    handleEditClick: (connection: any) => void;
    WhatsAppConnectionData: any;
    onTestConnection: () => void;
    onSaveConfiguration: (fields: { waba_id: string; phone_number_id: string; whatsapp_number: string; app_id: string; access_token: string }) => void;
    testConnectionSuccess: boolean;
    isWebhookVerified: boolean;
    isAdmin: boolean;
}

export const WhatsappConnectionList = ({
    isDarkMode,
    handleToggleActive,
    handleDeleteClick,
    handleEditClick,
    WhatsAppConnectionData,
    onTestConnection,
    onSaveConfiguration,
    testConnectionSuccess,
    isWebhookVerified,
    isAdmin
}: WhatsAppConnectionListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedFields, setEditedFields] = useState<Record<string, { waba_id: string; phone_number_id: string; whatsapp_number: string; app_id: string; access_token: string }>>({});

    const isEditing = editingId === WhatsAppConnectionData.data.id;
    const isActive = WhatsAppConnectionData.data.status === "active";

    const isToggleDisabled =
        !isAdmin ||
        !["verified", "active", "inactive"].includes(WhatsAppConnectionData.data.status) ||
        (!isActive && (!testConnectionSuccess || !isWebhookVerified));

    const handleEditMode = (connection: any) => {
        setEditingId(connection.id);
        setEditedFields(prev => ({
            ...prev,
            [connection.id]: {
                waba_id: connection.waba_id || '',
                phone_number_id: connection.phone_number_id || '',
                whatsapp_number: connection.whatsapp_number || '',
                app_id: connection.app_id || '',
                access_token: '', // always start empty — user enters new token to replace
            }
        }));
    };

    const handleCancelEdit = (id: string) => {
        setEditingId(null);
        setEditedFields(prev => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    const handleFieldChange = (id: string, field: string, value: string) => {
        setEditedFields(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleSave = (connection: any) => {
        const fields = editedFields[connection.id];
        onSaveConfiguration({
            waba_id: fields.waba_id,
            phone_number_id: fields.phone_number_id,
            whatsapp_number: fields.whatsapp_number,
            app_id: fields.app_id,
            access_token: fields.access_token,
        });
        setEditingId(null);
    };

    if (!WhatsAppConnectionData?.data || WhatsAppConnectionData.data.length === 0) {
        return (
            <div className={cn(
                "text-center py-16 rounded-xl border",
                isDarkMode ? "text-white/40 border-white/10 bg-white/[0.02]" : "text-slate-400 border-slate-200 bg-white"
            )}>
                <MessageCircle className="mx-auto mb-4" size={48} />
                <p className="text-lg font-medium">No WhatsApp connections found</p>
                <p className="text-sm mt-1">Add your first WhatsApp Business API connection</p>
            </div>
        );
    }

    const fields = editedFields[WhatsAppConnectionData.data.id];

    return (
        <div className="space-y-6">
            <div
                key={WhatsAppConnectionData.data.id}
                className={cn(
                    "p-6 rounded-xl border backdrop-blur-xl transition-all",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/10"
                        : "bg-white border-slate-200"
                )}
            >
                <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                        )}>
                            <MessageCircle className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h3 className={cn("font-semibold text-base", isDarkMode ? "text-white" : "text-slate-900")}>
                                {WhatsAppConnectionData.data.name || "WhatsApp Connection"}
                            </h3>
                            <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                {WhatsAppConnectionData.data.whatsapp_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={cn("text-sm font-medium", isDarkMode ? "text-white/70" : "text-slate-600")}>
                            {isActive ? "Active" : "Inactive"}
                        </span>
                        <label className={cn(
                            "relative inline-flex items-center",
                            isToggleDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}>
                            <input
                                type="checkbox"
                                disabled={isToggleDisabled}
                                className="sr-only peer"
                                checked={isActive}
                                onChange={() => handleToggleActive(WhatsAppConnectionData.data.id, WhatsAppConnectionData.data.status)}
                            />
                            <div className={cn(
                                "w-11 h-6 rounded-full peer transition-all",
                                "peer-checked:bg-emerald-600",
                                isDarkMode ? 'bg-white/10' : 'bg-slate-300'
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all",
                                    isActive ? "translate-x-5" : "translate-x-0"
                                )} />
                            </div>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Input
                        isDarkMode={isDarkMode}
                        label="WhatsApp Business Account ID"
                        icon={Shield}
                        value={isEditing ? (fields?.waba_id ?? '') : (WhatsAppConnectionData.data.waba_id || '')}
                        onChange={(e) => isEditing && handleFieldChange(WhatsAppConnectionData.data.id, 'waba_id', e.target.value)}
                        disabled={!isEditing}
                        placeholder="WABA ID"
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Phone Number ID"
                        icon={Phone}
                        value={isEditing ? (fields?.phone_number_id ?? '') : (WhatsAppConnectionData.data.phone_number_id || '')}
                        onChange={(e) => isEditing && handleFieldChange(WhatsAppConnectionData.data.id, 'phone_number_id', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Phone Number ID"
                    />

                    <div className="md:col-span-2">
                        <Input
                            isDarkMode={isDarkMode}
                            label="WhatsApp Number"
                            icon={MessageCircle}
                            value={isEditing ? (fields?.whatsapp_number ?? '') : (WhatsAppConnectionData.data.whatsapp_number || '')}
                            onChange={(e) => isEditing && handleFieldChange(WhatsAppConnectionData.data.id, 'whatsapp_number', e.target.value)}
                            disabled={!isEditing}
                            placeholder="WhatsApp Number"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Meta App ID"
                            icon={Building2}
                            value={isEditing ? (fields?.app_id ?? '') : (WhatsAppConnectionData.data.app_id || '')}
                            onChange={(e) => isEditing && handleFieldChange(WhatsAppConnectionData.data.id, 'app_id', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Meta App ID (Optional)"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Access Token"
                            icon={Key}
                            type={isEditing ? "password" : "text"}
                            value={isEditing
                                ? (fields?.access_token ?? '')
                                : (WhatsAppConnectionData.data.has_access_token ? '••••••••••••••••••••' : '')
                            }
                            onChange={(e) => isEditing && handleFieldChange(WhatsAppConnectionData.data.id, 'access_token', e.target.value)}
                            disabled={!isEditing}
                            placeholder={isEditing ? "Enter new access token (leave empty to keep current)" : "No token configured"}
                            autoComplete="new-password"
                        />
                        {isEditing && (
                            <p className={cn("text-[10px] mt-1 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Leave empty to keep current token. Enter a new token to replace it.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    {isAdmin && (
                        <button
                            onClick={onTestConnection}
                            className={cn(
                                "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                isDarkMode
                                    ? "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20"
                                    : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                            )}
                        >
                            <MessageCircle size={16} />
                            <span>Test Connection</span>
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => handleCancelEdit(WhatsAppConnectionData.data.id)}
                                    className={cn(
                                        "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                        isDarkMode
                                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <XCircle size={16} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    onClick={() => handleSave(WhatsAppConnectionData.data)}
                                    className={cn(
                                        "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                        isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                                    )}
                                >
                                    <CheckCircle2 size={16} />
                                    <span>Save Configuration</span>
                                </button>
                            </>
                        ) : (
                            <>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleEditMode(WhatsAppConnectionData.data)}
                                        className={cn(
                                            "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                            isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                                        )}
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

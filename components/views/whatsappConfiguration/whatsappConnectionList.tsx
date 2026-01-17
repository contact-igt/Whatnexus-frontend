"use client";

import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle2, Shield, Phone, MessageCircle, Key, Edit, XCircle, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface WhatsAppConnectionListProps {
    isDarkMode: boolean;
    handleToggleActive: (id: string, status: string) => void;
    handleDeleteClick: (id: string) => void;
    handleEditClick: (connection: any) => void;
    WhatsAppConnectionData: any;
    onTestConnection: () => void;
    onSaveConfiguration: (connection: any) => void;
}

export const WhatsappConnectionList = ({
    isDarkMode,
    handleToggleActive,
    handleDeleteClick,
    handleEditClick,
    WhatsAppConnectionData,
    onTestConnection,
    onSaveConfiguration
}: WhatsAppConnectionListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAccessToken, setShowAccessToken] = useState<Record<string, boolean>>({});
    const [editedTokens, setEditedTokens] = useState<Record<string, string>>({});
    const isEditing = editingId === WhatsAppConnectionData.data.id;
    const isActive = WhatsAppConnectionData.data.status === "active";
    const toggleAccessTokenVisibility = (id: string) => {
        setShowAccessToken(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleEditMode = (connection: any) => {
        setEditingId(connection.id);
        setEditedTokens(prev => ({ ...prev, [connection.id]: connection.access_token }));
    };

    const handleCancelEdit = (id: string) => {
        setEditingId(null);
        setEditedTokens(prev => {
            const newTokens = { ...prev };
            delete newTokens[id];
            return newTokens;
        });
    };

    const handleSave = (connection: any) => {
        const updatedConnection = {
            ...connection,
            access_token: editedTokens[connection.id] || connection.access_token
        };
        onSaveConfiguration(updatedConnection);
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
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                disabled={WhatsAppConnectionData.data.status == "pending"}
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
                        value={WhatsAppConnectionData.data.waba_id || ''}
                        disabled
                        placeholder="WABA ID"
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Phone Number ID"
                        icon={Phone}
                        value={WhatsAppConnectionData.data.phone_number_id || ''}
                        disabled
                        placeholder="Phone Number ID"
                    />

                    <div className="md:col-span-2">
                        <Input
                            isDarkMode={isDarkMode}
                            label="WhatsApp Number"
                            icon={MessageCircle}
                            value={WhatsAppConnectionData.data.whatsapp_number || ''}
                            disabled
                            placeholder="WhatsApp Number"
                        />
                    </div>

                    <div className="md:col-span-2 relative">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Access Token"
                            icon={Key}
                            type={showAccessToken[WhatsAppConnectionData.data.id] ? "text" : "password"}
                            value={isEditing ? (editedTokens[WhatsAppConnectionData.data.id] || '') : (WhatsAppConnectionData.data.access_token || '')}
                            onChange={(e) => {
                                if (isEditing) {
                                    setEditedTokens(prev => ({ ...prev, [WhatsAppConnectionData.data.id]: e.target.value }));
                                }
                            }}
                            disabled={!isEditing}
                            placeholder="Access Token"
                        />
                        <button
                            type="button"
                            onClick={() => toggleAccessTokenVisibility(WhatsAppConnectionData.data.id)}
                            className={cn(
                                "absolute right-3 top-8 p-1.5 rounded-lg transition-colors",
                                isDarkMode
                                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            )}
                        >
                            {showAccessToken[WhatsAppConnectionData.data.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
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
                                <button
                                    onClick={() => handleDeleteClick(WhatsAppConnectionData.data.id)}
                                    className={cn(
                                        "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                        isDarkMode
                                            ? "bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-600/20"
                                            : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                    )}
                                >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
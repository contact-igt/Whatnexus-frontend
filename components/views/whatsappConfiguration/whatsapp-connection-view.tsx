"use client";

import { useState } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, Eye, EyeOff, Loader2, Shield, Phone, Key, Smartphone, Building2, Users, Hospital, Copy, Check, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Organization } from "../organization/organization-view";
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useGetWhatsappConfigQuery, useSaveWhatsAppConfigMutation, useStatusWhatsAppConfigQuery, useTestWhatsAppConfigQuery } from '@/hooks/useWhatsappConfigQuery';
import { WhatsappConnectionList } from './whatsappConnectionList';
import { getWebhookBaseURL } from '@/helper/axios';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useDispatch } from 'react-redux';
import { updateWebhookStatus } from '@/redux/slices/auth/authSlice';
import { toast } from 'sonner';
interface WhatsAppConfig {
    waba_id: string;
    phone_number_id: string;
    whatsapp_number: string;
    access_token: string;
}

export const whatsappConnectSchema = z.object({
    waba_id: z
        .string()
        .regex(/^\d+$/, "WABA ID must contain only numbers")
        .min(8, "WABA ID is too short")
        .max(20, "WABA ID is too long"),

    phone_number_id: z
        .string()
        .regex(/^\d+$/, "Phone Number ID must contain only numbers")
        .min(8, "Phone Number ID is too short")
        .max(20, "Phone Number ID is too long"),

    whatsapp_number: z
        .string()
        .regex(/^\d+$/, "WhatsApp number must contain only numbers")
        .min(10, "WhatsApp number must be at least 10 digits")
        .max(15, "WhatsApp number must be at most 15 digits"),

    access_token: z
        .string()
        .min(100, "Access token is too short")
        .max(300, "Access token is too long"),
});

export const WhatsAppConnectionView = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<WhatsAppConfig>({
        resolver: zodResolver(whatsappConnectSchema),
        defaultValues: {
            waba_id: '',
            whatsapp_number: '',
            phone_number_id: '',
            access_token: '',
        }
    })
    const { user } = useAuth();
    const dispatch = useDispatch();
    const { data: WhatsAppConnectionData, isLoading: isWhatsappLoading, refetch: refetchWhatsAppConfig } = useGetWhatsappConfigQuery();
    const { mutate: saveWhatsConfigMutate, isPending: isSaveLoading } = useSaveWhatsAppConfigMutation();
    const { mutate: testWhatsConfigMutate, isPending: isTestLoading } = useTestWhatsAppConfigQuery();
    const { mutate: updateWhatsappConfigMutate, isPending: isUpdateLoading } = useStatusWhatsAppConfigQuery();
    const { isDarkMode } = useTheme();

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isCheckingWebhook, setIsCheckingWebhook] = useState(false);

    const [showAccessToken, setShowAccessToken] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isHideBack = pathname === '/settings/whatsapp-settings';

    const handleTestConnection = () => {
        testWhatsConfigMutate()
    }
    const handleDeleteClick = (id: any) => {
        // setSelectedOrgId(id);
        // setIsDeleteModalOpen(true);
    };

    const handleToggleActive = (id: any, status: string) => {
        const data = {
            status: status == "active" ? "inactive" : "active"
        }
        updateWhatsappConfigMutate({ id, data });
    }

    const handleEditClick = (connection: any) => {
        console.log('Edit clicked for connection:', connection.id);
    };

    const handleSaveEdit = (connection: any) => {
        console.log('Save configuration for:', connection.id);
        // TODO: Implement save logic
    };

    const getStatusColor = () => {
        if (WhatsAppConnectionData?.data?.id) return 'text-emerald-500 bg-emerald-500/10';
        return 'text-slate-500 bg-slate-500/10';
    };
    const whatsappNumber = watch("whatsapp_number");
    const getStatusIcon = () => {
        if (WhatsAppConnectionData?.data?.id) return <CheckCircle2 size={16} />;
        return <XCircle size={16} />;
    };

    const handleBack = () => {
        router.push('/organizations');
    }

    const onSubmit = (data: any) => {
        console.log("datafunc", data)
        saveWhatsConfigMutate({ data });
    }

    const handleCheckWebhookStatus = async () => {
        if (!user?.tenant_id) return;

        setIsCheckingWebhook(true);
        try {
            const response = await new (await import('@/services/tenant')).TenantApiData().getWebhookStatus(user.tenant_id);
            const webhookVerified = response?.data?.webhook_verified || false;
            dispatch(updateWebhookStatus(webhookVerified));

            if (webhookVerified) {
                await refetchWhatsAppConfig(); // Refetch WhatsApp config
                toast.success('Webhook verified successfully!');
            } else {
                toast.info('Webhook not yet verified. Please complete Meta verification.');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to check webhook status');
        } finally {
            setIsCheckingWebhook(false);
        }
    };
    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1000px] mx-auto no-scrollbar pb-32">
            <div className="space-y-4">
                {!isHideBack && <button
                    onClick={handleBack}
                    className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors",
                        isDarkMode ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
                    )}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Organizations</span>
                </button>}

                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            WhatsApp Business API
                        </h1>
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Configure WhatsApp Business API for <span className="font-semibold">{organization?.company_name || "City Hospital"}</span>
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium",
                            getStatusColor()
                        )}>
                            {getStatusIcon()}
                            <span>{WhatsAppConnectionData?.data?.id ? 'Connected' : 'Not Connected'}</span>
                        </div>

                        {!WhatsAppConnectionData?.data?.id && (
                            <button
                                onClick={handleCheckWebhookStatus}
                                disabled={isCheckingWebhook}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                                    isDarkMode
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100",
                                    isCheckingWebhook && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isCheckingWebhook ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={16} />
                                )}
                                <span>{isCheckingWebhook ? 'Checking...' : 'Check Webhook Status'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {WhatsAppConnectionData?.data?.id && (
                <div className={cn(
                    "p-6 rounded-xl border backdrop-blur-xl",
                    isDarkMode
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-emerald-50 border-emerald-200"
                )}>
                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                        )}>
                            <MessageCircle className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h3 className={cn("font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                WhatsApp Connected
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                Last connected: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {WhatsAppConnectionData?.data?.id && (
                <WhatsappConnectionList
                    isDarkMode={isDarkMode}
                    handleToggleActive={handleToggleActive}
                    handleDeleteClick={handleDeleteClick}
                    handleEditClick={handleEditClick}
                    WhatsAppConnectionData={WhatsAppConnectionData}
                    onTestConnection={handleTestConnection}
                    onSaveConfiguration={handleSaveEdit}
                />
            )}



            {!WhatsAppConnectionData?.data?.id && <>
                {/* Conditional UI based on webhook_verified status */}
                {user?.webhook_verified ? (
                    /* API Credentials Form - Shown when webhook_verified is true */
                    <div className={cn(
                        "p-8 rounded-xl border backdrop-blur-xl",
                        isDarkMode
                            ? "bg-white/[0.02] border-white/10"
                            : "bg-white border-slate-200"
                    )}>
                        <div className="space-y-6">
                            <div>
                                <h2 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                    API Credentials
                                </h2>
                                <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    Enter your Meta Business API credentials to connect WhatsApp
                                </p>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        {...register("waba_id")}
                                        autoComplete='new-password'
                                        isDarkMode={isDarkMode}
                                        label="WhatsApp Business Account ID"
                                        icon={Shield}
                                        placeholder="Enter WABA ID"
                                        error={errors.waba_id?.message}
                                        required
                                    />

                                    <Input
                                        {...register("phone_number_id")}
                                        autoComplete='new-password'
                                        isDarkMode={isDarkMode}
                                        label="Phone Number ID"
                                        icon={Phone}
                                        placeholder="Enter Phone Number ID"
                                        error={errors.phone_number_id?.message}
                                        required
                                    />
                                    <div className='md:col-span-2 relative'>
                                        <Input
                                            {...register("whatsapp_number")}
                                            autoComplete='new-password'
                                            isDarkMode={isDarkMode}
                                            label="Whatsapp Number"
                                            icon={MessageCircle}
                                            placeholder="Enter Whatsapp Number"
                                            error={errors.whatsapp_number?.message}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 relative mb-5">
                                        <Input
                                            {...register("access_token")}
                                            autoComplete='new-password'
                                            isDarkMode={isDarkMode}
                                            label="Access Token"
                                            icon={Key}
                                            type={showAccessToken ? "text" : "password"}
                                            placeholder="Enter your Meta Access Token"
                                            error={errors?.access_token?.message}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowAccessToken(!showAccessToken)}
                                            className={cn(
                                                "absolute right-3 top-8 p-1.5 rounded-lg transition-colors",
                                                isDarkMode
                                                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                                                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                            )}
                                        >
                                            {showAccessToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                    <div className="flex items-center space-x-3">
                                    </div>

                                    <button
                                        type='submit'
                                        className={cn(
                                            "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                            isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                                        )}
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>Save Configuration</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* Webhook Setup Instructions - Shown when webhook_verified is false */
                    <div className={cn(
                        "p-8 rounded-xl border backdrop-blur-xl",
                        isDarkMode
                            ? "bg-gradient-to-br from-rose-500/5 to-orange-500/5 border-rose-500/20"
                            : "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200"
                    )}>
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start space-x-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                    isDarkMode ? "bg-rose-500/20" : "bg-rose-100"
                                )}>
                                    <Key className="text-rose-500" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Complete Meta Verification
                                    </h2>
                                    <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                        You need to verify your Meta Business account before connecting WhatsApp
                                    </p>
                                </div>
                            </div>

                            {/* Email Notification Card */}
                            <div className={cn(
                                "p-6 rounded-xl border",
                                isDarkMode
                                    ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
                                    : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                            )}>
                                <div className="flex items-start space-x-4">
                                    <div className={cn(
                                        "w-16 h-16 rounded-xl flex items-center justify-center shrink-0",
                                        isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                    )}>
                                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={cn("text-lg font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                            📧 Check Your Email
                                        </h3>
                                        <p className={cn("text-sm mb-3", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                            We've sent your <span className="font-semibold">Callback URL</span> and <span className="font-semibold">Verify Token</span> to:
                                        </p>
                                        <div className={cn(
                                            "px-4 py-3 rounded-lg border inline-flex items-center space-x-2",
                                            isDarkMode
                                                ? "bg-white/5 border-white/10"
                                                : "bg-white border-slate-200"
                                        )}>
                                            <svg className={cn("w-4 h-4", isDarkMode ? "text-white/60" : "text-slate-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                            <span className={cn("font-mono text-sm font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                                {user?.email}
                                            </span>
                                        </div>
                                        <p className={cn("text-xs mt-3", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                            💡 Please check your inbox (and spam folder) for the email containing your credentials
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions Card */}
                            <div className={cn(
                                "p-6 rounded-xl border",
                                isDarkMode
                                    ? "bg-white/5 border-white/10"
                                    : "bg-white border-slate-200"
                            )}>
                                <h3 className={cn("font-semibold mb-4 flex items-center space-x-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                        isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                    )}>1</span>
                                    <span>What you'll find in the email:</span>
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                            isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
                                        )}>
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                Callback URL
                                            </p>
                                            <p className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                The webhook endpoint URL for your Meta app configuration
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                            isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
                                        )}>
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                Verify Token
                                            </p>
                                            <p className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                The verification token to authenticate your webhook
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps Card */}
                            <div className={cn(
                                "p-6 rounded-xl border",
                                isDarkMode
                                    ? "bg-white/5 border-white/10"
                                    : "bg-white border-slate-200"
                            )}>
                                <h3 className={cn("font-semibold mb-4 flex items-center space-x-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                        isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                    )}>2</span>
                                    <span>Next Steps:</span>
                                </h3>
                                <ol className={cn("space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">1.</span>
                                        <span>Open the email and copy your <strong>Callback URL</strong> and <strong>Verify Token</strong></span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">2.</span>
                                        <span>Click the button below to go to Meta Developer Console</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">3.</span>
                                        <span>Navigate to <code className={cn("px-1.5 py-0.5 rounded text-xs", isDarkMode ? "bg-white/10" : "bg-slate-200")}>WhatsApp → Configuration → Webhook</code></span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">4.</span>
                                        <span>Click "Edit" and paste your credentials from the email</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">5.</span>
                                        <span>Click "Verify and Save" to complete the setup</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <span className="font-semibold shrink-0">6.</span>
                                        <span>Subscribe to webhook fields: <code className={cn("px-1.5 py-0.5 rounded text-xs", isDarkMode ? "bg-white/10" : "bg-slate-200")}>messages</code>, <code className={cn("px-1.5 py-0.5 rounded text-xs", isDarkMode ? "bg-white/10" : "bg-slate-200")}>message_status</code></span>
                                    </li>
                                </ol>
                            </div>

                            {/* CTA Button */}
                            <div className="flex justify-center pt-2">
                                <a
                                    href="https://developers.facebook.com/apps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg hover:brightness-110",
                                        isDarkMode
                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                                    )}
                                >
                                    <ExternalLink size={18} />
                                    <span>Go to Meta Developer Console</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meta Business Setup Guide - Always Shown */}
                <div className="space-y-4">
                    <div className={cn(
                        "p-6 rounded-xl border backdrop-blur-xl",
                        isDarkMode
                            ? "bg-blue-500/5 border-blue-500/20"
                            : "bg-blue-50 border-blue-200"
                    )}>
                        <div className="flex items-start space-x-3 mb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                            )}>
                                <Building2 className="text-blue-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className={cn("font-semibold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Meta Business Setup Guide
                                </h3>
                                <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    Follow these steps to configure WhatsApp Business API
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Step 1 */}
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === 'step1' ? null : 'step1')}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                        )}>
                                            1
                                        </div>
                                        <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Create Meta Business Account
                                        </span>
                                    </div>
                                    {expandedSection === 'step1' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedSection === 'step1' && (
                                    <div className={cn("px-4 pb-4 pt-2 space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                        <p>• Visit <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Meta Business Suite <ExternalLink size={12} className="ml-1" /></a></p>
                                        <p>• Create a new business account or select an existing one</p>
                                        <p>• Ensure you have admin access to the account</p>
                                    </div>
                                )}
                            </div>

                            {/* Step 2 */}
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === 'step2' ? null : 'step2')}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                        )}>
                                            2
                                        </div>
                                        <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Set Up WhatsApp Business API
                                        </span>
                                    </div>
                                    {expandedSection === 'step2' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedSection === 'step2' && (
                                    <div className={cn("px-4 pb-4 pt-2 space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                        <p>• Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">Meta for Developers <ExternalLink size={12} className="ml-1" /></a></p>
                                        <p>• Create a new app or select an existing one</p>
                                        <p>• Add WhatsApp product to your app</p>
                                        <p>• Navigate to WhatsApp → Getting Started</p>
                                    </div>
                                )}
                            </div>

                            {/* Step 3 */}
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === 'step3' ? null : 'step3')}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                        )}>
                                            3
                                        </div>
                                        <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Get Your Credentials
                                        </span>
                                    </div>
                                    {expandedSection === 'step3' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedSection === 'step3' && (
                                    <div className={cn("px-4 pb-4 pt-2 space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                        <p>• <strong>WABA ID:</strong> Found in WhatsApp → API Setup → WhatsApp Business Account ID</p>
                                        <p>• <strong>Phone Number ID:</strong> Found in WhatsApp → API Setup → Phone Number ID</p>
                                        <p>• <strong>Access Token:</strong> Generate from App Settings → Basic → Generate Token</p>
                                        <p className="text-amber-500">⚠️ Make sure to generate a permanent access token, not a temporary one</p>
                                    </div>
                                )}
                            </div>

                            {/* Step 4 */}
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === 'step4' ? null : 'step4')}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                        )}>
                                            4
                                        </div>
                                        <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Configure Webhook
                                        </span>
                                    </div>
                                    {expandedSection === 'step4' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedSection === 'step4' && (
                                    <div className={cn("px-4 pb-4 pt-2 space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                        <p className="text-emerald-500 font-semibold">📧 Check your Email ( {user?.email} ) for the Verify Token that were sent to you</p>
                                        <p>• In Meta Developer Console, go to WhatsApp → Configuration</p>
                                        <p>• Click "Edit" next to Webhook</p>
                                        <div>• <strong>Callback URL:</strong> Use this URL:
                                            <div className={cn("inline-flex items-center space-x-2 mt-1 px-2 py-1 rounded border ml-2", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                                <code className="text-xs font-mono">{getWebhookBaseURL()}/webhook</code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${getWebhookBaseURL()}/webhook`);
                                                        setCopiedWebhook(true);
                                                        setTimeout(() => setCopiedWebhook(false), 2000);
                                                    }}
                                                    className={cn("p-1 rounded transition-colors", isDarkMode ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700")}
                                                >
                                                    {copiedWebhook ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </div>
                                        <p>• <strong>Verify Token:</strong> Use the verify token from your Email</p>
                                        <p>• Click "Verify and Save"</p>
                                        <p>• Subscribe to webhook fields: <code className={cn("px-1.5 py-0.5 rounded text-xs", isDarkMode ? "bg-white/10" : "bg-slate-200")}>messages</code>, <code className={cn("px-1.5 py-0.5 rounded text-xs", isDarkMode ? "bg-white/10" : "bg-slate-200")}>message_status</code></p>
                                    </div>
                                )}
                            </div>

                            {/* Step 5 */}
                            <div className={cn(
                                "rounded-lg border overflow-hidden",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                            )}>
                                <button
                                    onClick={() => setExpandedSection(expandedSection === 'step5' ? null : 'step5')}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                            isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                        )}>
                                            5
                                        </div>
                                        <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Connect Phone Number
                                        </span>
                                    </div>
                                    {expandedSection === 'step5' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedSection === 'step5' && (
                                    <div className={cn("px-4 pb-4 pt-2 space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                        <p>• In WhatsApp → API Setup, click "Add Phone Number"</p>
                                        <p>• Enter your business phone number</p>
                                        <p>• Verify the phone number via SMS or call</p>
                                        <p>• Once verified, the phone number will be linked to your Meta app</p>
                                        <p>• Copy the Phone Number ID and use it in the form above</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>}
        </div>
    );
};
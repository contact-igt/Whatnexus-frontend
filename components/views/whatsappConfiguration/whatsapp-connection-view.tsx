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
import { TestMessageCard } from './test-message-card';
import { MetaVerificationCard } from './meta-verification-card';
import { MetaSetupGuide } from './meta-setup-guide';
import { WhatsAppFlowStepper } from './whatsapp-flow-stepper';
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
    const [showVerification, setShowVerification] = useState(false);

    const [showAccessToken, setShowAccessToken] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isHideBack = pathname === '/settings/whatsapp-settings';

    const handleTestConnection = () => {
        testWhatsConfigMutate(undefined)
    }
    const handleDeleteClick = (id: any) => {
        // setSelectedOrgId(id);
        // setIsDeleteModalOpen(true);
    };

    const handleToggleActive = (id: any, status: string) => {
        // If trying to activate
        if (status !== 'active') {
            // Check if webhook is verified
            if (!user?.webhook_verified) {
                // If not verified, show verification UI and return
                setShowVerification(true);
                toast.error("Please verify your webhook before activating.");
                return;
            }
        }

        // If verified or deactivating, proceed with toggle
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
                setShowVerification(false); // Hide verification UI after success (optional, or keep it to show status)
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
        <div className="h-full overflow-y-auto p-8 animate-in slide-in-from-bottom-8 duration-700 mx-auto no-scrollbar pb-32">
            <div className="max-w-[1200px] mx-auto space-y-8">
                <div>
                    {!isHideBack && <button
                        onClick={handleBack}
                        className={cn(
                            "flex items-center space-x-2 text-sm font-medium transition-colors mb-4",
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
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                    {/* Main Content - Left Column */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center space-x-3 mb-2">
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

                        {WhatsAppConnectionData?.data?.id && (
                            <div className={cn(
                                "p-6 rounded-xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500",
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

                        {WhatsAppConnectionData?.data?.id ? (
                            <div className="space-y-6">
                                {/* Meta Verification Card - Show if triggered */}
                                {showVerification && (
                                    <MetaVerificationCard
                                        isDarkMode={isDarkMode}
                                        user={user}
                                        onCheckStatus={handleCheckWebhookStatus}
                                        isChecking={isCheckingWebhook}
                                    />
                                )}

                                <WhatsappConnectionList
                                    isDarkMode={isDarkMode}
                                    handleToggleActive={handleToggleActive}
                                    handleDeleteClick={handleDeleteClick}
                                    handleEditClick={handleEditClick}
                                    WhatsAppConnectionData={WhatsAppConnectionData}
                                    onTestConnection={handleTestConnection}
                                    onSaveConfiguration={handleSaveEdit}
                                />

                                {/* Test MessageCard - Show if connection exists */}
                                {WhatsAppConnectionData?.data?.id && (
                                    <TestMessageCard
                                        isDarkMode={isDarkMode}
                                        isActive={WhatsAppConnectionData.data.status === 'active'}
                                        whatsappNumber={WhatsAppConnectionData.data.whatsapp_number}
                                    />
                                )}
                            </div>
                        ) : (
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
                        )}
                    </div>


                    <div className="xl:col-span-1 space-y-6">
                        <WhatsAppFlowStepper
                            isDarkMode={isDarkMode}
                        />
                        <MetaSetupGuide isDarkMode={isDarkMode} user={user} />
                    </div>
                </div>
            </div>
        </div>
    );
};

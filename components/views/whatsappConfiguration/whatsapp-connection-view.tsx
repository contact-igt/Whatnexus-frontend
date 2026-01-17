"use client";

import { useState } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, Eye, EyeOff, Loader2, Shield, Phone, Key, Smartphone, Building2, Users, Hospital } from 'lucide-react';
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
    const { data: WhatsAppConnectionData, isLoading: isWhatsappLoading } = useGetWhatsappConfigQuery();
    const { mutate: saveWhatsConfigMutate, isPending: isSaveLoading } = useSaveWhatsAppConfigMutation();
    const { mutate: testWhatsConfigMutate, isPending: isTestLoading } = useTestWhatsAppConfigQuery();
    const { mutate: updateWhatsappConfigMutate, isPending: isUpdateLoading } = useStatusWhatsAppConfigQuery();
    const { isDarkMode } = useTheme();

    const [organization, setOrganization] = useState<Organization | null>(null);

    const [showAccessToken, setShowAccessToken] = useState(false);
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
        saveWhatsConfigMutate({data});
    }
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
                            Configure WhatsApp Business API for <span className="font-semibold">{organization?.name || "City Hospital"}</span>
                        </p>
                    </div>

                    <div className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium",
                        getStatusColor()
                    )}>
                        {getStatusIcon()}
                        <span>{WhatsAppConnectionData?.data?.id ? 'Connected' : 'Not Connected'}</span>
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

                                {/* <div className="relative">
                            <Input
                            autoComplete='new-password'
                                isDarkMode={isDarkMode}
                                label="Meta App Secret"
                                icon={Key}
                                type={showAppSecret ? "text" : "password"}
                                placeholder="Enter Meta App Secret (Optional)"
                                value={formData.metaAppSecret}
                                onChange={(e) => handleChange('metaAppSecret', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowAppSecret(!showAppSecret)}
                                className={cn(
                                    "absolute right-3 top-9 p-1.5 rounded-lg transition-colors",
                                    isDarkMode
                                        ? "hover:bg-white/10 text-white/60 hover:text-white"
                                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                )}
                            >
                                {showAppSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div> */}

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
                                    {/* <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    className={cn(
                                        "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                        isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20",
                                        isTesting && "opacity-50 cursor-not-allowed",
                                        
                                    )}
                                >
                                    {isTesting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Testing Connection...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MessageCircle size={16} />
                                            <span>Test Connection</span>
                                        </>
                                    )}
                                </button> */}

                                    {/* {isWhatsappConnected && (
                                    <button
                                        disabled={!isTested || isTesting}
                                        onClick={handleDisconnect}
                                        className={cn(
                                            "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                            isDarkMode
                                                ? "bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20"
                                                : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                        )}
                                    >
                                        <XCircle size={16} />
                                        <span>Disconnect</span>
                                    </button>
                                )} */}
                                </div>

                                <button
                                    // onClick={handleSaveConfiguration}
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

                <div className={cn(
                    "p-6 rounded-xl border backdrop-blur-xl",
                    isDarkMode
                        ? "bg-blue-500/5 border-blue-500/20"
                        : "bg-blue-50 border-blue-200"
                )}>
                    <h3 className={cn("font-semibold mb-3", isDarkMode ? "text-white" : "text-slate-900")}>
                        How to get your credentials
                    </h3>
                    <ul className={cn("space-y-2 text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                        <li>• Visit the <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Meta Business Suite</a></li>
                        <li>• Navigate to WhatsApp Business API settings</li>
                        <li>• Copy your WABA ID and Phone Number ID</li>
                        <li>• Generate a permanent access token from your Meta App</li>
                        <li>• Enter the credentials above and test the connection</li>
                    </ul>
                </div>
            </>}
        </div>
    );
};
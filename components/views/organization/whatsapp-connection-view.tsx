"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, Eye, EyeOff, Loader2, Shield, Phone, Key, Smartphone, Building2, PlayCircle, ChevronDown, ChevronUp, Rocket, Calendar, Facebook, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Organization } from "./organization-view";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useGetWhatsAppConfigQuery, useSaveWhatsAppConfigMutation, useTestWhatsAppConnectionMutation } from '@/hooks/useTenantQuery';


interface WhatsAppConfig {
    wabaId: string;
    phoneNumberId: string;
    accessToken: string;
    metaAppId: string;
    metaAppSecret: string;
    isConnected: boolean;
    lastConnected?: Date;
    verificationStatus?: 'verified' | 'pending' | 'unverified';
}

interface SetupStep {
    id: string;
    title: string;
    completed: boolean;
}

export const WhatsAppConnectionView = () => {
    const { isDarkMode } = useTheme();
    const searchParams = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [showAppSecret, setShowAppSecret] = useState(false);
    const [showAllSteps, setShowAllSteps] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const pathname = usePathname();
    const [formData, setFormData] = useState<WhatsAppConfig>({
        wabaId: '',
        phoneNumberId: '',
        accessToken: '',
        metaAppId: '',
        metaAppSecret: '',
        isConnected: false,
        verificationStatus: 'unverified'
    });
    const router = useRouter();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const isHideBack = pathname === '/settings/whatsapp-settings';
    const [showCredentialsForm, setShowCredentialsForm] = useState(false);

    const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
        { id: '1', title: 'Apply for WhatsApp Business API', completed: false },
        { id: '2', title: 'Configure API Credentials', completed: false },
        { id: '3', title: 'Test Connection', completed: false },
    ]);

    // Fetch WhatsApp config from API
    const { data: whatsappConfig, isLoading, isError } = useGetWhatsAppConfigQuery(tenantId);
    const { mutate: saveConfigMutate, isPending: isSaving } = useSaveWhatsAppConfigMutation();
    const { mutate: testConnectionMutate, isPending: isTesting } = useTestWhatsAppConnectionMutation();

    // Load WhatsApp config from API
    useEffect(() => {
        if (whatsappConfig) {
            setFormData({
                wabaId: whatsappConfig.wabaId || '',
                phoneNumberId: whatsappConfig.phoneNumberId || '',
                accessToken: whatsappConfig.accessToken || '',
                metaAppId: whatsappConfig.metaAppId || '',
                metaAppSecret: whatsappConfig.metaAppSecret || '',
                isConnected: whatsappConfig.isConnected || false,
                lastConnected: whatsappConfig.lastConnected ? new Date(whatsappConfig.lastConnected) : undefined,
                verificationStatus: whatsappConfig.verificationStatus || 'unverified'
            });

            // Mark steps as completed if already connected
            if (whatsappConfig.isConnected) {
                setSetupSteps(prev => prev.map(step => ({ ...step, completed: true })));
            }
        }
    }, [whatsappConfig]);

    const handleChange = (field: keyof WhatsAppConfig, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Mark step 2 as in progress when user starts filling form
        if (!setupSteps[1].completed && value.trim()) {
            setSetupSteps(prev => prev.map((step, idx) =>
                idx === 0 ? { ...step, completed: true } : step
            ));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.wabaId.trim()) {
            newErrors.wabaId = "WABA ID is required";
        }
        if (!formData.phoneNumberId.trim()) {
            newErrors.phoneNumberId = "Phone Number ID is required";
        }
        if (!formData.accessToken.trim()) {
            newErrors.accessToken = "Access Token is required";
        }
        if (!formData.metaAppId.trim()) {
            newErrors.metaAppId = "Meta App ID is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleApplyForAPI = () => {
    //     // Open Meta Business Suite for WhatsApp API application
    //     window.open('https://business.facebook.com/wa/manage/home/', '_blank');
    //     // Mark step 1 as completed
    //     setSetupSteps(prev => prev.map((step, idx) =>
    //         idx === 0 ? { ...step, completed: true } : step
    //     ));
    //     // Show credentials form after they apply
    //     setTimeout(() => {
    //         setShowCredentialsForm(true);
    //     }, 1000);
    // };
    const connectWhatsApp = () => {
        const clientId = "1811169506187093";

        const redirectUri = encodeURIComponent(
            "http://localhost:8000/api/whatsapp/callback"
        );

        const scopes = [
            "business_management",
            "whatsapp_business_management",
            "whatsapp_business_messaging",
        ].join(",");

        const fbAuthUrl =
            `https://www.facebook.com/v19.0/dialog/oauth +
            ?client_id=${clientId} +
            &redirect_uri=${redirectUri} +
            &scope=${scopes} +
            &response_type=code`;

        window.location.href = fbAuthUrl;
    };

    const handleScheduleMeeting = () => {
        // You can replace this with your actual scheduling URL
        window.open('https://calendly.com/your-link', '_blank');
    };

    const handleContinueWithFacebook = () => {
        window.open('https://business.facebook.com/', '_blank');
    };

    const handleTestConnection = async () => {
        if (!validate()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!tenantId) {
            toast.error('Tenant ID is missing');
            return;
        }

        testConnectionMutate(
            {
                tenantId,
                data: {
                    wabaId: formData.wabaId,
                    phoneNumberId: formData.phoneNumberId,
                    accessToken: formData.accessToken,
                    metaAppId: formData.metaAppId,
                    metaAppSecret: formData.metaAppSecret,
                }
            },
            {
                onSuccess: () => {
                    setFormData(prev => ({
                        ...prev,
                        isConnected: true,
                        verificationStatus: 'verified',
                        lastConnected: new Date()
                    }));
                    // Mark all steps as completed
                    setSetupSteps(prev => prev.map(step => ({ ...step, completed: true })));
                }
            }
        );
    };

    const handleSaveConfiguration = () => {
        if (!validate()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!tenantId) {
            toast.error('Tenant ID is missing');
            return;
        }

        saveConfigMutate({
            tenantId,
            data: {
                wabaId: formData.wabaId,
                phoneNumberId: formData.phoneNumberId,
                accessToken: formData.accessToken,
                metaAppId: formData.metaAppId,
                metaAppSecret: formData.metaAppSecret,
                isConnected: formData.isConnected,
                verificationStatus: formData.verificationStatus,
            }
        });
    };

    const handleDisconnect = () => {
        setFormData(prev => ({
            ...prev,
            isConnected: false,
            verificationStatus: 'unverified',
            lastConnected: undefined
        }));
        setSetupSteps(prev => prev.map(step => ({ ...step, completed: false })));

        if (tenantId) {
            saveConfigMutate({
                tenantId,
                data: {
                    ...formData,
                    isConnected: false,
                    verificationStatus: 'unverified',
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-32 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            </div>
        );
    }

    const getStatusColor = () => {
        if (formData.isConnected) return 'text-emerald-500 bg-emerald-500/10';
        return 'text-orange-500 bg-orange-500/10';
    };

    const getStatusIcon = () => {
        if (formData.isConnected) return <CheckCircle2 size={16} />;
        return <XCircle size={16} />;
    };

    const getStatusText = () => {
        if (formData.isConnected) return 'CONNECTED';
        return 'PENDING';
    };

    const handleBack = () => {
        router.push('/organizations');
    };

    const stepsLeft = setupSteps.filter(step => !step.completed).length;

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            {/* Header */}
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
                            {organization?.name || "Business Setup"}
                        </h1>
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            WhatsApp Business API Status: <span className={cn("font-semibold uppercase", getStatusColor().split(' ')[0])}>{getStatusText()}</span>
                        </p>
                    </div>

                    <div className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold border",
                        getStatusColor(),
                        isDarkMode ? "border-white/10" : "border-slate-200"
                    )}>
                        {getStatusIcon()}
                        <span>{formData.isConnected ? 'Connected' : 'Pending'}</span>
                    </div>
                </div>
            </div>

            {/* Conditional Content Based on Connection Status */}
            {/* Conditional Content Based on Connection Status */}
            {!formData.isConnected ? (
                /* NOT CONNECTED - AISensy-Inspired Design */
                !showCredentialsForm ? (
                    <div className="max-w-[1000px] mx-auto space-y-6 animate-in fade-in duration-700">
                        {/* Bottom Banner */}
                        <div className={cn(
                            "relative overflow-hidden rounded-2xl p-8 md:p-10 text-white shadow-2xl mt-8 mb-10",
                            "bg-gradient-to-r from-purple-800 to-indigo-900"
                        )}>
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                                            Start WhatsApp Engagement for your Business
                                        </h3>
                                        <p className="text-purple-100 text-sm md:text-base leading-relaxed max-w-lg">
                                            You'll need to Apply for WhatsApp Business API to use WhatNexus for your Business.
                                            Start your API application by choosing one of the options.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={connectWhatsApp}
                                            className="px-6 py-3 rounded-xl bg-white text-purple-900 font-bold text-sm hover:bg-purple-50 transition-colors shadow-lg shadow-purple-900/20 flex items-center space-x-2"
                                        >
                                            <MessageCircle size={18} className="text-emerald-500 fill-emerald-500/20" />
                                            <span>Connect WhatsApp Business API (FREE)</span>
                                        </button>

                                        <button
                                            onClick={() => setShowCredentialsForm(true)}
                                            className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium text-sm hover:bg-white/20 border border-white/20 transition-all flex items-center space-x-2 backdrop-blur-sm"
                                        >
                                            <span>Migrate from Another Vendor</span>
                                            <span>→</span>
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-xs text-purple-200">
                                            Want to know more about WhatNexus? <a href="#" className="underline hover:text-white transition-colors">Click to schedule a Live Demo.</a>
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden md:flex justify-end relative">
                                    <div className="relative w-48 h-48 animate-float">
                                        <Rocket size={180} className="text-white drop-shadow-2xl opacity-90 transform -rotate-12" />
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/20 blur-xl rounded-full" />

                                        {/* Sparkles */}
                                        <div className="absolute top-0 right-0 p-2 animate-pulse text-yellow-300">✦</div>
                                        <div className="absolute bottom-10 left-0 p-2 animate-pulse delay-700 text-blue-300 text-xl">★</div>
                                        <div className="absolute top-1/2 -left-4 p-1 animate-pulse delay-300 text-white">•</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className={cn(
                                    "p-2 rounded-lg",
                                    isDarkMode ? "bg-white/10" : "bg-slate-100"
                                )}>
                                    <MessageCircle size={20} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                                </span>
                                <h2 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Enable WhatsApp Business API
                                </h2>
                            </div>
                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                {stepsLeft} steps left
                            </span>
                        </div>

                        {/* Step Card */}
                        <div className={cn(
                            "rounded-xl border shadow-sm transition-all overflow-hidden",
                            isDarkMode
                                ? "bg-white/[0.02] border-white/10"
                                : "bg-white border-slate-200"
                        )}>
                            <div className="border-b transition-colors" style={{
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }}>
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex space-x-4">
                                            {/* Status Icon */}
                                            <div className="relative">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                                                    setupSteps[0].completed
                                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                        : "bg-yellow-400 text-yellow-900 shadow-yellow-500/20"
                                                )}>
                                                    <CheckCircle2 size={24} className="fill-current" />
                                                </div>
                                                {/* Start Badge */}
                                                {!setupSteps[0].completed && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap border border-green-200">
                                                        Start
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-slate-100" : "text-slate-900")}>
                                                    Apply for WhatsApp Business API
                                                </h3>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowAllSteps(!showAllSteps)}
                                            className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isDarkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-400"
                                            )}
                                        >
                                            {showAllSteps ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>

                                    {/* Expanded Content */}
                                    <div className="mt-6 md:pl-14 space-y-6">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            isDarkMode ? "text-emerald-400" : "text-emerald-700"
                                        )}>
                                            Click on Continue With Facebook to apply for WhatsApp Business API
                                        </p>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className={cn("text-sm font-medium mb-2", isDarkMode ? "text-white/80" : "text-slate-600")}>
                                                        Requirements to apply for WhatsApp Business API
                                                    </h4>
                                                    <ul className={cn("space-y-2 text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                                        <li className="flex items-start space-x-2">
                                                            <span className="text-emerald-500 mt-1">•</span>
                                                            <span>A Registered Business & Working Website.</span>
                                                        </li>
                                                        <li className="flex items-start space-x-2">
                                                            <span className="text-emerald-500 mt-1">
                                                                <BookOpen size={14} />
                                                            </span>
                                                            <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                                                                How to apply for WhatsApp Business API?
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Video Placeholder */}
                                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-xl group cursor-pointer w-full max-w-sm ml-auto">
                                                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop")' }} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                                                        <PlayCircle className="w-8 h-8 text-white fill-current" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                                    <p className="font-bold text-lg leading-tight">GET FREE WhatsApp API</p>
                                                    <p className="text-sm opacity-90">in 10 Mins</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <button
                                                onClick={handleScheduleMeeting}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center space-x-2 transition-all",
                                                    isDarkMode
                                                        ? "border-white/20 hover:bg-white/5 text-white"
                                                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                                )}
                                            >
                                                <Calendar size={16} />
                                                <span>Schedule Meetings</span>
                                            </button>
                                            <button
                                                onClick={connectWhatsApp}
                                                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all transform active:scale-95"
                                            >
                                                <Facebook size={18} className="fill-current" />
                                                <span>Continue With Facebook</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* All Steps Toggle */}
                        <div className="pl-2">
                            <button
                                onClick={() => setShowAllSteps(!showAllSteps)}
                                className={cn(
                                    "flex items-center space-x-2 text-sm font-medium transition-colors",
                                    isDarkMode ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <span>All Steps</span>
                                {showAllSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {/* Steps List (Hidden by default) */}
                        {showAllSteps && (
                            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                                {setupSteps.map((step, idx) => (
                                    <div key={step.id} className={cn(
                                        "p-4 rounded-xl border flex items-center space-x-4",
                                        isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
                                    )}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                            step.completed
                                                ? "bg-emerald-500 text-white"
                                                : isDarkMode ? "bg-white/10 text-white/40" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            step.completed
                                                ? isDarkMode ? "text-white" : "text-slate-900"
                                                : isDarkMode ? "text-white/60" : "text-slate-500"
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Credentials Form View */
                    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <button
                            onClick={() => setShowCredentialsForm(false)}
                            className={cn(
                                "flex items-center space-x-2 text-sm font-medium transition-colors mb-4",
                                isDarkMode ? "text-white/60 hover:text-white" : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Guide</span>
                        </button>

                        <div className={cn(
                            "p-8 rounded-2xl border backdrop-blur-xl shadow-2xl",
                            isDarkMode
                                ? "bg-white/[0.02] border-white/10"
                                : "bg-white border-slate-200"
                        )}>
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                                        isDarkMode ? "bg-emerald-500/20 text-emerald-500" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        <Key size={24} />
                                    </div>
                                    <h2 className={cn("text-2xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Connect WhatsApp API
                                    </h2>
                                    <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                        Enter your Meta Business API credentials below
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        isDarkMode={isDarkMode}
                                        label="WhatsApp Business Account ID (WABA ID)"
                                        icon={Shield}
                                        placeholder="Enter WABA ID"
                                        value={formData.wabaId}
                                        onChange={(e) => handleChange('wabaId', e.target.value)}
                                        error={errors.wabaId}
                                        required
                                    />

                                    <Input
                                        isDarkMode={isDarkMode}
                                        label="Phone Number ID"
                                        icon={Phone}
                                        placeholder="Enter Phone Number ID"
                                        value={formData.phoneNumberId}
                                        onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                                        error={errors.phoneNumberId}
                                        required
                                    />

                                    <Input
                                        autoComplete='new-password'
                                        isDarkMode={isDarkMode}
                                        label="Meta App ID"
                                        icon={Smartphone}
                                        placeholder="Enter Meta App ID"
                                        value={formData.metaAppId}
                                        onChange={(e) => handleChange('metaAppId', e.target.value)}
                                        error={errors.metaAppId}
                                        required
                                    />

                                    <div className="relative">
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
                                        {formData.metaAppSecret && (
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
                                        )}
                                    </div>

                                    <div className="md:col-span-2 relative">
                                        <Input
                                            isDarkMode={isDarkMode}
                                            label="Access Token"
                                            icon={Key}
                                            type={showAccessToken ? "text" : "password"}
                                            placeholder="Enter your Meta Access Token"
                                            value={formData.accessToken}
                                            onChange={(e) => handleChange('accessToken', e.target.value)}
                                            error={errors.accessToken}
                                            required
                                        />
                                        {formData.accessToken && (
                                            <button
                                                type="button"
                                                onClick={() => setShowAccessToken(!showAccessToken)}
                                                className={cn(
                                                    "absolute right-3 top-9 p-1.5 rounded-lg transition-colors",
                                                    isDarkMode
                                                        ? "hover:bg-white/10 text-white/60 hover:text-white"
                                                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                                )}
                                            >
                                                {showAccessToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={isTesting}
                                        className={cn(
                                            "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                            isDarkMode
                                                ? "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20"
                                                : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200",
                                            isTesting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isTesting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Testing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle size={16} />
                                                <span>Test Connection</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleSaveConfiguration}
                                        disabled={isSaving}
                                        className={cn(
                                            "flex items-center space-x-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                            isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20",
                                            isSaving && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                <span>Save & Connect</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            "rounded-xl border p-4 text-center text-sm",
                            isDarkMode ? "bg-white/5 border-white/10 text-white/60" : "bg-slate-50 border-slate-200 text-slate-600"
                        )}>
                            Need help? <a href="#" className="text-blue-500 hover:underline">Read our setup guide</a> or <a href="#" className="text-blue-500 hover:underline">contact support</a>.
                        </div>
                    </div>
                )
            ) : (
                /* CONNECTED - Show Only API Credentials Form */
                <div className="max-w-[1000px] mx-auto space-y-6">
                    {/* Connected Status Banner */}
                    {formData.lastConnected && (
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
                                        WhatsApp Connected Successfully
                                    </h3>
                                    <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                        Last connected: {new Date(formData.lastConnected).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Credentials Form - Read Only */}
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
                                    Your WhatsApp Business API credentials are configured below
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="WhatsApp Business Account ID (WABA ID)"
                                    icon={Shield}
                                    placeholder="Enter WABA ID"
                                    value={formData.wabaId}
                                    onChange={(e) => handleChange('wabaId', e.target.value)}
                                    error={errors.wabaId}
                                    required
                                    disabled={true}
                                />

                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Phone Number ID"
                                    icon={Phone}
                                    placeholder="Enter Phone Number ID"
                                    value={formData.phoneNumberId}
                                    onChange={(e) => handleChange('phoneNumberId', e.target.value)}
                                    error={errors.phoneNumberId}
                                    required
                                    disabled={true}
                                />

                                <Input
                                    autoComplete='new-password'
                                    isDarkMode={isDarkMode}
                                    label="Meta App ID"
                                    icon={Smartphone}
                                    placeholder="Enter Meta App ID"
                                    value={formData.metaAppId}
                                    onChange={(e) => handleChange('metaAppId', e.target.value)}
                                    error={errors.metaAppId}
                                    required
                                    disabled={true}
                                />

                                <div className="relative">
                                    <Input
                                        autoComplete='new-password'
                                        isDarkMode={isDarkMode}
                                        label="Meta App Secret"
                                        icon={Key}
                                        type={showAppSecret ? "text" : "password"}
                                        placeholder="Enter Meta App Secret (Optional)"
                                        value={formData.metaAppSecret}
                                        onChange={(e) => handleChange('metaAppSecret', e.target.value)}
                                        disabled={true}
                                    />
                                    {formData.metaAppSecret && (
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
                                    )}
                                </div>

                                <div className="md:col-span-2 relative">
                                    <Input
                                        isDarkMode={isDarkMode}
                                        label="Access Token"
                                        icon={Key}
                                        type={showAccessToken ? "text" : "password"}
                                        placeholder="Enter your Meta Access Token"
                                        value={formData.accessToken}
                                        onChange={(e) => handleChange('accessToken', e.target.value)}
                                        error={errors.accessToken}
                                        required
                                        disabled={true}
                                    />
                                    {formData.accessToken && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAccessToken(!showAccessToken)}
                                            className={cn(
                                                "absolute right-3 top-9 p-1.5 rounded-lg transition-colors",
                                                isDarkMode
                                                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                                                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                            )}
                                        >
                                            {showAccessToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <button
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

                                <button
                                    onClick={handleSaveConfiguration}
                                    disabled={isSaving}
                                    className={cn(
                                        "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                        isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20",
                                        isSaving && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>Save Configuration</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
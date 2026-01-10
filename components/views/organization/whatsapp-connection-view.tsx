"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, CheckCircle2, XCircle, Eye, EyeOff, Loader2, Shield, Phone, Key, Smartphone, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Organization } from "./organization-view";
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';


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

export const WhatsAppConnectionView = () => {
    const { isDarkMode } = useTheme();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTesting, setIsTesting] = useState(false);
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [showAppSecret, setShowAppSecret] = useState(false);
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
    // Load organizations and selected organization data
    useEffect(() => {
        const loadOrganization = () => {
            const stored = localStorage.getItem('organizations');
            if (stored) {
                const orgs: any[] = JSON.parse(stored);
                setOrganizations(orgs);

                if (selectedOrgId) {
                    const org = orgs.find(o => o.id === selectedOrgId);
                    if (org) {
                        setOrganization(org);
                        if (org?.whatsappConfig) {
                            setFormData(org?.whatsappConfig);
                        } else {
                            // Reset form if switching organizations
                            setFormData({
                                wabaId: '',
                                phoneNumberId: '',
                                accessToken: '',
                                metaAppId: '',
                                metaAppSecret: '',
                                isConnected: false,
                                verificationStatus: 'unverified'
                            });
                        }
                    }
                } else {
                    setOrganization(null);
                }
            }
            setIsLoading(false);
        };

        loadOrganization();
    }, [selectedOrgId]);

    const handleChange = (field: keyof WhatsAppConfig, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
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

    const handleTestConnection = async () => {
        if (!validate()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsTesting(true);

        // Simulate API call to test connection
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock validation - in real implementation, this would call Meta's API
        const isValid = formData.wabaId.length > 5 && formData.accessToken.length > 10;

        if (isValid) {
            setFormData(prev => ({
                ...prev,
                isConnected: true,
                verificationStatus: 'verified',
                lastConnected: new Date()
            }));
            toast.success('Connection successful! WhatsApp Business API is connected.');
        } else {
            setFormData(prev => ({
                ...prev,
                isConnected: false,
                verificationStatus: 'unverified'
            }));
            toast.error('Connection failed. Please check your credentials.');
        }

        setIsTesting(false);
    };

    // const handleSaveConfiguration = () => {
    //     if (!validate()) {
    //         toast.error('Please fill in all required fields');
    //         return;
    //     }

    //     const stored = localStorage.getItem('organizations');
    //     if (stored) {
    //         const organizations: Organization[] = JSON.parse(stored);
    //         const updatedOrgs = organizations.map(org =>
    //             org.id === organizationId
    //                 ? { ...org, whatsappConfig: formData }
    //                 : org
    //         );
    //         localStorage.setItem('organizations', JSON.stringify(updatedOrgs));
    //         toast.success('WhatsApp configuration saved successfully');

    //         setTimeout(() => {
    //             router.push('/dashboard');
    //         }, 1500);
    //     }
    // };

    const handleDisconnect = () => {
        setFormData(prev => ({
            ...prev,
            isConnected: false,
            verificationStatus: 'unverified',
            lastConnected: undefined
        }));
        toast.success('WhatsApp disconnected');
    };

    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1000px] mx-auto no-scrollbar pb-32">
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
        return 'text-slate-500 bg-slate-500/10';
    };

    const getStatusIcon = () => {
        if (formData.isConnected) return <CheckCircle2 size={16} />;
        return <XCircle size={16} />;
    };

    const handleBack = () => {
        router.push('/organizations');
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
                        <span>{formData.isConnected ? 'Connected' : 'Not Connected'}</span>
                    </div>
                </div>
            </div>

            {formData.isConnected && formData.lastConnected && (
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
                                Last connected: {new Date(formData.lastConnected).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            isDarkMode={isDarkMode}
                            label="WhatsApp Business Account ID"
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
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className={cn(
                                    "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                    isDarkMode
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20",
                                    isTesting && "opacity-50 cursor-not-allowed"
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
                            </button>

                            {formData.isConnected && (
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
                            )}
                        </div>

                        <button
                            // onClick={handleSaveConfiguration}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                            )}
                        >
                            <CheckCircle2 size={16} />
                            <span>Save Configuration</span>
                        </button>
                    </div>
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
        </div>
    );
};
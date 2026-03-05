"use client";

import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MetaSetupGuideProps {
    isDarkMode: boolean;
    user: any;
}

export const MetaSetupGuide = ({ isDarkMode, user }: MetaSetupGuideProps) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    return (
        <div className="space-y-4 sticky top-8">
            <div className={cn(
                "p-6 rounded-xl border backdrop-blur-xl",
                isDarkMode
                    ? "bg-white/[0.02] border-white/10"
                    : "bg-white border-slate-200"
            )}>
                <div className="flex items-start space-x-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isDarkMode ? "bg-white/10" : "bg-slate-100"
                    )}>
                        <Building2 className={cn("text-slate-500", isDarkMode && "text-white")} size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className={cn("font-semibold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                            Meta Business Setup Guide
                        </h3>
                        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                            Detailed instructions to configure WhatsApp Business API
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
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
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
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
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
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
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
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
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
                                <p className="text-emerald-500 font-semibold">📧 Check your Email ( {user?.email} ) for the Callback URL & Verify Token</p>
                                <p>• In Meta Developer Console, go to WhatsApp → Configuration</p>
                                <p>• Click "Edit" next to Webhook</p>
                                <p>• <strong>Callback URL:</strong> Copy the URL from your email</p>
                                <p>• <strong>Verify Token:</strong> Copy the token from your email</p>
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
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
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
    );
};

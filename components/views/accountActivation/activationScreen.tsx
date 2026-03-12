"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Zap, Building2, Mail, UserRoundCheck } from "lucide-react";
import { useAcceptInvitationQuery, useRejectInvitationQuery } from "@/hooks/useTenantActivationQuery";
import { useAuth } from "@/redux/selectors/auth/authSelector";

interface ActivationScreenProps {
    onActivate: () => void;
    onReject: () => void;
    invitationData: {
        company_name: string;
        email: string;
    };
}

export default function ActivationScreen({
    onActivate,
    onReject,
    invitationData,
}: ActivationScreenProps) {
    const { isDarkMode } = useTheme();
    const {activationToken} = useAuth();
    const {mutate: useAcceptInvitationMutate} = useAcceptInvitationQuery();
    const {mutate: useRejectInvitationMutate} = useRejectInvitationQuery();
    const [isActivating, setIsActivating] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleActivate = () => {
        setIsActivating(true);
        useAcceptInvitationMutate({token: activationToken ?? ""}, {
            onSuccess: ()=>{
                onActivate();
            }
        }
        )
    };

    const handleReject = () => {
        setIsRejecting(true);
        useRejectInvitationMutate({token: activationToken ?? ""},{
            onSuccess: ()=>{
                onReject();
            }
        })
    };

    return (
        <>
            <h1
                className={cn(
                    "text-xl font-bold text-center mb-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}
            >
                Account Activation
            </h1>
            <p
                className={cn(
                    "text-center text-xs mb-6",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
            >
                Review your invitation details below
            </p>

            {/* Invitation Details */}
            <div className="space-y-6 mb-7">
                {/* Organization */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                isDarkMode
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : "bg-emerald-50 border-emerald-200"
                            )}
                        >
                            <Building2
                                className={cn(
                                    "w-4.5 h-4.5",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-[10px] font-medium uppercase tracking-wider mb-1",
                                isDarkMode ? "text-slate-500" : "text-slate-500"
                            )}
                        >
                            Organization
                        </p>
                        <p
                            className={cn(
                                "text-sm font-semibold truncate",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            {invitationData?.company_name}
                        </p>
                        <div className={cn("flex-1 min-w-0 border-b-[0.1px] mt-4", isDarkMode ? "border-slate-800" : "border-slate-200")}></div>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                isDarkMode
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : "bg-emerald-50 border-emerald-200"
                            )}
                        >
                            <Mail
                                className={cn(
                                    "w-4.5 h-4.5",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-[10px] font-medium uppercase tracking-wider mb-1",
                                isDarkMode ? "text-slate-500" : "text-slate-500"
                            )}
                        >
                            Email Address
                        </p>
                        <p
                            className={cn(
                                "text-sm font-semibold truncate",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            {invitationData?.email}
                        </p>
                        <div className={cn(`flex-1 min-w-0 border-b-[0.1px] mt-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`)}></div>
                    </div>
                </div>

                {/* Invited By */}
                {/* <div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <div
                                className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                    isDarkMode
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-emerald-50 border-emerald-200"
                                )}
                            >
                                <UserRoundCheck
                                    className={cn(
                                        "w-4.5 h-4.5",
                                        isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p
                                className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider mb-1",
                                    isDarkMode ? "text-slate-500" : "text-slate-500"
                                )}
                            >
                                Invited By
                            </p>
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}
                            >
                                {invitationData.invitedBy}
                            </p>
                            <p
                                className={cn(
                                    "text-[10px] mt-0.5",
                                    isDarkMode ? "text-slate-500" : "text-slate-500"
                                )}
                            >
                                Invited on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div className={cn(`flex-1 min-w-0 border-b-[0.1px] mt-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`)}></div>
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Activate Button */}
            <button
                onClick={handleActivate}
                disabled={isActivating || isRejecting}
                className={cn(
                    "group relative w-full py-3 pt-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    "shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer",
                    "bg-emerald-500 hover:bg-emerald-400",
                    "text-white",
                    (isActivating || isRejecting) && "opacity-70 cursor-not-allowed"
                )}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {/* Glow effect */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "bg-emerald-400/30 blur-xl"
                )} />

                <div className="relative z-10 flex items-center justify-center gap-2">
                    {isActivating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="drop-shadow-sm">Activating...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 fill-current drop-shadow-sm" />
                            <span className="drop-shadow-sm">Activate Account</span>
                        </>
                    )}
                </div>
            </button>

            {/* Decline Link */}
            <div className="mt-3 text-center">
                <button
                    onClick={handleReject}
                    disabled={isActivating || isRejecting}
                    className={cn(
                        "text-[11px] font-medium transition-colors duration-200 hover:underline",
                        isDarkMode ? "text-slate-500 cursor-pointer hover:text-red-400" : "text-slate-500 hover:text-red-700",
                        (isActivating || isRejecting) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isRejecting ? "Declining..." : "Decline Invitation"}
                </button>
            </div>
        </>
    );
}

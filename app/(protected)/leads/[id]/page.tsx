"use client";

import { useParams, useRouter } from "next/navigation";
import { LeadDetailsView } from "@/components/views/lead-details-view";
import { useLeadIntelligenceQuery, useGetLeadByIdQuery } from "@/hooks/useLeadIntelligenceQuery";
import { useTheme } from "@/hooks/useTheme";
import { Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const leadId = params?.id as string;
    const { data: leadDetailData, isLoading } = useGetLeadByIdQuery(leadId);

    const lead = leadDetailData?.data;

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className={cn("mt-2 text-sm font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>Loading lead details...</p>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Lead Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2",
                        isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    )}
                >
                    <ArrowLeft size={16} />
                    <span>Go Back</span>
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 pt-6 pb-2">
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "flex items-center space-x-2 text-xs font-medium tracking-wide transition-colors",
                        isDarkMode ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-800"
                    )}
                >
                    <ArrowLeft size={12} />
                    <span>Back to Leads</span>
                </button>
            </div>
            <LeadDetailsView
                lead={lead}
                isDarkMode={isDarkMode}
                onBack={() => router.back()}
            />
        </div>
    );
}

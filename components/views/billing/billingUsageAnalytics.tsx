"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BillingLedger } from "./billingLedger";
import { BillingAnalytics } from "./billingAnalytics";
import { BillingInsights } from "./billingInsights";
import { AiApiTokensUsage } from "./aiApiTokenUsage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Receipt, BarChart3, Cpu, TrendingUp } from "lucide-react";

interface BillingUsageAnalyticsProps {
    isDarkMode: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
}

// Helper to convert optional to nullable for child components
const toNullable = (d?: Date | null): Date | null => d ?? null;

export const BillingUsageAnalytics = ({ isDarkMode, startDate, endDate }: BillingUsageAnalyticsProps) => {
    const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("ledger");

    return (
        <div className="space-y-8">
            <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                <div className="w-4 h-px bg-emerald-500/50" />
                Usage Analytics
            </h2>

            <Tabs
                defaultValue="ledger"
                value={activeAnalyticsTab}
                onValueChange={setActiveAnalyticsTab}
                className="space-y-6"
            >
                <TabsList isDarkMode={isDarkMode}>
                    <TabsTrigger value="ledger">
                        <div className="flex items-center gap-2"><Receipt size={12} />Transaction Ledger</div>
                    </TabsTrigger>
                    <TabsTrigger value="spend">
                        <div className="flex items-center gap-2"><BarChart3 size={12} />Spend Charts</div>
                    </TabsTrigger>
                    <TabsTrigger value="ai">
                        <div className="flex items-center gap-2"><Cpu size={12} />AI Token Usage</div>
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                        <div className="flex items-center gap-2"><TrendingUp size={12} />Insights</div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ledger" className="outline-none">
                    <BillingLedger isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                </TabsContent>

                <TabsContent value="spend" className="outline-none">
                    <BillingAnalytics isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                </TabsContent>

                <TabsContent value="ai" className="outline-none">
                    <AiApiTokensUsage isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                </TabsContent>

                <TabsContent value="insights" className="outline-none">
                    <BillingInsights isDarkMode={isDarkMode} startDate={toNullable(startDate)} endDate={toNullable(endDate)} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

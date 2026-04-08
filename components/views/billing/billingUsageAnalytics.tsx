"use client";

import { cn } from "@/lib/utils";
import { BillingLedger } from "./billingLedger";
import { BillingAnalytics } from "./billingAnalytics";
import { BillingInsights } from "./billingInsights";
import { AiApiTokensUsage } from "./aiApiTokenUsage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Receipt, BarChart3, Cpu, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BillingUsageAnalyticsProps {
    isDarkMode: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
}

// Helper to convert optional to nullable for child components
const toNullable = (d?: Date | null): Date | null => d ?? null;

export const BillingUsageAnalytics = ({ isDarkMode, startDate, endDate }: BillingUsageAnalyticsProps) => {
    return (
        <div className="space-y-8">
            <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                <div className="w-4 h-px bg-emerald-500/50" />
                Usage Analytics
            </h2>

            <Tabs defaultValue="ledger" className="space-y-6">
                <TabsList isDarkMode={isDarkMode}>
                    <TabsTrigger value="ledger">
                        <div className="flex items-center gap-2"><Receipt size={12} />Transaction Ledger</div>
                    </TabsTrigger>
                    {/* <TabsTrigger value="spend">
                        <div className="flex items-center gap-2"><BarChart3 size={12} />Spend Charts</div>
                    </TabsTrigger> */}
                    <TabsTrigger value="ai">
                        <div className="flex items-center gap-2"><Cpu size={12} />AI Token Usage</div>
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                        <div className="flex items-center gap-2"><TrendingUp size={12} />Insights</div>
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent key="ledger" value="ledger" className="outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BillingLedger isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="spend" value="spend" className="outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BillingAnalytics isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="ai" value="ai" className="outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AiApiTokensUsage isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="insights" value="insights" className="outline-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BillingInsights isDarkMode={isDarkMode} startDate={toNullable(startDate)} endDate={toNullable(endDate)} />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

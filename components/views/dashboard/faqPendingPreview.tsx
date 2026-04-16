"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CircleHelp } from "lucide-react";
import { tx } from "./glassStyles";
import { cn } from "@/lib/utils";
import { FAQ_REVIEW_ROUTE, useFaqNotifications } from "@/hooks/useFaqNotifications";

interface FaqPendingPreviewProps {
    isDarkMode?: boolean;
}

const getQuestionText = (question?: string, fallback?: string) => {
    const resolved = String(question || fallback || "").trim();
    return resolved || "Untitled FAQ question";
};

export const FaqPendingPreview = ({ isDarkMode = true }: FaqPendingPreviewProps) => {
    const router = useRouter();
    const t = tx(isDarkMode);
    const { canAccessFaqNotifications, pendingCount, latestPendingFaqs, isLoading } = useFaqNotifications(3);

    if (!canAccessFaqNotifications) {
        return null;
    }

    const openFaqReview = () => {
        router.push(FAQ_REVIEW_ROUTE);
    };

    return (
        <div
            className="rounded-xl border"
            style={{
                background: isDarkMode ? "#09090b" : "#ffffff",
                borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
            }}
        >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <CircleHelp size={16} style={{ color: "#3b82f6" }} />
                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: t.primary }}>
                        Latest FAQ
                    </h3>
                    <span
                        className="px-2 py-0.5 rounded-md"
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "rgba(59,130,246,0.12)",
                            color: "#3b82f6",
                            border: "1px solid rgba(59,130,246,0.2)",
                        }}
                    >
                        {pendingCount}
                    </span>
                </div>

                <button
                    onClick={openFaqReview}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: t.secondary,
                        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                    }}
                >
                    View All <ArrowRight size={13} />
                </button>
            </div>

            <div className="px-5 pb-5 space-y-2.5">
                <p style={{ fontSize: "11px", color: t.secondary }}>
                    Latest 3 pending FAQ questions.
                </p>

                {isLoading ? (
                    <div className="space-y-2.5">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-10 rounded-lg animate-pulse"
                                style={{ background: isDarkMode ? "#18181b" : "#f4f4f5" }}
                            />
                        ))}
                    </div>
                ) : latestPendingFaqs.length === 0 ? (
                    <div
                        className="rounded-lg border p-3"
                        style={{
                            background: isDarkMode ? "#18181b" : "#fafafa",
                            borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                        }}
                    >
                        <p style={{ fontSize: "12px", color: t.secondary }}>
                            No pending FAQ questions right now.
                        </p>
                    </div>
                ) : (
                    latestPendingFaqs.map((item, index) => (
                        <button
                            key={String(item?.id ?? index)}
                            onClick={openFaqReview}
                            className={cn(
                                "w-full text-left rounded-lg border p-3 transition-colors",
                                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                            )}
                            style={{
                                background: isDarkMode ? "#18181b" : "#fafafa",
                                borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                            }}
                        >
                            <div className="flex items-start gap-2">
                                <span
                                    className="mt-0.5 inline-flex w-5 h-5 rounded-full items-center justify-center shrink-0"
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        color: "#3b82f6",
                                        background: "rgba(59,130,246,0.12)",
                                    }}
                                >
                                    {index + 1}
                                </span>
                                <p style={{ fontSize: "12px", color: t.primary, lineHeight: 1.45 }}>
                                    {getQuestionText(item?.question, item?.normalized_question)}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

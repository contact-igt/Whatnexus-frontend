"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  CheckCircle2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import {
  useFaqReviewsQuery,
  useFaqCountsQuery,
  useSaveFaqReviewMutation,
  usePublishFaqReviewMutation,
  useDeleteFaqReviewMutation,
  useToggleFaqActiveMutation,
  useCreateFaqMutation,
  useEditFaqKnowledgeEntryMutation,
} from "@/hooks/useFaqQuery";
import type { FaqReviewItem } from "@/services/faq";
import { CreateFaqModal } from "./CreateFaqModal";

interface FaqReviewProps {
  isDarkMode: boolean;
}

type FilterType = "pending_review" | "published";

const CATEGORY_CONFIG = {
  valid_faq: {
    label: "Valid FAQ",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  out_of_scope: {
    label: "Out of Scope",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  noise: {
    label: "Noise",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  hospital_relevant_answerable: {
    label: "Answerable",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  hospital_relevant_unanswerable: {
    label: "Unanswerable",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  medical_but_outside_scope: {
    label: "Out of Scope",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  irrelevant_noise: {
    label: "Noise",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
} as const;

const FAQ_ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getFaqDisplayName = (item: FaqReviewItem) => {
  if (item.creator_name?.trim()) {
    return item.creator_name.trim();
  }
  if (typeof item.reviewed_by === "string" && item.reviewed_by.trim()) {
    return item.reviewed_by.trim();
  }
  return "";
};

export const FaqReview = ({ isDarkMode }: FaqReviewProps) => {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("pending_review");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [addToKb, setAddToKb] = useState<Record<string, boolean>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: faqData, isLoading } = useFaqReviewsQuery(filter);
  const { data: countsData } = useFaqCountsQuery();
  const { mutate: saveReview, isPending: isSaving } =
    useSaveFaqReviewMutation();
  const { mutate: publishReview, isPending: isPublishing } =
    usePublishFaqReviewMutation();
  const { mutate: createFaq, isPending: isCreating } = useCreateFaqMutation();
  const { mutate: editFaqKnowledgeEntry, isPending: isEditingPublished } =
    useEditFaqKnowledgeEntryMutation();
  const { mutate: deleteReview } = useDeleteFaqReviewMutation();
  const { mutate: toggleActive } = useToggleFaqActiveMutation();



  const pendingCount: number = countsData?.data?.pending_review ?? 0;
  const publishedCount: number = countsData?.data?.published ?? 0;

  const rawReviews = faqData?.data?.reviews;
  const allReviews = Array.isArray(rawReviews) ? rawReviews : [];
  const totalPages = Math.ceil((allReviews?.length ?? 0) / FAQ_ITEMS_PER_PAGE);
  const currentReviews = useMemo(() => {
    const items = allReviews ?? [];
    const start = (page - 1) * FAQ_ITEMS_PER_PAGE;
    return items.slice(start, start + FAQ_ITEMS_PER_PAGE);
  }, [allReviews, page]);

  const getAnswer = (item: FaqReviewItem) =>
    answers[String(item.id)] ?? item.doctor_answer ?? "";
  const getAddToKb = (item: FaqReviewItem) =>
    addToKb[String(item.id)] ?? item.add_to_kb ?? false;

  const handleSave = (item: FaqReviewItem) => {
    const answer = getAnswer(item);
    const shouldAddToKb = getAddToKb(item);
    if (shouldAddToKb && !answer.trim()) {
      setAnswerErrors((prev) => ({
        ...prev,
        [item.id]: 'An answer is required when "Add to KB" is enabled.',
      }));
      return;
    }
    setAnswerErrors((prev) => ({ ...prev, [item.id]: "" }));
    saveReview({
      id: String(item.id),
      data: { doctor_answer: answer, add_to_kb: shouldAddToKb },
    });
  };

  const handleGoToChat = (item: any) => {
    // Navigate to chat with message highlight
    const whatsappNumber = item.whatsapp_number || item.phone;
    const wamid = item.wamid;

    console.log('[Go to Chat] Item:', { whatsappNumber, wamid, item });

    if (!whatsappNumber) {
      console.error('[Go to Chat] No phone number found for this FAQ');
      return;
    }

    // Treat empty string same as null
    if (!wamid || wamid === '') {
      console.warn('[Go to Chat] No wamid, opening chat without highlight', { phone: whatsappNumber });
      router.push(`/chats?phone=${encodeURIComponent(whatsappNumber)}`);
      return;
    }

    // Navigate with highlight parameter
    console.log('[Go to Chat] Navigating with highlight:', { phone: whatsappNumber, wamid });
    router.push(
      `/chats?phone=${encodeURIComponent(whatsappNumber)}&highlight=${encodeURIComponent(wamid)}`
    );
  };

  const handlePublish = (item: FaqReviewItem) => {
    const answer = getAnswer(item);
    const shouldAddToKb = getAddToKb(item);
    if (!answer.trim()) {
      setAnswerErrors((prev) => ({
        ...prev,
        [item.id]: "An answer is required before publishing.",
      }));
      return;
    }
    if (shouldAddToKb && !answer.trim()) {
      setAnswerErrors((prev) => ({
        ...prev,
        [item.id]: 'An answer is required when "Add to KB" is enabled.',
      }));
      return;
    }
    setAnswerErrors((prev) => ({ ...prev, [item.id]: "" }));
    publishReview({ id: String(item.id), data: { doctor_answer: answer, add_to_kb: shouldAddToKb } });
  };

  const handleCreateFaq = (data: { question: string; answer: string }) => {
    createFaq(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        if (filter === "published") {
          // Stay on published tab to see the newly created FAQ
        } else {
          // Switch to published tab to see the newly created FAQ
          setFilter("published");
          setPage(1);
        }
      },
    });
  };

  const handleUpdatePublishedAnswer = (item: FaqReviewItem) => {
    const answer = getAnswer(item);
    if (!answer.trim()) {
      setAnswerErrors((prev) => ({
        ...prev,
        [item.id]: "An answer is required before updating.",
      }));
      return;
    }

    if (!item.knowledge_entry_id) {
      setAnswerErrors((prev) => ({
        ...prev,
        [item.id]: "This published FAQ is not synced to knowledge yet.",
      }));
      return;
    }

    setAnswerErrors((prev) => ({ ...prev, [item.id]: "" }));
    editFaqKnowledgeEntry({
      id: String(item.knowledge_entry_id),
      data: { answer },
    });
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
    setExpandedId(null);
  };

  const filterTabs = [
    {
      value: "pending_review" as FilterType,
      label: `Pending Review${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
    },
    {
      value: "published" as FilterType,
      label: `Published${publishedCount > 0 ? ` (${publishedCount})` : ""}`,
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard isDarkMode={isDarkMode} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={cn(
                "text-lg font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}
            >
              FAQ Review
            </h3>
            <p
              className={cn(
                "text-xs mt-1",
                isDarkMode ? "text-white/50" : "text-slate-500"
              )}
            >
              Review and answer questions flagged by the AI for doctor
              moderation.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
            )}
          >
            <Plus size={16} />
            Add FAQ
          </button>
        </div>

        {/* Sub-filter tabs */}
        <div
          className={cn(
            "flex p-1 rounded-xl mb-6 w-fit",
            isDarkMode ? "bg-white/5" : "bg-slate-100"
          )}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                filter === tab.value
                  ? isDarkMode
                    ? "bg-white/10 text-white shadow"
                    : "bg-white text-slate-900 shadow-md"
                  : isDarkMode
                    ? "text-white/50 hover:text-white/80"
                    : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-xl border animate-pulse",
                  isDarkMode
                    ? "bg-white/5 border-white/10"
                    : "bg-slate-50 border-slate-200"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-3/4 rounded mb-2",
                    isDarkMode ? "bg-white/10" : "bg-slate-200"
                  )}
                />
                <div
                  className={cn(
                    "h-3 w-1/3 rounded",
                    isDarkMode ? "bg-white/10" : "bg-slate-200"
                  )}
                />
              </div>
            ))
          ) : currentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <MessageCircle
                className={cn(
                  "mb-3",
                  isDarkMode ? "text-white/20" : "text-slate-300"
                )}
                size={40}
              />
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-white/40" : "text-slate-400"
                )}
              >
                {filter === "pending_review"
                  ? "No questions pending review"
                  : "No published answers yet"}
              </p>
              <p
                className={cn(
                  "text-xs mt-1",
                  isDarkMode ? "text-white/30" : "text-slate-400"
                )}
              >
                {filter === "pending_review"
                  ? "Questions flagged by the AI will appear here."
                  : "Review and publish answers to see them here."}
              </p>
            </div>
          ) : (
            currentReviews.flatMap((item: FaqReviewItem, idx: number) => {
              const isExpanded = expandedId === String(item.id);
              const categoryConfig =
                CATEGORY_CONFIG[
                item.agent_category as keyof typeof CATEGORY_CONFIG
                ];
              const displayName = getFaqDisplayName(item);
              const currentAnswer = getAnswer(item);
              const currentAddToKb = getAddToKb(item);
              const answerError = answerErrors[item.id];
              const creatorName =
                (item.creator_name && String(item.creator_name).trim()) ||
                (item.reviewed_by && !String(item.reviewed_by).includes("@")
                  ? String(item.reviewed_by).trim()
                  : "") ||
                (item.status === "pending_review" ? "System" : "Admin");

              // Priority tier header — detect tier change between consecutive items (2 tiers only)
              const itemTier = filter === "pending_review"
                ? ((item.ask_count ?? 1) > 1 ? 0 : 1)
                : -1;
              const prevItem = idx > 0 ? currentReviews[idx - 1] : null;
              const prevTier = filter === "pending_review" && prevItem
                ? ((prevItem.ask_count ?? 1) > 1 ? 0 : 1)
                : -1;
              const showTierHeader = itemTier !== -1 && itemTier !== prevTier;

              const tierHeader = showTierHeader ? (
                <div
                  key={`tier-${item.id}`}
                  className={cn("flex items-center gap-2 px-1 mb-2", idx > 0 && "mt-6")}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    itemTier === 0 ? "bg-red-500" : "bg-emerald-500"
                  )} />
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-widest",
                    itemTier === 0 ? (isDarkMode ? "text-red-400" : "text-red-600")
                      : (isDarkMode ? "text-emerald-400" : "text-emerald-600")
                  )}>
                    {itemTier === 0 ? "High Priority" : "Valid FAQ"}
                  </span>
                  <div className={cn("flex-1 h-px",
                    itemTier === 0 ? (isDarkMode ? "bg-red-500/20" : "bg-red-200")
                      : (isDarkMode ? "bg-emerald-500/20" : "bg-emerald-200")
                  )} />
                </div>
              ) : null;

              const isHighPriority = (item.ask_count ?? 1) > 1;

              const card = (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border transition-all relative",
                    isHighPriority && "border-l-4 border-l-red-500",
                    isDarkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  {/* Count circle — top-right for High Priority */}
                  {isHighPriority && (
                    <span className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-10">
                      {item.ask_count}
                    </span>
                  )}
                  {/* Card header — always visible */}
                  <div
                    className="p-4 flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === String(item.id) ? null : String(item.id)
                      )
                    }
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p
                        className={cn(
                          "text-sm font-medium leading-snug",
                          isDarkMode ? "text-white" : "text-slate-900"
                        )}
                      >
                        {item.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {categoryConfig && (
                          <span
                            className={cn(
                              "text-xs font-semibold px-2.5 py-0.5 rounded-md border",
                              categoryConfig.color,
                              categoryConfig.bg,
                              categoryConfig.border
                            )}
                          >
                            {categoryConfig.label}
                          </span>
                        )}
                        {item.wamid && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGoToChat(item);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium transition-colors",
                              isDarkMode
                                ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                : "border-emerald-400/50 text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            <ExternalLink size={11} />
                            Go to Chat
                          </button>
                        )}
                        {(item.ask_count ?? 1) > 1 && (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold border",
                            isDarkMode
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-red-50 border-red-200 text-red-600"
                          )}>
                            Asked {item.ask_count} times
                          </span>
                        )}
                        {isHighPriority && (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-bold border",
                            isDarkMode
                              ? "bg-red-500/10 border-red-500/30 text-red-400"
                              : "bg-red-50 border-red-200 text-red-600"
                          )}>
                            High Priority
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-xs",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                          )}
                        >
                          {formatDate(item.created_at)}
                        </span>
                        {filter === "published" && (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <CheckCircle2 size={11} />
                            <span>Published</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {filter === "published" && (
                        <label
                          className="relative inline-flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.is_active ?? false}
                            onChange={() =>
                              toggleActive({
                                id: String(item.id),
                                isActive: !item.is_active,
                              })
                            }
                          />
                          <div
                            className={cn(
                              "relative w-9 h-5 rounded-full peer transition-all peer-checked:bg-emerald-600",
                              isDarkMode ? "bg-white/10" : "bg-slate-300"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-all",
                                item.is_active
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              )}
                            />
                          </div>
                        </label>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReview(String(item.id));
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isDarkMode
                            ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                            : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                        )}
                      >
                        <Trash2 size={14} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp
                          size={16}
                          className={cn(
                            isDarkMode ? "text-white/40" : "text-slate-400"
                          )}
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className={cn(
                            isDarkMode ? "text-white/40" : "text-slate-400"
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div
                      className={cn(
                        "px-4 pb-4 border-t",
                        isDarkMode ? "border-white/5" : "border-slate-200"
                      )}
                    >
                      {item.agent_reason && (
                        <p
                          className={cn(
                            "text-xs mt-3 mb-2 italic",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                          )}
                        >
                          AI reason: {item.agent_reason}
                        </p>
                      )}

                      {(() => {
                        try {
                          const raw = JSON.parse(item.similar_questions ?? "[]");
                          if (!Array.isArray(raw) || raw.length === 0) return null;
                          // Handle both legacy string[] and new {question, similarity, merged_at, wamid, phone}[] formats
                          const variants = raw.map((v: unknown) => {
                            if (typeof v === "string") return { question: v, similarity: null, wamid: null, phone: null };
                            if (v && typeof v === "object" && "question" in v) {
                              const obj = v as { question: string; similarity?: number; wamid?: string; phone?: string };
                              return { question: obj.question, similarity: obj.similarity ?? null, wamid: obj.wamid ?? null, phone: obj.phone ?? null };
                            }
                            return null;
                          }).filter(Boolean) as { question: string; similarity: number | null; wamid: string | null; phone: string | null }[];

                          return variants.length > 0 ? (
                            <div className={cn(
                              "mt-1 mb-2 px-2.5 py-2 rounded-lg border",
                              isDarkMode ? "bg-red-500/5 border-red-500/15" : "bg-red-50 border-red-100"
                            )}>
                              <p className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider mb-1.5",
                                isDarkMode ? "text-red-400/70" : "text-red-600/70"
                              )}>Also asked as:</p>
                              <ul className="space-y-1">
                                {variants.map((v, i) => (
                                  <li key={i} className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className="text-xs italic px-1 py-0.5 rounded"
                                      style={{ background: 'rgba(255, 235, 59, 0.15)', color: isDarkMode ? '#fff9c4' : '#5d4037' }}
                                    >&quot;{v.question}&quot;</span>
                                    {v.similarity != null && (
                                      <span className={cn(
                                        "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                        isDarkMode ? "bg-white/5 text-white/30" : "bg-slate-100 text-slate-400"
                                      )}>
                                        {Math.round(v.similarity * 100)}% match
                                      </span>
                                    )}
                                    {(v.phone || item.whatsapp_number) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log('[Variant Button] v.wamid:', v.wamid, 'v.phone:', v.phone, 'variant:', v);
                                          // Build variant item object to pass to handleGoToChat
                                          const variantItem = {
                                            whatsapp_number: v.phone || item.whatsapp_number,
                                            phone: v.phone || item.whatsapp_number,
                                            wamid: v.wamid
                                          };
                                          console.log('[Variant Button] variantItem:', variantItem);
                                          handleGoToChat(variantItem);
                                        }}
                                        className={cn(
                                          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium border transition-colors",
                                          isDarkMode
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                        )}
                                      >
                                        <ExternalLink size={10} />
                                        Go to Chat
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null;
                        } catch { return null; }
                      })()}

                      <div className="mt-3">
                        <label
                          className={cn(
                            "block text-xs font-semibold mb-1.5",
                            isDarkMode ? "text-white/60" : "text-slate-600"
                          )}
                        >
                          Doctor&apos;s Answer
                        </label>
                        <textarea
                          value={currentAnswer}
                          onChange={(e) => {
                            setAnswers((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }));
                            if (answerError) {
                              setAnswerErrors((prev) => ({
                                ...prev,
                                [item.id]: "",
                              }));
                            }
                          }}
                          rows={3}
                          placeholder="Type your answer here..."
                          className={cn(
                            "w-full text-sm rounded-xl px-3 py-2.5 resize-none outline-none border transition-colors",
                            isDarkMode
                              ? "bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/40"
                              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-emerald-400",
                            ""
                          )}
                        />
                        {answerError && (
                          <p className="text-xs text-red-400 mt-1">
                            {answerError}
                          </p>
                        )}
                      </div>

                      {filter === "pending_review" && (
                        <>
                          <div className="flex items-center gap-2 mt-3">
                            <label
                              className="relative inline-flex items-center cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={currentAddToKb}
                                onChange={() =>
                                  setAddToKb((prev) => ({
                                    ...prev,
                                    [item.id]: !currentAddToKb,
                                  }))
                                }
                              />
                              <div
                                className={cn(
                                  "relative w-9 h-5 rounded-full peer transition-all peer-checked:bg-emerald-600",
                                  isDarkMode ? "bg-white/10" : "bg-slate-300"
                                )}
                              >
                                <div
                                  className={cn(
                                    "absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 transition-all",
                                    currentAddToKb
                                      ? "translate-x-4"
                                      : "translate-x-0"
                                  )}
                                />
                              </div>
                            </label>
                            <span
                              className={cn(
                                "text-xs",
                                isDarkMode ? "text-white/60" : "text-slate-600"
                              )}
                            >
                              Add to Knowledge Base
                            </span>
                            <BookOpen
                              size={12}
                              className={cn(
                                isDarkMode ? "text-white/30" : "text-slate-400"
                              )}
                            />
                          </div>

                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => handleSave(item)}
                              disabled={isSaving}
                              className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                isDarkMode
                                  ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              {isSaving && (
                                <Loader2 size={14} className="animate-spin" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={() => handlePublish(item)}
                              disabled={isPublishing}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-60"
                            >
                              {isPublishing ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Publish
                            </button>
                          </div>
                        </>
                      )}

                      {filter === "published" && (
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => handleUpdatePublishedAnswer(item)}
                            disabled={isEditingPublished}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-60"
                          >
                            {isEditingPublished ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Update Published Answer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              return tierHeader ? [tierHeader, card] : [card];
            })
          )}
        </div>

        {(allReviews?.length ?? 0) > FAQ_ITEMS_PER_PAGE && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={Math.max(1, totalPages)}
              onPageChange={setPage}
              totalItems={allReviews?.length ?? 0}
              itemsPerPage={FAQ_ITEMS_PER_PAGE}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </GlassCard>

      <CreateFaqModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFaq}
        isDarkMode={isDarkMode}
        isLoading={isCreating}
      />
    </div>
  );
};

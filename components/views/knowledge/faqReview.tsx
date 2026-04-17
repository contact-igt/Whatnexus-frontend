"use client";

import { useState, useMemo } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
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

export const FaqReview = ({ isDarkMode }: FaqReviewProps) => {
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

  const MOCK_REVIEWS = [
    {
      id: "mock-1",
      question: "What are your OPD timings on weekdays?",
      normalized_question: "What are the outpatient department timings on weekdays?",
      agent_category: "hospital_relevant_answerable",
      agent_reason: "Patient is asking about hospital operating hours — directly answerable from hospital info.",
      doctor_answer: "",
      whatsapp_number: "+91 98765 43210",
      session_id: "sess_abc123",
      status: "pending_review",
      add_to_kb: false,
      is_active: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-2",
      question: "Can I get a second opinion on my MRI report from one of your neurologists?",
      normalized_question: "Is a second opinion from a neurologist available for MRI reports?",
      agent_category: "hospital_relevant_unanswerable",
      agent_reason: "Patient is requesting a specialist consultation — cannot be answered without doctor involvement.",
      doctor_answer: "",
      whatsapp_number: "+91 87654 32109",
      session_id: "sess_def456",
      status: "pending_review",
      add_to_kb: true,
      is_active: false,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-3",
      question: "What is the recommended dosage of metformin for Type 2 diabetes?",
      normalized_question: "Metformin dosage for Type 2 diabetes management",
      agent_category: "medical_but_outside_scope",
      agent_reason: "General medical question outside this hospital's scope — no hospital-specific answer available.",
      doctor_answer: "",
      whatsapp_number: "+91 76543 21098",
      session_id: "sess_ghi789",
      status: "pending_review",
      add_to_kb: false,
      is_active: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-4",
      question: "Do you offer cashless insurance for Apollo Munich?",
      normalized_question: "Is cashless insurance available for Apollo Munich policyholders?",
      agent_category: "hospital_relevant_answerable",
      agent_reason: "Insurance tie-ups are hospital-specific — can be answered from hospital knowledge base.",
      doctor_answer: "Yes, we are empanelled with Apollo Munich for cashless treatment. Please carry your insurance card and a valid photo ID at the time of admission.",
      whatsapp_number: "+91 65432 10987",
      session_id: "sess_jkl012",
      status: "published",
      add_to_kb: true,
      is_active: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mock-5",
      question: "How do I book an appointment with Dr. Sharma?",
      normalized_question: "Procedure for booking an appointment with a specific doctor",
      agent_category: "hospital_relevant_answerable",
      agent_reason: "Appointment booking is a core hospital workflow — answerable from booking info.",
      doctor_answer: "You can book an appointment with Dr. Sharma via our website, by calling our front desk at +91 11 2345 6789, or by replying 'BOOK' in this chat.",
      whatsapp_number: "+91 54321 09876",
      session_id: "sess_mno345",
      status: "published",
      add_to_kb: true,
      is_active: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

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

  const getAnswer = (item: Record<string, unknown>) =>
    (answers[item.id as string] ?? item.doctor_answer ?? "") as string;
  const getAddToKb = (item: Record<string, unknown>) =>
    (addToKb[item.id as string] ?? item.add_to_kb ?? false) as boolean;

  const handleSave = (item: any) => {
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
    saveReview({ id: item.id, data: { doctor_answer: answer } });
  };

  const handlePublish = (item: any) => {
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
    publishReview({ id: item.id, data: { doctor_answer: answer, add_to_kb: shouldAddToKb } });
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

  const handleUpdatePublishedAnswer = (item: any) => {
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
            currentReviews.map((item: any) => {
              const isExpanded = expandedId === item.id;
              const categoryConfig =
                CATEGORY_CONFIG[
                  item.agent_category as keyof typeof CATEGORY_CONFIG
                ];
              const currentAnswer = getAnswer(item);
              const currentAddToKb = getAddToKb(item);
              const answerError = answerErrors[item.id];

              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border transition-all",
                    isDarkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  {/* Card header — always visible */}
                  <div
                    className="p-4 flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === item.id ? null : item.id
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
                        {item.whatsapp_number && (
                          <span
                            className={cn(
                              "text-xs",
                              isDarkMode ? "text-white/40" : "text-slate-400"
                            )}
                          >
                            {item.whatsapp_number}
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
                                id: item.id,
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
                          deleteReview(item.id);
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

import { faqApiData, PublishFaqReviewData, SaveFaqReviewData, CreateFaqData, EditFaqKnowledgeEntryData, FaqReviewsListResponse } from "@/services/faq";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useEffect } from "react";

const FaqApis = new faqApiData();

interface FaqQueryOptions {
  enabled?: boolean;
}

export const useFaqReviewsQuery = (
  status?: "pending_review" | "published",
  options?: FaqQueryOptions,
) => {
  const { data, isLoading, isError, error } = useQuery<FaqReviewsListResponse>({
    queryKey: ["faq-reviews", status ?? "all"],
    queryFn: () => FaqApis.getFaqReviews(status),
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load FAQ reviews"
      );
    }
  }, [isError, error]);

  return { data, isLoading, isError };
};

export const useFaqCountsQuery = (options?: FaqQueryOptions) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faq-counts"],
    queryFn: () => FaqApis.getFaqCounts(),
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  });
  return { data, isLoading, isError };
};

export const useFaqMasterSourceQuery = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["faq-master"],
    queryFn: () => FaqApis.getFaqMasterSource(),
    staleTime: 2 * 60 * 1000,
  });
  return { data, isLoading, isError };
};

export const useSaveFaqReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaveFaqReviewData }) =>
      FaqApis.saveFaqReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      toast.success("Answer saved successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save answer"
      );
    },
  });
};

export const usePublishFaqReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PublishFaqReviewData }) =>
      FaqApis.publishFaqReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["faq-counts"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      queryClient.invalidateQueries({ queryKey: ["knowledges"] });
      toast.success("FAQ answer published successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to publish FAQ answer"
      );
    },
  });
};

export const useCreateFaqMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFaqData) => FaqApis.createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["faq-counts"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      queryClient.invalidateQueries({ queryKey: ["knowledges"] });
      queryClient.invalidateQueries({ queryKey: ["faq-knowledge-entries"] });
      toast.success("FAQ created and published successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create FAQ"
      );
    },
  });
};

export const useToggleFaqActiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      FaqApis.toggleFaqActive(id, isActive),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      queryClient.invalidateQueries({ queryKey: ["faq-knowledge-entries"] });
      queryClient.invalidateQueries({ queryKey: ["knowledges"] });
      const message =
        response?.data?.message ||
        response?.message ||
        "FAQ status updated successfully";
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update FAQ status"
      );
    },
  });
};

export const useDeleteFaqReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FaqApis.deleteFaqReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["faq-counts"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      toast.success("FAQ review deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete FAQ review"
      );
    },
  });
};

// ── Child FAQ Knowledge Entry hooks ──────────────────────────────────────

export const useFaqKnowledgeEntriesQuery = (page = 1, limit = 50) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["faq-knowledge-entries", page],
    queryFn: () => FaqApis.getFaqKnowledgeEntries(page, limit),
    staleTime: 2 * 60 * 1000,
  });
  return { data, isLoading, isError, refetch };
};

export const useEditFaqKnowledgeEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditFaqKnowledgeEntryData }) =>
      FaqApis.editFaqKnowledgeEntry(id, data),
    onSuccess: (_response, variables) => {
      queryClient.setQueriesData(
        { queryKey: ["faq-knowledge-entries"] },
        (oldData: any) => {
          const entries = oldData?.data?.entries;
          if (!Array.isArray(entries)) return oldData;

          const updatedEntries = entries.map((entry: any) =>
            String(entry?.id) === String(variables?.id)
              ? {
                  ...entry,
                  ...(variables?.data?.question !== undefined
                    ? { question: variables.data.question }
                    : {}),
                  ...(variables?.data?.answer !== undefined
                    ? { answer: variables.data.answer }
                    : {}),
                }
              : entry,
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              entries: updatedEntries,
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["faq-knowledge-entries"] });
      queryClient.refetchQueries({ queryKey: ["faq-knowledge-entries"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["knowledges"] });
      toast.success("FAQ entry updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update FAQ entry"
      );
    },
  });
};

export const useRemoveFaqKnowledgeEntryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => FaqApis.removeFaqKnowledgeEntry(id),
    onSuccess: (_response, removedId) => {
      queryClient.setQueriesData(
        { queryKey: ["faq-knowledge-entries"] },
        (oldData: any) => {
          const entries = oldData?.data?.entries;
          if (!Array.isArray(entries)) return oldData;

          const filteredEntries = entries.filter(
            (entry: any) => String(entry?.id) !== String(removedId),
          );

          return {
            ...oldData,
            data: {
              ...oldData.data,
              entries: filteredEntries,
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["faq-knowledge-entries"] });
      queryClient.refetchQueries({ queryKey: ["faq-knowledge-entries"] });
      queryClient.invalidateQueries({ queryKey: ["faq-master"] });
      queryClient.invalidateQueries({ queryKey: ["faq-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["knowledges"] });
      toast.success("FAQ entry removed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to remove FAQ entry"
      );
    },
  });
};

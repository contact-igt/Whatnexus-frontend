/**
 * useKnowledgeLifecycle.tsx
 *
 * React Query hooks for the knowledge_sources delete → restore → hard-delete lifecycle.
 * This pattern is identical across every Tier 1 resource.
 *
 * Query key map:
 *   ["knowledge"]           — active knowledge list
 *   ["knowledge-deleted"]   — trash list
 *
 * Every mutation invalidates both so the UI stays consistent.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { knowledgeLifecycleApi } from "@/services/lifecycle/knowledgeLifecycle";

// ── Query: trash list ─────────────────────────────────────────────────────────
export const useDeletedKnowledgeQuery = (page = 1, limit = 20) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["knowledge-deleted", page],
    queryFn: () => knowledgeLifecycleApi.getDeleted(page, limit),
    staleTime: 60 * 1000, // trash list can be stale for 1 min
  });
  return { data, isLoading, isError };
};

// ── Mutation: soft delete ─────────────────────────────────────────────────────
export const useSoftDeleteKnowledgeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => knowledgeLifecycleApi.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      qc.invalidateQueries({ queryKey: ["knowledge-deleted"] });
      toast.success("Knowledge source moved to trash — restoreable for 30 days");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete knowledge source");
    },
  });
};

// ── Mutation: restore ─────────────────────────────────────────────────────────
export const useRestoreKnowledgeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => knowledgeLifecycleApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      qc.invalidateQueries({ queryKey: ["knowledge-deleted"] });
      toast.success("Knowledge source restored and embeddings rebuilt");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 410) {
        toast.error("Restore window has expired — this source can no longer be recovered");
      } else {
        toast.error(err?.response?.data?.message || "Failed to restore knowledge source");
      }
    },
  });
};

// ── Mutation: hard delete (admin only) ───────────────────────────────────────
export const useHardDeleteKnowledgeMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => knowledgeLifecycleApi.hardDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge"] });
      qc.invalidateQueries({ queryKey: ["knowledge-deleted"] });
      toast.success("Knowledge source permanently deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to permanently delete knowledge source");
    },
  });
};

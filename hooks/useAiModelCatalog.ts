"use client";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { _axios } from "@/helper/axios";
import { socket } from "@/utils/socket";

export type CatalogState =
  | "Pending review" | "Unsupported" | "Pricing needed" | "Test required"
  | "Ready to activate" | "Active" | "Deprecated" | "Retired" | "Unavailable";

export interface CatalogRequestProfile {
  endpoint: "chat_completions" | "responses";
  usageFormat: "chat_completions" | "responses";
  modalities: Array<"text" | "image_input">;
  purposes: Array<"input" | "output" | "vision">;
  supportsStructuredOutput: boolean;
  supportsJsonMode: boolean;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsReasoning: boolean;
  reasoningEfforts: string[];
  defaultReasoningEffort?: string;
  tokenLimitParameter: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  actualModelIds: string[];
  allowVersionedActuals?: boolean;
}

export interface CatalogPricing {
  id: number;
  model: string;
  input_rate: string | number;
  output_rate: string | number;
  cached_input_price_per_million: string | number | null;
  markup_percent: string | number;
  usd_to_inr_rate: string | number;
  pricing_version: number;
  is_active: boolean;
  category: string;
  recommended_for: string;
  description: string | null;
}

export interface CatalogModel {
  id: number;
  provider: string;
  model: string;
  owned_by: string | null;
  review_status: "pending" | "approved" | "unsupported" | "retired";
  lifecycle_status: "available" | "deprecated" | "shutdown" | "unknown";
  shutdown_date: string | null;
  request_profile: CatalogRequestProfile | null;
  test_status: "not_tested" | "passed" | "failed";
  test_error: string | null;
  last_tested_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  last_seen_at: string | null;
  last_successfully_seen_at: string | null;
  pricing: CatalogPricing | null;
  active: boolean;
  activationReady: boolean;
  blockers: string[];
  state: CatalogState;
}

export interface CatalogSyncInfo {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  models_received: number;
  models_created: number;
  models_updated: number;
  error_code: string | null;
  sanitized_error: string | null;
}

export interface CatalogListData {
  models: CatalogModel[];
  latestSync: CatalogSyncInfo | null;
  latestSuccess: CatalogSyncInfo | null;
  uncataloguedActiveModels: string[];
}

const CATALOG_KEYS = ["ai-model-catalog", "ai-pricing-rules", "available-ai-models"];

/** Refetch catalog + pricing + tenant availability whenever the server broadcasts a change. */
export function useCatalogInvalidation() {
  const client = useQueryClient();
  useEffect(() => {
    const refresh = () => CATALOG_KEYS.forEach((key) => client.invalidateQueries({ queryKey: [key] }));
    socket.on("ai-model-catalog-updated", refresh);
    return () => { socket.off("ai-model-catalog-updated", refresh); };
  }, [client]);
}

export function useAiModelCatalog() {
  useCatalogInvalidation();
  return useQuery({
    queryKey: ["ai-model-catalog"],
    queryFn: async (): Promise<CatalogListData> => {
      const res = await _axios("get", "/management/ai-model-catalog");
      return res?.data ?? { models: [], latestSync: null, latestSuccess: null, uncataloguedActiveModels: [] };
    },
    staleTime: 30_000,
  });
}

type Method = "post" | "put";
function useCatalogMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, data, method = "post" }: { path: string; data?: unknown; method?: Method }) =>
      _axios(method, `/management/ai-model-catalog${path}`, data),
    onSuccess: () => CATALOG_KEYS.forEach((key) => client.invalidateQueries({ queryKey: [key] })),
  });
}

export function useCatalogSync() {
  const m = useCatalogMutation();
  return { ...m, sync: () => m.mutateAsync({ path: "/sync" }) };
}
export function useCatalogReview() {
  const m = useCatalogMutation();
  return {
    ...m,
    review: (id: number, body: { review_status?: string; lifecycle_status?: string; request_profile?: unknown }) =>
      m.mutateAsync({ path: `/${id}`, data: body, method: "put" }),
  };
}
export function useCatalogTest() {
  const m = useCatalogMutation();
  return {
    ...m,
    test: (id: number, body: { credentialScope: "platform" | "tenant"; tenantId?: string }) =>
      m.mutateAsync({ path: `/${id}/test`, data: body }),
  };
}
export function useCatalogActivation() {
  const m = useCatalogMutation();
  return {
    ...m,
    setActive: (id: number, active: boolean) => m.mutateAsync({ path: `/${id}/${active ? "activate" : "deactivate"}` }),
  };
}

/** Backwards-compatible combined action hook (used by the older component shape). */
export function useCatalogAction() {
  return useCatalogMutation();
}

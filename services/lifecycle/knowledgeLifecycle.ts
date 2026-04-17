/**
 * knowledgeLifecycle.ts
 * TypeScript API service methods for the knowledge_sources lifecycle.
 *
 * Pattern is identical across all Tier 1 resources — only the endpoint
 * path and return types differ.
 */

import { _axios } from "@/helper/axios";

export interface DeletedKnowledgeSource {
  id: number;
  title: string;
  type: "file" | "text" | "url" | "faq";
  file_name: string | null;
  source_url: string | null;
  deleted_at: string;
  created_at: string;
  /** Computed by backend: Math.max(0, 30 - daysSince(deleted_at)) */
  days_remaining: number;
  /** true if days_remaining > 0 */
  can_restore: boolean;
}

export interface DeletedItemsResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class KnowledgeLifecycleApi {
  /** GET /knowledge/deleted — paginated trash list */
  getDeleted = async (page = 1, limit = 20): Promise<DeletedItemsResponse<DeletedKnowledgeSource>> => {
    return _axios("get", `/whatsapp/knowledge/deleted?page=${page}&limit=${limit}`);
  };

  /** DELETE /knowledge/:id/soft */
  softDelete = async (id: string | number) => {
    return _axios("delete", `/whatsapp/knowledge/${id}/soft`);
  };

  /** PUT /knowledge/:id/restore */
  restore = async (id: string | number) => {
    return _axios("put", `/whatsapp/knowledge/${id}/restore`);
  };

  /** DELETE /knowledge/:id — admin only */
  hardDelete = async (id: string | number) => {
    return _axios("delete", `/whatsapp/knowledge/${id}`);
  };
}

export const knowledgeLifecycleApi = new KnowledgeLifecycleApi();

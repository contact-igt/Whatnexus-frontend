import { _axios } from "@/helper/axios";

export interface MediaAsset {
  id?: number;
  media_asset_id?: string;
  tenant_id: string;
  file_name: string;
  file_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number;
  media_handle: string;
  preview_url: string | null;
  tags: string[];
  folder: string;
  is_approved: boolean;
  is_deleted: boolean;
  templates_used: string[];
  campaigns_used: string[];
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  media_url?: string;
  url?: string;
}

export interface MediaAssetsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: MediaAsset[];
}

export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: {
    asset_id: string;
    media_handle: string;
    preview_url: string | null;
    file_name: string;
    file_type: string;
    file_size: number;
    mime_type: string;
    tags: string[];
    folder: string;
    is_approved: boolean;
    created_at: string;
  };
}

export interface MediaStatsResponse {
  success: boolean;
  data: {
    total: number;
    images: number;
    videos: number;
    documents: number;
    approved: number;
    pending: number;
    totalSize: number;
  };
}

/**
 * Fetch aggregated media stats (single SQL query — no bulk row transfer)
 */
export const fetchMediaStats = async (): Promise<MediaStatsResponse> => {
  return await _axios("get", "/whatsapp/gallery/stats", null, "application/json");
};

/**
 * Fetch media assets with filters and pagination
 */
export const fetchMediaAssets = async (params: {
  tenant_id: string;
  type?: string;
  search?: string;
  tags?: string;
  folder?: string;
  approved_only?: boolean;
  pending_only?: boolean;
  show_deleted?: boolean;
  sort_field?: "date" | "name" | "size";
  sort_dir?: "asc" | "desc";
  page?: number;
  limit?: number;
}): Promise<MediaAssetsResponse> => {
  return await _axios("get", "/whatsapp/gallery", null, "application/json", params);
};

/**
 * Upload media file
 */
export const uploadMedia = async (
  file: File,
  tenantId: string,
  metadata?: {
    tags?: string[];
    folder?: string;
  },
  onProgress?: (percent: number) => void,
): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tenant_id", tenantId);
  
  if (metadata?.tags) {
    formData.append("tags", JSON.stringify(metadata.tags));
  }
  
  if (metadata?.folder) {
    formData.append("folder", metadata.folder);
  }

  return await _axios(
    "post",
    "/whatsapp/gallery/upload",
    formData,
    "multipart/form-data",
    undefined,
    {
      onUploadProgress: (event: ProgressEvent) => {
        if (!event.total || !onProgress) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      },
    },
  );
};

/**
 * Get single media asset
 */
export const getMediaAsset = async (
  assetId: string,
  // tenantId kept for API compatibility but backend reads it from JWT
  _tenantId?: string
): Promise<{ success: boolean; data: MediaAsset }> => {
  return await _axios("get", `/whatsapp/gallery/${assetId}`, null, "application/json");
};

/**
 * Delete media asset
 */
export const deleteMediaAsset = async (
  assetId: string,
  // tenantId kept for API compatibility but backend reads it from JWT
  _tenantId?: string
): Promise<{ success: boolean; message: string }> => {
  return await _axios("delete", `/whatsapp/gallery/${assetId}`);
};

/**
 * Restore a soft-deleted media asset
 */
export const restoreMediaAsset = async (
  assetId: string,
  // tenantId kept for API compatibility but backend reads it from JWT
  _tenantId?: string,
): Promise<{ success: boolean; asset_id: string; file_name: string; preview_url: string | null; media_handle: string; message: string }> => {
  return await _axios("post", `/whatsapp/gallery/${assetId}/restore`, null, "application/json");
};

/**
 * Update media asset tags
 */
export const updateMediaTags = async (
  assetId: string,
  // tenantId kept for API compatibility but backend reads it from JWT
  _tenantId?: string,
  tags: string[] = []
): Promise<{ success: boolean; message: string; data: MediaAsset }> => {
  return await _axios("patch", `/whatsapp/gallery/${assetId}/tags`, { tags });
};

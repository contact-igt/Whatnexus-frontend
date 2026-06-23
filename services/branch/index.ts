import { _axios } from "@/helper/axios";

export interface Branch {
  id?: number;
  branch_id: string;
  tenant_id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  google_map_url?: string | null;
  is_main: boolean;
  is_active: boolean;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  notes?: string | null;
  timezone?: string | null;
  landmark?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface BranchPayload {
  name: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  google_map_url?: string | null;
  is_main?: boolean;
  is_active?: boolean;
  notes?: string | null;
  timezone?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BranchListParams {
  search?: string;
  is_active?: boolean;
}

export class branchApiData {
  createBranch = async (data: BranchPayload) => {
    return await _axios("post", "/whatsapp/branch", data);
  };

  getAllBranches = async (params?: BranchListParams) => {
    return await _axios(
      "get",
      "/whatsapp/branches",
      undefined,
      "application/json",
      params,
    );
  };

  getBranchById = async (branchId: string) => {
    return await _axios("get", `/whatsapp/branch/${branchId}`);
  };

  updateBranch = async (branchId: string, data: BranchPayload) => {
    return await _axios("put", `/whatsapp/branch/${branchId}`, data);
  };

  deleteBranch = async (branchId: string) => {
    return await _axios("delete", `/whatsapp/branch/${branchId}/soft`);
  };

  getDeletedBranches = async () => {
    return await _axios("get", "/whatsapp/branches/deleted/list");
  };

  restoreBranch = async (branchId: string) => {
    return await _axios("post", `/whatsapp/branch/${branchId}/restore`);
  };

  permanentDeleteBranch = async (branchId: string) => {
    return await _axios("delete", `/whatsapp/branch/${branchId}/permanent`);
  };
}

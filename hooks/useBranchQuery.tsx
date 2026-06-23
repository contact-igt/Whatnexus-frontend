import { toast } from "@/lib/toast";
import { BranchListParams, BranchPayload, branchApiData } from "@/services/branch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";

const branchApis = new branchApiData();

export const useGetAllBranchesQuery = (params?: BranchListParams) => {
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
  return useQuery({
    queryKey: ["branches", tenantId, params],
    queryFn: () => branchApis.getAllBranches(params),
  });
};

export const useGetBranchByIdQuery = (branchId: string) => {
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
  return useQuery({
    queryKey: ["branch", tenantId, branchId],
    queryFn: () => branchApis.getBranchById(branchId),
    enabled: !!branchId,
  });
};

export const useGetDeletedBranchesQuery = () => {
  const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
  return useQuery({
    queryKey: ["deleted-branches", tenantId],
    queryFn: () => branchApis.getDeletedBranches(),
  });
};

export const useCreateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchPayload) => branchApis.createBranch(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success(data?.message || "Branch created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create branch");
    },
  });
};

export const useUpdateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: BranchPayload }) =>
      branchApis.updateBranch(branchId, data),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", variables.branchId] });
      toast.success(data?.message || "Branch updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update branch");
    },
  });
};

export const useDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => branchApis.deleteBranch(branchId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-branches"] });
      toast.success(data?.message || "Branch moved to trash");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete branch");
    },
  });
};

export const useRestoreBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => branchApis.restoreBranch(branchId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-branches"] });
      toast.success(data?.message || "Branch restored successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore branch");
    },
  });
};

export const usePermanentDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: string) => branchApis.permanentDeleteBranch(branchId),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["deleted-branches"] });
      toast.success(data?.message || "Branch permanently deleted");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to permanently delete branch",
      );
    },
  });
};

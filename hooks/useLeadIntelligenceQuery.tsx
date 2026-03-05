import { LeadIntelligenceApiData } from "@/services/leadIntelligene"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type LeadSummaryResponse = {
  data: {
    summary: string;
  };
};

const leadIntelligenceApis = new LeadIntelligenceApiData()
export const useLeadIntelligenceQuery = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lead-intelligence"],
    queryFn: () => leadIntelligenceApis.getAllLeadIntelligence(),
    staleTime: 2 * 60 * 1000,
  })
  console.log("data", data)
  return { data, isLoading, isError, refetch }
}

export const useGetLeadByIdQuery = (id: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["lead-intelligence", id],
    queryFn: () => leadIntelligenceApis.getLeadById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
  return { data, isLoading, isError, refetch }
}



export const useSummarizeLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LeadSummaryResponse,
    Error,
    { id: string; date?: string, startDate?: string, endDate?: string }
  >({
    mutationFn: (data: any) =>
      leadIntelligenceApis.getLeadSummary(data.id, data.date, data.startDate, data.endDate),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lead-intelligence"],
      });
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: ["lead-intelligence", variables.id],
        });
      }
    },
  });
};

export const useGetDeletedLeadsQuery = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["deleted-leads"],
    queryFn: () => leadIntelligenceApis.getDeletedLeads(),
  })
  return { data, isLoading, isError, refetch }
}

export const useSoftDeleteLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadIntelligenceApis.softDeleteLead(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-leads"] });
      toast.success(data?.message || "Lead deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete lead");
    }
  });
};

export const usePermanentDeleteLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadIntelligenceApis.permanentDeleteLead(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["deleted-leads"] });
      toast.success(data?.message || "Lead permanently deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to permanently delete lead");
    }
  });
};

export const useRestoreLeadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadIntelligenceApis.restoreLead(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-leads"] });
      toast.success(data?.message || "Lead restored successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore lead");
    }
  });
};
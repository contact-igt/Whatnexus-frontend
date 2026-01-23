import { LeadIntelligenceApiData } from "@/services/leadIntelligene"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type LeadSummaryResponse = {
  data: {
    summary: string;
  };
};

const leadIntelligenceApis = new LeadIntelligenceApiData()
export const useLeadIntelligenceQuery = ()=>{
    const {data, isLoading, isError} = useQuery({
        queryKey: ["lead-intelligence"],
        queryFn: ()=> leadIntelligenceApis.getAllLeadIntelligence(),
        staleTime: 2 * 60 * 1000,
    })
    console.log("data", data)
    return {data, isLoading, isError}
}



export const useSummarizeLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    LeadSummaryResponse,
    Error,
    { id: string; phone: string }
  >({
    mutationFn: (data) =>
      leadIntelligenceApis.getLeadSummary(data.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lead-intelligence"],
      });
    },
  });
};
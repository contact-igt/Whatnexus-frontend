import { LeadIntelligenceApiData } from "@/services/leadIntelligene"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"


const leadIntelligenceApis = new LeadIntelligenceApiData()
export const useLeadIntelligenceQuery = ()=>{
    const {data, isLoading, isError} = useQuery({
        queryKey: ["lead-intelligence"],
        queryFn: ()=> leadIntelligenceApis.getAllLeadIntelligence(),
        staleTime: 2 * 60 * 1000,
    })

    return {data, isLoading, isError}
}
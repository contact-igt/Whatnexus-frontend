import { managementApiData } from "@/services/management"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";


const managementApis = new managementApiData();

export const useManagementQuery = ()=>{
    const {data, isLoading, isError} = useQuery({
        queryKey: ["management"],
        queryFn: ()=> managementApis.getAllManagement(),
        staleTime: 2 * 60 * 1000,
    })

    if(isError){
        toast.error("Failed to load management")
    }

    return {data, isLoading, isError}
}


export const useCreateManagementMutation = ()=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any)=> managementApis.createManagement(data),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            toast.success("Management created successfully")
        },
        onError: (error: any)=>{
            toast.error(error?.response?.data?.message || error.message || "Failed to create management")
        }
    })
}

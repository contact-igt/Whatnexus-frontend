import { tenantUserApiData } from "@/services/tenantUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";


const tenantUserApis = new tenantUserApiData();

export const useTenantUserQuery = ()=>{
    const {data, isLoading, isError} = useQuery({
        queryKey: ["tenant-user"],
        queryFn: ()=> tenantUserApis.getAllTenantUser(),
        staleTime: 2 * 60 * 1000,
    })

    if(isError){
        toast.error("Failed to load management")
    }

    return {data, isLoading, isError}
}


export const useCreateTenantUserMutation = ()=>{
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any)=> tenantUserApis.createTenantUser(data),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: ["tenant-user"],
            });
            toast.success("Tenant user created successfully")
        },
        onError: (error: any)=>{
            toast.error(error?.response?.data?.message || error?.message || "Failed to create tenant user")
        }
    })
}
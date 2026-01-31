import { setAuthData } from "@/redux/slices/auth/authSlice";
import { TenantActivationApiData } from "@/services/tenant-activation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const tenantActivationApis = new TenantActivationApiData();

export const useTenantActivationCheckQuery = (token: string, enabled: boolean)=>{
    const {data, error, isLoading, isError} = useQuery<any, AxiosError<any>>({
        enabled: !enabled && !!token,
        queryKey: ['tenant-activation', token],
        queryFn: async()=> {
            try {
                return await tenantActivationApis.CheckInvitedEmailStatus(token)
            } catch (error) {
                const axiosError = error as AxiosError<any>;
                console.log("axiosError", axiosError?.response?.data)
                return axiosError?.response?.data;
            }
        },
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: false
    })
    console.log("error", error)
    return {data, isLoading}
}

export const useAcceptInvitationQuery = ()=>{
   return useMutation({
    mutationFn: (token: any)=> tenantActivationApis.AcceptInvitation(token)
   })
}  

export const useRejectInvitationQuery = ()=>{
    return useMutation({
        mutationFn: (token: any)=> tenantActivationApis.RejectInvitation(token)
    })
}


export const useSetPasswordQuery = ()=>{
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any)=> tenantActivationApis.SetPassword(data),
        onSuccess: (data)=>{
            toast.success("Password set successfully")
                        dispatch(setAuthData({
                            token: data?.refreshToken,
                            refreshToken: data?.refreshToken,
                            user: data?.user
                        }))
        },
        onError: (error: AxiosError<any>)=>{
            toast.error(error?.response?.data?.message || error?.message || "Failed to set password")
            queryClient.invalidateQueries({queryKey: ['tenant-activation', error?.response?.data?.token]})
        }
    })
}
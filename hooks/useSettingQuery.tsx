import { settingApiData } from "@/services/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SettingsApis = new settingApiData();

export const useGetAllSettingQuery = () => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['settings'],
        queryFn: () => SettingsApis.getAllSettings(),
        staleTime: 2 * 60 * 1000,
    });

    if (isError) {
        toast.error('Failed to load settings');
    }

    return { data, isLoading, isError };
};

// export const useUpdateSettingMutation = ()=>{
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn:(id: string, data: any)=>{
//             return SettingsApis.updateSettingById(id, data)
//         },
//         onSuccess:()=>{
//             queryClient.invalidateQueries({queryKey: ['settings']})
//             toast.success('Setting updated successfully!')
//         },
//         onError:(error: any)=>{
//             toast.error(error?.response?.data?.message || error.message || 'Failed to update setting')
//         }
//     })
// }

export const useActivateSettingMutation = ()=>{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn:({id, data}: {id: string, data: any})=>{
            return SettingsApis.activateSettingById(id, data)
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey: ['settings']})
            toast.success('Setting activated successfully!')
        },
        onError:(error: any)=>{
            toast.error(error?.response?.data?.message || error.message || 'Failed to activate setting')
        }
    })
}

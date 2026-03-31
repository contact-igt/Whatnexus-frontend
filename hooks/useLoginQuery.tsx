import { setAuthData, setWhatsAppApiDetails } from "@/redux/slices/auth/authSlice";
import { authApis } from "@/services/auth";
import { whatsappConfigApiData } from "@/services/whatsappConfiguration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const { login } = new authApis();
const whatsappConfigApis = new whatsappConfigApiData();


export const useManagementLoginMutation = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => login(data),
        onSuccess: async (data, variables) => {
            if (!data || data?.success == false) {
                toast.error(data?.message || "Something went wrong")
                return;
            }
            console.log("user", data)
            dispatch(setAuthData({
                token: data?.tokens?.accessToken,
                refreshToken: data?.tokens?.refreshToken,
                user: data?.user
            }))

            // Pre-fetch WhatsApp config before navigating so connected status displays immediately
            if (data?.user?.role !== 'super_admin' && data?.user?.role !== 'platform_admin') {
                try {
                    const configResult = await queryClient.fetchQuery({
                        queryKey: ['whatsapp-config'],
                        queryFn: () => whatsappConfigApis.getWhatsAppConfig(),
                    });
                    if (configResult?.data) {
                        dispatch(setWhatsAppApiDetails(configResult.data));
                    }
                } catch {
                    // Ignore - dashboard will handle
                }
            }

            toast.success("Login successful")
            router.replace("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    })
}
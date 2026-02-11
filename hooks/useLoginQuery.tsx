import { setAuthData } from "@/redux/slices/auth/authSlice";
import { authApis } from "@/services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const { login } = new authApis();


export const useManagementLoginMutation = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any) => login(data),
        onSuccess: (data, variables) => {
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
            queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] })
            toast.success("Login successful")
            router.replace("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        }
    })
}
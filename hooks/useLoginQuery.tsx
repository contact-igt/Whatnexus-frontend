import { setAuthData } from "@/redux/slices/auth/authSlice";
import { authApis } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const {login} = new authApis();


export const useLoginMutation = ()=>{
    const dispatch = useDispatch();
    const router = useRouter();
    return useMutation({
        mutationFn: (data: any)=> login(data),
        onSuccess: (data, variables)=>{
            if(!data || data?.success == false){
                toast.error(data?.message || "Something went wrong")
            }
            dispatch(setAuthData({
                token: variables.rememberMe === true ? data?.refreshToken : data?.accessToken,
                refreshToken: data?.refreshToken,
                user: data?.user
            }))
            toast.success("Login successful")
            router.replace("/")
        },
        onError: (error)=>{
            toast.error(error?.message || "Something went wrong")
        }
    })
}
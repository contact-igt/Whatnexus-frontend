import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApis } from "@/services/forgot-password";
import { toast } from "sonner";

type UserType = 'management' | 'tenant';

export const useForgotPasswordMutation = (userType: UserType) => {
    return useMutation({
        mutationFn: (email: string) => {
            return userType === 'management'
                ? forgotPasswordApis.managementForgotPassword(email)
                : forgotPasswordApis.tenantForgotPassword(email);
        },
        onSuccess: () => {
            toast.success("OTP sent to your email successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to send OTP");
        }
    });
};

export const useVerifyOtpMutation = (userType: UserType) => {
    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) => {
            return userType === 'management'
                ? forgotPasswordApis.managementVerifyOtp(email, otp)
                : forgotPasswordApis.tenantVerifyOtp(email, otp);
        },
        onSuccess: () => {
            toast.success("OTP verified successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Invalid or expired OTP");
        }
    });
};

export const useResetPasswordMutation = (userType: UserType) => {
    return useMutation({
        mutationFn: ({ email, new_password }: { email: string; new_password: string }) => {
            return userType === 'management'
                ? forgotPasswordApis.managementResetPassword(email, new_password)
                : forgotPasswordApis.tenantResetPassword(email, new_password);
        },
        onSuccess: () => {
            toast.success("Password reset successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to reset password");
        }
    });
};

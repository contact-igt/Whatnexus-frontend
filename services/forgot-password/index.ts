import { _axios } from "@/helper/axios";

export class ForgotPasswordApiData {
    // Management APIs
    managementForgotPassword = async (email: string) => {
        return await _axios("post", "/management/forgot-password", { email });
    };

    managementVerifyOtp = async (email: string, otp: string) => {
        return await _axios("post", "/management/verify-otp", { email, otp });
    };

    managementResetPassword = async (email: string, new_password: string) => {
        return await _axios("post", "/management/reset-password", { email, new_password });
    };

    // Tenant APIs
    tenantForgotPassword = async (email: string) => {
        return await _axios("post", "/tenant/user/forgot-password", { email });
    };

    tenantVerifyOtp = async (email: string, otp: string) => {
        return await _axios("post", "/tenant/user/verify-otp", { email, otp });
    };

    tenantResetPassword = async (email: string, new_password: string) => {
        return await _axios("post", "/tenant/user/reset-password", { email, new_password });
    };
}

export const forgotPasswordApis = new ForgotPasswordApiData();

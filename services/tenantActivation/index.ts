import { _axios } from "@/helper/axios"


export class TenantActivationApiData {
    CheckInvitedEmailStatus = async (token: string) => {
        return await _axios("get", `/tenant/invite/verify?token=${token}`)
    }
    AcceptInvitation = async (data: { token: string }) => {
        return await _axios("post", `/tenant/invite/accept`, data)
    }
    RejectInvitation = async (data: { token: string }) => {
        return await _axios("post", `/tenant/invite/reject`, data)
    }
    SetPassword = async (data: any) => {
        return await _axios("post", `/tenant/invite/set-password`, data)
    }
}
import { _axios } from "@/helper/axios"


export class TenantActivationApiData {
    CheckInvitedEmailStatus = async (token: string)=>{
        return await _axios("get", `/invite/verify?token=${token}`)
    }
    AcceptInvitation = async (token: string)=>{
        return await _axios("post", `/invite/accept`, token)
    }
    RejectInvitation = async(token: string)=>{
        return await _axios("post", `/invite/reject`, token)
    }
    SetPassword = async(data: any)=>{
        return await _axios("post", `/invite/set-password`, data)
    }
}
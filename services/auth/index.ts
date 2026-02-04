import {_axios} from "@/helper/axios";


export interface user{
    username: string;
    password: string;
}

export class authApis{
    login = async(data: user)=>{
        return await _axios("post", `/management/login`, data);
    }
}
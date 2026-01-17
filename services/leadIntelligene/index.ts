import { _axios } from "@/helper/axios";


export class LeadIntelligenceApiData {
    getAllLeadIntelligence = async () => {
        return await _axios("get", `/chatstates`);
    };
}
import { _axios } from "@/helper/axios";


export class LeadIntelligenceApiData {
    getAllLeadIntelligence = async () => {
        return await _axios("get", `/leads`);
    };
    getLeadSummary = async (id: string) => {
        return await _axios("get", `/leads-summary/${id}`);
    };
}
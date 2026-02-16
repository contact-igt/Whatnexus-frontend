import { _axios } from "@/helper/axios";


export class LeadIntelligenceApiData {
    getAllLeadIntelligence = async () => {
        return await _axios("get", `/whatsapp/leads`);
    };
    getLeadSummary = async (id: string, date?: string, startDate?: string, endDate?: string) => {
        let url = `/whatsapp/leads-summary/${id}`;
        const params = new URLSearchParams();

        if (startDate && endDate) {
            params.append('start_date', startDate);
            params.append('end_date', endDate);
        } else if (date) {
            params.append('date', date);
        }

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return await _axios("get", url);
    };

    getLeadById = async (id: string) => {
        return await _axios("get", `/whatsapp/lead/${id}`);
    };

    softDeleteLead = async (id: string) => {
        return await _axios("delete", `/whatsapp/lead/${id}/soft`)
    }
    getDeletedLeads = async () => {
        return await _axios("get", "/whatsapp/leads/deleted/list")
    }
    permanentDeleteLead = async (id: string) => {
        return await _axios("delete", `/whatsapp/lead/${id}/permanent`)
    }
    restoreLead = async (id: string) => {
        return await _axios("post", `/whatsapp/lead/${id}/restore`)
    }
}
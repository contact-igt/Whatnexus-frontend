import { _axios } from "@/helper/axios";

export interface UploadKnowledgeData {
  title: string;
  type: string;
  text: string;
  source_url: string;
  file: string;
}

export class knowledgeApiData {
  uploadKnowledge = async (data: UploadKnowledgeData) => {
    return await _axios("post", "/knowledge", data);
  };
  getAllKnowledges = async () => {
    return await _axios("get", "/knowledges");
  };
  getKnowledgeById = async (id: string) => {
    return await _axios("get", `/knowledge/${id}`);
  };
  updateKnowledgeById = async(id: string, data: any)=>{
    return await _axios("put", `/knowledge/${id}`, data)
  }
  activateKnowledgeById = async(id: string, data: any)=>{
    return await _axios("put", `/knowledge-active/${id}`, data)
  }
  deleteKnowledgeById = async(id: string)=>{
    return await _axios("delete", `/knowledge/${id}`)
  }
}

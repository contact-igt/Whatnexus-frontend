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
    return await _axios("post", "/whatsapp/knowledge", data);
  };
  getAllKnowledges = async () => {
    return await _axios("get", "/whatsapp/knowledges");
  };
  getKnowledgeById = async (id: string) => {
    return await _axios("get", `/whatsapp/knowledge/${id}`);
  };
  updateKnowledgeById = async(id: string, data: any)=>{
    return await _axios("put", `/whatsapp/knowledge/${id}`, data)
  }
  activateKnowledgeById = async(id: string, data: any)=>{
    return await _axios("put", `/whatsapp/knowledge-status/${id}?status=${data.status}`)
  }
  deleteKnowledgeById = async(id: string)=>{
    return await _axios("delete", `/whatsapp/knowledge/${id}/soft`)
  }
  getDeletedKnowledges = async()=>{
    return await _axios("get", "/whatsapp/knowledges/deleted/list")
  }
  deleteKnowledgePermanentById = async(id: string)=>{
    return await _axios("delete", `/whatsapp/knowledge/${id}/permanent`)
  }
  restoreKnowledgeById = async(id: string)=>{
    return await _axios("post", `/whatsapp/knowledge/${id}/restore`)
  }
}

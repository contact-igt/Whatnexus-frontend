import { _axios } from "@/helper/axios";

export interface SendMessageData {
  phone: string;
  message: string;
}

export class MessagesApiData {
  getMessagesByPhone = async (phone: string) => {
    return await _axios("get", `/whatsapp/chats/${phone}`);
  };

  getAllChats = async () => {
    return await _axios("get", "/whatsapp/chats");
  };

  getAllLiveChats = async () => {
    return await _axios("get", "/whatsapp/live-chats")

  };

  getAllHistoryChats = async () => {
    return await _axios("get", "/whatsapp/history-chats")

  };

  addMessage = async (data: SendMessageData) => {
    return await _axios("post", "/whatsapp/chats/send", data);
  };

  updateSeen = async (phone: string) => {
    return await _axios(
      "put",
      `/whatsapp/chats/mark?phone=${phone}`
    );
  };

  chatSuggest = async (data: any) => {
    return await _axios("post", "/whatsapp/chats/suggest", data)
  }

  sendTemplateMessage = async (data: { phone: string; contact_id: string; template_id: string; components?: any[] }) => {
    return await _axios("post", "/whatsapp/chats/send-template", data);
  };
}

import { _axios } from "@/helper/axios";

export interface SendMessageData {
  phone: string;
  message: string;
}

export class MessagesApiData {
  getMessagesByPhone = async (phone: string) => {
    return await _axios("get", `/chats/${phone}`);
  };

  getAllChats = async () => {
    return await _axios("get", "/chats");
  };

  addMessage = async (data: SendMessageData) => {
    return await _axios("post", "/chats/send", data);
  };

  updateSeen = async (phone: string) => {
    return await _axios(
      "put",
      `/chats/mark?phone=${phone}`
    );
  };

  chatSuggest = async (data: any)=>{
    return await _axios("post", "/chats/suggest", data)
  }
}

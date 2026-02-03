import { _axios } from "@/helper/axios";
import { CreateGroupDto, UpdateGroupDto, AddContactsToGroupDto } from "@/types/contactGroup";

export class contactGroupApiData {
    createGroup = async (data: CreateGroupDto) => {
        return await _axios("post", "/contact-group", data);
    };

    getAllGroups = async () => {
        return await _axios("get", "/contact-group/list");
    };

    getGroupById = async (groupId: string) => {
        return await _axios("get", `/contact-group/${groupId}`);
    };

    getAvailableContacts = async (groupId: string) => {
        return await _axios("get", `/contact-group/${groupId}/available-contacts`);
    };

    updateGroup = async (groupId: string, data: UpdateGroupDto) => {
        return await _axios("put", `/contact-group/${groupId}`, data);
    };

    addContactsToGroup = async (groupId: string, data: AddContactsToGroupDto) => {
        return await _axios("post", `/contact-group/${groupId}/add-contacts`, data);
    };

    removeContactFromGroup = async (groupId: string, contactId: string) => {
        return await _axios("delete", `/contact-group/${groupId}/contact/${contactId}`);
    };

    deleteGroup = async (groupId: string) => {
        return await _axios("delete", `/contact-group/${groupId}`);
    };
}

export const contactGroupApis = new contactGroupApiData();

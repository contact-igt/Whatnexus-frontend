import { _axios } from "@/helper/axios";
import { CreateGroupDto, UpdateGroupDto, AddContactsToGroupDto } from "@/types/contactGroup";

export class contactGroupApiData {
    createGroup = async (data: CreateGroupDto) => {
        return await _axios("post", "/whatsapp/contact-group", data);
    };

    getAllGroups = async (params?: any) => {
        return await _axios("get", "/whatsapp/contact-group/list", null, undefined, params);
    };

    getGroupById = async (groupId: string) => {
        return await _axios("get", `/whatsapp/contact-group/${groupId}`);
    };

    getAvailableContacts = async (groupId: string) => {
        return await _axios("get", `/whatsapp/contact-group/${groupId}/available-contacts`);
    };

    updateGroup = async (groupId: string, data: UpdateGroupDto) => {
        return await _axios("put", `/whatsapp/contact-group/${groupId}`, data);
    };

    addContactsToGroup = async (groupId: string, data: AddContactsToGroupDto) => {
        return await _axios("post", `/whatsapp/contact-group/${groupId}/add-contacts`, data);
    };

    removeContactFromGroup = async (groupId: string, contactId: string) => {
        return await _axios("delete", `/whatsapp/contact-group/${groupId}/contact/${contactId}`);
    };

    deleteGroup = async (groupId: string) => {
        return await _axios("delete", `/whatsapp/contact-group/${groupId}/soft`);
    };

    getDeletedGroups = async (params?: any) => {
        return await _axios("get", "/whatsapp/contact-group/deleted/list", null, undefined, params);
    };

    restoreGroup = async (groupId: string) => {
        return await _axios("post", `/whatsapp/contact-group/${groupId}/restore`);
    };

    permanentDeleteGroup = async (groupId: string) => {
        return await _axios("delete", `/whatsapp/contact-group/${groupId}/permanent`);
    };
}

export const contactGroupApis = new contactGroupApiData();

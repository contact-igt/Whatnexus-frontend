import { _axios } from "@/helper/axios";
import { CreateContactDto, UpdateContactDto } from "@/types/contact";

export class contactApiData {
    createContact = async (data: CreateContactDto) => {
        return await _axios("post", "/whatsapp/contact", data);
    };

    getAllContacts = async (params?: any) => {
        return await _axios("get", "/whatsapp/contacts", null, undefined, params);
    };

    getContactById = async (contactId: string) => {
        return await _axios("get", `/whatsapp/contact/${contactId}`);
    };

    updateContact = async (contactId: string, data: UpdateContactDto) => {
        return await _axios("put", `/whatsapp/contact/${contactId}`, data);
    };

    deleteContact = async (contactId: string) => {
        return await _axios("delete", `/whatsapp/contact/${contactId}/soft`);
    };

    importContacts = async (csvData: FormData) => {
        return await _axios("post", "/whatsapp/contact/import", csvData);
    };

    getDeletedContacts = async (params?: any) => {
        return await _axios("get", "/whatsapp/contacts/deleted/list", null, undefined, params);
    };

    restoreContact = async (contactId: string) => {
        return await _axios("post", `/whatsapp/contact/${contactId}/restore`);
    };

    permanentDeleteContact = async (contactId: string) => {
        return await _axios("delete", `/whatsapp/contact/${contactId}/permanent`);
    };
}

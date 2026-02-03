import { _axios } from "@/helper/axios";
import { CreateContactDto, UpdateContactDto } from "@/types/contact";

export class contactApiData {
    createContact = async (data: CreateContactDto) => {
        return await _axios("post", "/contact", data);
    };

    getAllContacts = async () => {
        return await _axios("get", "/contacts");
    };

    getContactById = async (contactId: string) => {
        return await _axios("get", `/contact/${contactId}`);
    };

    updateContact = async (contactId: string, data: UpdateContactDto) => {
        return await _axios("put", `/contact/${contactId}`, data);
    };

    deleteContact = async (contactId: string) => {
        return await _axios("delete", `/contact/${contactId}`);
    };

    importContacts = async (csvData: FormData) => {
        return await _axios("post", "/contact/import", csvData);
    };
}

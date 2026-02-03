import { contactApiData } from "@/services/contact";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const contactApis = new contactApiData();

export const useCreateContactMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            return contactApis.createContact(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast.success(data?.message || 'Contact created successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Contact creation failed!');
        }
    });
};

export const useGetAllContactsQuery = () => {
    return useQuery({
        queryKey: ['contacts'],
        queryFn: () => contactApis.getAllContacts()
    });
};

export const useGetContactByIdQuery = (contactId: string) => {
    return useQuery({
        queryKey: ['contact', contactId],
        queryFn: () => contactApis.getContactById(contactId),
        enabled: !!contactId
    });
};

export const useUpdateContactMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contactId, data }: { contactId: string; data: any }) => {
            return contactApis.updateContact(contactId, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
            toast.success(data?.message || 'Contact updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Contact update failed!');
        }
    });
};

export const useDeleteContactMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contactId: string) => {
            return contactApis.deleteContact(contactId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast.success(data?.message || 'Contact deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Contact deletion failed!');
        }
    });
};

export const useImportContactsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (csvData: FormData) => {
            return contactApis.importContacts(csvData);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            toast.success(data?.message || 'Contacts imported successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Contact import failed!');
        }
    });
};


"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Contact, CreateContactDto, UpdateContactDto } from "@/types/contact";
import {
    useGetAllContactsQuery,
    useCreateContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useImportContactsMutation
} from "@/hooks/useContactQuery";
import { ContactsHeader } from "./contactsHeader";
import { ContactList } from "./contactList";
import { AddContactModal } from "./addContactModal";
import { EditContactDrawer } from "./editContactDrawer";
import { ImportContactsModal } from "./importContactsModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export const ContactsView = () => {
    const { isDarkMode } = useTheme();

    // Modals and Drawers State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // Selected Contact State
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // React Query Hooks
    const { data: contactsData, isLoading } = useGetAllContactsQuery();
    const { mutate: createContact, isPending: isCreating } = useCreateContactMutation();
    const { mutate: updateContact, isPending: isUpdating } = useUpdateContactMutation();
    const { mutate: deleteContact, isPending: isDeleting } = useDeleteContactMutation();
    const { mutate: importContacts, isPending: isImporting } = useImportContactsMutation();

    // Get contacts from API response
    const contacts: Contact[] = contactsData?.data || [];

    // Filtered contacts based on search
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts;

        const query = searchQuery.toLowerCase();
        return contacts.filter(contact =>
            (contact.name || "").toLowerCase().includes(query) ||
            (contact.phone || "").toLowerCase().includes(query) ||
            (contact.email || "").toLowerCase().includes(query)
        );
    }, [contacts, searchQuery]);



    // Handlers
    const handleAddContact = (data: CreateContactDto) => {
        createContact(data, {
            onSuccess: () => {
                setIsAddModalOpen(false);
            }
        });
    };

    const handleEditContact = (contactId: string, data: UpdateContactDto) => {
        updateContact({ contactId, data }, {
            onSuccess: () => {
                setIsEditDrawerOpen(false);
                setSelectedContact(null);
            }
        });
    };

    const handleDeleteContact = () => {
        if (selectedContact) {
            deleteContact(selectedContact.contact_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }
            });
        }
    };

    const handleBulkDelete = () => {
        // Delete selected contacts one by one
        selectedContacts.forEach(contactId => {
            deleteContact(contactId);
        });
        setIsBulkDeleteModalOpen(false);
        setSelectedContacts([]);
    };

    const handleImportCSV = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        importContacts(formData, {
            onSuccess: () => {
                setIsImportModalOpen(false);
            }
        });
    };

    const handleSelectContact = (contactId: string) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedContacts(filteredContacts.map(c => c.contact_id));
        } else {
            setSelectedContacts([]);
        }
    };

    const openEditDrawer = (contact: Contact) => {
        setSelectedContact(contact);
        setIsEditDrawerOpen(true);
    };

    const openDeleteModal = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDeleteModalOpen(true);
    };

    const openViewContact = (contact: Contact) => {
        // For now, just open edit drawer
        // In future, this could navigate to a detail page
        openEditDrawer(contact);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <ContactsHeader
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddContact={() => setIsAddModalOpen(true)}
                onImportCSV={() => setIsImportModalOpen(true)}
                selectedCount={selectedContacts.length}
                onBulkDelete={selectedContacts.length > 0 ? () => setIsBulkDeleteModalOpen(true) : undefined}
            />

            {/* Contact List */}
            <ContactList
                isDarkMode={isDarkMode}
                contacts={filteredContacts}
                isLoading={isLoading}
                selectedContacts={selectedContacts}
                onSelectContact={handleSelectContact}
                onSelectAll={handleSelectAll}
                onView={openViewContact}
                onEdit={openEditDrawer}
                onDelete={openDeleteModal}
            />

            {/* Add Contact Modal */}
            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddContact}
                isDarkMode={isDarkMode}
                isLoading={isCreating}
            />

            {/* Edit Contact Drawer */}
            <EditContactDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => {
                    setIsEditDrawerOpen(false);
                    setSelectedContact(null);
                }}
                onSubmit={handleEditContact}
                contact={selectedContact}
                isDarkMode={isDarkMode}
                isLoading={isUpdating}
            />

            {/* Import CSV Modal */}
            <ImportContactsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportCSV}
                isDarkMode={isDarkMode}
                isLoading={isImporting}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }}
                onConfirm={handleDeleteContact}
                title="Delete Contact"
                message={`Are you sure you want to delete ${selectedContact?.name}? This action cannot be undone.`}
                isDarkMode={isDarkMode}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Contacts"
                message={`Are you sure you want to delete ${selectedContacts.length} contact(s)? This action cannot be undone.`}
                isDarkMode={isDarkMode}
                confirmText="Delete All"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

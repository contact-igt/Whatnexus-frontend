
"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Contact, CreateContactDto, UpdateContactDto } from "@/types/contact";
import {
    useGetAllContactsQuery,
    useCreateContactMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
    useImportContactsMutation,
    useGetDeletedContactsQuery,
    useRestoreContactMutation,
    usePermanentDeleteContactMutation
} from "@/hooks/useContactQuery";
import { handleCSVDownloadData } from "@/hooks/useExportDataToExcel";
import { ContactsHeader } from "./contactsHeader";
import { ContactList } from "./contactList";
import { AddContactModal } from "./addContactModal";
import { EditContactDrawer } from "./editContactDrawer";
import { ImportContactsModal } from "./importContactsModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const ContactsView = () => {
    const { isDarkMode } = useTheme();

    // Modals and Drawers State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');

    // Selected Contact State
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore'>('delete');

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // React Query Hooks
    const { data: contactsData, isLoading: isLoadingContacts } = useGetAllContactsQuery();
    const { data: deletedContactsData, isLoading: isLoadingDeleted } = useGetDeletedContactsQuery();

    const { mutate: createContact, isPending: isCreating } = useCreateContactMutation();
    const { mutate: updateContact, isPending: isUpdating } = useUpdateContactMutation();
    const { mutate: deleteContact, isPending: isDeleting } = useDeleteContactMutation();
    const { mutate: importContacts, isPending: isImporting } = useImportContactsMutation();
    const { mutate: restoreContact, isPending: isRestoring } = useRestoreContactMutation();
    const { mutate: permanentDeleteContact, isPending: isPermanentlyDeleting } = usePermanentDeleteContactMutation();

    // Get contacts from API response based on tab
    const contacts: Contact[] = activeTab === 'all'
        ? contactsData?.data?.contacts || []
        : deletedContactsData?.data?.contacts || [];

    const isLoading = activeTab === 'all' ? isLoadingContacts : isLoadingDeleted;

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

    const handleConfirmAction = () => {
        if (!selectedContact) return;

        if (actionType === 'delete') {
            deleteContact(selectedContact.contact_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }
            });
        } else if (actionType === 'restore') {
            restoreContact(selectedContact.contact_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }
            });
        } else if (actionType === 'permanent_delete') {
            permanentDeleteContact(selectedContact.contact_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }
            });
        }
    };

    const handleBulkDelete = () => {
        // Delete selected contacts one by one
        // Note: Ideally backend should support bulk delete
        selectedContacts.forEach(contactId => {
            if (activeTab === 'all') {
                deleteContact(contactId);
            } else {
                permanentDeleteContact(contactId);
            }
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

    const handleExportCSV = () => {
        // Prepare data for export
        const dataToExport = contacts.map(contact => ({
            name: contact.name,
            phone: contact.phone,
            // tags: contact.tags?.join(';') || '' // Include if tags are used
        }));
        handleCSVDownloadData(dataToExport, 'contacts_export');
    };

    const handleDownloadSample = () => {
        const sampleData = [
            { name: "Aarav Patel", phone: "+919876543210" },
            { name: "Priya Sharma", phone: "+919988776655" },
            { name: "Rahul Singh", phone: "+919123456789" },
            { name: "Ananya Gupta", phone: "+919898989898" },
            { name: "Vikram Kumar", phone: "+919012345678" }
        ];
        handleCSVDownloadData(sampleData, 'contacts_sample');
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
        setActionType('delete');
        setIsDeleteModalOpen(true);
    };

    const openRestoreModal = (contact: Contact) => {
        setSelectedContact(contact);
        setActionType('restore');
        setIsDeleteModalOpen(true);
    };

    const openPermanentDeleteModal = (contact: Contact) => {
        setSelectedContact(contact);
        setActionType('permanent_delete');
        setIsDeleteModalOpen(true);
    };

    const openViewContact = (contact: Contact) => {
        // For now, just open edit drawer
        // In future, this could navigate to a detail page
        openEditDrawer(contact);
    };

    return (
        <div className="p-6 font-sans overflow-y-auto h-full space-y-4">
            {/* Header */}
            <ContactsHeader
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddContact={() => setIsAddModalOpen(true)}
                onImportCSV={() => setIsImportModalOpen(true)}
                onExportCSV={handleExportCSV}
                onDownloadSample={handleDownloadSample}
                selectedCount={selectedContacts.length}
                onBulkDelete={selectedContacts.length > 0 ? () => setIsBulkDeleteModalOpen(true) : undefined}
            />

            {/* Tabs */}
            <div className="flex items-center space-x-1 border-b border-white/5">
                <button
                    onClick={() => { setActiveTab('all'); setSelectedContacts([]); }}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                        activeTab === 'all'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    All Contacts
                </button>
                <button
                    onClick={() => { setActiveTab('trash'); setSelectedContacts([]); }}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center space-x-2",
                        activeTab === 'trash'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    <Trash2 size={14} />
                    <span>Trash</span>
                </button>
            </div>

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
                onRestore={openRestoreModal}
                onPermanentDelete={openPermanentDeleteModal}
                isTrash={activeTab === 'trash'}
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

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedContact(null);
                }}
                onConfirm={handleConfirmAction}
                title={
                    actionType === 'delete' ? "Remove Contact" :
                        actionType === 'restore' ? "Restore Contact" :
                            "Permanently Delete Contact"
                }
                message={
                    actionType === 'delete'
                        ? `Are you sure you want to remove ${selectedContact?.name}? It will be moved to the trash.`
                        : actionType === 'restore'
                            ? `Are you sure you want to restore ${selectedContact?.name}?`
                            : `Are you sure you want to permanently delete ${selectedContact?.name}? This action cannot be undone.`
                }
                isDarkMode={isDarkMode}
                confirmText={
                    actionType === 'delete' ? "Remove" :
                        actionType === 'restore' ? "Restore" :
                            "Delete Forever"
                }
                cancelText="Cancel"
                isLoading={isDeleting || isRestoring || isPermanentlyDeleting}
                variant={actionType === 'restore' ? 'info' : 'danger'}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Contacts"
                message={`Are you sure you want to ${activeTab === 'trash' ? 'permanently ' : ''}delete ${selectedContacts.length} contact(s)? This action cannot be undone.`}
                isDarkMode={isDarkMode}
                confirmText="Delete All"
                cancelText="Cancel"
                isLoading={isDeleting || isPermanentlyDeleting}
                variant="danger"
            />
        </div>
    );
};

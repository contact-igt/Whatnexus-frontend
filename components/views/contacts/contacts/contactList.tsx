import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/contact";
import { ActionMenu } from "@/components/ui/action-menu";
import { Checkbox } from "@/components/ui/Checkbox";
import { User, Phone } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";

interface ContactListProps {
    isDarkMode: boolean;
    contacts: Contact[];
    isLoading: boolean;
    selectedContacts: string[];
    onSelectContact: (contactId: string) => void;
    onSelectAll: (selected: boolean) => void;
    onView: (contact: Contact) => void;
    onEdit: (contact: Contact) => void;
    onDelete: (contact: Contact) => void;
    onRestore?: (contact: Contact) => void;
    onPermanentDelete?: (contact: Contact) => void;
    isTrash?: boolean;
}

export const ContactList = ({
    isDarkMode,
    contacts,
    isLoading,
    selectedContacts,
    onSelectContact,
    onSelectAll,
    // onView, // Unused?
    onEdit,
    onDelete,
    onRestore,
    onPermanentDelete,
    isTrash = false
}: ContactListProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

    const totalPages = Math.ceil(contacts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

    const columns: ColumnDef<Contact>[] = useMemo(() => [
        {
            field: 'select',
            headerName: '',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <Checkbox
                    checked={selectedContacts.includes(row.contact_id)}
                    onCheckedChange={() => onSelectContact(row.contact_id)}
                    aria-label={`Select ${row.name}`}
                />
            )
        },
        {
            field: 'id', // S.No
            headerName: 'S.No',
            width: 180,
            renderCell: ({ index }) => (
                <span className={cn(
                    "text-sm font-medium space-x-2",
                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                )}>
                    {startIndex + index + 1}
                </span>
            )
        },
        {
            field: 'name',
            headerName: 'Contact Name',
            width: 280,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    {row.profile_pic ? (
                        <img
                            src={row.profile_pic}
                            alt={row.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                        )}>
                            <User className="text-emerald-500" size={16} />
                        </div>
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {row.name || "Patient"}
                    </span>
                </div>
            )
        },
        {
            field: 'phone',
            headerName: 'Phone',
            width: 200,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <Phone className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                    <span className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                    )}>
                        {row.phone}
                    </span>
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <ActionMenu
                    isDarkMode={isDarkMode}
                    isView={false}
                    isEdit={!isTrash}
                    isDelete={!isTrash}
                    isRestore={isTrash}
                    isPermanentDelete={isTrash}
                    onEdit={() => onEdit(row)}
                    onDelete={() => onDelete(row)}
                    onRestore={() => onRestore?.(row)}
                    onPermanentDelete={() => onPermanentDelete?.(row)}
                />
            )
        }
    ], [isDarkMode, selectedContacts, isTrash, onSelectContact, onEdit, onDelete, onRestore, onPermanentDelete, startIndex]);

    // Custom Header for Select All
    // We need to inject the Select All checkbox into the header for the 'select' column.
    // However, our DataTable simple implementation takes string for headerName.
    // For now, let's just make the first column header be the checkbox if possible?
    // The current DataTable implementation defines headerName as string.
    // I should modify DataTable to allow ReactNode for headerName or just accept the limitation and put it in a custom header row?
    // A better approach for the generic component is to allow `headerName` to be ReactNode.
    // Let me check `ColumnDef` definition in `components/ui/data-table.tsx`.
    // It is `headerName: string;`. I should update it to `ReactNode` first.

    return (
        <div>
            <div className={cn(
                "rounded-xl overflow-hidden border transition-all duration-200",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
                <DataTable
                    columns={columns.map(col => {
                        if (col.field === 'select') {
                            return {
                                ...col,
                                headerName: (
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={onSelectAll}
                                        aria-label="Select all"
                                    />
                                ) as any // Cast to any because headerName is string in interface currently
                            };
                        }
                        return col;
                    })}
                    data={currentContacts}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className={cn(
                                "p-4 rounded-full mb-4",
                                isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                            )}>
                                <User className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={32} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-semibold mb-2",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                {isTrash ? "No deleted contacts found" : "No contacts found"}
                            </h3>
                            <p className={cn(
                                "text-sm",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                {isTrash ? "Contacts moved to trash will appear here" : "Add your first contact to get started"}
                            </p>
                        </div>
                    }
                />
            </div>

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={contacts.length}
                        itemsPerPage={itemsPerPage}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}
        </div>
    );
};

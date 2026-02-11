import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ContactGroup } from "@/types/contactGroup";
import { ActionMenu } from "@/components/ui/action-menu";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";

interface GroupsListProps {
    isDarkMode: boolean;
    groups: ContactGroup[];
    isLoading: boolean;
    onEdit: (group: ContactGroup) => void;
    onDelete: (group: ContactGroup) => void;
    onRestore?: (group: ContactGroup) => void;
    onPermanentDelete?: (group: ContactGroup) => void;
    isTrash?: boolean;
}

export const GroupsList = ({
    isDarkMode,
    groups,
    isLoading,
    onEdit,
    onDelete,
    onRestore,
    onPermanentDelete,
    isTrash = false
}: GroupsListProps) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const totalPages = Math.ceil(groups.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentGroups = groups.slice(startIndex, startIndex + itemsPerPage);

    const columns: ColumnDef<ContactGroup>[] = useMemo(() => [
        {
            field: 'id',
            headerName: 'S.No',
            width: 80,
            renderCell: ({ index }) => (
                <span className={cn(
                    "text-sm font-medium",
                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                )}>
                    {startIndex + index + 1}
                </span>
            )
        },
        {
            field: 'group_name',
            headerName: 'Group Name',
            width: 250,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    )}>
                        <Users className="text-emerald-500" size={16} />
                    </div>
                    <span className={cn(
                        "text-sm font-medium",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {row.group_name}
                    </span>
                </div>
            )
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 'auto',
            renderCell: ({ row }) => (
                row.description ? (
                    <span className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                    )}>
                        {row.description.length > 50
                            ? `${row.description.substring(0, 50)}...`
                            : row.description}
                    </span>
                ) : (
                    <span className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/30' : 'text-slate-400'
                    )}>
                        —
                    </span>
                )
            )
        },
        {
            field: 'members', // Total Contacts
            headerName: 'Total Contacts',
            width: 200,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Users className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                    <span className={cn(
                        "text-sm font-medium",
                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                    )}>
                        {row?.members?.length}
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
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                        isDarkMode={isDarkMode}
                        isView={!isTrash}
                        isEdit={!isTrash}
                        isDelete={!isTrash}
                        isRestore={isTrash}
                        isPermanentDelete={isTrash}
                        onView={() => router.push(`/contacts/groups/${row.group_id}`)}
                        onEdit={() => onEdit(row)}
                        onDelete={() => onDelete(row)}
                        onRestore={() => onRestore?.(row)}
                        onPermanentDelete={() => onPermanentDelete?.(row)}
                    />
                </div>
            )
        }
    ], [isDarkMode, isTrash, onEdit, onDelete, onRestore, onPermanentDelete, router, startIndex]);

    return (
        <div>
            <div className={cn(
                "font-sans rounded-xl overflow-hidden border transition-all duration-200",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
                <DataTable
                    columns={columns}
                    data={currentGroups}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    onRowClick={(row) => router.push(`/contacts/groups/${row.group_id}`)}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className={cn(
                                "p-4 rounded-full mb-4",
                                isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                            )}>
                                <Users className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={32} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-semibold mb-2",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                {isTrash ? "No deleted groups found" : "No groups found"}
                            </h3>
                            <p className={cn(
                                "text-sm",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                {isTrash ? "Groups moved to trash will appear here" : "Create your first group to organize contacts"}
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
                        totalItems={groups.length}
                        itemsPerPage={itemsPerPage}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}
        </div >
    );
};

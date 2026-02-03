"use client";

import { cn } from "@/lib/utils";
import { ContactGroup } from "@/types/contactGroup";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ActionMenu } from "@/components/ui/action-menu";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface GroupsListProps {
    isDarkMode: boolean;
    groups: ContactGroup[];
    isLoading: boolean;
    onEdit: (group: ContactGroup) => void;
    onDelete: (group: ContactGroup) => void;
}

export const GroupsList = ({
    isDarkMode,
    groups,
    isLoading,
    onEdit,
    onDelete
}: GroupsListProps) => {
    const router = useRouter();
    console.log("groups", groups)
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-16 rounded-xl animate-pulse",
                            isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                        )}
                    />
                ))}
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center py-16 rounded-xl border",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
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
                    No groups found
                </h3>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? 'text-white/50' : 'text-slate-500'
                )}>
                    Create your first group to organize contacts
                </p>
            </div>
        );
    }

    return (
        <Table isDarkMode={isDarkMode}>
            <TableHeader isDarkMode={isDarkMode}>
                <TableRow isDarkMode={isDarkMode}>
                    <TableHead isDarkMode={isDarkMode} width="400px">S.No</TableHead>
                    <TableHead isDarkMode={isDarkMode} width="400px">Group Name</TableHead>
                    <TableHead isDarkMode={isDarkMode} width="400px">Description</TableHead>
                    <TableHead isDarkMode={isDarkMode} width="400px">Total Contacts</TableHead>
                    <TableHead isDarkMode={isDarkMode} align="center" width="250px">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groups?.map((group, index) => (
                    <TableRow
                        key={group.id}
                        isDarkMode={isDarkMode}
                        isLast={index === groups.length - 1}
                        onClick={() => router.push(`/contacts/groups/${group.id}`)}
                    >
                        <TableCell width="80px">
                            <span className={cn(
                                "text-sm font-medium",
                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                            )}>
                                {index + 1}
                            </span>
                        </TableCell>
                        <TableCell width="250px">
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
                                    {group.group_name}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell width="auto">
                            {group.description ? (
                                <span className={cn(
                                    "text-sm",
                                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                                )}>
                                    {group.description.length > 50
                                        ? `${group.description.substring(0, 50)}...`
                                        : group.description}
                                </span>
                            ) : (
                                <span className={cn(
                                    "text-sm",
                                    isDarkMode ? 'text-white/30' : 'text-slate-400'
                                )}>
                                    —
                                </span>
                            )}
                        </TableCell>
                        <TableCell width="300px">
                            <div className="flex items-center space-x-2">
                                <Users className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                                <span className={cn(
                                    "text-sm font-medium",
                                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                                )}>
                                    {group?.members?.length}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell align="center" width="250px">
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isView={true}
                                isEdit={true}
                                isDelete={true}
                                onView={() => router.push(`/contacts/groups/${group.id}`)}
                                onEdit={() => onEdit(group)}
                                onDelete={() => onDelete(group)}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

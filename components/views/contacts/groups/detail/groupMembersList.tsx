"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GroupMember } from "@/types/contactGroup";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "@/components/ui/table";
import { User, Mail, Phone, Search, X } from "lucide-react";

interface GroupMembersListProps {
    isDarkMode: boolean;
    members: GroupMember[];
    isLoading: boolean;
    onRemoveMember: (member: GroupMember) => void;
}

export const GroupMembersList = ({
    isDarkMode,
    members,
    isLoading,
    onRemoveMember
}: GroupMembersListProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms debounce delay

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filtered members based on debounced search
    const filteredMembers = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return members;

        const query = debouncedSearchQuery.toLowerCase();
        return members.filter(member =>
            member.name?.toLowerCase().includes(query) ||
            member.phone?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query)
        );
    }, [members, debouncedSearchQuery]);

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <div className="space-y-3 font-sans">
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

    return (
        <div>
            {/* Search Bar */}
            {members.length > 0 && (
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={18} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Empty State */}
            {members.length === 0 ? (
                <div className={cn(
                    "flex flex-col items-center justify-center py-16 rounded-xl border",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}>
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
                        No members yet
                    </h3>
                    <p className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                    )}>
                        Click "Add Members" to add contacts to this group
                    </p>
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className={cn(
                    "flex flex-col items-center justify-center py-16 rounded-xl border",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}>
                    <p className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                    )}>
                        No members found matching "{searchQuery}"
                    </p>
                </div>
            ) : (
                <div>
                    <div>
                        <Table isDarkMode={isDarkMode}>
                            <TableHeader isDarkMode={isDarkMode}>
                                <TableRow isDarkMode={isDarkMode}>
                                    <TableHead isDarkMode={isDarkMode} width="300px"><span className="ml-3">S.No</span></TableHead>
                                    <TableHead isDarkMode={isDarkMode} width="400px">Contact Name</TableHead>
                                    <TableHead isDarkMode={isDarkMode} width="400px">Phone</TableHead>
                                    {/* <TableHead isDarkMode={isDarkMode}>Email</TableHead> */}
                                    <TableHead isDarkMode={isDarkMode} align="center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentMembers.map((member, index) => (
                                    <TableRow
                                        key={member.id}
                                        isDarkMode={isDarkMode}
                                        isLast={index === currentMembers.length - 1}
                                    >
                                        <TableCell width="300px">
                                            <span className={cn(
                                                "text-sm font-medium pl-10 px-4",
                                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                                            )}>
                                                {startIndex + index + 1}
                                            </span>
                                        </TableCell>
                                        <TableCell width="400px">
                                            <div className="flex items-center space-x-3">
                                                {member.profile_pic ? (
                                                    <img
                                                        src={member.profile_pic}
                                                        alt={member.name}
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
                                                    {member.name || "Patient"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell width="400px">
                                            <div className="flex items-center space-x-2">
                                                <Phone className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                                                <span className={cn(
                                                    "text-sm",
                                                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                                                )}>
                                                    {member.phone}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {/* <TableCell>
                                    {member.email ? (
                                        <div className="flex items-center space-x-2">
                                            <Mail className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                                            <span className={cn(
                                                "text-sm",
                                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                                            )}>
                                                {member.email}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={cn(
                                            "text-sm",
                                            isDarkMode ? 'text-white/30' : 'text-slate-400'
                                        )}>
                                            —
                                        </span>
                                    )}
                                </TableCell> */}
                                        <TableCell align="center" width="200px">
                                            <button
                                                onClick={() => onRemoveMember(member)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all",
                                                    isDarkMode
                                                        ? 'text-red-400 hover:bg-red-500/20'
                                                        : 'text-red-600 hover:bg-red-50'
                                                )}
                                                title="Remove from group"
                                            >
                                                <X size={16} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <TablePagination
                        isDarkMode={isDarkMode}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        startIndex={startIndex}
                        endIndex={startIndex + itemsPerPage}
                        totalItems={filteredMembers.length}
                    />
                </div>
            )}
        </div>
    );
};

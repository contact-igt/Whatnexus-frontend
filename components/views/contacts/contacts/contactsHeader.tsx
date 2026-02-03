
"use client";

import { Search, Plus, Upload, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ContactsHeaderProps {
    isDarkMode: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddContact: () => void;
    onImportCSV: () => void;
    selectedCount: number;
    onBulkDelete?: () => void;
}

export const ContactsHeader = ({
    isDarkMode,
    searchQuery,
    onSearchChange,
    onAddContact,
    onImportCSV,
    selectedCount,
    onBulkDelete
}: ContactsHeaderProps) => {
    const router = useRouter();

    return (
        <div className="space-y-4 mb-6">
            {/* Title and Main Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={cn(
                        "text-2xl font-bold",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        Contacts
                    </h1>
                    <p className={cn(
                        "text-sm mt-1",
                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                    )}>
                        Manage your contact list and groups
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.push('/contacts/groups')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        )}
                    >
                        <Users size={16} />
                        <span>Manage Groups</span>
                    </button>

                    <button
                        onClick={onImportCSV}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        )}
                    >
                        <Upload size={16} />
                        <span>Import CSV</span>
                    </button>

                    <button
                        onClick={onAddContact}
                        className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={16} />
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            {/* Search and Bulk Actions */}
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        isDarkMode ? "text-white/30" : "text-slate-400"
                    )} size={16} />
                    <input
                        type="text"
                        placeholder="Search contacts by name, phone, or email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                        )}
                    />
                </div>

                {selectedCount > 0 && (
                    <div className="flex items-center space-x-3">
                        <span className={cn(
                            "text-sm font-medium",
                            isDarkMode ? 'text-white/70' : 'text-slate-600'
                        )}>
                            {selectedCount} selected
                        </span>
                        {onBulkDelete && (
                            <button
                                onClick={onBulkDelete}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    isDarkMode
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                )}
                            >
                                Delete Selected
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

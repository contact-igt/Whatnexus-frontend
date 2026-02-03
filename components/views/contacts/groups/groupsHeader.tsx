"use client";

import { cn } from "@/lib/utils";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface GroupsHeaderProps {
    isDarkMode: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCreateGroup: () => void;
}

export const GroupsHeader = ({
    isDarkMode,
    searchQuery,
    onSearchChange,
    onCreateGroup
}: GroupsHeaderProps) => {
    const router = useRouter();

    return (
        <div className="mb-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/contacts/contacts')}
                className={cn(
                    "flex items-center space-x-2 mb-4 text-sm font-medium transition-all",
                    isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                )}
            >
                <ArrowLeft size={16} />
                <span>Back to Contacts</span>
            </button>

            {/* Title and Actions */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className={cn(
                        "text-2xl font-bold mb-1",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        Manage Groups
                    </h1>
                    <p className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                    )}>
                        Organize your contacts into groups for better management
                    </p>
                </div>
                <div>
                    {/* Create Group Button */}
                    <button
                        onClick={onCreateGroup}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        )}
                    >
                        <Plus size={18} />
                        <span>Create Group</span>
                    </button>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        isDarkMode ? "text-white/30" : "text-slate-400"
                    )} size={18} />
                    <input
                        type="text"
                        placeholder="Search groups..."
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
            </div>
        </div>
    );
};

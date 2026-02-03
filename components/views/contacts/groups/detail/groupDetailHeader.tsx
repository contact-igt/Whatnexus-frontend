"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft, Edit, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { ContactGroup } from "@/types/contactGroup";

interface GroupDetailHeaderProps {
    isDarkMode: boolean;
    group: ContactGroup | null;
    memberCount: number;
    onEdit: () => void;
    onDelete: () => void;
    onAddMembers: () => void;
}

export const GroupDetailHeader = ({
    isDarkMode,
    group,
    memberCount,
    onEdit,
    onDelete,
    onAddMembers
}: GroupDetailHeaderProps) => {
    const router = useRouter();

    if (!group) return null;

    return (
        <div className="mb-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/contacts/groups')}
                className={cn(
                    "flex items-center space-x-2 mb-4 text-sm font-medium transition-all",
                    isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                )}
            >
                <ArrowLeft size={16} />
                <span>Back to Groups</span>
            </button>

            {/* Group Info and Actions */}
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    {/* Group Icon */}
                    <div className={cn(
                        "w-16 h-16 rounded-xl flex items-center justify-center",
                        isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    )}>
                        <Users className="text-emerald-500" size={32} />
                    </div>

                    {/* Group Details */}
                    <div>
                        <h1 className={cn(
                            "text-2xl font-bold mb-1",
                            isDarkMode ? 'text-white' : 'text-slate-900'
                        )}>
                            {group.group_name}
                        </h1>
                        {group.description && (
                            <p className={cn(
                                "text-sm mb-2",
                                isDarkMode ? 'text-white/60' : 'text-slate-600'
                            )}>
                                {group.description}
                            </p>
                        )}
                        <div className="flex items-center space-x-2">
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                isDarkMode ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-700'
                            )}>
                                <Users size={12} className="inline mr-1" />
                                {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onAddMembers}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                        )}
                    >
                        <UserPlus size={16} />
                        <span>Add Members</span>
                    </button>
                    <button
                        onClick={onEdit}
                        className={cn(
                            "p-2 rounded-lg transition-all border",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                        title="Edit Group"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className={cn(
                            "p-2 rounded-lg transition-all border",
                            isDarkMode
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        )}
                        title="Delete Group"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

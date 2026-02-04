"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Search, User, Phone, Mail, CheckSquare, Square } from "lucide-react";
import { GroupMember } from "@/types/contactGroup";
import { Checkbox } from "@/components/ui/Checkbox";
import { useDebounce } from "@/hooks/useDebounce";

interface AddMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contactIds: string[]) => void;
    availableContacts: GroupMember[];
    isLoadingContacts: boolean;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const AddMembersModal = ({
    isOpen,
    onClose,
    onSubmit,
    availableContacts,
    isLoadingContacts,
    isDarkMode,
    isLoading = false
}: AddMembersModalProps) => {
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Filtered contacts based on search
    const filteredContacts = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return availableContacts;

        const query = debouncedSearchQuery.toLowerCase();
        return availableContacts.filter(contact =>
            (contact.name || '').toLowerCase().includes(query) ||
            (contact.phone || '').toLowerCase().includes(query) ||
            (contact.email || '').toLowerCase().includes(query)
        );
    }, [availableContacts, debouncedSearchQuery]);

    const handleToggleContact = (contactId: string) => {
        setSelectedContactIds(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = () => {
        if (selectedContactIds.length === filteredContacts.length) {
            setSelectedContactIds([]);
        } else {
            setSelectedContactIds(filteredContacts.map(c => c.id));
        }
    };

    const handleSubmit = () => {
        if (selectedContactIds.length > 0) {
            onSubmit(selectedContactIds);
            handleReset();
        }
    };

    const handleReset = () => {
        setSelectedContactIds([]);
        setSearchQuery("");
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const allSelected = filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Members to Group"
            description="Select contacts to add to this group (only showing contacts not already in the group)"
            isDarkMode={isDarkMode}
            className="max-w-3xl font-sans"
            footer={
                <div className="flex items-center justify-between">
                    <p className={cn(
                        "text-sm font-medium",
                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                    )}>
                        {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                isDarkMode
                                    ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                isLoading && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || selectedContactIds.length === 0}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all",
                                (isLoading || selectedContactIds.length === 0) && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {isLoading ? 'Adding...' : `Add ${selectedContactIds.length} Member${selectedContactIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Search and Select All */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={18} />
                        <input
                            type="text"
                            placeholder="Search available contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>
                    {filteredContacts.length > 0 && (
                        <button
                            onClick={handleSelectAll}
                            className={cn(
                                "flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border whitespace-nowrap",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                        </button>
                    )}
                </div>

                {/* Contacts List */}
                <div className={cn(
                    "max-h-96 overflow-y-auto rounded-xl border",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}>
                    {isLoadingContacts ? (
                        <div className="p-8 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-12 rounded-lg animate-pulse",
                                        isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                    )}
                                />
                            ))}
                        </div>
                    ) : availableContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className={cn(
                                "p-3 rounded-full mb-3",
                                isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                            )}>
                                <User className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={24} />
                            </div>
                            <p className={cn(
                                "text-sm",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                All contacts are already in this group
                            </p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className={cn(
                                "text-sm",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                No contacts found matching "{searchQuery}"
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => handleToggleContact(contact.id)}
                                    className={cn(
                                        "flex items-center space-x-3 p-3 cursor-pointer transition-all",
                                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                                    )}
                                >
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedContactIds.includes(contact.id)}
                                            onCheckedChange={() => handleToggleContact(contact.id)}
                                        />
                                    </div>
                                    {contact.profile_pic ? (
                                        <img
                                            src={contact.profile_pic}
                                            alt={contact.name || 'Patient'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                        )}>
                                            <User className="text-emerald-500" size={18} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium truncate",
                                            isDarkMode ? 'text-white' : 'text-slate-900'
                                        )}>
                                            {contact.name || 'Patient'}
                                        </p>
                                        <div className="flex items-center space-x-3 mt-0.5">
                                            <div className="flex items-center space-x-1">
                                                <Phone className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={12} />
                                                <span className={cn(
                                                    "text-xs",
                                                    isDarkMode ? 'text-white/50' : 'text-slate-500'
                                                )}>
                                                    {contact.phone}
                                                </span>
                                            </div>
                                            {contact.email && (
                                                <div className="flex items-center space-x-1">
                                                    <Mail className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={12} />
                                                    <span className={cn(
                                                        "text-xs truncate",
                                                        isDarkMode ? 'text-white/50' : 'text-slate-500'
                                                    )}>
                                                        {contact.email}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

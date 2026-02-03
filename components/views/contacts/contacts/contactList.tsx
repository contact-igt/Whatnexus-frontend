
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/contact";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ActionMenu } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { User, Mail, Phone, Shield } from "lucide-react";

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
}

export const ContactList = ({
    isDarkMode,
    contacts,
    isLoading,
    selectedContacts,
    onSelectContact,
    onSelectAll,
    onView,
    onEdit,
    onDelete
}: ContactListProps) => {
    const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

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

    if (contacts.length === 0) {
        return (
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
                    No contacts found
                </h3>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? 'text-white/50' : 'text-slate-500'
                )}>
                    Add your first contact to get started
                </p>
            </div>
        );
    }

    return (
        <Table isDarkMode={isDarkMode}>
            <TableHeader isDarkMode={isDarkMode}>
                <TableRow isDarkMode={isDarkMode}>
                    <TableHead isDarkMode={isDarkMode} align="center" width="60px">
                        <Checkbox
                            checked={allSelected}
                            onCheckedChange={onSelectAll}
                            aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead isDarkMode={isDarkMode} width="80px">S.No</TableHead>
                    <TableHead isDarkMode={isDarkMode} width="auto">Contact Name</TableHead>
                    <TableHead isDarkMode={isDarkMode} width="200px">Phone</TableHead>
                    {/* <TableHead isDarkMode={isDarkMode}>Email</TableHead>
                    <TableHead isDarkMode={isDarkMode}>Tags</TableHead>
                    <TableHead isDarkMode={isDarkMode}>Status</TableHead> */}
                    <TableHead isDarkMode={isDarkMode} align="center" width="100px">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contacts.map((contact, index) => (
                    <TableRow
                        key={contact?.contact_id}
                        isDarkMode={isDarkMode}
                        isLast={index === contacts.length - 1}
                    >
                        <TableCell align="center" width="300px">
                            <Checkbox
                                checked={selectedContacts.includes(contact?.contact_id)}
                                onCheckedChange={() => onSelectContact(contact?.contact_id)}
                                aria-label={`Select ${contact?.name}`}
                            />
                        </TableCell>
                        <TableCell width="400px">
                            <span className={cn(
                                "text-sm font-medium space-x-2",
                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                            )}>
                                {index + 1}
                            </span>
                        </TableCell>
                        <TableCell width="500px">
                            <div className="flex items-center space-x-3">
                                {contact.profile_pic ? (
                                    <img
                                        src={contact.profile_pic}
                                        alt={contact.name}
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
                                    {contact.name}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell width="400px">
                            <div className="flex items-center space-x-3">
                                <Phone className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                                <span className={cn(
                                    "text-sm",
                                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                                )}>
                                    {contact.phone}
                                </span>
                            </div>
                        </TableCell>
                        {/* <TableCell>
                            {contact.email ? (
                                <div className="flex items-center space-x-2">
                                    <Mail className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={14} />
                                    <span className={cn(
                                        "text-sm",
                                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                                    )}>
                                        {contact.email}
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
                        </TableCell>
                        <TableCell>
                            {contact.tags && contact.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {contact.tags.slice(0, 2).map((tag, i) => (
                                        <Badge key={i} isDarkMode={isDarkMode} variant="primary" size="sm">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {contact.tags.length > 2 && (
                                        <Badge isDarkMode={isDarkMode} variant="default" size="sm">
                                            +{contact.tags.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <span className={cn(
                                    "text-sm",
                                    isDarkMode ? 'text-white/30' : 'text-slate-400'
                                )}>
                                    —
                                </span>
                            )}
                        </TableCell>
                        <TableCell>
                            {contact.is_blocked ? (
                                <Badge isDarkMode={isDarkMode} variant="danger" size="sm">
                                    <Shield size={12} className="mr-1" />
                                    Blocked
                                </Badge>
                            ) : (
                                <Badge isDarkMode={isDarkMode} variant="success" size="sm">
                                    Active
                                </Badge>
                            )}
                        </TableCell> */}
                        <TableCell align="center" width="300px">
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isView={true}
                                isEdit={true}
                                isDelete={true}
                                onView={() => onView(contact)}
                                onEdit={() => onEdit(contact)}
                                onDelete={() => onDelete(contact)}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

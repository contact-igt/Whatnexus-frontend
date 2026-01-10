
"use client";

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Ban, Building2, Users, Calendar, CheckCircle, XCircle, Clock, MessageCircle, Hospital } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { OrganizationModal } from "./organization-modal";
import { useActivatePromptMutation, useCreatePromptMutation, useGetPromptConfigurationQuery } from '@/hooks/usePromptQuery';
import { useCreateTenantMutation, useGetTenantsQuery } from '@/hooks/useTenantQuery';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

interface OrganizationViewProps {
    isDarkMode: boolean;
    // onNavigateToWhatsApp?: (organizationId: string) => void;
}

export interface Organization {
    id: string;
    name: string;
    email: string;
    mobile: string;
    address: string;
    subscriptionStatus: 'active' | 'expired' | 'trial';
    subscriptionPlan: 'basic' | 'pro' | 'enterprise';
    userCount: number;
    maxUsers: number;
    registeredDate: Date;
    expiryDate: Date;
    adminName: string;
    adminEmail: string;
    isActive: boolean;
    type: 'hospital' | 'clinic';
    country_code: string;
    password?: string; // Optional in interface as it might not be returned always, but needed for creation
    whatsappConfig?: {
        wabaId: string;
        phoneNumberId: string;
        accessToken: string;
        metaAppId: string;
        metaAppSecret?: string;
        isConnected: boolean;
        lastConnected?: Date;
        verificationStatus?: 'verified' | 'pending' | 'unverified';
    };
}

export const OrganizationView = () => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    // const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const { data: tenantsData, isLoading: isTenantLoading, isError } = useGetTenantsQuery();
    // const { mutate: createTenantMutate, isPending: isCreateTenantPending } = useCreateTenantMutation();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    // Load organizations from localStorage
    // useEffect(() => {
    //     const loadOrganizations = () => {
    //         const stored = localStorage.getItem('organizations');
    //         if (stored) {
    //             const parsed = JSON.parse(stored);
    //             const orgsWithDates = parsed.map((org: any) => ({
    //                 ...org,
    //                 registeredDate: new Date(org.registeredDate),
    //                 expiryDate: new Date(org.expiryDate)
    //             }));
    //             setOrganizations(orgsWithDates);
    //             setFilteredOrganizations(orgsWithDates);
    //         } else {
    //             // Mock data for initial display
    //             const mockOrganizations: Organization[] = [
    //                 {
    //                     id: '1',
    //                     name: 'City Eye Hospital',
    //                     email: 'admin@cityeye.com',
    //                     phone: '+91 98765 43210',
    //                     address: '123 Medical Street, Mumbai, Maharashtra',
    //                     subscriptionStatus: 'active',
    //                     subscriptionPlan: 'pro',
    //                     userCount: 25,
    //                     maxUsers: 50,
    //                     registeredDate: new Date(2025, 0, 15),
    //                     expiryDate: new Date(2026, 0, 15),
    //                     adminName: 'Dr. Rajesh Kumar',
    //                     adminEmail: 'rajesh@cityeye.com',
    //                     isActive: true
    //                 },
    //                 {
    //                     id: '2',
    //                     name: 'Vision Care Center',
    //                     email: 'contact@visioncare.com',
    //                     phone: '+91 98765 43211',
    //                     address: '456 Health Avenue, Delhi',
    //                     subscriptionStatus: 'trial',
    //                     subscriptionPlan: 'basic',
    //                     userCount: 8,
    //                     maxUsers: 10,
    //                     registeredDate: new Date(2025, 11, 1),
    //                     expiryDate: new Date(2026, 0, 1),
    //                     adminName: 'Dr. Priya Sharma',
    //                     adminEmail: 'priya@visioncare.com',
    //                     isActive: true
    //                 },
    //                 {
    //                     id: '3',
    //                     name: 'Advanced Eye Clinic',
    //                     email: 'info@advancedeye.com',
    //                     phone: '+91 98765 43212',
    //                     address: '789 Wellness Road, Bangalore',
    //                     subscriptionStatus: 'expired',
    //                     subscriptionPlan: 'enterprise',
    //                     userCount: 45,
    //                     maxUsers: 100,
    //                     registeredDate: new Date(2024, 5, 10),
    //                     expiryDate: new Date(2025, 11, 10),
    //                     adminName: 'Dr. Amit Patel',
    //                     adminEmail: 'amit@advancedeye.com',
    //                     isActive: false
    //                 }
    //             ];
    //             setOrganizations(mockOrganizations);
    //             setFilteredOrganizations(mockOrganizations);
    //             localStorage.setItem('organizations', JSON.stringify(mockOrganizations));
    //         }
    //         setIsLoading(false);
    //     };

    //     loadOrganizations();
    // }, []);

    // useEffect(() => {
    //     let filtered = tenantsData?.data;

    //     if (searchQuery.trim() !== '') {
    //         filtered = filtered.filter((org: any) =>
    //             org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //             org.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //             org.phone.includes(searchQuery) ||
    //             org.adminName.toLowerCase().includes(searchQuery.toLowerCase())
    //         );
    //     }

    //     if (filterStatus !== 'all') {
    //         filtered = filtered.filter((org: any) => org.subscriptionStatus === filterStatus);
    //     }

    //     setFilteredOrganizations(filtered);
    // }, [searchQuery, filterStatus, organizations]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-500 bg-emerald-500/10';
            case 'trial': return 'text-blue-500 bg-blue-500/10';
            case 'expired': return 'text-red-500 bg-red-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle size={14} />;
            case 'trial': return <Clock size={14} />;
            case 'expired': return <XCircle size={14} />;
            default: return <XCircle size={14} />;
        }
    };
    console.log("tenantsData", tenantsData)
    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'basic': return 'bg-slate-500/10 text-slate-600';
            case 'pro': return 'bg-purple-500/10 text-purple-600';
            case 'enterprise': return 'bg-amber-500/10 text-amber-600';
            default: return 'bg-slate-500/10 text-slate-600';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const handleToggleStatus = (id: string) => {
        const updated = organizations.map(org =>
            org.id === id ? { ...org, isActive: !org.isActive } : org
        );
        setOrganizations(updated);
        localStorage.setItem('organizations', JSON.stringify(updated));
        toast.success('Organization status updated');
    };

    const handleOpenModal = (mode: 'create' | 'edit' | 'view', org?: Organization) => {
        setModalMode(mode);
        setSelectedOrg(org || null);
        setIsModalOpen(true);
    };
    const handleNavigateToWhatsApp = (id: string) => {
        console.log("Navigate to WhatsApp", id)
        router.push(`/whatsapp-settings`);
    }
    const handleSaveOrganization = (orgData: Partial<Organization>) => {
        if (modalMode === 'create') {
            const newOrg: Organization = {
                ...orgData as Organization,
                id: Date.now().toString(),
                userCount: 0,
                registeredDate: new Date(),
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            };
            // Remove password from object before saving if needed, but for now keeping it simple as per request or just logging it
            console.log("Creating Org with password:", orgData.password);

            const updated = [newOrg, ...organizations];
            setOrganizations(updated);
            localStorage.setItem('organizations', JSON.stringify(updated));
            toast.success('Organization registered successfully');
        } else {
            const updated = organizations.map(org =>
                org.id === selectedOrg?.id ? { ...org, ...orgData } : org
            );
            setOrganizations(updated);
            localStorage.setItem('organizations', JSON.stringify(updated));
            toast.success('Organization updated successfully');
        }
        setIsModalOpen(false);
    };

    if (isTenantLoading) {
        return (
            <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-48 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Organizations
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Manage hospital registrations, subscriptions, and user access.
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <SearchInput
                            isDarkMode={isDarkMode}
                            placeholder="Search organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='flex-1'
                        />
                        <Select
                            isDarkMode={isDarkMode}
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'trial', label: 'Trial' },
                                { value: 'expired', label: 'Expired' }
                            ]}
                            className="max-w-[180px]"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('create')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                            isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                        )}
                    >
                        <Plus size={18} />
                        <span>Add Organization</span>
                    </button>
                </div>
            </div>
            <Table isDarkMode={isDarkMode}>
                {tenantsData?.data?.length === 0 ? (
                    <tbody>
                        <tr>
                            <td colSpan={7}>
                                <div className={cn(
                                    "text-center py-16",
                                    isDarkMode ? "text-white/40" : "text-slate-400"
                                )}>
                                    <Building2 className="mx-auto mb-4" size={48} />
                                    <p className="text-lg font-medium">No organizations found</p>
                                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                ) : (
                    <>
                        <TableHeader isDarkMode={isDarkMode}>
                            <tr>
                                <TableHead isDarkMode={isDarkMode}>Organization</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Admin</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Type</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Plan</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Users</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Status</TableHead>
                                <TableHead isDarkMode={isDarkMode}>Expiry</TableHead>
                                <TableHead isDarkMode={isDarkMode} align="right">Actions</TableHead>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {tenantsData?.data?.map((org: any, index: any) => (
                                <TableRow
                                    key={org.id}
                                    isDarkMode={isDarkMode}
                                    isLast={index === tenantsData?.data?.length - 1}
                                >
                                    {/* Organization */}
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                            )}>
                                                {org.type == "hospital" ? <Hospital className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-700")} size={20} /> : <Building2 className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-700")} size={20} />}
                                            </div>
                                            <div>
                                                <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {org.name}
                                                </p>
                                                <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                    {org.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Admin */}
                                    <TableCell>
                                        <p className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            {org.adminName}
                                        </p>
                                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                            {org.adminEmail ? org.adminEmail : org?.country_code + org?.mobile}
                                        </p>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        <p className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            {org.type}
                                        </p>
                                    </TableCell>

                                    {/* Plan */}
                                    <TableCell>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium uppercase inline-block",
                                            getPlanBadgeColor(org.subscriptionPlan)
                                        )}>
                                            {org.subscriptionPlan || 'basic'}
                                        </span>
                                    </TableCell>

                                    {/* Users */}
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Users className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                                {org.userCount} / {org.maxUsers} 1
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-0.5 rounded-full w-fit inline-block",
                                            !org.isActive
                                                ? isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                                : isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-100 text-red-700"
                                        )}>
                                            {!org.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </TableCell>

                                    {/* Expiry */}
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                                {formatDate(org.expiryDate)}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleOpenModal('view', org)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isDarkMode
                                                        ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                )}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', org)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isDarkMode
                                                        ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                )}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleNavigateToWhatsApp(org.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all relative",
                                                    org.whatsappConfig?.isConnected
                                                        ? isDarkMode
                                                            ? 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                                                            : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                                        : isDarkMode
                                                            ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                )}
                                                title={org.whatsappConfig?.isConnected ? 'WhatsApp Connected' : 'Connect WhatsApp'}
                                            >
                                                <MessageCircle size={16} />
                                                {org.whatsappConfig?.isConnected && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-current" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(org.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    org.isActive
                                                        ? isDarkMode
                                                            ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                                        : isDarkMode
                                                            ? 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                                                            : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                                )}
                                                title={org.isActive ? 'Suspend' : 'Activate'}
                                            >
                                                <Ban size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </>
                )}
            </Table>

            <OrganizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrganization}
                organization={selectedOrg}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
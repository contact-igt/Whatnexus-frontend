
"use client";
import { useState } from 'react';
import { UserPlus, Shield, MoreHorizontal, User, Mail, Phone, Lock, Globe, ChevronDown, Badge } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useCreateManagementMutation, useManagementQuery } from '@/hooks/useManagementQuery';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { RoleBasedWrapper } from '@/components/ui/role-based-wrapper';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { useCreateTenantUserMutation, useTenantUserQuery } from '@/hooks/useTenantUserQuery';

const formSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    country_code: z.string().min(2, { message: "Country code must be at least 2 characters." }),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export const TeamManagementView = () => {
    const { isDarkMode } = useTheme();
    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            "country_code": "+91"
        },
        resolver: zodResolver(formSchema)
    })
    // const { data: managementData, isLoading } = useManagementQuery();
    const {data: tenantUserData, isLoading} = useTenantUserQuery();
    const { mutate: createTenantUserMutate, isPending: createManagementLoading } = useCreateTenantUserMutation();

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const onSubmit = (data: FormData) => {
        createTenantUserMutate(data, {
            onSuccess: () => {
                reset();
                setIsInviteModalOpen(false);
            }
        });
    }
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await handleSubmit(onSubmit)(e);
    };
    const filteredManagementUsers  = tenantUserData?.data?.filter((user: any)=> user.role !== "super_admin" )
    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Agent Matrix</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Manage shared inbox permissions and neural layer overrides.</p>
                </div>
                <RoleBasedWrapper allowedRoles={['tenant_admin', 'super_admin']}>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center space-x-2"
                    >
                        <UserPlus size={16} />
                        <span>Invite Node</span>
                    </button>
                </RoleBasedWrapper>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <GlassCard isDarkMode={isDarkMode} className="p-0">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
                            <h3 className="font-bold uppercase tracking-tight text-sm">Active Nodes</h3>
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">4 Human Shards</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                                        <th className="px-8 py-4">Identity</th>
                                        <th className="px-8 py-4">Pulse</th>
                                        <th className="px-8 py-4 text-center">Load</th>
                                        <th className="px-8 py-4">Security Role</th>
                                        <th className="px-8 py-4 text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <tr key={index} className="animate-pulse">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={cn("w-9 h-9 rounded-xl", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                        <div className={cn("h-4 w-24 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={cn("w-2 h-2 rounded-full", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                        <div className={cn("h-3 w-16 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <div className={cn("h-4 w-12 rounded mx-auto", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className={cn("h-5 w-20 rounded-lg", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </td>
                                                {/* <td className="px-8 py-4 text-right">
                                                    <div className={cn("h-8 w-8 rounded ml-auto", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </td> */}
                                            </tr>
                                        ))
                                    ) : filteredManagementUsers?.length > 0 ? (
                                        filteredManagementUsers?.map((agent: any) => (
                                            <tr key={agent.id} className="group transition-all hover:bg-emerald-500/5">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-white/10 group-hover:rotate-6 transition-transform shadow-lg">{!agent?.username ? agent?.username?.split("")[0].toUpperCase() : <User size={16} />}</div>
                                                        <span className={cn("text-sm font-semibold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-800')}>{agent?.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={cn("w-2 h-2 rounded-full", agent.status === 'Online' ? 'bg-emerald-500 animate-pulse' : agent?.status === 'Busy' ? 'bg-orange-500' : 'bg-slate-600')} />
                                                        <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/50' : 'text-slate-500')}>{agent?.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className={cn("text-xs font-bold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>{Math.floor(Math.random() * 10)} / 15</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={cn("text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide", agent.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20')}>{agent?.role}</span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <RoleBasedWrapper allowedRoles={['admin', 'super_admin']}>
                                                        <button className="p-2 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                                                    </RoleBasedWrapper>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center">
                                                <p className={cn("text-sm font-medium", isDarkMode ? 'text-white/40' : 'text-slate-400')}>No team members found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <RoleBasedWrapper allowedRoles={['admin', 'super_admin']}>
                        <GlassCard isDarkMode={isDarkMode} className="p-6 space-y-6">
                            <div className="flex items-center space-x-2.5 text-emerald-500">
                                <Shield size={20} className="animate-pulse" />
                                <h3 className="font-bold text-base uppercase tracking-tight">Permission Matrix</h3>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-wide">Define global overrides for human agents vs neural Receptionist.</p>

                            <div className="space-y-3 pt-3 border-t border-white/5">
                                {[
                                    { label: "Override AI Conversation", active: true },
                                    { label: "Mass Broadcast Access", active: true },
                                    { label: "Modify Knowledge Base", active: false },
                                    { label: "Delete Customer Data", active: false },
                                    { label: "Configure API Logic", active: false },
                                ].map((perm, i) => (
                                    <div key={i} className={cn("p-3 rounded-xl border flex items-center justify-between transition-all group/item", isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:border-emerald-500/10')}>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/80' : 'text-slate-700')}>{perm.label}</span>
                                        <button className={cn("w-9 h-5 rounded-full relative transition-all duration-300", perm.active ? 'bg-emerald-600' : 'bg-slate-700')}>
                                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300", perm.active ? 'right-0.5' : 'left-0.5 shadow-sm')} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-wide hover:bg-white/5 transition-all">Reset All Permissions</button>
                        </GlassCard>
                    </RoleBasedWrapper>
                </div>
            </div>

            <Modal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                title="Invite New Node"
                description="Add a new team member to your agent matrix"
                isDarkMode={isDarkMode}
                className="max-w-2xl"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            form="invite-form"
                            disabled={createManagementLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20",
                                createManagementLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                            )}
                        >
                            {createManagementLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                }
            >
                <form id="invite-form" autoComplete="off" onSubmit={handleFormSubmit} className="space-y-5">
                    <Input
                        isDarkMode={isDarkMode}
                        label=" Username"
                        {...register('username')}
                        icon={User}
                        placeholder="Enter username"
                        disabled={createManagementLoading}
                        error={errors.username?.message}
                        required
                    />
                    <Controller
                        name="country_code"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Country Code"
                                value={field.value}
                                onChange={field.onChange}
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: '+91', label: 'India (+91)' },
                                    { value: '+1', label: 'USA (+1)' },
                                    { value: '+44', label: 'UK (+44)' },
                                    { value: '+971', label: 'UAE (+971)' }
                                ]}
                                disabled={createManagementLoading}
                                error={errors.country_code?.message}

                            />
                        )} />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Mobile Number"
                        {...register('mobile')}
                        icon={Phone}
                        placeholder="+91 1234567890"
                        disabled={createManagementLoading}
                        error={errors.mobile?.message}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Email"
                        {...register('email')}
                        icon={Mail}
                        placeholder="Enter email"
                        disabled={createManagementLoading}
                        error={errors.email?.message}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Password"
                        {...register('password')}
                        icon={Lock}
                        placeholder="Enter password"
                        disabled={createManagementLoading}
                        error={errors.password?.message}
                        required
                    />
                </form>
            </Modal>
        </div>
    );
};
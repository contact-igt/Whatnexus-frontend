
"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Loader2, Check, Shield, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const teamUserSchema = z.object({
    username: z.string().trim().min(2, "Username must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
    country_code: z.string().default("+91"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    role: z.enum(["staff", "agent", "doctor", "tenant_admin"], { message: "Role is required" }),
    status: z.string().optional(),
});

type TeamUserFormValues = z.infer<typeof teamUserSchema>;

interface TeamUserDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
    onSubmit: (data: any) => Promise<void>;
    isSaving: boolean;
}

export const TeamUserDrawer = ({
    isOpen,
    onClose,
    user,
    mode,
    isDarkMode,
    onSubmit,
    isSaving
}: TeamUserDrawerProps) => {

    const { control, register, handleSubmit, reset, formState: { errors }, watch } = useForm<TeamUserFormValues>({
        resolver: zodResolver(teamUserSchema) as any,
        defaultValues: {
            username: '',
            email: '',
            country_code: '+91',
            mobile: '',
            role: 'staff',
            status: 'active'
        }
    });

    const formData = watch();

    useEffect(() => {
        if (user && (mode === 'view' || mode === 'edit')) {
            let mobile = user.mobile || '';
            let countryCode = user.country_code || '+91';

            // Normalize country code
            if (!countryCode.startsWith('+')) countryCode = `+${countryCode}`;

            const knownCodes = ['+91', '+1', '+44', '+971'];
            let foundCode = false;

            if (mobile.startsWith(countryCode)) {
                mobile = mobile.slice(countryCode.length).trim();
                foundCode = true;
            } else {
                for (const code of knownCodes) {
                    if (mobile.startsWith(code)) {
                        countryCode = code;
                        mobile = mobile.slice(code.length).trim();
                        foundCode = true;
                        break;
                    }
                }
            }

            reset({
                username: user.username || '',
                email: user.email || '',
                country_code: countryCode,
                mobile: mobile,
                role: user.role || 'staff',
                status: user.status || 'active'
            });
        } else if (mode === 'create') {
            reset({
                username: '',
                email: '',
                country_code: '+91',
                mobile: '',
                role: 'staff',
                status: 'active'
            });
        }
    }, [user, mode, isOpen, reset]);

    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const dialogTitle = isCreate ? 'Invite New Node' : isEdit ? 'Edit Node' : 'Node Details';
    const dialogDescription = isCreate
        ? 'Add a new team member to your agent matrix.'
        : isEdit
            ? 'Update node information and permissions.'
            : 'View node information.';

    const handleFormSubmit = async (data: TeamUserFormValues) => {
        await onSubmit(data);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={dialogTitle}
            description={dialogDescription}
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans",
                isDarkMode ? 'bg-black' : 'bg-white'
            )}
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            isDarkMode
                                ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button
                            onClick={handleSubmit(handleFormSubmit)}
                            disabled={isSaving}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                isDarkMode
                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
                            )}
                        >
                            {isSaving && <Loader2 className="animate-spin" size={14} />}
                            <span>{isCreate ? 'Send Invite' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {isView ? (
                    <div className="space-y-6">
                        {/* Profile Header in View Mode */}
                        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-2xl transition-transform hover:scale-110 duration-500",
                                isDarkMode ? "bg-emerald-600 text-white border-2 border-emerald-500/30" : "bg-slate-900 text-white border-2 border-slate-700"
                            )}>
                                {user?.username?.charAt(0).toUpperCase() || <User size={32} />}
                            </div>
                            <div>
                                <h3 className={cn("text-xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                    {user?.username}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        user?.status === 'active' 
                                            ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                                            : (isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-slate-100 text-slate-600 border-slate-200")
                                    )}>
                                        {user?.status || 'Inactive'}
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        isDarkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"
                                    )}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={cn("text-[10px] uppercase font-bold tracking-widest block mb-1.5 opacity-40", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        Email Identity
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="opacity-40" />
                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                            {user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className={cn("text-[10px] uppercase font-bold tracking-widest block mb-1.5 opacity-40", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        Secure Link
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="opacity-40" />
                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                            {user?.country_code} {user?.mobile}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Username"
                            {...register('username')}
                            icon={User}
                            placeholder="Enter username"
                            disabled={isSaving}
                            error={errors.username?.message}
                            required
                        />

                        <Input
                            isDarkMode={isDarkMode}
                            label="Email"
                            {...register('email')}
                            icon={Mail}
                            placeholder="Enter email address"
                            disabled={isSaving || isEdit}
                            error={errors.email?.message}
                            required
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <Controller
                                name="country_code"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Code"
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { value: '+91', label: '+91' },
                                            { value: '+1', label: '+1' },
                                            { value: '+44', label: '+44' },
                                            { value: '+971', label: '+971' }
                                        ]}
                                        disabled={isSaving}
                                        error={errors.country_code?.message}
                                        required
                                    />
                                )}
                            />

                            <Input
                                isDarkMode={isDarkMode}
                                label="Mobile Number"
                                {...register('mobile')}
                                icon={Phone}
                                placeholder="10-digit mobile"
                                disabled={isSaving}
                                error={errors.mobile?.message}
                                wrapperClassName="col-span-2"
                                required
                            />
                        </div>

                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Security Role"
                                    value={field.value}
                                    onChange={field.onChange}
                                    isDarkMode={isDarkMode}
                                    options={[
                                        { value: 'staff', label: 'Staff' },
                                        { value: 'agent', label: 'Agent' },
                                        { value: 'doctor', label: 'Doctor' },
                                        ...(user?.role === 'tenant_admin' ? [{ value: 'tenant_admin', label: 'Admin (Node Controller)' }] : [])
                                    ]}
                                    disabled={isSaving}
                                    error={errors.role?.message}
                                    required
                                />
                            )}
                        />
                    </div>
                )}
            </div>
        </Drawer>
    );
};

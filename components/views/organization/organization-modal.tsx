
"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Organization } from "./organization-view";
import { Building2, Mail, Phone, MapPin, User, Users, Calendar, Lock, Globe, Stethoscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTenantMutation, useUpdateTenantMutation } from "@/hooks/useTenantQuery";

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (org: Partial<Organization>) => void;
    organization?: Organization | null;
    mode: 'create' | 'edit' | 'view';
    isDarkMode: boolean;
}

export const OrganizationModal = ({
    isOpen,
    onClose,
    onSave,
    organization,
    mode,
    isDarkMode
}: OrganizationModalProps) => {
    const [formData, setFormData] = useState<Partial<Organization>>({
        company_name: '',
        owner_name: '',
        owner_email: '',
        owner_mobile: '',
        address: '',
        subscriptionStatus: 'trial',
        subscriptionPlan: 'basic',
        maxUsers: 10,
        adminName: '',
        adminEmail: '',
        isActive: true,
        type: 'hospital',
        owner_country_code: '+91',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { mutate: createTenantMutate, isPending: isCreateTenantPending } = useCreateTenantMutation();
    const { mutate: updateTenantMutate, isPending: isUpdateTenantPending } = useUpdateTenantMutation();



    useEffect(() => {
        if (organization && (mode === 'edit' || mode === 'view')) {
            setFormData(organization);
        } else {
            setFormData({
                company_name: '',
                owner_name: '',
                owner_email: '',
                owner_mobile: '',
                address: '',
                subscriptionStatus: 'trial',
                subscriptionPlan: 'basic',
                maxUsers: 10,
                adminName: '',
                adminEmail: '',
                isActive: true,
                type: 'hospital',
                owner_country_code: '+91',
                password: ''
            });
        }
        setErrors({});
    }, [organization, mode, isOpen]);

    const handleChange = (field: keyof Organization, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.company_name?.trim()) newErrors.company_name = "Organization name is required";
        if (!formData.owner_name?.trim()) newErrors.owner_name = "Owner name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.owner_email?.trim()) {
            newErrors.owner_email = "Email is required";
        } else if (!emailRegex.test(formData.owner_email)) {
            newErrors.owner_email = "Invalid email address";
        }

        // if (!formData.adminName?.trim()) newErrors.adminName = "Admin name is required";
        // if (!formData.adminEmail?.trim()) newErrors.adminEmail = "Admin email is required";
        // if (mode === 'create' && !formData.password?.trim()) newErrors.password = "Password is required";
        if (!formData.owner_country_code) newErrors.owner_country_code = "Country code is required";

        if (!formData.owner_mobile?.trim()) {
            newErrors.owner_mobile = "mobile number is required";
        } else if (!/^\d+$/.test(formData.owner_mobile)) {
            newErrors.owner_mobile = "mobile number must contain only digits";
        } else if (formData.owner_mobile.length < 10 || formData.owner_mobile.length > 12) {
            newErrors.owner_mobile = "mobile number must be between 10 and 12 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            if (mode === 'create') {
                createTenantMutate(formData, {
                    onSuccess: () => {
                        onClose();
                    }
                });
            } else if (mode === 'edit' && organization?.id) {
                updateTenantMutate({ id: organization.id, data: formData }, {
                    onSuccess: () => {
                        onClose();
                    }
                });
            }
        }
    };

    const isView = mode === 'view';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? "Add Organization" : mode === 'edit' ? "Edit Organization" : "Organization Details"}
            description={mode === 'create' ? "Register a new hospital or clinic" : "View and manage organization details"}
            isDarkMode={isDarkMode}
            className="font-sans"
            footer={
                !isView && (
                    <div className="flex justify-end font-sans space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isCreateTenantPending || isUpdateTenantPending}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCreateTenantPending || isUpdateTenantPending}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {(isCreateTenantPending || isUpdateTenantPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'create'
                                ? (isCreateTenantPending ? 'Registering...' : 'Register Organization')
                                : (isUpdateTenantPending ? 'Saving...' : 'Save Changes')}
                        </button>
                    </div>
                )
            }
        >
            <div className="space-y-6 font-sans">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* <div className="col-span-full">
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>
                            Organization Details
                        </h3>
                    </div> */}

                    <Input
                        autoComplete="new-password"
                        isDarkMode={isDarkMode}
                        label="Organization Name"
                        icon={Building2}
                        placeholder="e.g. City Eye Hospital"
                        value={formData.company_name}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                        error={errors.company_name}
                        disabled={isView}
                        required
                    />
                    <Input
                        autoComplete="new-password"
                        isDarkMode={isDarkMode}
                        label="Organization Owner"
                        icon={Building2}
                        placeholder="e.g. Hospital"
                        value={formData.owner_name}
                        onChange={(e) => handleChange('owner_name', e.target.value)}
                        error={errors.owner_name}
                        disabled={isView}
                        required
                    />
                    <Input
                        autoComplete="new-password"
                        isDarkMode={isDarkMode}
                        label="Email Address"
                        icon={Mail}
                        placeholder="contact@hospital.com"
                        value={formData.owner_email}
                        onChange={(e) => handleChange('owner_email', e.target.value)}
                        error={errors.owner_email}
                        disabled={isView}
                        required
                    />
                    <div className="grid grid-cols-3 gap-4">
                        <Select
                            isDarkMode={isDarkMode}
                            label="Country Code"
                            value={formData.owner_country_code || '+91'}
                            onChange={(value) => handleChange('owner_country_code', value)}
                            options={[
                                { value: '+91', label: 'India (+91)' },
                                { value: '+1', label: 'USA (+1)' },
                                { value: '+44', label: 'UK (+44)' },
                                { value: '+971', label: 'UAE (+971)' }
                            ]}
                            disabled={isView}
                            className="col-span-1"
                            error={errors.country_code}
                            required
                        />
                        <Input
                            isDarkMode={isDarkMode}
                            label="Mobile Number"
                            icon={Phone}
                            placeholder="+91 98765 43210"
                            value={formData.owner_mobile}
                            wrapperClassName="col-span-2"
                            onChange={(e) => handleChange('owner_mobile', e.target.value)}
                            disabled={isView}
                            error={errors.owner_mobile}
                            required
                        />
                    </div>
                    <Select
                        isDarkMode={isDarkMode}
                        label="Type"
                        value={formData.type || 'hospital'}
                        onChange={(value) => handleChange('type', value)}
                        options={[
                            { value: 'hospital', label: 'Hospital' },
                            { value: 'clinic', label: 'Clinic' }
                        ]}
                        disabled={isView}
                        required
                    />

                    {/* {mode === 'create' && (
                        <Input
                            autoComplete="new-password"
                            isDarkMode={isDarkMode}
                            label="Password"
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            error={errors.password}
                            required
                        />
                    )} */}

                    {/* <Select
                        isDarkMode={isDarkMode}
                        label="Subscription Plan"
                        value={formData.subscriptionPlan}
                        onChange={(value) => handleChange('subscriptionPlan', value)}
                        options={[
                            { value: 'basic', label: 'Basic Plan' },
                            { value: 'pro', label: 'Pro Plan' },
                            { value: 'enterprise', label: 'Enterprise Plan' }
                        ]}
                        disabled={isView}
                        required
                    /> */}

                    {/* <div className="col-span-full">
                        <Textarea
                            isDarkMode={isDarkMode}
                            label="Address"
                            icon={MapPin}
                            placeholder="Full address of the organization"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            disabled={isView}
                            rows={3}
                        />
                    </div> */}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="col-span-full">
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>
                            Administrator Details
                        </h3>
                    </div>

                    <Input
                        isDarkMode={isDarkMode}
                        label="Admin Name"
                        icon={User}
                        placeholder="Dr. Name"
                        value={formData.adminName}
                        onChange={(e) => handleChange('adminName', e.target.value)}
                        error={errors.adminName}
                        disabled={isView}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Admin Email"
                        icon={Mail}
                        placeholder="admin@hospital.com"
                        value={formData.adminEmail}
                        onChange={(e) => handleChange('adminEmail', e.target.value)}
                        error={errors.adminEmail}
                        disabled={isView}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Max Users Allowed"
                        icon={Users}
                        type="number"
                        placeholder="e.g. 10"
                        value={formData.maxUsers}
                        onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))}
                        disabled={isView}
                        required
                    />

                    <Select
                        isDarkMode={isDarkMode}
                        label="Status"
                        value={formData.subscriptionStatus}
                        onChange={(value) => handleChange('subscriptionStatus', value)}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'trial', label: 'Trial' },
                            { value: 'expired', label: 'Expired' }
                        ]}
                        disabled={isView}
                        required
                    />
                </div> */}
            </div>
        </Modal>
    );
};


"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Organization } from "./organizationView";
import { Building2, Mail, Phone, MapPin, User, Users, Calendar, Lock, Globe, Stethoscope, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTenantMutation, useUpdateTenantMutation } from "@/hooks/useTenantQuery";
import { Country, State, City } from 'country-state-city';

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization?: Organization | null;
    mode: 'create' | 'edit' | 'view';
    isDarkMode: boolean;
}

export const OrganizationModal = ({
    isOpen,
    onClose,
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
        city: '',
        country: '',
        state: '',
        pincode: '',
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
    // ISO codes used to drive cascading dropdowns
    const [countryIso, setCountryIso] = useState('');
    const [stateIso, setStateIso] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { mutate: createTenantMutate, isPending: isCreateTenantPending } = useCreateTenantMutation();
    const { mutate: updateTenantMutate, isPending: isUpdateTenantPending } = useUpdateTenantMutation();

    // Derived Location Options
    const countryOptions = Country.getAllCountries().map(c => ({
        label: c.name,
        value: c.isoCode
    }));

    const stateOptions = countryIso
        ? State.getStatesOfCountry(countryIso).map(s => ({
            label: s.name,
            value: s.isoCode
        }))
        : [];

    const cityOptions = (countryIso && stateIso)
        ? City.getCitiesOfState(countryIso, stateIso).map(c => ({
            label: c.name,
            value: c.name
        }))
        : [];

    useEffect(() => {
        if (organization && (mode === 'edit' || mode === 'view')) {
            let profileData = {};
            try {
                if (typeof organization.profile === 'string') {
                    profileData = JSON.parse(organization.profile);
                } else if (typeof organization.profile === 'object') {
                    profileData = organization.profile || {};
                }
            } catch (e) {
                console.error("Failed to parse profile JSON", e);
            }

            // Resolve stored country name → ISO code for driving dependent dropdowns
            const storedCountry = (organization as any).country || '';
            const storedState = (organization as any).state || '';

            // Try to find matching ISO code from stored value (could be ISO already or full name)
            const matchedCountry = Country.getAllCountries().find(
                c => c.isoCode.toUpperCase() === storedCountry.toUpperCase() ||
                    c.name.toLowerCase() === storedCountry.toLowerCase()
            );
            const resolvedCountryIso = matchedCountry?.isoCode || storedCountry;

            const matchedState = resolvedCountryIso
                ? State.getStatesOfCountry(resolvedCountryIso).find(
                    s => s.isoCode.toUpperCase() === (storedState || "").toUpperCase() ||
                        s.name.toLowerCase() === (storedState || "").toLowerCase()
                ) : undefined;
            const resolvedStateIso = matchedState?.isoCode || storedState;

            setCountryIso(resolvedCountryIso);
            setStateIso(resolvedStateIso);

            // Normalize all API field aliases into formData keys
            const org = organization as any;
            setFormData({
                ...org,
                ...profileData,
                // Location fields — store ISO codes in form for dropdown driving
                country: resolvedCountryIso,
                state: resolvedStateIso,
                city: org.city || '',
                pincode: org.pincode || '',
                address: org.address || '',
                // Status — API may return 'status' or 'tenant_status'
                subscriptionStatus: (org.tenant_status || org.status || org.subscriptionStatus || 'active').toLowerCase(),
                // Plan — API returns 'subscription_plan', form uses 'subscriptionPlan'
                subscriptionPlan: (org.subscription_plan || org.subscriptionPlan || 'basic').toLowerCase(),
                // Users — API returns 'max_users', form uses 'maxUsers'
                maxUsers: Number(org.max_users ?? org.maxUsers ?? 10),
                // Phone
                owner_country_code: org.owner_country_code || '+91',
                owner_mobile: org.owner_mobile || '',
            });
        } else {
            setCountryIso('');
            setStateIso('');
            setFormData({
                company_name: '',
                owner_name: '',
                owner_email: '',
                owner_mobile: '',
                address: '',
                city: '',
                country: '',
                state: '',
                pincode: '',
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
        const sanitizedValue = field === 'owner_mobile' ? value.replace(/\D/g, '') : value;
        setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
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
            newErrors.owner_mobile = "Mobile number is required";
        } else if (!/^\d{7,15}$/.test(formData.owner_mobile)) {
            newErrors.owner_mobile = "Mobile number must be 7-15 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            // Resolve ISO codes to full names for storage
            const selectedCountry = Country.getAllCountries().find(c => c.isoCode === formData.country);
            const selectedState = countryIso
                ? State.getStatesOfCountry(countryIso).find(s => s.isoCode === formData.state)
                : undefined;

            const { address, city, country, state, pincode, maxUsers, subscriptionPlan, profile, ...rest } = formData;
            const submitData = {
                ...rest,
                address,
                city,
                country: selectedCountry?.name || country, // store full name
                state: selectedState?.name || state,       // store full name
                pincode,
                maxUsers,
                subscriptionPlan,
                profile: profile ? JSON.stringify(profile) : null,
                subscription_start_date: (organization as any)?.subscription_start_date,
                subscription_end_date: (organization as any)?.subscription_end_date,
            };

            if (mode === 'create') {
                createTenantMutate(submitData, {
                    onSuccess: () => {
                        onClose();
                    }
                });
            } else if (mode === 'edit' && (organization?.id || organization?.tenant_id)) {
                updateTenantMutate({ tenantId: organization.tenant_id, data: submitData }, {
                    onSuccess: () => {
                        onClose();
                    }
                });
            }
        }
    };

    const isView = mode === 'view';

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? "Add Organization" : mode === 'edit' ? "Edit Organization" : "Organization Details"}
            description={mode === 'create' ? "Register a new hospital or clinic" : "View and manage organization details"}
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? 'bg-black' : 'bg-white'
            )}
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
                            value={formData.owner_country_code ? (formData.owner_country_code.toString().startsWith('+') ? formData.owner_country_code : `+${formData.owner_country_code}`) : '+91'}
                            onChange={(value) => handleChange('owner_country_code', value)}
                            options={[
                                { value: '+91', label: 'India (+91)' },
                                { value: '+1', label: 'USA (+1)' },
                                { value: '+44', label: 'UK (+44)' },
                                { value: '+971', label: 'UAE (+971)' },
                                { value: '+61', label: 'Australia (+61)' },
                                { value: '+65', label: 'Singapore (+65)' },
                                { value: '+60', label: 'Malaysia (+60)' },
                                { value: '+966', label: 'Saudi Arabia (+966)' },
                                { value: '+974', label: 'Qatar (+974)' },
                                { value: '+49', label: 'Germany (+49)' },
                                { value: '+33', label: 'France (+33)' },
                                { value: '+81', label: 'Japan (+81)' },
                                { value: '+82', label: 'S. Korea (+82)' },
                                { value: '+55', label: 'Brazil (+55)' },
                                { value: '+27', label: 'South Africa (+27)' },
                            ]}
                            disabled={isView}
                            className="col-span-1"
                            error={errors.owner_country_code}
                            required
                        />
                        <Input
                            isDarkMode={isDarkMode}
                            label="Mobile Number"
                            icon={Phone}
                            placeholder="9876543210"
                            value={formData.owner_mobile}
                            wrapperClassName="col-span-2"
                            onChange={(e) => handleChange('owner_mobile', e.target.value.replace(/\D/g, ''))}
                            disabled={isView}
                            error={errors.owner_mobile}
                            required
                            maxLength={15}
                        />
                    </div>
                    <Select
                        isDarkMode={isDarkMode}
                        label="Type"
                        value={formData.type || 'hospital'}
                        onChange={(value) => handleChange('type', value)}
                        options={[
                            { value: 'hospital', label: 'Hospital' },
                            { value: 'clinic', label: 'Clinic' },
                            { value: 'organization', label: 'Organization' }
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

                    <Select
                        isDarkMode={isDarkMode}
                        label="Subscription Plan"
                        value={formData.subscriptionPlan || 'basic'}
                        onChange={(value) => handleChange('subscriptionPlan', value)}
                        options={[
                            { value: 'basic', label: 'Basic Plan' },
                            { value: 'pro', label: 'Pro Plan' },
                            { value: 'enterprise', label: 'Enterprise Plan' }
                        ]}
                        disabled={isView}
                        required
                    />

                    <div className="col-span-full">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Address"
                            icon={MapPin}
                            placeholder="Full address of the organization"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            disabled={isView}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-full">
                        <Select
                            isDarkMode={isDarkMode}
                            label="Country"
                            value={formData.country || ''}
                            onChange={(value) => {
                                setCountryIso(value);
                                setStateIso('');
                                handleChange('country', value);
                                handleChange('state', '');
                                handleChange('city', '');
                            }}
                            options={countryOptions}
                            disabled={isView}
                        />

                        <Select
                            isDarkMode={isDarkMode}
                            label="State / Province"
                            value={formData.state || ''}
                            onChange={(value) => {
                                setStateIso(value);
                                handleChange('state', value);
                                handleChange('city', '');
                            }}
                            options={stateOptions}
                            disabled={isView || !countryIso || stateOptions.length === 0}
                        />

                        <Select
                            isDarkMode={isDarkMode}
                            label="City / Town"
                            value={formData.city || ''}
                            onChange={(value) => handleChange('city', value)}
                            options={cityOptions}
                            disabled={isView || !stateIso || cityOptions.length === 0}
                        />

                        <Input
                            isDarkMode={isDarkMode}
                            label="Pincode / Zip Code"
                            icon={MapPin}
                            placeholder="e.g. 00000"
                            value={formData.pincode}
                            onChange={(e) => handleChange('pincode', e.target.value)}
                            disabled={isView}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="col-span-full">
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>
                            Management Details
                        </h3>
                    </div>

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
                            { value: 'invited', label: 'Invited' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'expired', label: 'Expired' },
                            { value: 'suspended', label: 'Suspended' },
                            { value: 'pending_setup', label: 'Pending Setup' },
                            { value: 'grace_period', label: 'Grace Period' },
                            { value: 'maintenance', label: 'Maintenance' },
                        ]}
                        disabled={isView}
                        required
                    />
                </div>
            </div>
        </Drawer>
    );
};

"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Edit2, X, Check, Building2, MapPin, ShieldCheck, Globe, Navigation, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useUpdateTenantUserMutation, useGetTenantProfileQuery } from '@/hooks/useTenantUserQuery';
import { updateUserData } from '@/redux/slices/auth/authSlice';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Country, State } from 'country-state-city';
import { useUpdateTenantOrganizationMutation } from '@/hooks/useTenantUserQuery';

// Form Schema
const editProfileSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    country_code: z.string().min(2, { message: "Country code is required." }),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
    // Organization fields
    company_name: z.string().min(2, { message: "Organization name is required." }),
    type: z.enum(['hospital', 'clinic']),
    address: z.string().min(5, { message: "Address is too short." }),
    country: z.string().min(1, { message: "Country is required." }),
    state: z.string().min(1, { message: "State is required." }),
    city: z.string().min(2, { message: "City is required." }),
    pincode: z.string().min(4, { message: "Pincode is required." }),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

export default function TenantProfileView() {
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isEditMode, setIsEditMode] = useState(false);
    const [countryIso, setCountryIso] = useState('');
    const [stateIso, setStateIso] = useState('');

    const { mutate: updateProfile, isPending: isUpdatingUser } = useUpdateTenantUserMutation();
    const { mutate: updateOrganization, isPending: isUpdatingOrg } = useUpdateTenantOrganizationMutation();
    const isUpdating = isUpdatingUser || isUpdatingOrg;
    const { data: profileData, refetch: refetchProfile } = useGetTenantProfileQuery();

    const { control, register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EditProfileData>({
        defaultValues: {
            username: user?.username || user?.name || '',
            country_code: user?.country_code?.startsWith('+') ? user?.country_code : `+${user?.country_code || '91'}`,
            mobile: user?.mobile || '',
            company_name: user?.organization?.company_name || '',
            type: user?.organization?.type || 'hospital',
            address: user?.organization?.address || '',
            country: user?.organization?.country || '',
            state: user?.organization?.state || '',
            city: user?.organization?.city || '',
            pincode: user?.organization?.pincode || '',
        },
        resolver: zodResolver(editProfileSchema)
    });

    const onSubmit = (data: EditProfileData) => {
        const tenantUserId = user?.tenant_user_id;
        if (!tenantUserId) {
            return;
        }

        // Prepare user update data
        const userData = {
            username: data.username,
            country_code: data.country_code,
            mobile: data.mobile
        };

        // Prepare organization update data
        const orgData = {
            company_name: data.company_name,
            type: data.type,
            address: data.address,
            country: data.country,
            state: data.state,
            city: data.city,
            pincode: data.pincode
        };

        // Run both mutations
        const userUpdatePromise = new Promise((resolve, reject) => {
            updateProfile({ tenantUserId, data: userData }, { onSuccess: resolve, onError: reject });
        });

        const orgUpdatePromise = new Promise((resolve, reject) => {
            updateOrganization(orgData, { onSuccess: resolve, onError: reject });
        });

        Promise.all([userUpdatePromise, orgUpdatePromise]).then(async () => {
            setIsEditMode(false);
            const result = await refetchProfile();
            if (result.data?.data) {
                dispatch(updateUserData(result.data.data));
            }
        }).catch(() => {
            // Errors are handled by the mutation toast
        });
    };

    const handleCancel = () => {
        setIsEditMode(false);
    };

    // Sync form values when entering edit mode or user data changes
    useEffect(() => {
        if (user) {
            const rawCountryCode = user?.country_code || '+91';
            const normalizedCountryCode = rawCountryCode.startsWith('+') ? rawCountryCode : `+${rawCountryCode}`;

            reset({
                username: user?.username || user?.name || '',
                country_code: normalizedCountryCode,
                mobile: user?.mobile || '',
                company_name: user?.organization?.company_name || '',
                type: user?.organization?.type || 'hospital',
                address: user?.organization?.address || '',
                country: user?.organization?.country || '',
                state: user?.organization?.state || '',
                city: user?.organization?.city || '',
                pincode: user?.organization?.pincode || '',
            });

            // Set ISO codes for selects if we can resolve them
            if (user?.organization?.country) {
                const c = Country.getAllCountries().find(count => count.name.toLowerCase() === user.organization.country.toLowerCase());
                if (c) {
                    setCountryIso(c.isoCode);
                    if (user?.organization?.state) {
                        const s = State.getStatesOfCountry(c.isoCode).find(st => st.name.toLowerCase() === user.organization.state.toLowerCase());
                        if (s) setStateIso(s.isoCode);
                    }
                }
            }
        }
    }, [user, reset]);

    const handleCountryChange = (countryName: string) => {
        const c = Country.getAllCountries().find(count => count.name === countryName);
        if (c) {
            setCountryIso(c.isoCode);
            setValue('state', '');
            setValue('city', '');
            setStateIso('');
        }
    };

    const handleStateChange = (stateName: string) => {
        if (!countryIso) return;
        const s = State.getStatesOfCountry(countryIso).find(st => st.name === stateName);
        if (s) {
            setStateIso(s.isoCode);
            setValue('city', '');
        }
    };

    // Fetch and update profile data on mount
    useEffect(() => {
        if (profileData?.data) {
            dispatch(updateUserData(profileData.data));
        }
    }, [profileData, dispatch]);

    return (
        <div className={cn(
            "h-screen overflow-y-auto p-6 pb-32 no-scrollbar",
            isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
        )}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={cn(
                        "text-3xl font-bold mb-2",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        Profile Settings
                    </h1>
                    <p className={cn(
                        "text-sm",
                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                    )}>
                        Manage your account information and preferences
                    </p>
                </div>

                {/* Profile Card */}
                <div className={cn(
                    "rounded-2xl border p-8",
                    isDarkMode
                        ? 'bg-slate-900/50 border-white/10 backdrop-blur-xl'
                        : 'bg-white border-slate-200 shadow-xl'
                )}>
                    {/* Avatar and Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-3xl text-white shadow-xl shadow-emerald-500/20">
                                {(user?.username || user?.name)?.charAt(0).toUpperCase() || <User size={32} />}
                            </div>
                            <div>
                                <h2 className={cn(
                                    "text-2xl font-bold",
                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                )}>
                                    {user?.username || user?.name || 'N/A'}
                                </h2>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wide",
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    )}>
                                        {user?.role || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isEditMode && (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className={cn(
                                    "px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2",
                                    "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                )}
                            >
                                <Edit2 size={16} />
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>

                    {/* Profile Content */}
                    {isEditMode ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <Input
                                isDarkMode={isDarkMode}
                                label="Username"
                                {...register('username')}
                                icon={User}
                                placeholder="Enter username"
                                disabled={isUpdating}
                                error={errors.username?.message}
                                required
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <Controller
                                    name="country_code"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isDarkMode={isDarkMode}
                                            label="Country Code"
                                            value={field.value || '+91'}
                                            onChange={field.onChange}
                                            options={[
                                                { value: '+91', label: 'India (+91)' },
                                                { value: '+1', label: 'USA (+1)' },
                                                { value: '+44', label: 'UK (+44)' },
                                                { value: '+971', label: 'UAE (+971)' }
                                            ]}
                                            disabled={isUpdating}
                                            className="col-span-1"
                                            error={errors.country_code?.message}
                                            required
                                        />
                                    )}
                                />

                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Mobile Number"
                                    {...register('mobile')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }}
                                    maxLength={10}
                                    icon={Phone}
                                    placeholder="Enter mobile number"
                                    disabled={isUpdating}
                                    error={errors.mobile?.message}
                                    wrapperClassName="col-span-2"
                                    required
                                />
                            </div>

                            {/* Organization Details - Only for tenant_admin */}
                            {user?.role === 'tenant_admin' && (
                                <div className="space-y-6 pt-6 border-t border-white/10">
                                    <h3 className={cn(
                                        "text-base font-bold flex items-center space-x-2",
                                        isDarkMode ? "text-white/70" : "text-slate-600"
                                    )}>
                                        <Building2 size={18} className="text-emerald-500" />
                                        <span>Organization Details</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            isDarkMode={isDarkMode}
                                            label="Organization Name"
                                            {...register('company_name')}
                                            icon={Building2}
                                            placeholder="Enter company name"
                                            disabled={isUpdating}
                                            error={errors.company_name?.message}
                                            required
                                        />

                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="Organization Type"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={[
                                                        { value: 'hospital', label: 'Hospital' },
                                                        { value: 'clinic', label: 'Clinic' },
                                                    ]}
                                                    disabled={isUpdating}
                                                    error={errors.type?.message}
                                                    required
                                                />
                                            )}
                                        />

                                        <div className="md:col-span-2">
                                            <Input
                                                isDarkMode={isDarkMode}
                                                label="Full Address"
                                                {...register('address')}
                                                icon={MapPin}
                                                placeholder="Enter full organization address"
                                                disabled={isUpdating}
                                                error={errors.address?.message}
                                                required
                                            />
                                        </div>

                                        <Controller
                                            name="country"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="Country"
                                                    value={field.value}
                                                    onChange={(val) => {
                                                        field.onChange(val);
                                                        handleCountryChange(val);
                                                    }}
                                                    options={Country.getAllCountries().map(c => ({ value: c.name, label: c.name }))}
                                                    disabled={isUpdating}
                                                    error={errors.country?.message}
                                                    required
                                                />
                                            )}
                                        />

                                        <Controller
                                            name="state"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="State"
                                                    value={field.value}
                                                    onChange={(val) => {
                                                        field.onChange(val);
                                                        handleStateChange(val);
                                                    }}
                                                    options={countryIso ? State.getStatesOfCountry(countryIso).map(s => ({ value: s.name, label: s.name })) : []}
                                                    disabled={isUpdating || !countryIso}
                                                    error={errors.state?.message}
                                                    required
                                                />
                                            )}
                                        />

                                        <Input
                                            isDarkMode={isDarkMode}
                                            label="City"
                                            {...register('city')}
                                            icon={Globe}
                                            placeholder="Enter city"
                                            disabled={isUpdating}
                                            error={errors.city?.message}
                                            required
                                        />

                                        <Input
                                            isDarkMode={isDarkMode}
                                            label="Pincode"
                                            {...register('pincode')}
                                            icon={Navigation}
                                            placeholder="Enter pincode"
                                            disabled={isUpdating}
                                            error={errors.pincode?.message}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2",
                                        isDarkMode
                                            ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    )}
                                >
                                    <X size={16} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20",
                                        "bg-emerald-600 text-white",
                                        isUpdating ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                                    )}
                                >
                                    <Check size={16} />
                                    <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {/* Email */}
                            <div className={cn(
                                "p-5 rounded-xl border transition-all",
                                isDarkMode
                                    ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10'
                                    : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'
                            )}>
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                    )}>
                                        <Mail size={20} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "text-[11px] font-bold uppercase tracking-wide mb-1",
                                            isDarkMode ? 'text-white/40' : 'text-slate-400'
                                        )}>
                                            Email Address
                                        </p>
                                        <p className={cn(
                                            "text-sm font-semibold",
                                            isDarkMode ? 'text-white' : 'text-slate-800'
                                        )}>
                                            {user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className={cn(
                                "p-5 rounded-xl border transition-all",
                                isDarkMode
                                    ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10'
                                    : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'
                            )}>
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                    )}>
                                        <Phone size={20} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "text-[11px] font-bold uppercase tracking-wide mb-1",
                                            isDarkMode ? 'text-white/40' : 'text-slate-400'
                                        )}>
                                            Mobile Number
                                        </p>
                                        <p className={cn(
                                            "text-sm font-semibold",
                                            isDarkMode ? 'text-white' : 'text-slate-800'
                                        )}>
                                            {user?.country_code} {user?.mobile || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Organization Information - Added Sections */}
                            {(user as any)?.organization && (
                                <div className="pt-6 mt-6 border-t border-white/10 space-y-6">
                                    <h3 className={cn(
                                        "text-lg font-bold flex items-center space-x-2",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        <Building2 size={20} className="text-emerald-500" />
                                        <span>Organization Information</span>
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Company Name & Type */}
                                        <div className={cn(
                                            "p-5 rounded-xl border transition-all",
                                            isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                                        )}>
                                            <p className={cn("text-[11px] font-bold uppercase tracking-wide mb-2 opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>Company Details</p>
                                            <p className={cn("text-base font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{(user as any).organization.company_name}</p>
                                            <p className="text-xs opacity-60 mt-1 capitalize text-emerald-500 font-semibold">{(user as any).organization.type || 'Organization'}</p>
                                        </div>

                                        {/* Subscription & Max Users */}
                                        <div className={cn(
                                            "p-5 rounded-xl border transition-all",
                                            isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                                        )}>
                                            <p className={cn("text-[11px] font-bold uppercase tracking-wide mb-2 opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>Subscription & Limits</p>
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                                                    (user as any).organization.subscription_plan === 'enterprise' ? 'bg-amber-500/10 text-amber-500' :
                                                    (user as any).organization.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-500' :
                                                    'bg-emerald-500/10 text-emerald-500'
                                                )}>
                                                    {(user as any).organization.subscription_plan || 'Basic'} Plan
                                                </span>
                                                <span className="text-xs font-bold opacity-70">
                                                    {(user as any).organization.max_users || 10} Max Users
                                                </span>
                                            </div>
                                            {(user as any).organization.subscription_end_date && (
                                                <p className="text-[10px] mt-2 opacity-50 flex items-center">
                                                    <Calendar size={10} className="mr-1" />
                                                    Renews on: {new Date((user as any).organization.subscription_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            )}
                                        </div>

                                        {/* Full Address */}
                                        <div className={cn(
                                            "md:col-span-2 p-5 rounded-xl border transition-all",
                                            isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                                        )}>
                                            <div className="flex items-start space-x-3">
                                                <div className="mt-1 p-2 rounded-lg bg-emerald-500/10">
                                                    <MapPin size={16} className="text-emerald-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={cn("text-[11px] font-bold uppercase tracking-wide mb-1 opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>Address Details</p>
                                                    <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                        {(user as any).organization.address || 'Address not provided'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                                        {[(user as any).organization.city, (user as any).organization.state, (user as any).organization.country].filter(Boolean).map((loc, i) => (
                                                            <span key={i} className="text-xs opacity-50 flex items-center">
                                                                <Globe size={10} className="mr-1" /> {loc}
                                                            </span>
                                                        ))}
                                                        {(user as any).organization.pincode && (
                                                            <span className="text-xs opacity-50 flex items-center">
                                                                <Navigation size={10} className="mr-1" /> {(user as any).organization.pincode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Info - Original Section */}
                            <div className={cn(
                                "grid grid-cols-2 gap-4 p-5 rounded-xl border mt-6",
                                isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100'
                            )}>
                                <div>
                                    <p className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide mb-1",
                                        isDarkMode ? 'text-white/30' : 'text-slate-400'
                                    )}>
                                        Account ID
                                    </p>
                                    <p className={cn(
                                        "text-xs font-mono",
                                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                                    )}>
                                        {user?.tenant_user_id || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide mb-1",
                                        isDarkMode ? 'text-white/30' : 'text-slate-400'
                                    )}>
                                        Account Type
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                                    )}>
                                        Tenant User
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

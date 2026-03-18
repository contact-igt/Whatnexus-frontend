"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Edit2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useUpdateManagementMutation, useGetManagementProfileQuery } from '@/hooks/useManagementQuery';
import { updateUserData } from '@/redux/slices/auth/authSlice';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Form Schema
const editProfileSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    country_code: z.string().min(2, { message: "Country code is required." }),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

export default function ManagementProfileView() {
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isEditMode, setIsEditMode] = useState(false);

    const { mutate: updateProfile, isPending: isUpdating } = useUpdateManagementMutation();
    const { data: profileData, refetch: refetchProfile } = useGetManagementProfileQuery();

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<EditProfileData>({
        defaultValues: {
            username: user?.username || user?.name || '',
            country_code: user?.country_code?.startsWith('+') ? user?.country_code : `+${user?.country_code || '91'}`,
            mobile: (() => {
                const rawCode = user?.country_code || '+91';
                const normCode = rawCode.startsWith('+') ? rawCode : `+${rawCode}`;
                const mobile = user?.mobile || '';

                if (mobile.startsWith(normCode)) return mobile.slice(normCode.length).trim();
                if (mobile.startsWith(rawCode)) return mobile.slice(rawCode.length).trim();
                return mobile;
            })(),
        },
        resolver: zodResolver(editProfileSchema)
    });

    const onSubmit = (data: EditProfileData) => {
        const managementId = user?.management_id;
        if (!managementId) {
            return;
        }

        updateProfile(
            { managementId, data },
            {
                onSuccess: async () => {
                    setIsEditMode(false);
                    // Refetch profile to get updated data
                    const result = await refetchProfile();
                    if (result.data?.data) {
                        dispatch(updateUserData(result.data.data));
                    }
                }
            }
        );
    };

    const handleCancel = () => {
        const countryCode = user?.country_code?.startsWith('+') ? user?.country_code : `+${user?.country_code || '91'}`;
        reset({
            username: user?.username || user?.name || '',
            country_code: countryCode,
            mobile: user?.mobile || '',
        });
        setIsEditMode(false);
    };

    // Sync form values when entering edit mode
    useEffect(() => {
        if (isEditMode && user) {
            const rawCountryCode = user?.country_code || '+91';
            const normalizedCountryCode = rawCountryCode.startsWith('+') ? rawCountryCode : `+${rawCountryCode}`;

            let mobile = user?.mobile || '';
            if (mobile.startsWith(normalizedCountryCode)) {
                mobile = mobile.slice(normalizedCountryCode.length).trim();
            } else if (mobile.startsWith(rawCountryCode)) {
                mobile = mobile.slice(rawCountryCode.length).trim();
            }

            reset({
                username: user?.username || user?.name || '',
                country_code: normalizedCountryCode,
                mobile: mobile,
            });
        }
    }, [isEditMode, user, reset]);

    // Fetch and update profile data on mount
    useEffect(() => {
        if (profileData?.data) {
            dispatch(updateUserData(profileData.data));
        }
    }, [profileData, dispatch]);

    return (
        <div className={cn(
            "min-h-screen p-6",
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
                                    icon={Phone}
                                    placeholder="Enter mobile number"
                                    disabled={isUpdating}
                                    error={errors.mobile?.message}
                                    wrapperClassName="col-span-2"
                                    required
                                />
                            </div>

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

                            {/* Account Info */}
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
                                        {user?.management_id || 'N/A'}
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
                                        Management User
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

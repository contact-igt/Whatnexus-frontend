"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { Mail, Phone, User, Briefcase, Award, Edit2, Save, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';


export const ProfileView = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: user?.title || '',
        username: user?.username || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        role: user?.role || ''
    });

    const userInitials = user?.username?.split("")[0].toUpperCase();

    const handleSave = () => {
        setIsEditMode(false);
    };

    const handleCancel = () => {
        setFormData({
            title: user?.title || '',
            username: user?.username || '',
            email: user?.email || '',
            mobile: user?.mobile || '',
            role: user?.role || ''
        });
        setIsEditMode(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    console.log("formData", formData)
    return (
        <div className={cn(
            "flex-1 overflow-y-auto p-8",
            isDarkMode ? 'bg-[#0D0D0F]' : 'bg-slate-50'
        )}>
            <div className="max-w-4xl mx-auto">
                <div className={cn(
                    "rounded-2xl border p-6 mb-6 relative",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}>
                    <div className="absolute top-6 right-6 flex gap-2">
                        {!isEditMode ? (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className={cn(
                                    "px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all",
                                    isDarkMode
                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                )}
                            >
                                <Edit2 size={16} />
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className={cn(
                                        "px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all",
                                        isDarkMode
                                            ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    )}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className={cn(
                                        "px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all",
                                        isDarkMode
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    )}
                                >
                                    <Save size={16} />
                                    Save
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl border shrink-0",
                            isDarkMode
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        )}>
                            {userInitials ? userInitials : <User size={20} />}
                        </div>
                        <div className="flex-1">
                            <h1 className={cn(
                                "text-2xl font-black mb-1",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                {user?.username || "User"}
                            </h1>
                            <p className={cn(
                                "text-sm flex items-center gap-2",
                                isDarkMode ? 'text-white/60' : 'text-slate-500'
                            )}>
                                <Mail size={14} />
                                {user?.email || "email@example.com"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={cn(
                    "rounded-2xl border p-6",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                )}>
                    <h2 className={cn(
                        "text-lg font-black mb-6",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        Profile Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={cn(
                                "text-xs font-bold uppercase tracking-wider mb-2 block",
                                isDarkMode ? 'text-white/40' : 'text-slate-500'
                            )}>
                                Username
                            </label>
                            {isEditMode ? (
                                <div className="relative">
                                    <User size={16} className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2",
                                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                                    )} />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white'
                                        )}
                                        placeholder="Enter name"
                                    />
                                </div>
                            ) : (
                                <div className={cn(
                                    "px-4 py-2.5 rounded-xl border font-medium text-sm flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/70'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                )}>
                                    <User size={16} className={isDarkMode ? 'text-white/40' : 'text-slate-400'} />
                                    {formData.username || "Not set"}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={cn(
                                "text-xs font-bold uppercase tracking-wider mb-2 block",
                                isDarkMode ? 'text-white/40' : 'text-slate-500'
                            )}>
                                Phone Number
                            </label>
                            {isEditMode ? (
                                <div className="relative">
                                    <Phone size={16} className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2",
                                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                                    )} />
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white'
                                        )}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            ) : (
                                <div className={cn(
                                    "px-4 py-2.5 rounded-xl border font-medium text-sm flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/70'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                )}>
                                    <Phone size={16} className={isDarkMode ? 'text-white/40' : 'text-slate-400'} />
                                    {formData?.mobile || "Not set"}
                                </div>
                            )}
                        </div>


                        <div className="md:col-span-2">
                            <label className={cn(
                                "text-xs font-bold uppercase tracking-wider mb-2 block",
                                isDarkMode ? 'text-white/40' : 'text-slate-500'
                            )}>
                                Email
                            </label>
                            <div className={cn(
                                "px-4 py-2.5 rounded-xl border font-medium text-sm flex items-center gap-2",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white/70'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                            )}>
                                <Mail size={16} className={isDarkMode ? 'text-white/40' : 'text-slate-400'} />
                                {formData?.email || "Not set"}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className={cn(
                                "text-xs font-bold uppercase tracking-wider mb-2 block",
                                isDarkMode ? 'text-white/40' : 'text-slate-500'
                            )}>
                                Role
                            </label>
                            {isEditMode ? (
                                <div className="relative">
                                    <Briefcase size={16} className={cn(
                                        "absolute left-3 top-1/2 -translate-y-1/2",
                                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                                    )} />
                                    <ChevronDown size={16} className={cn(
                                        "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10",
                                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                                    )} />
                                    {/* <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white'
                                        )}
                                        placeholder="Enter role"
                                    /> */}
                                    <select
                                        // {...register('role')}
                                        value={formData?.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        className={cn(
                                            "w-full pl-10 pr-9 py-2.5 rounded-xl border font-medium text-sm transition-all appearance-none cursor-pointer",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50 focus:bg-white/10 hover:bg-white/[0.07]'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white hover:bg-slate-100'
                                        )}
                                        style={{
                                            backgroundImage: 'none'
                                        }}
                                    >
                                        <option value="agent" className={isDarkMode ? 'bg-[#1c1c21] text-white' : 'bg-white text-slate-900'}>Agent</option>
                                        <option value="admin" className={isDarkMode ? 'bg-[#1c1c21] text-white' : 'bg-white text-slate-900'}>Admin</option>
                                        <option value="super_admin" className={isDarkMode ? 'bg-[#1c1c21] text-white' : 'bg-white text-slate-900'}>Super Admin</option>
                                    </select>
                                </div>
                            ) : (
                                <div className={cn(
                                    "px-4 py-2.5 rounded-xl border font-medium text-sm flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/70'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                )}>
                                    <Briefcase size={16} className={isDarkMode ? 'text-white/40' : 'text-slate-400'} />
                                    {formData?.role?.split("-").map((word: any) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || "Not set"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

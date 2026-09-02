
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCircle, Clock, Briefcase, Phone, Mail, CheckCircle, XCircle, MinusCircle, RefreshCw, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DoctorDrawer } from './doctorDrawer';
import { Select } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/lib/toast";
import {
    useGetAllDoctorsQuery,
    useGetDeletedDoctorsQuery,
    useUpdateDoctorMutation,
    useDeleteDoctorMutation,
    useRestoreDoctorMutation,
    usePermanentDeleteDoctorMutation
} from "@/hooks/useDoctorQuery";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useGetAllSpecializationsQuery } from '@/hooks/useSpecializationsQuery';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Pagination } from '@/components/ui/pagination';
import { Doctor } from '@/services/doctor';
interface DoctorManagementProps {
    isDarkMode: boolean;
}

const STATUS_OPTIONS: { value: NonNullable<Doctor['status']>; label: string }[] = [
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'off_duty', label: 'Off Duty' }
];

export const DoctorManagement = ({ isDarkMode }: DoctorManagementProps) => {
    const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const { data: specializationsData, isPending } = useGetAllSpecializationsQuery();
    const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
    const [pendingStatus, setPendingStatus] = useState<{ doctorId: string; status: NonNullable<Doctor['status']> } | null>(null);
    const [statusMenuDoctorId, setStatusMenuDoctorId] = useState<string | null>(null);

    // Confirmation Modal State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        type: 'soft-delete' | 'restore' | 'permanent-delete' | null;
        doctorId: string | null;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'info' | 'success';
        confirmText: string;
    }>({
        isOpen: false,
        type: null,
        doctorId: null,
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirm'
    });

    // API Hooks
    const {
        data: activeDoctorsData,
        isLoading: isLoadingActive,
        refetch: refetchActive
    } = useGetAllDoctorsQuery({ search: searchQuery });

    const {
        data: deletedDoctorsData,
        isLoading: isLoadingDeleted,
        refetch: refetchDeleted
    } = useGetDeletedDoctorsQuery({ search: searchQuery });

    const deleteDoctorMutation = useDeleteDoctorMutation();
    const updateDoctorMutation = useUpdateDoctorMutation();
    const restoreDoctorMutation = useRestoreDoctorMutation();
    const permanentDeleteDoctorMutation = usePermanentDeleteDoctorMutation();

    const normalizeDoctors = (payload: any): Doctor[] => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.doctors)) return payload.doctors;
        return [];
    };

    const activeDoctors = normalizeDoctors(activeDoctorsData?.data);
    const deletedDoctors = normalizeDoctors(deletedDoctorsData?.data);

    // Derived state
    const doctors = activeTab === 'active'
        ? activeDoctors
        : deletedDoctors;

    const isLoading = activeTab === 'active' ? isLoadingActive : isLoadingDeleted;

    // Filter doctors based on specialization (client-side for now as API might not support it yet)
    const filteredDoctors = doctors.filter((doc: Doctor) => {
        if (filterSpecialization === 'all') return true;
        return doc.specializations?.some((s: any) => {
            const name = typeof s === 'string' ? s : s.name;
            return name === filterSpecialization;
        });
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const totalDoctorPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const currentDoctors = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredDoctors.slice(start, start + itemsPerPage);
    }, [filteredDoctors, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, filterSpecialization]);

    const { user } = useAuth();
    const normalizedRole = String(user?.role || '').toLowerCase();
    const isDoctor = user?.user_type === 'tenant' && normalizedRole === 'doctor';

    const handleCreateDoctor = () => {
        setSelectedDoctor(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleViewDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleStatusChange = async (doctor: Doctor, status: NonNullable<Doctor['status']>) => {
        setStatusMenuDoctorId(null);
        if (status === doctor.status) return;

        setPendingStatus({ doctorId: doctor.doctor_id, status });
        try {
            await updateDoctorMutation.mutateAsync({ doctorId: doctor.doctor_id, data: { status } });
            await refetchActive();
        } catch (error) {
            console.error("Doctor status update failed", error);
        } finally {
            setPendingStatus(null);
        }
    };

    const handleDeleteDoctor = (doctor: Doctor) => {
        setConfirmationState({
            isOpen: true,
            type: 'soft-delete',
            doctorId: doctor.doctor_id,
            title: 'Remove Doctor',
            message: `Are you sure you want to remove ${doctor.name}? They will be moved to the trash.`,
            variant: 'danger',
            confirmText: 'Remove'
        });
    };

    const handleRestoreDoctor = (doctor: Doctor) => {
        setConfirmationState({
            isOpen: true,
            type: 'restore',
            doctorId: doctor.doctor_id,
            title: 'Restore Doctor',
            message: `Are you sure you want to restore ${doctor.name}? They will appear in the active doctors list.`,
            variant: 'success',
            confirmText: 'Restore'
        });
    };

    const handlePermanentDeleteDoctor = (doctor: Doctor) => {
        setConfirmationState({
            isOpen: true,
            type: 'permanent-delete',
            doctorId: doctor.doctor_id,
            title: 'Permanently Delete',
            message: `Are you sure you want to permanently delete ${doctor.name}? This action cannot be undone.`,
            variant: 'danger',
            confirmText: 'Delete Permanently'
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmationState.doctorId) return;

        try {
            if (confirmationState.type === 'soft-delete') {
                await deleteDoctorMutation.mutateAsync(confirmationState.doctorId);
            } else if (confirmationState.type === 'restore') {
                await restoreDoctorMutation.mutateAsync(confirmationState.doctorId);
            } else if (confirmationState.type === 'permanent-delete') {
                await permanentDeleteDoctorMutation.mutateAsync(confirmationState.doctorId);
            }
            setConfirmationState(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error("Action failed", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-emerald-500 bg-emerald-500/10';
            case 'busy': return 'text-amber-500 bg-amber-500/10';
            case 'off_duty': return 'text-slate-500 bg-slate-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle size={14} />;
            case 'busy': return <MinusCircle size={14} />;
            case 'off_duty': return <XCircle size={14} />;
            default: return <XCircle size={14} />;
        }
    };

    const getAvailableDays = (availability: Doctor['availability']) => {
        if (!availability) return 'No availability';

        if (Array.isArray(availability)) {
            const days = Array.from(new Set(availability.map(a => a.day_of_week)));
            return days.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ') || 'No availability';
        }

        return Object.entries(availability)
            .filter(([_, data]) => data?.enabled)
            .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
            .join(', ') || 'No availability';
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'active'
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Active Doctors
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'trash'
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Trash ({deletedDoctors.length})
                </button>
            </div>

            {/* Search, Filter and Create */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors..."
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
                    <div className="min-w-[200px]">
                        <Select
                            isDarkMode={isDarkMode}
                            value={filterSpecialization}
                            onChange={(value) => setFilterSpecialization(value)}
                            options={[
                                { value: "all", label: "All Specializations" },
                                ...(specializationsData?.data || []).map((spec: any) => ({ value: spec?.name, label: spec?.name }))
                            ]}
                            placeholder="All Specializations"
                        />
                    </div>
                </div>
                {activeTab === 'active' && (
                    <button
                        onClick={handleCreateDoctor}
                        className={cn(
                            "px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2 whitespace-nowrap",
                            isDarkMode
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                        )}
                    >
                        <Plus size={18} />
                        <span>Add Doctor</span>
                    </button>
                )}
            </div>

            {/* Doctors Grid */}
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-48 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.length === 0 ? (
                        <div className={cn(
                            "col-span-full text-center py-12 rounded-xl border-2 border-dashed",
                            isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                        )}>
                            <UserCircle className="mx-auto mb-3" size={48} />
                            <p className="text-lg font-medium">No doctors found</p>
                            <p className="text-sm mt-1">
                                {activeTab === 'active' ? "Add your first doctor to get started" : "No doctors in trash"}
                            </p>
                        </div>
                    ) : (
                        currentDoctors.map((doctor: Doctor) => (
                            <div
                                key={doctor.doctor_id}
                                className={cn(
                                    "p-6 rounded-xl border transition-all hover:scale-[1.02]",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                        : 'bg-white border-slate-200 hover:shadow-lg'
                                )}
                            >
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                                                isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className={cn("font-semibold text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {doctor.title} {doctor.name}
                                                </h3>
                                                {(() => {
                                                    const status = pendingStatus?.doctorId === doctor.doctor_id
                                                        ? pendingStatus.status
                                                        : doctor.status || 'off_duty';
                                                    return !isDoctor ? (
                                                        <Popover
                                                            open={statusMenuDoctorId === doctor.doctor_id}
                                                            onOpenChange={(open) => setStatusMenuDoctorId(open ? doctor.doctor_id : null)}
                                                        >
                                                            <PopoverTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Change availability status for ${doctor.name}`}
                                                                    title="Change availability status"
                                                                    disabled={updateDoctorMutation.isPending}
                                                                    className={cn(
                                                                        "group mt-1 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all hover:ring-1 hover:ring-current/30 disabled:cursor-wait disabled:opacity-60",
                                                                        getStatusColor(status)
                                                                    )}
                                                                >
                                                                    {getStatusIcon(status)}
                                                                    <span className="capitalize">{status.replace('_', ' ')}</span>
                                                                    <ChevronDown size={13} className="opacity-60 transition-transform group-data-[state=open]:rotate-180" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                isDarkMode={isDarkMode}
                                                                align="start"
                                                                sideOffset={6}
                                                                className="w-44 rounded-xl p-1.5 shadow-xl"
                                                            >
                                                                <div className="space-y-1">
                                                                    {STATUS_OPTIONS.map((option) => (
                                                                        <button
                                                                            key={option.value}
                                                                            type="button"
                                                                            onClick={() => void handleStatusChange(doctor, option.value)}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                                                                                option.value === status
                                                                                    ? getStatusColor(option.value)
                                                                                    : isDarkMode
                                                                                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                                                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                                            )}
                                                                        >
                                                                            {getStatusIcon(option.value)}
                                                                            <span>{option.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ) : (
                                                        <div className={cn("mt-1 inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium", getStatusColor(status))}>
                                                            {getStatusIcon(status)}
                                                            <span className="capitalize">{status.replace('_', ' ')}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specializations */}
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            const specs = doctor.specializations || (doctor as any).specialization || [];
                                            return specs.map((spec: any, idx: number) => {
                                                const specName = typeof spec === 'string'
                                                    ? (specializationsData?.data?.find((s: any) => s.specialization_id === spec || s.name === spec)?.name || spec)
                                                    : spec.name;

                                                return (
                                                    <span
                                                        key={idx}
                                                        className={cn(
                                                            "px-3 py-1 rounded-full text-xs font-medium",
                                                            isDarkMode
                                                                ? "bg-blue-500/10 text-blue-400"
                                                                : "bg-blue-50 text-blue-700"
                                                        )}
                                                    >
                                                        {specName}
                                                    </span>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", doctor.mobile ? (isDarkMode ? "text-white/60" : "text-slate-600") : (isDarkMode ? "text-white/25" : "text-slate-400"), !doctor.mobile && "italic")}>
                                                {doctor.mobile ? `${doctor.country_code} ${doctor.mobile}` : "Not provided"}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", doctor.email ? (isDarkMode ? "text-white/60" : "text-slate-600") : (isDarkMode ? "text-white/25" : "text-slate-400"), !doctor.email && "italic")}>
                                                {doctor.email || "Not provided"}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {getAvailableDays(doctor.availability)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Briefcase className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {doctor.appointment_count || 0} appointments
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                        {activeTab === 'active' ? (
                                            <>
                                                <button
                                                    onClick={() => handleViewDoctor(doctor)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                    )}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {!isDoctor && (
                                                    <button
                                                        onClick={() => handleEditDoctor(doctor)}
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
                                                )}
                                                {!isDoctor && (
                                                    <button
                                                        onClick={() => handleDeleteDoctor(doctor)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            isDarkMode
                                                                ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                                        )}
                                                        title="Trash"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {!isDoctor && (
                                                    <button
                                                        onClick={() => handleRestoreDoctor(doctor)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            isDarkMode
                                                                ? 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                                                                : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                                        )}
                                                        title="Restore"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                )}
                                                {!isDoctor && (
                                                    <button
                                                        onClick={() => handlePermanentDeleteDoctor(doctor)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all",
                                                            isDarkMode
                                                                ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                                        )}
                                                        title="Permanently Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {filteredDoctors.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalDoctorPages)}
                        onPageChange={setCurrentPage}
                        totalItems={filteredDoctors.length}
                        itemsPerPage={itemsPerPage}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            <DoctorDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
                mode={modalMode}
                specializationsData={specializationsData?.data}
                isDarkMode={isDarkMode}
            />

            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmationState.title}
                message={confirmationState.message}
                variant={confirmationState.variant}
                confirmText={confirmationState.confirmText}
                isDarkMode={isDarkMode}
                isLoading={deleteDoctorMutation.isPending || restoreDoctorMutation.isPending || permanentDeleteDoctorMutation.isPending}
            />
        </div>
    );
};

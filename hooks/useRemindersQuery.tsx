/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { AppointmentApiData, type AppointmentReminderFilters } from "@/services/appointment";

const appointmentApis = new AppointmentApiData();

export const useGetRemindersQuery = (filters?: AppointmentReminderFilters) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["reminders", tenantId, filters],
        queryFn: () => appointmentApis.getReminders(filters),
        staleTime: 30 * 1000,
    });
};

export const useGetReminderDetailQuery = (id?: number | null) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["reminder-detail", tenantId, id],
        queryFn: () => appointmentApis.getReminderDetail(id!),
        enabled: id != null && id > 0,
        staleTime: 30 * 1000,
    });
};

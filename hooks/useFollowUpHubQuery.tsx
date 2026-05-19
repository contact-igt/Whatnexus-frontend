/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { AppointmentApiData, type FollowUpHubFilters } from "@/services/appointment";
import { toast } from "@/lib/toast";

const appointmentApis = new AppointmentApiData();

export const useGetFollowUpHubQuery = (filters?: FollowUpHubFilters) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["followup-hub", tenantId, filters],
        queryFn: () => appointmentApis.getFollowUpHub(filters),
        staleTime: 30 * 1000,
    });
};

export const useGetPendingFollowUpCountQuery = () => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["followup-hub-count", tenantId],
        queryFn: () => appointmentApis.getPendingFollowUpCount(),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    });
};

export const useRetryFollowUpMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => appointmentApis.retryFollowUp(id),
        onSuccess: () => {
            toast.success("Follow-up queued for retry");
            queryClient.invalidateQueries({ queryKey: ["followup-hub"] });
            queryClient.invalidateQueries({ queryKey: ["followup-hub-count"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Retry failed");
        },
    });
};

export const useRescheduleFollowUpMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, scheduled_at }: { id: number; scheduled_at: string }) =>
            appointmentApis.rescheduleFollowUp(id, scheduled_at),
        onSuccess: () => {
            toast.success("Follow-up rescheduled successfully");
            queryClient.invalidateQueries({ queryKey: ["followup-hub"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Reschedule failed");
        },
    });
};

export const useSendNowFollowUpMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => appointmentApis.sendNowFollowUp(id),
        onSuccess: (data: any) => {
            if (data?.data?.success === false) {
                toast.error(`Send failed: ${data?.data?.error || "Unknown error"}`);
            } else {
                toast.success("Message sent successfully");
            }
            queryClient.invalidateQueries({ queryKey: ["followup-hub"] });
            queryClient.invalidateQueries({ queryKey: ["followup-hub-count"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Send failed");
        },
    });
};

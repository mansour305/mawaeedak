import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOfficialFinancialDates,
  fetchOfficialPrayerTimes,
  fetchNextFinancialEvent,
  createOfficialFinancialDate,
  updateOfficialFinancialDate,
  deleteOfficialFinancialDate,
  createOfficialPrayerTime,
  updateOfficialPrayerTime,
  deleteOfficialPrayerTime,
  fetchOfficialAppointments,
  createOfficialAppointment,
  updateOfficialAppointment,
  deleteOfficialAppointment,
} from "@/services/officialData";

/**
 * React Query v5-compatible hooks for official Supabase data.
 * Important: TanStack Query v5 requires object syntax for useQuery/useMutation.
 */

export function useOfficialFinancialDates() {
  return useQuery({
    queryKey: ["official-financial-dates"],
    queryFn: async () => {
      const { data, error } = await fetchOfficialFinancialDates();
      if (error) throw error;
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });
}

export function useNextFinancialEvent(eventKey: string) {
  return useQuery({
    queryKey: ["next-financial-event", eventKey],
    queryFn: async () => {
      const { data, error } = await fetchNextFinancialEvent(eventKey);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(eventKey),
    retry: 1,
    staleTime: 30_000,
  });
}

export function useOfficialPrayerTimes(cityKey: string, dateIso: string) {
  return useQuery({
    queryKey: ["official-prayer-times", cityKey, dateIso],
    queryFn: async () => {
      const { data, error } = await fetchOfficialPrayerTimes(cityKey, dateIso);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(cityKey && dateIso),
    retry: 1,
    staleTime: 60_000,
  });
}

export function useCreateOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Record<string, any>) => {
      const { data, error } = await createOfficialFinancialDate(record);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-financial-dates"] });
    },
  });
}

export function useUpdateOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialFinancialDate(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-financial-dates"] });
    },
  });
}

export function useDeleteOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteOfficialFinancialDate(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-financial-dates"] });
    },
  });
}

export function useCreateOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Record<string, any>) => {
      const { data, error } = await createOfficialPrayerTime(record);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (invalidateKey) queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
  });
}

export function useUpdateOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialPrayerTime(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      if (invalidateKey) queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
  });
}

export function useDeleteOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteOfficialPrayerTime(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      if (invalidateKey) queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
  });
}

export function useOfficialAppointments(date?: string) {
  return useQuery({
    queryKey: ["official-appointments", date ?? "all"],
    queryFn: async () => {
      const { data, error } = await fetchOfficialAppointments(date);
      if (error) throw error;
      return data;
    },
    retry: 1,
    staleTime: 30_000,
  });
}

export function useCreateOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Record<string, any>) => {
      const { data, error } = await createOfficialAppointment(record);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] }));
      }
      queryClient.invalidateQueries({ queryKey: ["official-appointments"] });
    },
  });
}

export function useUpdateOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialAppointment(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] }));
      }
      queryClient.invalidateQueries({ queryKey: ["official-appointments"] });
    },
  });
}

export function useDeleteOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteOfficialAppointment(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] }));
      }
      queryClient.invalidateQueries({ queryKey: ["official-appointments"] });
    },
  });
}


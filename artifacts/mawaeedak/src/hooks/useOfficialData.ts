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
 * React Query hook to fetch all confirmed official financial dates.
 */
export function useOfficialFinancialDates() {
  return useQuery(["official-financial-dates"], async () => {
    const { data, error } = await fetchOfficialFinancialDates();
    if (error) throw error;
    return data;
  });
}

/**
 * React Query hook to fetch the next upcoming financial event for a specific event key
 * (e.g. "gov_salary"). Requires the user to be authenticated.
 */
export function useNextFinancialEvent(eventKey: string) {
  return useQuery(["next-financial-event", eventKey], async () => {
    const { data, error } = await fetchNextFinancialEvent(eventKey);
    if (error) throw error;
    return data;
  });
}

/**
 * React Query hook to fetch official prayer times for a given city and date. When
 * no official times exist, the query returns undefined and the caller should
 * implement a fallback.
 */
export function useOfficialPrayerTimes(cityKey: string, dateIso: string) {
  return useQuery(["official-prayer-times", cityKey, dateIso], async () => {
    const { data, error } = await fetchOfficialPrayerTimes(cityKey, dateIso);
    if (error) throw error;
    return data;
  });
}

/**
 * React Query mutation hook to create a new official financial date. On success,
 * the list of official financial dates is invalidated to refresh the cache.
 */
export function useCreateOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (record: Record<string, any>) => {
      const { data, error } = await createOfficialFinancialDate(record);
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["official-financial-dates"]);
      },
    }
  );
}

/**
 * Mutation hook to update an existing official financial date by ID. It
 * invalidates the list query upon success to refresh the cache.
 */
export function useUpdateOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialFinancialDate(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["official-financial-dates"]);
      },
    }
  );
}

/**
 * Mutation hook to delete an official financial date. After deletion it
 * invalidates the list to reflect changes.
 */
export function useDeleteOfficialFinancialDate() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: number) => {
      const result = await deleteOfficialFinancialDate(id);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["official-financial-dates"]);
      },
    }
  );
}

/**
 * Mutation hook to create a new official prayer time entry. Invalidates the
 * prayer times list on success. Note: list invalidation key is left to
 * the caller since listing is context-specific.
 */
export function useCreateOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async (record: Record<string, any>) => {
      const { data, error } = await createOfficialPrayerTime(record);
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        if (invalidateKey) queryClient.invalidateQueries(invalidateKey);
      },
    }
  );
}

/**
 * Mutation hook to update an official prayer time record. Accepts an object
 * with id and data. Invalidates the given query key on success.
 */
export function useUpdateOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialPrayerTime(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        if (invalidateKey) queryClient.invalidateQueries(invalidateKey);
      },
    }
  );
}

/**
 * Mutation hook to delete an official prayer time record by ID.
 */
export function useDeleteOfficialPrayerTime(invalidateKey?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: number) => {
      const result = await deleteOfficialPrayerTime(id);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        if (invalidateKey) queryClient.invalidateQueries(invalidateKey);
      },
    }
  );
}

/**
 * React Query hook to fetch appointments for the current user. Optionally
 * pass a date string (YYYY-MM-DD) to filter appointments for that day.
 */
export function useOfficialAppointments(date?: string) {
  return useQuery(["official-appointments", date ?? "all"], async () => {
    const { data, error } = await fetchOfficialAppointments(date);
    if (error) throw error;
    return data;
  });
}

/**
 * Mutation hook to create a new appointment for the current user. On success,
 * invalidates the appointments list and upcoming appointments list to
 * refresh cached data.
 */
export function useCreateOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async (record: Record<string, any>) => {
      const { data, error } = await createOfficialAppointment(record);
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        if (invalidateKeys) {
          invalidateKeys.forEach((key) => queryClient.invalidateQueries(key));
        }
      },
    }
  );
}

/**
 * Mutation hook to update an existing appointment. Accepts an object with
 * `id` and `data`. Invalidates provided query keys on success.
 */
export function useUpdateOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const result = await updateOfficialAppointment(id, data);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        if (invalidateKeys) {
          invalidateKeys.forEach((key) => queryClient.invalidateQueries(key));
        }
      },
    }
  );
}

/**
 * Mutation hook to delete an appointment by ID. Invalidates provided query
 * keys on success.
 */
export function useDeleteOfficialAppointment(invalidateKeys?: any[]) {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: number) => {
      const result = await deleteOfficialAppointment(id);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        if (invalidateKeys) {
          invalidateKeys.forEach((key) => queryClient.invalidateQueries(key));
        }
      },
    }
  );
}
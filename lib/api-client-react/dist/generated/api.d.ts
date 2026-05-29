import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminStats, Appointment, AppointmentInput, AppointmentUpdate, AuditLog, CityOption, Complaint, ComplaintInput, ComplaintUpdate, CountdownItem, DailyMessage, DailyMessageInput, DailyMessageUpdate, FinancialEvent, FinancialEventInput, FinancialEventUpdate, GetPrayerTimesParams, HealthStatus, Job, JobInput, JobUpdate, ListAppointmentsParams, ListAuditLogsParams, ListFinancialEventsParams, ListJobsParams, ListNewsParams, ListNotificationsParams, ListPublicEventsParams, ListUpcomingAppointmentsParams, NewsInput, NewsItem, NewsUpdate, Notification, NotificationInput, PrayerTimes, PublicEvent, PublicEventInput, PublicEventUpdate, SocialLog, SocialPreview, SocialSettings, SocialSettingsUpdate, SocialTestResult, StoryTemplate, StoryTemplateInput, StoryTemplateUpdate, SuccessResponse, Theme, ThemeUpdate, UnreadCount } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAppointmentsUrl: (params?: ListAppointmentsParams) => string;
/**
 * @summary List all appointments
 */
export declare const listAppointments: (params?: ListAppointmentsParams, options?: RequestInit) => Promise<Appointment[]>;
export declare const getListAppointmentsQueryKey: (params?: ListAppointmentsParams) => readonly ["/api/appointments", ...ListAppointmentsParams[]];
export declare const getListAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listAppointments>>>;
export type ListAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List all appointments
 */
export declare function useListAppointments<TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAppointmentUrl: () => string;
/**
 * @summary Create appointment
 */
export declare const createAppointment: (appointmentInput: AppointmentInput, options?: RequestInit) => Promise<Appointment>;
export declare const getCreateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export type CreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAppointment>>>;
export type CreateAppointmentMutationBody = BodyType<AppointmentInput>;
export type CreateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Create appointment
*/
export declare const useCreateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<AppointmentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<AppointmentInput>;
}, TContext>;
export declare const getListUpcomingAppointmentsUrl: (params?: ListUpcomingAppointmentsParams) => string;
/**
 * @summary List upcoming appointments
 */
export declare const listUpcomingAppointments: (params?: ListUpcomingAppointmentsParams, options?: RequestInit) => Promise<Appointment[]>;
export declare const getListUpcomingAppointmentsQueryKey: (params?: ListUpcomingAppointmentsParams) => readonly ["/api/appointments/upcoming", ...ListUpcomingAppointmentsParams[]];
export declare const getListUpcomingAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof listUpcomingAppointments>>, TError = ErrorType<unknown>>(params?: ListUpcomingAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUpcomingAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUpcomingAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUpcomingAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listUpcomingAppointments>>>;
export type ListUpcomingAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List upcoming appointments
 */
export declare function useListUpcomingAppointments<TData = Awaited<ReturnType<typeof listUpcomingAppointments>>, TError = ErrorType<unknown>>(params?: ListUpcomingAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUpcomingAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAppointmentUrl: (id: number) => string;
/**
 * @summary Get appointment
 */
export declare const getAppointment: (id: number, options?: RequestInit) => Promise<Appointment>;
export declare const getGetAppointmentQueryKey: (id: number) => readonly [`/api/appointments/${number}`];
export declare const getGetAppointmentQueryOptions: <TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAppointmentQueryResult = NonNullable<Awaited<ReturnType<typeof getAppointment>>>;
export type GetAppointmentQueryError = ErrorType<unknown>;
/**
 * @summary Get appointment
 */
export declare function useGetAppointment<TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAppointmentUrl: (id: number) => string;
/**
 * @summary Update appointment
 */
export declare const updateAppointment: (id: number, appointmentUpdate: AppointmentUpdate, options?: RequestInit) => Promise<Appointment>;
export declare const getUpdateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentUpdate>;
}, TContext>;
export type UpdateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAppointment>>>;
export type UpdateAppointmentMutationBody = BodyType<AppointmentUpdate>;
export type UpdateAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Update appointment
*/
export declare const useUpdateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        id: number;
        data: BodyType<AppointmentUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    id: number;
    data: BodyType<AppointmentUpdate>;
}, TContext>;
export declare const getDeleteAppointmentUrl: (id: number) => string;
/**
 * @summary Delete appointment
 */
export declare const deleteAppointment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAppointment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAppointment>>, TError, {
    id: number;
}, TContext>;
export type DeleteAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAppointment>>>;
export type DeleteAppointmentMutationError = ErrorType<unknown>;
/**
* @summary Delete appointment
*/
export declare const useDeleteAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAppointment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAppointment>>, TError, {
    id: number;
}, TContext>;
export declare const getListFinancialEventsUrl: (params?: ListFinancialEventsParams) => string;
/**
 * @summary List financial events
 */
export declare const listFinancialEvents: (params?: ListFinancialEventsParams, options?: RequestInit) => Promise<FinancialEvent[]>;
export declare const getListFinancialEventsQueryKey: (params?: ListFinancialEventsParams) => readonly ["/api/financial-events", ...ListFinancialEventsParams[]];
export declare const getListFinancialEventsQueryOptions: <TData = Awaited<ReturnType<typeof listFinancialEvents>>, TError = ErrorType<unknown>>(params?: ListFinancialEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFinancialEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFinancialEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFinancialEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listFinancialEvents>>>;
export type ListFinancialEventsQueryError = ErrorType<unknown>;
/**
 * @summary List financial events
 */
export declare function useListFinancialEvents<TData = Awaited<ReturnType<typeof listFinancialEvents>>, TError = ErrorType<unknown>>(params?: ListFinancialEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFinancialEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFinancialEventUrl: () => string;
/**
 * @summary Create financial event
 */
export declare const createFinancialEvent: (financialEventInput: FinancialEventInput, options?: RequestInit) => Promise<FinancialEvent>;
export declare const getCreateFinancialEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFinancialEvent>>, TError, {
        data: BodyType<FinancialEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFinancialEvent>>, TError, {
    data: BodyType<FinancialEventInput>;
}, TContext>;
export type CreateFinancialEventMutationResult = NonNullable<Awaited<ReturnType<typeof createFinancialEvent>>>;
export type CreateFinancialEventMutationBody = BodyType<FinancialEventInput>;
export type CreateFinancialEventMutationError = ErrorType<unknown>;
/**
* @summary Create financial event
*/
export declare const useCreateFinancialEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFinancialEvent>>, TError, {
        data: BodyType<FinancialEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFinancialEvent>>, TError, {
    data: BodyType<FinancialEventInput>;
}, TContext>;
export declare const getUpdateFinancialEventUrl: (id: number) => string;
/**
 * @summary Update financial event
 */
export declare const updateFinancialEvent: (id: number, financialEventUpdate: FinancialEventUpdate, options?: RequestInit) => Promise<FinancialEvent>;
export declare const getUpdateFinancialEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFinancialEvent>>, TError, {
        id: number;
        data: BodyType<FinancialEventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateFinancialEvent>>, TError, {
    id: number;
    data: BodyType<FinancialEventUpdate>;
}, TContext>;
export type UpdateFinancialEventMutationResult = NonNullable<Awaited<ReturnType<typeof updateFinancialEvent>>>;
export type UpdateFinancialEventMutationBody = BodyType<FinancialEventUpdate>;
export type UpdateFinancialEventMutationError = ErrorType<unknown>;
/**
* @summary Update financial event
*/
export declare const useUpdateFinancialEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateFinancialEvent>>, TError, {
        id: number;
        data: BodyType<FinancialEventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateFinancialEvent>>, TError, {
    id: number;
    data: BodyType<FinancialEventUpdate>;
}, TContext>;
export declare const getDeleteFinancialEventUrl: (id: number) => string;
/**
 * @summary Delete financial event
 */
export declare const deleteFinancialEvent: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteFinancialEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFinancialEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteFinancialEvent>>, TError, {
    id: number;
}, TContext>;
export type DeleteFinancialEventMutationResult = NonNullable<Awaited<ReturnType<typeof deleteFinancialEvent>>>;
export type DeleteFinancialEventMutationError = ErrorType<unknown>;
/**
* @summary Delete financial event
*/
export declare const useDeleteFinancialEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFinancialEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteFinancialEvent>>, TError, {
    id: number;
}, TContext>;
export declare const getGetFinancialCountdownUrl: () => string;
/**
 * @summary Get countdown for all financial events
 */
export declare const getFinancialCountdown: (options?: RequestInit) => Promise<CountdownItem[]>;
export declare const getGetFinancialCountdownQueryKey: () => readonly ["/api/financial-events/countdown"];
export declare const getGetFinancialCountdownQueryOptions: <TData = Awaited<ReturnType<typeof getFinancialCountdown>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFinancialCountdown>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFinancialCountdown>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFinancialCountdownQueryResult = NonNullable<Awaited<ReturnType<typeof getFinancialCountdown>>>;
export type GetFinancialCountdownQueryError = ErrorType<unknown>;
/**
 * @summary Get countdown for all financial events
 */
export declare function useGetFinancialCountdown<TData = Awaited<ReturnType<typeof getFinancialCountdown>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFinancialCountdown>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListNotificationsUrl: (params?: ListNotificationsParams) => string;
/**
 * @summary List notifications
 */
export declare const listNotifications: (params?: ListNotificationsParams, options?: RequestInit) => Promise<Notification[]>;
export declare const getListNotificationsQueryKey: (params?: ListNotificationsParams) => readonly ["/api/notifications", ...ListNotificationsParams[]];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateNotificationUrl: () => string;
/**
 * @summary Create notification (admin)
 */
export declare const createNotification: (notificationInput: NotificationInput, options?: RequestInit) => Promise<Notification>;
export declare const getCreateNotificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createNotification>>, TError, {
        data: BodyType<NotificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createNotification>>, TError, {
    data: BodyType<NotificationInput>;
}, TContext>;
export type CreateNotificationMutationResult = NonNullable<Awaited<ReturnType<typeof createNotification>>>;
export type CreateNotificationMutationBody = BodyType<NotificationInput>;
export type CreateNotificationMutationError = ErrorType<unknown>;
/**
* @summary Create notification (admin)
*/
export declare const useCreateNotification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createNotification>>, TError, {
        data: BodyType<NotificationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createNotification>>, TError, {
    data: BodyType<NotificationInput>;
}, TContext>;
export declare const getDeleteNotificationUrl: (id: number) => string;
/**
 * @summary Delete notification
 */
export declare const deleteNotification: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteNotificationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
    id: number;
}, TContext>;
export type DeleteNotificationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteNotification>>>;
export type DeleteNotificationMutationError = ErrorType<void>;
/**
* @summary Delete notification
*/
export declare const useDeleteNotification: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteNotification>>, TError, {
    id: number;
}, TContext>;
export declare const getGetUnreadNotificationsCountUrl: () => string;
/**
 * @summary Get unread count
 */
export declare const getUnreadNotificationsCount: (options?: RequestInit) => Promise<UnreadCount>;
export declare const getGetUnreadNotificationsCountQueryKey: () => readonly ["/api/notifications/unread-count"];
export declare const getGetUnreadNotificationsCountQueryOptions: <TData = Awaited<ReturnType<typeof getUnreadNotificationsCount>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUnreadNotificationsCount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUnreadNotificationsCount>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUnreadNotificationsCountQueryResult = NonNullable<Awaited<ReturnType<typeof getUnreadNotificationsCount>>>;
export type GetUnreadNotificationsCountQueryError = ErrorType<unknown>;
/**
 * @summary Get unread count
 */
export declare function useGetUnreadNotificationsCount<TData = Awaited<ReturnType<typeof getUnreadNotificationsCount>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUnreadNotificationsCount>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkNotificationReadUrl: (id: number) => string;
/**
 * @summary Mark notification as read
 */
export declare const markNotificationRead: (id: number, options?: RequestInit) => Promise<Notification>;
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<unknown>;
/**
* @summary Mark notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    id: number;
}, TContext>;
export declare const getMarkAllNotificationsReadUrl: () => string;
/**
 * @summary Mark all notifications as read
 */
export declare const markAllNotificationsRead: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getMarkAllNotificationsReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export type MarkAllNotificationsReadMutationResult = NonNullable<Awaited<ReturnType<typeof markAllNotificationsRead>>>;
export type MarkAllNotificationsReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all notifications as read
*/
export declare const useMarkAllNotificationsRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export declare const getListDailyMessagesUrl: () => string;
/**
 * @summary List daily messages
 */
export declare const listDailyMessages: (options?: RequestInit) => Promise<DailyMessage[]>;
export declare const getListDailyMessagesQueryKey: () => readonly ["/api/daily-messages"];
export declare const getListDailyMessagesQueryOptions: <TData = Awaited<ReturnType<typeof listDailyMessages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDailyMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDailyMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDailyMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof listDailyMessages>>>;
export type ListDailyMessagesQueryError = ErrorType<unknown>;
/**
 * @summary List daily messages
 */
export declare function useListDailyMessages<TData = Awaited<ReturnType<typeof listDailyMessages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDailyMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateDailyMessageUrl: () => string;
/**
 * @summary Create daily message (admin)
 */
export declare const createDailyMessage: (dailyMessageInput: DailyMessageInput, options?: RequestInit) => Promise<DailyMessage>;
export declare const getCreateDailyMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDailyMessage>>, TError, {
        data: BodyType<DailyMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDailyMessage>>, TError, {
    data: BodyType<DailyMessageInput>;
}, TContext>;
export type CreateDailyMessageMutationResult = NonNullable<Awaited<ReturnType<typeof createDailyMessage>>>;
export type CreateDailyMessageMutationBody = BodyType<DailyMessageInput>;
export type CreateDailyMessageMutationError = ErrorType<unknown>;
/**
* @summary Create daily message (admin)
*/
export declare const useCreateDailyMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDailyMessage>>, TError, {
        data: BodyType<DailyMessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDailyMessage>>, TError, {
    data: BodyType<DailyMessageInput>;
}, TContext>;
export declare const getGetTodayMessageUrl: () => string;
/**
 * @summary Get today's message
 */
export declare const getTodayMessage: (options?: RequestInit) => Promise<DailyMessage>;
export declare const getGetTodayMessageQueryKey: () => readonly ["/api/daily-messages/today"];
export declare const getGetTodayMessageQueryOptions: <TData = Awaited<ReturnType<typeof getTodayMessage>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayMessage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTodayMessage>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTodayMessageQueryResult = NonNullable<Awaited<ReturnType<typeof getTodayMessage>>>;
export type GetTodayMessageQueryError = ErrorType<unknown>;
/**
 * @summary Get today's message
 */
export declare function useGetTodayMessage<TData = Awaited<ReturnType<typeof getTodayMessage>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTodayMessage>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateDailyMessageUrl: (id: number) => string;
/**
 * @summary Update daily message (admin)
 */
export declare const updateDailyMessage: (id: number, dailyMessageUpdate: DailyMessageUpdate, options?: RequestInit) => Promise<DailyMessage>;
export declare const getUpdateDailyMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDailyMessage>>, TError, {
        id: number;
        data: BodyType<DailyMessageUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDailyMessage>>, TError, {
    id: number;
    data: BodyType<DailyMessageUpdate>;
}, TContext>;
export type UpdateDailyMessageMutationResult = NonNullable<Awaited<ReturnType<typeof updateDailyMessage>>>;
export type UpdateDailyMessageMutationBody = BodyType<DailyMessageUpdate>;
export type UpdateDailyMessageMutationError = ErrorType<unknown>;
/**
* @summary Update daily message (admin)
*/
export declare const useUpdateDailyMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDailyMessage>>, TError, {
        id: number;
        data: BodyType<DailyMessageUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDailyMessage>>, TError, {
    id: number;
    data: BodyType<DailyMessageUpdate>;
}, TContext>;
export declare const getDeleteDailyMessageUrl: (id: number) => string;
/**
 * @summary Delete daily message (admin)
 */
export declare const deleteDailyMessage: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDailyMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDailyMessage>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDailyMessage>>, TError, {
    id: number;
}, TContext>;
export type DeleteDailyMessageMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDailyMessage>>>;
export type DeleteDailyMessageMutationError = ErrorType<unknown>;
/**
* @summary Delete daily message (admin)
*/
export declare const useDeleteDailyMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDailyMessage>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDailyMessage>>, TError, {
    id: number;
}, TContext>;
export declare const getListThemesUrl: () => string;
/**
 * @summary List themes
 */
export declare const listThemes: (options?: RequestInit) => Promise<Theme[]>;
export declare const getListThemesQueryKey: () => readonly ["/api/themes"];
export declare const getListThemesQueryOptions: <TData = Awaited<ReturnType<typeof listThemes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listThemes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listThemes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListThemesQueryResult = NonNullable<Awaited<ReturnType<typeof listThemes>>>;
export type ListThemesQueryError = ErrorType<unknown>;
/**
 * @summary List themes
 */
export declare function useListThemes<TData = Awaited<ReturnType<typeof listThemes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listThemes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateThemeUrl: (id: number) => string;
/**
 * @summary Update theme (admin)
 */
export declare const updateTheme: (id: number, themeUpdate: ThemeUpdate, options?: RequestInit) => Promise<Theme>;
export declare const getUpdateThemeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTheme>>, TError, {
        id: number;
        data: BodyType<ThemeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTheme>>, TError, {
    id: number;
    data: BodyType<ThemeUpdate>;
}, TContext>;
export type UpdateThemeMutationResult = NonNullable<Awaited<ReturnType<typeof updateTheme>>>;
export type UpdateThemeMutationBody = BodyType<ThemeUpdate>;
export type UpdateThemeMutationError = ErrorType<unknown>;
/**
* @summary Update theme (admin)
*/
export declare const useUpdateTheme: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTheme>>, TError, {
        id: number;
        data: BodyType<ThemeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTheme>>, TError, {
    id: number;
    data: BodyType<ThemeUpdate>;
}, TContext>;
export declare const getListNewsUrl: (params?: ListNewsParams) => string;
/**
 * @summary List news
 */
export declare const listNews: (params?: ListNewsParams, options?: RequestInit) => Promise<NewsItem[]>;
export declare const getListNewsQueryKey: (params?: ListNewsParams) => readonly ["/api/news", ...ListNewsParams[]];
export declare const getListNewsQueryOptions: <TData = Awaited<ReturnType<typeof listNews>>, TError = ErrorType<unknown>>(params?: ListNewsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNews>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNewsQueryResult = NonNullable<Awaited<ReturnType<typeof listNews>>>;
export type ListNewsQueryError = ErrorType<unknown>;
/**
 * @summary List news
 */
export declare function useListNews<TData = Awaited<ReturnType<typeof listNews>>, TError = ErrorType<unknown>>(params?: ListNewsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateNewsUrl: () => string;
/**
 * @summary Create news (admin)
 */
export declare const createNews: (newsInput: NewsInput, options?: RequestInit) => Promise<NewsItem>;
export declare const getCreateNewsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createNews>>, TError, {
        data: BodyType<NewsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createNews>>, TError, {
    data: BodyType<NewsInput>;
}, TContext>;
export type CreateNewsMutationResult = NonNullable<Awaited<ReturnType<typeof createNews>>>;
export type CreateNewsMutationBody = BodyType<NewsInput>;
export type CreateNewsMutationError = ErrorType<unknown>;
/**
* @summary Create news (admin)
*/
export declare const useCreateNews: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createNews>>, TError, {
        data: BodyType<NewsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createNews>>, TError, {
    data: BodyType<NewsInput>;
}, TContext>;
export declare const getUpdateNewsUrl: (id: number) => string;
/**
 * @summary Update news (admin)
 */
export declare const updateNews: (id: number, newsUpdate: NewsUpdate, options?: RequestInit) => Promise<NewsItem>;
export declare const getUpdateNewsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateNews>>, TError, {
        id: number;
        data: BodyType<NewsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateNews>>, TError, {
    id: number;
    data: BodyType<NewsUpdate>;
}, TContext>;
export type UpdateNewsMutationResult = NonNullable<Awaited<ReturnType<typeof updateNews>>>;
export type UpdateNewsMutationBody = BodyType<NewsUpdate>;
export type UpdateNewsMutationError = ErrorType<unknown>;
/**
* @summary Update news (admin)
*/
export declare const useUpdateNews: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateNews>>, TError, {
        id: number;
        data: BodyType<NewsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateNews>>, TError, {
    id: number;
    data: BodyType<NewsUpdate>;
}, TContext>;
export declare const getDeleteNewsUrl: (id: number) => string;
/**
 * @summary Delete news (admin)
 */
export declare const deleteNews: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteNewsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNews>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteNews>>, TError, {
    id: number;
}, TContext>;
export type DeleteNewsMutationResult = NonNullable<Awaited<ReturnType<typeof deleteNews>>>;
export type DeleteNewsMutationError = ErrorType<unknown>;
/**
* @summary Delete news (admin)
*/
export declare const useDeleteNews: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNews>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteNews>>, TError, {
    id: number;
}, TContext>;
export declare const getListJobsUrl: (params?: ListJobsParams) => string;
/**
 * @summary List jobs
 */
export declare const listJobs: (params?: ListJobsParams, options?: RequestInit) => Promise<Job[]>;
export declare const getListJobsQueryKey: (params?: ListJobsParams) => readonly ["/api/jobs", ...ListJobsParams[]];
export declare const getListJobsQueryOptions: <TData = Awaited<ReturnType<typeof listJobs>>, TError = ErrorType<unknown>>(params?: ListJobsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListJobsQueryResult = NonNullable<Awaited<ReturnType<typeof listJobs>>>;
export type ListJobsQueryError = ErrorType<unknown>;
/**
 * @summary List jobs
 */
export declare function useListJobs<TData = Awaited<ReturnType<typeof listJobs>>, TError = ErrorType<unknown>>(params?: ListJobsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listJobs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateJobUrl: () => string;
/**
 * @summary Create job (admin)
 */
export declare const createJob: (jobInput: JobInput, options?: RequestInit) => Promise<Job>;
export declare const getCreateJobMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
        data: BodyType<JobInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
    data: BodyType<JobInput>;
}, TContext>;
export type CreateJobMutationResult = NonNullable<Awaited<ReturnType<typeof createJob>>>;
export type CreateJobMutationBody = BodyType<JobInput>;
export type CreateJobMutationError = ErrorType<unknown>;
/**
* @summary Create job (admin)
*/
export declare const useCreateJob: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createJob>>, TError, {
        data: BodyType<JobInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createJob>>, TError, {
    data: BodyType<JobInput>;
}, TContext>;
export declare const getUpdateJobUrl: (id: number) => string;
/**
 * @summary Update job (admin)
 */
export declare const updateJob: (id: number, jobUpdate: JobUpdate, options?: RequestInit) => Promise<Job>;
export declare const getUpdateJobMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateJob>>, TError, {
        id: number;
        data: BodyType<JobUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateJob>>, TError, {
    id: number;
    data: BodyType<JobUpdate>;
}, TContext>;
export type UpdateJobMutationResult = NonNullable<Awaited<ReturnType<typeof updateJob>>>;
export type UpdateJobMutationBody = BodyType<JobUpdate>;
export type UpdateJobMutationError = ErrorType<unknown>;
/**
* @summary Update job (admin)
*/
export declare const useUpdateJob: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateJob>>, TError, {
        id: number;
        data: BodyType<JobUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateJob>>, TError, {
    id: number;
    data: BodyType<JobUpdate>;
}, TContext>;
export declare const getDeleteJobUrl: (id: number) => string;
/**
 * @summary Delete job (admin)
 */
export declare const deleteJob: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteJobMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteJob>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteJob>>, TError, {
    id: number;
}, TContext>;
export type DeleteJobMutationResult = NonNullable<Awaited<ReturnType<typeof deleteJob>>>;
export type DeleteJobMutationError = ErrorType<unknown>;
/**
* @summary Delete job (admin)
*/
export declare const useDeleteJob: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteJob>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteJob>>, TError, {
    id: number;
}, TContext>;
export declare const getGetPrayerTimesUrl: (params: GetPrayerTimesParams) => string;
/**
 * @summary Get prayer times by city
 */
export declare const getPrayerTimes: (params: GetPrayerTimesParams, options?: RequestInit) => Promise<PrayerTimes>;
export declare const getGetPrayerTimesQueryKey: (params?: GetPrayerTimesParams) => readonly ["/api/prayer-times", ...GetPrayerTimesParams[]];
export declare const getGetPrayerTimesQueryOptions: <TData = Awaited<ReturnType<typeof getPrayerTimes>>, TError = ErrorType<unknown>>(params: GetPrayerTimesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrayerTimes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPrayerTimes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPrayerTimesQueryResult = NonNullable<Awaited<ReturnType<typeof getPrayerTimes>>>;
export type GetPrayerTimesQueryError = ErrorType<unknown>;
/**
 * @summary Get prayer times by city
 */
export declare function useGetPrayerTimes<TData = Awaited<ReturnType<typeof getPrayerTimes>>, TError = ErrorType<unknown>>(params: GetPrayerTimesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPrayerTimes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPrayerCitiesUrl: () => string;
/**
 * @summary List available cities
 */
export declare const listPrayerCities: (options?: RequestInit) => Promise<CityOption[]>;
export declare const getListPrayerCitiesQueryKey: () => readonly ["/api/prayer-times/cities"];
export declare const getListPrayerCitiesQueryOptions: <TData = Awaited<ReturnType<typeof listPrayerCities>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPrayerCities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPrayerCities>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPrayerCitiesQueryResult = NonNullable<Awaited<ReturnType<typeof listPrayerCities>>>;
export type ListPrayerCitiesQueryError = ErrorType<unknown>;
/**
 * @summary List available cities
 */
export declare function useListPrayerCities<TData = Awaited<ReturnType<typeof listPrayerCities>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPrayerCities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPublicEventsUrl: (params?: ListPublicEventsParams) => string;
/**
 * @summary List public events
 */
export declare const listPublicEvents: (params?: ListPublicEventsParams, options?: RequestInit) => Promise<PublicEvent[]>;
export declare const getListPublicEventsQueryKey: (params?: ListPublicEventsParams) => readonly ["/api/public-events", ...ListPublicEventsParams[]];
export declare const getListPublicEventsQueryOptions: <TData = Awaited<ReturnType<typeof listPublicEvents>>, TError = ErrorType<unknown>>(params?: ListPublicEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPublicEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPublicEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPublicEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listPublicEvents>>>;
export type ListPublicEventsQueryError = ErrorType<unknown>;
/**
 * @summary List public events
 */
export declare function useListPublicEvents<TData = Awaited<ReturnType<typeof listPublicEvents>>, TError = ErrorType<unknown>>(params?: ListPublicEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPublicEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreatePublicEventUrl: () => string;
/**
 * @summary Create public event (admin)
 */
export declare const createPublicEvent: (publicEventInput: PublicEventInput, options?: RequestInit) => Promise<PublicEvent>;
export declare const getCreatePublicEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPublicEvent>>, TError, {
        data: BodyType<PublicEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPublicEvent>>, TError, {
    data: BodyType<PublicEventInput>;
}, TContext>;
export type CreatePublicEventMutationResult = NonNullable<Awaited<ReturnType<typeof createPublicEvent>>>;
export type CreatePublicEventMutationBody = BodyType<PublicEventInput>;
export type CreatePublicEventMutationError = ErrorType<unknown>;
/**
* @summary Create public event (admin)
*/
export declare const useCreatePublicEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPublicEvent>>, TError, {
        data: BodyType<PublicEventInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPublicEvent>>, TError, {
    data: BodyType<PublicEventInput>;
}, TContext>;
export declare const getUpdatePublicEventUrl: (id: number) => string;
/**
 * @summary Update public event (admin)
 */
export declare const updatePublicEvent: (id: number, publicEventUpdate: PublicEventUpdate, options?: RequestInit) => Promise<PublicEvent>;
export declare const getUpdatePublicEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePublicEvent>>, TError, {
        id: number;
        data: BodyType<PublicEventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePublicEvent>>, TError, {
    id: number;
    data: BodyType<PublicEventUpdate>;
}, TContext>;
export type UpdatePublicEventMutationResult = NonNullable<Awaited<ReturnType<typeof updatePublicEvent>>>;
export type UpdatePublicEventMutationBody = BodyType<PublicEventUpdate>;
export type UpdatePublicEventMutationError = ErrorType<unknown>;
/**
* @summary Update public event (admin)
*/
export declare const useUpdatePublicEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePublicEvent>>, TError, {
        id: number;
        data: BodyType<PublicEventUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePublicEvent>>, TError, {
    id: number;
    data: BodyType<PublicEventUpdate>;
}, TContext>;
export declare const getDeletePublicEventUrl: (id: number) => string;
/**
 * @summary Delete public event (admin)
 */
export declare const deletePublicEvent: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePublicEventMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePublicEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePublicEvent>>, TError, {
    id: number;
}, TContext>;
export type DeletePublicEventMutationResult = NonNullable<Awaited<ReturnType<typeof deletePublicEvent>>>;
export type DeletePublicEventMutationError = ErrorType<unknown>;
/**
* @summary Delete public event (admin)
*/
export declare const useDeletePublicEvent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePublicEvent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePublicEvent>>, TError, {
    id: number;
}, TContext>;
export declare const getListComplaintsUrl: () => string;
/**
 * @summary List complaints (admin)
 */
export declare const listComplaints: (options?: RequestInit) => Promise<Complaint[]>;
export declare const getListComplaintsQueryKey: () => readonly ["/api/complaints"];
export declare const getListComplaintsQueryOptions: <TData = Awaited<ReturnType<typeof listComplaints>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComplaints>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComplaints>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListComplaintsQueryResult = NonNullable<Awaited<ReturnType<typeof listComplaints>>>;
export type ListComplaintsQueryError = ErrorType<unknown>;
/**
 * @summary List complaints (admin)
 */
export declare function useListComplaints<TData = Awaited<ReturnType<typeof listComplaints>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComplaints>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateComplaintUrl: () => string;
/**
 * @summary Submit complaint
 */
export declare const createComplaint: (complaintInput: ComplaintInput, options?: RequestInit) => Promise<Complaint>;
export declare const getCreateComplaintMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComplaint>>, TError, {
        data: BodyType<ComplaintInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createComplaint>>, TError, {
    data: BodyType<ComplaintInput>;
}, TContext>;
export type CreateComplaintMutationResult = NonNullable<Awaited<ReturnType<typeof createComplaint>>>;
export type CreateComplaintMutationBody = BodyType<ComplaintInput>;
export type CreateComplaintMutationError = ErrorType<unknown>;
/**
* @summary Submit complaint
*/
export declare const useCreateComplaint: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComplaint>>, TError, {
        data: BodyType<ComplaintInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createComplaint>>, TError, {
    data: BodyType<ComplaintInput>;
}, TContext>;
export declare const getUpdateComplaintUrl: (id: number) => string;
/**
 * @summary Update complaint status / reply (admin)
 */
export declare const updateComplaint: (id: number, complaintUpdate: ComplaintUpdate, options?: RequestInit) => Promise<Complaint>;
export declare const getUpdateComplaintMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateComplaint>>, TError, {
        id: number;
        data: BodyType<ComplaintUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateComplaint>>, TError, {
    id: number;
    data: BodyType<ComplaintUpdate>;
}, TContext>;
export type UpdateComplaintMutationResult = NonNullable<Awaited<ReturnType<typeof updateComplaint>>>;
export type UpdateComplaintMutationBody = BodyType<ComplaintUpdate>;
export type UpdateComplaintMutationError = ErrorType<void>;
/**
* @summary Update complaint status / reply (admin)
*/
export declare const useUpdateComplaint: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateComplaint>>, TError, {
        id: number;
        data: BodyType<ComplaintUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateComplaint>>, TError, {
    id: number;
    data: BodyType<ComplaintUpdate>;
}, TContext>;
export declare const getDeleteComplaintUrl: (id: number) => string;
/**
 * @summary Delete complaint (admin)
 */
export declare const deleteComplaint: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteComplaintMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComplaint>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteComplaint>>, TError, {
    id: number;
}, TContext>;
export type DeleteComplaintMutationResult = NonNullable<Awaited<ReturnType<typeof deleteComplaint>>>;
export type DeleteComplaintMutationError = ErrorType<void>;
/**
* @summary Delete complaint (admin)
*/
export declare const useDeleteComplaint: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComplaint>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteComplaint>>, TError, {
    id: number;
}, TContext>;
export declare const getListAuditLogsUrl: (params?: ListAuditLogsParams) => string;
/**
 * @summary List audit logs (admin)
 */
export declare const listAuditLogs: (params?: ListAuditLogsParams, options?: RequestInit) => Promise<AuditLog[]>;
export declare const getListAuditLogsQueryKey: (params?: ListAuditLogsParams) => readonly ["/api/audit-logs", ...ListAuditLogsParams[]];
export declare const getListAuditLogsQueryOptions: <TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAuditLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listAuditLogs>>>;
export type ListAuditLogsQueryError = ErrorType<unknown>;
/**
 * @summary List audit logs (admin)
 */
export declare function useListAuditLogs<TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Get admin dashboard statistics
 */
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get admin dashboard statistics
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSocialSettingsUrl: () => string;
/**
 * @summary Get X/Twitter automation settings (admin)
 */
export declare const getSocialSettings: (options?: RequestInit) => Promise<SocialSettings>;
export declare const getGetSocialSettingsQueryKey: () => readonly ["/api/admin/social/settings"];
export declare const getGetSocialSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSocialSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSocialSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSocialSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSocialSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSocialSettings>>>;
export type GetSocialSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get X/Twitter automation settings (admin)
 */
export declare function useGetSocialSettings<TData = Awaited<ReturnType<typeof getSocialSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSocialSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateSocialSettingsUrl: () => string;
/**
 * @summary Update X/Twitter automation settings (admin)
 */
export declare const updateSocialSettings: (socialSettingsUpdate: SocialSettingsUpdate, options?: RequestInit) => Promise<SocialSettings>;
export declare const getUpdateSocialSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSocialSettings>>, TError, {
        data: BodyType<SocialSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSocialSettings>>, TError, {
    data: BodyType<SocialSettingsUpdate>;
}, TContext>;
export type UpdateSocialSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSocialSettings>>>;
export type UpdateSocialSettingsMutationBody = BodyType<SocialSettingsUpdate>;
export type UpdateSocialSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update X/Twitter automation settings (admin)
*/
export declare const useUpdateSocialSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSocialSettings>>, TError, {
        data: BodyType<SocialSettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSocialSettings>>, TError, {
    data: BodyType<SocialSettingsUpdate>;
}, TContext>;
export declare const getListSocialLogsUrl: () => string;
/**
 * @summary List X/Twitter automation logs (admin)
 */
export declare const listSocialLogs: (options?: RequestInit) => Promise<SocialLog[]>;
export declare const getListSocialLogsQueryKey: () => readonly ["/api/admin/social/logs"];
export declare const getListSocialLogsQueryOptions: <TData = Awaited<ReturnType<typeof listSocialLogs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSocialLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSocialLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSocialLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listSocialLogs>>>;
export type ListSocialLogsQueryError = ErrorType<unknown>;
/**
 * @summary List X/Twitter automation logs (admin)
 */
export declare function useListSocialLogs<TData = Awaited<ReturnType<typeof listSocialLogs>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSocialLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getPreviewSocialPostUrl: () => string;
/**
 * @summary Build a preview of today's post from live data (admin)
 */
export declare const previewSocialPost: (options?: RequestInit) => Promise<SocialPreview>;
export declare const getPreviewSocialPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof previewSocialPost>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof previewSocialPost>>, TError, void, TContext>;
export type PreviewSocialPostMutationResult = NonNullable<Awaited<ReturnType<typeof previewSocialPost>>>;
export type PreviewSocialPostMutationError = ErrorType<unknown>;
/**
* @summary Build a preview of today's post from live data (admin)
*/
export declare const usePreviewSocialPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof previewSocialPost>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof previewSocialPost>>, TError, void, TContext>;
export declare const getTestSocialPostUrl: () => string;
/**
 * @summary Run a manual test of the X/Twitter posting pipeline (admin)
 */
export declare const testSocialPost: (options?: RequestInit) => Promise<SocialTestResult>;
export declare const getTestSocialPostMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testSocialPost>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof testSocialPost>>, TError, void, TContext>;
export type TestSocialPostMutationResult = NonNullable<Awaited<ReturnType<typeof testSocialPost>>>;
export type TestSocialPostMutationError = ErrorType<unknown>;
/**
* @summary Run a manual test of the X/Twitter posting pipeline (admin)
*/
export declare const useTestSocialPost: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof testSocialPost>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof testSocialPost>>, TError, void, TContext>;
export declare const getListStoryTemplatesUrl: () => string;
/**
 * @summary List story templates
 */
export declare const listStoryTemplates: (options?: RequestInit) => Promise<StoryTemplate[]>;
export declare const getListStoryTemplatesQueryKey: () => readonly ["/api/story-templates"];
export declare const getListStoryTemplatesQueryOptions: <TData = Awaited<ReturnType<typeof listStoryTemplates>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStoryTemplates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listStoryTemplates>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListStoryTemplatesQueryResult = NonNullable<Awaited<ReturnType<typeof listStoryTemplates>>>;
export type ListStoryTemplatesQueryError = ErrorType<unknown>;
/**
 * @summary List story templates
 */
export declare function useListStoryTemplates<TData = Awaited<ReturnType<typeof listStoryTemplates>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listStoryTemplates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateStoryTemplateUrl: () => string;
/**
 * @summary Create story template (admin)
 */
export declare const createStoryTemplate: (storyTemplateInput: StoryTemplateInput, options?: RequestInit) => Promise<StoryTemplate>;
export declare const getCreateStoryTemplateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStoryTemplate>>, TError, {
        data: BodyType<StoryTemplateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createStoryTemplate>>, TError, {
    data: BodyType<StoryTemplateInput>;
}, TContext>;
export type CreateStoryTemplateMutationResult = NonNullable<Awaited<ReturnType<typeof createStoryTemplate>>>;
export type CreateStoryTemplateMutationBody = BodyType<StoryTemplateInput>;
export type CreateStoryTemplateMutationError = ErrorType<unknown>;
/**
* @summary Create story template (admin)
*/
export declare const useCreateStoryTemplate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createStoryTemplate>>, TError, {
        data: BodyType<StoryTemplateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createStoryTemplate>>, TError, {
    data: BodyType<StoryTemplateInput>;
}, TContext>;
export declare const getUpdateStoryTemplateUrl: (id: number) => string;
/**
 * @summary Update story template (admin)
 */
export declare const updateStoryTemplate: (id: number, storyTemplateUpdate: StoryTemplateUpdate, options?: RequestInit) => Promise<StoryTemplate>;
export declare const getUpdateStoryTemplateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStoryTemplate>>, TError, {
        id: number;
        data: BodyType<StoryTemplateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateStoryTemplate>>, TError, {
    id: number;
    data: BodyType<StoryTemplateUpdate>;
}, TContext>;
export type UpdateStoryTemplateMutationResult = NonNullable<Awaited<ReturnType<typeof updateStoryTemplate>>>;
export type UpdateStoryTemplateMutationBody = BodyType<StoryTemplateUpdate>;
export type UpdateStoryTemplateMutationError = ErrorType<unknown>;
/**
* @summary Update story template (admin)
*/
export declare const useUpdateStoryTemplate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateStoryTemplate>>, TError, {
        id: number;
        data: BodyType<StoryTemplateUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateStoryTemplate>>, TError, {
    id: number;
    data: BodyType<StoryTemplateUpdate>;
}, TContext>;
export declare const getDeleteStoryTemplateUrl: (id: number) => string;
/**
 * @summary Delete story template (admin)
 */
export declare const deleteStoryTemplate: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteStoryTemplateMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteStoryTemplate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteStoryTemplate>>, TError, {
    id: number;
}, TContext>;
export type DeleteStoryTemplateMutationResult = NonNullable<Awaited<ReturnType<typeof deleteStoryTemplate>>>;
export type DeleteStoryTemplateMutationError = ErrorType<unknown>;
/**
* @summary Delete story template (admin)
*/
export declare const useDeleteStoryTemplate: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteStoryTemplate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteStoryTemplate>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
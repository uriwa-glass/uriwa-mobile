import { z } from "zod";
import {
  ReservationStatus,
  PaymentMethod,
  reservationSchema,
  reservationStatusSchema,
  paymentMethodSchema,
} from "./reservation";
import { ClassSchedule, classScheduleSchema } from "./class";
import { UserProfile, userProfileSchema, UserRole, userRoleSchema } from "./user";

// 로딩 상태 스키마
export const loadingStateSchema = z.object({
  loading: z.boolean(),
  error: z.string().nullable(),
});
export type LoadingState = z.infer<typeof loadingStateSchema>;

// 알림 타입 스키마
export const notificationTypeSchema = z.enum(["success", "error", "info", "warning"]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

// 테마 스키마
export const themeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof themeSchema>;

// 알림 스키마
export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  message: z.string(),
  timestamp: z.number(),
  read: z.boolean(),
  autoClose: z.boolean().optional(),
  duration: z.number().optional(),
});
export type Notification = z.infer<typeof notificationSchema>;

// UI 상태 스키마
export const uiStateSchema = loadingStateSchema.extend({
  sidebarOpen: z.boolean(),
  modalOpen: z.boolean(),
  modalType: z.string().nullable(),
  modalData: z.any(),
  theme: themeSchema,
  notifications: z.array(notificationSchema),
});
export type UIState = z.infer<typeof uiStateSchema>;

// 결제 상태 스키마
export const paymentStatusTypeSchema = z.enum([
  "pending",
  "paid",
  "refunded",
  "failed",
  "cancelled",
]);
export type PaymentStatusType = z.infer<typeof paymentStatusTypeSchema>;

// 스토어 예약 정보 스키마 (API 응답 확장)
export const storeReservationSchema = reservationSchema.extend({
  class_schedules: z
    .lazy(() =>
      classScheduleSchema.extend({
        classes: z
          .object({
            id: z.string(),
            title: z.string(),
            category: z.string().optional(),
            instructor_id: z.string().optional(),
            instructors: z
              .array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                })
              )
              .optional(),
          })
          .optional(),
      })
    )
    .optional(),
  users: z.lazy(() => userProfileSchema).optional(),
  payment_status: paymentStatusTypeSchema.optional(),
});
export type StoreReservation = z.infer<typeof storeReservationSchema>;

// 예약 상태 스키마
export const reservationStateSchema = loadingStateSchema.extend({
  currentReservation: storeReservationSchema.nullable(),
  reservationHistory: z.array(storeReservationSchema),
  selectedSchedule: z.lazy(() => scheduleSchema.nullable()),
});
export type ReservationState = z.infer<typeof reservationStateSchema>;

// 가용성 상태 스키마
export const availabilityStatusSchema = z.enum(["available", "low", "full", "cancelled"]);
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>;

// 스케줄 스키마
export const scheduleSchema = z.object({
  id: z.string(),
  class_id: z.string(),
  date: z.string(),
  duration: z.number(),
  capacity: z.number(),
  remaining_seats: z.number(),
  is_cancelled: z.boolean(),
  instructor_id: z.string().optional(),
  location: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  availabilityStatus: availabilityStatusSchema.optional(),
});
export type Schedule = z.infer<typeof scheduleSchema>;

// 클래스 정보 스키마
export const classInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number(),
  original_price: z.number().optional(),
  capacity: z.number(),
  duration: z.number(),
  image_url: z.string().optional(),
  instructor_id: z.string().optional(),
  curriculum: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ClassInfo = z.infer<typeof classInfoSchema>;

// 스케줄 필터 스키마
export const scheduleFiltersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  dateRange: z.tuple([z.string(), z.string()]).optional(),
  instructorId: z.string().optional(),
  availabilityStatus: availabilityStatusSchema.optional(),
  searchTerm: z.string().optional(),
});
export type ScheduleFilters = z.infer<typeof scheduleFiltersSchema>;

// 스케줄 뷰 타입 스키마
export const scheduleViewSchema = z.enum(["day", "week", "month"]);
export type ScheduleView = z.infer<typeof scheduleViewSchema>;

// 스케줄 상태 스키마
export const scheduleStateSchema = loadingStateSchema.extend({
  schedules: z.array(scheduleSchema),
  classes: z.array(classInfoSchema),
  filters: scheduleFiltersSchema,
  selectedDate: z.string(),
  selectedView: scheduleViewSchema,
});
export type ScheduleState = z.infer<typeof scheduleStateSchema>;

// 사용자 스키마 (직접 import하지 않은 타입)
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  created_at: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
export type User = z.infer<typeof userSchema>;

// 사용자 기본 설정 스키마
export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  theme: themeSchema.optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// 사용자 상태 스키마
export const userStateSchema = loadingStateSchema.extend({
  currentUser: userSchema.nullable(),
  userProfile: z.lazy(() => userProfileSchema.nullable()),
  isAuthenticated: z.boolean(),
});
export type UserState = z.infer<typeof userStateSchema>;

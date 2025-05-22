import { z } from "zod";

// 수업 유형 스키마
export const classTypeSchema = z.enum(["REGULAR", "SPECIAL", "WORKSHOP", "EVENT"]);
export type ClassType = z.infer<typeof classTypeSchema>;

// 수업 카테고리 스키마
export const classCategorySchema = z.enum([
  "YOGA",
  "PILATES",
  "FITNESS",
  "DANCE",
  "MEDITATION",
  "OTHER",
]);
export type ClassCategory = z.infer<typeof classCategorySchema>;

// 수업 난이도 스키마
export const classLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL"]);
export type ClassLevel = z.infer<typeof classLevelSchema>;

// 수업 기본 스키마
export const classSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  capacity: z.number(),
  duration: z.number(),
  category: z.string(),
  type: classTypeSchema,
  image_url: z.string().optional(),
  instructor_id: z.string().optional(),
  location: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Class = z.infer<typeof classSchema>;

// 수업 일정 스키마
export const classScheduleSchema = z.object({
  id: z.string(),
  class_id: z.string(),
  date: z.string(),
  duration: z.number(),
  capacity: z.number(),
  remaining_seats: z.number(),
  is_cancelled: z.boolean(),
  cancellation_reason: z.string().optional(),
  instructor_id: z.string().optional(),
  location: z.string().optional(),
  classes: classSchema.optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ClassSchedule = z.infer<typeof classScheduleSchema>;

// 수업 가능 여부 응답 스키마
export const availabilityResponseSchema = z.object({
  available: z.boolean(),
  remaining_seats: z.number(),
  total_capacity: z.number(),
  class_id: z.string(),
  schedule_id: z.string(),
  message: z.string().optional(),
});
export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;

// 수업 필터 옵션 스키마
export const classFilterOptionsSchema = z.object({
  category: classCategorySchema.optional(),
  type: classTypeSchema.optional(),
  level: classLevelSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  searchQuery: z.string().optional(),
  instructorId: z.string().optional(),
  hasAvailability: z.boolean().optional(),
});
export type ClassFilterOptions = z.infer<typeof classFilterOptionsSchema>;

// 수업 정렬 옵션 스키마
export const classSortOptionSchema = z.enum([
  "date-asc",
  "date-desc",
  "price-asc",
  "price-desc",
  "popularity",
]);
export type ClassSortOption = z.infer<typeof classSortOptionSchema>;

// 수업 일정 그룹 스키마
export const scheduleGroupSchema = z.object({
  date: z.string(),
  schedules: z.array(classScheduleSchema),
});
export type ScheduleGroup = z.infer<typeof scheduleGroupSchema>;

// 인기 수업 스키마
export const popularClassSchema = z.object({
  id: z.string(),
  title: z.string(),
  bookings_count: z.number(),
  average_rating: z.number(),
  image_url: z.string().optional(),
});
export type PopularClass = z.infer<typeof popularClassSchema>;

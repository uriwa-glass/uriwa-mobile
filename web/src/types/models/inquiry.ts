import { z } from "zod";

// 문의 상태 스키마
export const inquiryStatusSchema = z.enum(["pending", "in-review", "answered", "closed"]);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

// 문의 중요도 스키마
export const inquiryPrioritySchema = z.enum(["low", "medium", "high"]);
export type InquiryPriority = z.infer<typeof inquiryPrioritySchema>;

// 문의 카테고리 스키마
export const inquiryCategorySchema = z.enum([
  "general",
  "reservation",
  "payment",
  "class",
  "technical",
  "other",
]);
export type InquiryCategory = z.infer<typeof inquiryCategorySchema>;

// 사용자 문의 메시지 스키마
export const userInquiryMessageSchema = z.object({
  id: z.string(),
  inquiry_id: z.string(),
  sender_id: z.string(),
  is_admin: z.boolean(),
  content: z.string(),
  attachment_urls: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  read_at: z.string().nullable(),
});

// 사용자 프로필 스키마 (중첩 객체)
const userProfileSchema = z.object({
  full_name: z.string(),
  avatar_url: z.string().optional(),
});

// 사용자 정보 스키마 (중첩 객체)
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  profile: userProfileSchema.optional(),
});

// 사용자 문의 스키마
export const userInquirySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  category: inquiryCategorySchema,
  status: inquiryStatusSchema,
  priority: inquiryPrioritySchema,
  description: z.string(),
  last_updated_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  is_read: z.boolean(),
  messages: z.array(userInquiryMessageSchema).optional(),
  user: userSchema.optional(),
});

// 사용자 문의 필터 스키마
export const userInquiryFilterSchema = z.object({
  status: inquiryStatusSchema.optional(),
  category: inquiryCategorySchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  searchQuery: z.string().optional(),
  isRead: z.boolean().optional(),
});

// 사용자 문의 생성 데이터 스키마
export const userInquiryCreateDataSchema = z.object({
  title: z.string(),
  category: inquiryCategorySchema,
  description: z.string(),
  attachment_urls: z.array(z.string()).optional(),
});

// 타입 추출
export type UserInquiryMessage = z.infer<typeof userInquiryMessageSchema>;
export type UserInquiry = z.infer<typeof userInquirySchema>;
export type UserInquiryFilter = z.infer<typeof userInquiryFilterSchema>;
export type UserInquiryCreateData = z.infer<typeof userInquiryCreateDataSchema>;

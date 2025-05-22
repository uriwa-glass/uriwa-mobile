export {
  userProfileSchema,
  membershipLevelSchema,
  userRoleSchema,
  createUserProfileSchema,
} from "./models/user";

export {
  classTypeSchema,
  classCategorySchema,
  classLevelSchema,
  classSchema,
  classScheduleSchema,
  availabilityResponseSchema,
  classFilterOptionsSchema,
  classSortOptionSchema,
  scheduleGroupSchema,
  popularClassSchema,
} from "./models/class";

export {
  reservationStatusSchema,
  paymentMethodSchema,
  reservationSchema,
  reservationRequestSchema,
  reservationResponseSchema,
  cancellationRefundStatusSchema,
  cancellationSchema,
  timeCancellationPolicySchema,
  membershipCancellationPolicySchema,
  classTypeCancellationPolicySchema,
  cancellationPoliciesSchema,
  cancellationCheckSchema,
  cancellationRequestSchema,
  cancellationResponseSchema,
  cancellationStatsSchema,
  cancellationAnalyticsFilterSchema,
} from "./models/reservation";

export {
  userSessionSchema,
  sessionTransactionTypeSchema,
  sessionTransactionSchema,
} from "./models/session";

export {
  inquiryStatusSchema,
  inquiryPrioritySchema,
  inquiryCategorySchema,
  userInquiryMessageSchema,
  userSchema,
  userInquirySchema,
  userInquiryFilterSchema,
  userInquiryCreateDataSchema,
} from "./models/inquiry";

export {
  inquiryStatusSchema as formInquiryStatusSchema,
  formFieldTypeSchema,
  formFieldSchema,
  formTemplateSchema,
  formSubmissionStatusSchema,
  formSubmissionSchema,
  inquirySchema,
  validationRuleTypeSchema,
  validationRuleSchema,
  operatorSchema,
  conditionalDisplaySchema,
  fieldOptionSchema,
  styleSchema,
  formFieldExtendedSchema,
  formTemplateExtendedSchema,
  formErrorSchema,
  fileObjectSchema,
  dynamicFormPropsSchema,
} from "./models/form";

// 스토어 관련 타입들 내보내기
export {
  loadingStateSchema,
  notificationTypeSchema,
  themeSchema,
  notificationSchema,
  uiStateSchema,
  paymentStatusTypeSchema,
  storeReservationSchema,
  reservationStateSchema,
  availabilityStatusSchema,
  scheduleSchema,
  classInfoSchema,
  scheduleFiltersSchema,
  scheduleViewSchema,
  scheduleStateSchema,
  userSchema as storeUserSchema, // 충돌 방지를 위해 이름 변경
  userPreferencesSchema,
  userStateSchema,
} from "./models/store";

// 수업 가용성 관련 타입 (models 폴더에 없는 독립적인 타입)
export interface ScheduleWithAvailability {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
  availabilityStatus: string;
  classes?: any; // 유연성을 위해 any 타입 사용
  cancellation_reason?: string;
  instructor_id?: string;
  location?: string;
}

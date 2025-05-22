import { z } from "zod";

// 문의 상태 타입
export const inquiryStatusSchema = z.enum(["new", "in-progress", "resolved"]);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

// 문의 관련 스키마
export const inquirySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string(),
  message: z.string(),
  status: inquiryStatusSchema.optional(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// 필드 타입 스키마 (확장된 버전)
export const formFieldTypeSchema = z.enum([
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "select",
  "radio",
  "checkbox",
  "date",
  "file",
  "tel",
]);
export type FormFieldType = z.infer<typeof formFieldTypeSchema>;

// 유효성 검사 규칙 스키마
export const validationRuleTypeSchema = z.enum([
  "required",
  "minLength",
  "maxLength",
  "pattern",
  "min",
  "max",
  "email",
  "phone",
]);

export const validationRuleSchema = z.object({
  type: validationRuleTypeSchema,
  value: z.any().optional(),
  message: z.string(),
});
export type ValidationRule = z.infer<typeof validationRuleSchema>;

// 조건부 표시 스키마
export const operatorSchema = z
  .enum(["==", "!=", "includes", "notIncludes", ">", "<", ">=", "<="])
  .optional();

export const conditionalDisplaySchema = z.object({
  dependsOn: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]),
  operator: operatorSchema,
});
export type ConditionalDisplay = z.infer<typeof conditionalDisplaySchema>;

// 필드 옵션 스키마
export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});
export type FieldOption = z.infer<typeof fieldOptionSchema>;

// 스타일 스키마
export const styleSchema = z.record(z.string().optional()).optional();

// 폼 필드 스키마 (확장된 버전)
export const formFieldExtendedSchema = z.object({
  id: z.string(),
  type: formFieldTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(fieldOptionSchema).optional(),
  defaultValue: z.any().optional(),
  validation: z.array(validationRuleSchema).optional(),
  conditionalDisplay: conditionalDisplaySchema.optional(),
  multiple: z.boolean().optional(),
  accept: z.string().optional(),
  style: styleSchema,
});
export type FormFieldExtended = z.infer<typeof formFieldExtendedSchema>;

// 기존 폼 필드 스키마 (호환성을 위해 유지)
export const formFieldSchema = z.object({
  id: z.string(),
  type: formFieldTypeSchema,
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.string().optional(),
  order: z.number().int(),
});

// 폼 템플릿 스키마 (확장된 버전)
export const formTemplateExtendedSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(formFieldExtendedSchema),
  submitButtonText: z.string().optional(),
  cancelButtonText: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type FormTemplateExtended = z.infer<typeof formTemplateExtendedSchema>;

// 기존 폼 템플릿 스키마 (호환성을 위해 유지)
export const formTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(formFieldSchema),
  is_active: z.boolean(),
  created_by: z.string().uuid().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 폼 제출 상태 스키마
export const formSubmissionStatusSchema = z.enum(["submitted", "reviewed", "processed"]);
export type FormSubmissionStatus = z.infer<typeof formSubmissionStatusSchema>;

// 폼 제출 스키마
export const formSubmissionSchema = z.object({
  id: z.string().optional(),
  template_id: z.string(),
  user_id: z.string().uuid().optional(),
  data: z.record(z.any()),
  status: formSubmissionStatusSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// 폼 에러 스키마
export const formErrorSchema = z.object({
  fieldId: z.string(),
  message: z.string(),
});
export type FormError = z.infer<typeof formErrorSchema>;

// 파일 객체 스키마
export const fileObjectSchema = z.object({
  file: z.instanceof(File),
  preview: z.string().optional(),
});
export type FileObject = z.infer<typeof fileObjectSchema>;

// 동적 폼 속성 스키마
export const dynamicFormPropsSchema = z.object({
  template: formTemplateExtendedSchema,
  initialValues: z.record(z.any()).optional(),
  onSubmit: z.function().args(z.record(z.any())).returns(z.void()),
  onCancel: z.function().args().returns(z.void()).optional(),
  isLoading: z.boolean().optional(),
});
export type DynamicFormProps = z.infer<typeof dynamicFormPropsSchema>;

// 타입 추출 (기존 타입들)
export type Inquiry = z.infer<typeof inquirySchema>;
export type FormField = z.infer<typeof formFieldSchema>;
export type FormTemplate = z.infer<typeof formTemplateSchema>;
export type FormSubmission = z.infer<typeof formSubmissionSchema>;

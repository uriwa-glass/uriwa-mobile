export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "file";

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customMessage?: string;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string | string[] | number | boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  isVisible?: boolean;
  dependsOn?: {
    fieldId: string;
    value: string | string[] | boolean;
  };
  style?: {
    width?: string;
    marginBottom?: string;
  };
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  fields: FormField[];
  version: number;
  notificationEmails?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id?: string;
  templateId: string;
  userId?: string;
  data: Record<string, any>;
  status?: "draft" | "submitted" | "reviewed" | "completed" | "rejected";
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileAttachment {
  id?: string;
  submissionId?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt?: string;
}

export interface FormError {
  fieldId: string;
  message: string;
}

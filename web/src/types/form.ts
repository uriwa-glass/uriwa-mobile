export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file";

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "min" | "max" | "email" | "phone";
  value?: any;
  message: string;
}

export interface ConditionalDisplay {
  dependsOn: string;
  value: string | string[] | number | boolean;
  operator?: "==" | "!=" | "includes" | "notIncludes" | ">" | "<" | ">=" | "<=";
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: any;
  validation?: ValidationRule[];
  conditionalDisplay?: ConditionalDisplay;
  multiple?: boolean;
  accept?: string;
  style?: {
    width?: string;
    marginBottom?: string;
    [key: string]: string | undefined;
  };
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitButtonText?: string;
  cancelButtonText?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormError {
  fieldId: string;
  message: string;
}

export interface DynamicFormProps {
  template: FormTemplate;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface FileObject {
  file: File;
  preview?: string;
}

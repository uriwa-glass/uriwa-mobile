import React, { useState, useEffect } from "react";
import Button from "./Button";
import Card from "./Card";
import { ConditionalDisplay, FileObject, FormFieldExtended } from "@/types/models/form";
import { FormError } from "@/types/models/form";
import { DynamicFormProps } from "@/types/models/form";

const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormError[]>([]);
  const [fileUploads, setFileUploads] = useState<Record<string, FileObject>>({});

  // 초기 값 설정
  useEffect(() => {
    const defaultValues: Record<string, any> = {};

    template.fields.forEach((field) => {
      if (initialValues[field.id] !== undefined) {
        defaultValues[field.id] = initialValues[field.id];
      } else if (field.defaultValue !== undefined) {
        defaultValues[field.id] = field.defaultValue;
      } else {
        // 필드 타입에 따른 기본값 설정
        switch (field.type) {
          case "checkbox":
            defaultValues[field.id] = [];
            break;
          default:
            defaultValues[field.id] = "";
        }
      }
    });

    setFormValues(defaultValues);
  }, [template, initialValues]);

  // 필드 값 변경 처리
  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldId]: value,
    }));
  };

  // 파일 업로드 처리
  const handleFileUpload = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    setFileUploads((prev) => ({
      ...prev,
      [fieldId]: { file },
    }));

    handleChange(fieldId, file);
  };

  // 파일 삭제 처리
  const handleRemoveFile = (fieldId: string) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };
      delete newUploads[fieldId];
      return newUploads;
    });

    handleChange(fieldId, null);
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    template.fields.forEach((field) => {
      // 조건부 표시 필드인 경우 표시되지 않으면 검증 생략
      if (field.conditionalDisplay && !isFieldVisible(field)) {
        return;
      }

      const value = formValues[field.id];

      // 필수 필드 검사
      if (field.required && (value === undefined || value === null || value === "")) {
        newErrors.push({
          fieldId: field.id,
          message: `${field.label}은(는) 필수 항목입니다`,
        });
      }

      // 유효성 검사 규칙 적용
      if (field.validation && value) {
        field.validation.forEach((rule) => {
          let isValid = true;

          switch (rule.type) {
            case "minLength":
              isValid = String(value).length >= (rule.value as number);
              break;
            case "maxLength":
              isValid = String(value).length <= (rule.value as number);
              break;
            case "min":
              isValid = Number(value) >= (rule.value as number);
              break;
            case "max":
              isValid = Number(value) <= (rule.value as number);
              break;
            case "pattern":
              isValid = new RegExp(rule.value as string).test(String(value));
              break;
            case "email":
              isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
              break;
            case "phone":
              isValid = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/.test(String(value));
              break;
          }

          if (!isValid) {
            newErrors.push({
              fieldId: field.id,
              message: rule.message,
            });
          }
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 조건부 표시 필드 처리
  const isFieldVisible = (field: FormFieldExtended): boolean => {
    if (!field.conditionalDisplay) return true;

    const condition = field.conditionalDisplay;
    const dependentValue = formValues[condition.dependsOn];

    if (dependentValue === undefined) return false;

    // 연산자가 명시되지 않은 경우 기본적으로 '==' 연산자 사용
    const operator = condition.operator || "==";

    switch (operator) {
      case "==":
        return dependentValue == condition.value;
      case "!=":
        return dependentValue != condition.value;
      case "includes":
        return Array.isArray(dependentValue) && dependentValue.includes(condition.value);
      case "notIncludes":
        return Array.isArray(dependentValue) && !dependentValue.includes(condition.value);
      case ">":
        return dependentValue > condition.value;
      case "<":
        return dependentValue < condition.value;
      case ">=":
        return dependentValue >= condition.value;
      case "<=":
        return dependentValue <= condition.value;
      default:
        return false;
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 파일 업로드 처리가 필요할 경우 여기서 처리
    const formData = { ...formValues };

    // 제출 처리
    onSubmit(formData);
  };

  // 필드 오류 메시지 반환
  const getFieldError = (fieldId: string): string | null => {
    const error = errors.find((err) => err.fieldId === fieldId);
    return error ? error.message : null;
  };

  // 필드 렌더링
  const renderField = (field: FormFieldExtended) => {
    // 필드가 표시되지 않으면 렌더링 생략
    if (field.conditionalDisplay && !isFieldVisible(field)) {
      return null;
    }

    const value = formValues[field.id];
    const error = getFieldError(field.id);
    const hasError = !!error;

    // 필드 스타일 계산
    const containerStyle: React.CSSProperties = {};
    if (field.style?.width) {
      containerStyle.width = field.style.width;
    }
    if (field.style?.marginBottom) {
      containerStyle.marginBottom = field.style.marginBottom;
    }

    // 입력 필드에 공통으로 적용되는 클래스
    const inputBaseClass = `w-full p-3 border rounded-sm text-text-primary bg-background-light focus:outline-none focus:border-primary-main ${
      hasError ? "border-error-main" : "border-border-medium"
    }`;

    // 필드 유형에 따른 렌더링
    let fieldComponent;

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        fieldComponent = (
          <input
            type={field.type}
            id={field.id}
            className={inputBaseClass}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
        break;

      case "textarea":
        fieldComponent = (
          <textarea
            id={field.id}
            className={`${inputBaseClass} min-h-[100px] resize-vertical`}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
        break;

      case "select":
        fieldComponent = (
          <select
            id={field.id}
            className={inputBaseClass}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          >
            <option value="" disabled>
              {field.placeholder || "선택하세요"}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case "radio":
        fieldComponent = (
          <div className="mt-1">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center mb-1.5">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  className="mr-2.5"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(field.id, option.value)}
                />
                <label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-md text-text-primary"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        break;

      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : value ? [value] : [];
        fieldComponent = (
          <div className="mt-1">
            {field.options?.map((option) => {
              const isChecked = checkboxValues.includes(option.value);
              return (
                <div key={option.value} className="flex items-center mb-1.5">
                  <input
                    type="checkbox"
                    id={`${field.id}-${option.value}`}
                    name={field.id}
                    className="mr-2.5"
                    value={option.value}
                    checked={isChecked}
                    onChange={() => {
                      const newValues = [...checkboxValues];
                      if (isChecked) {
                        const index = newValues.indexOf(option.value);
                        if (index > -1) {
                          newValues.splice(index, 1);
                        }
                      } else {
                        newValues.push(option.value);
                      }
                      handleChange(field.id, newValues);
                    }}
                  />
                  <label
                    htmlFor={`${field.id}-${option.value}`}
                    className="text-md text-text-primary"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        );
        break;

      case "date":
        fieldComponent = (
          <input
            type="date"
            id={field.id}
            className={inputBaseClass}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        );
        break;

      case "file":
        fieldComponent = (
          <div className="mt-1">
            <div className="flex gap-2">
              <input
                type="file"
                id={field.id}
                className="hidden"
                accept={field.accept || "*/*"}
                onChange={(e) => handleFileUpload(field.id, e)}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(field.id)?.click()}
                className="flex-1"
              >
                파일 선택
              </Button>
            </div>
            {fileUploads[field.id] && (
              <div className="flex items-center mt-2.5 p-2.5 bg-background-light rounded-sm">
                <span className="flex-1 text-sm text-text-primary truncate">
                  {fileUploads[field.id].file.name}
                </span>
                <button
                  type="button"
                  className="bg-transparent border-0 cursor-pointer text-sm text-error-main ml-2.5"
                  onClick={() => handleRemoveFile(field.id)}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        );
        break;

      default:
        fieldComponent = <div>지원되지 않는 필드 유형입니다.</div>;
        break;
    }

    return (
      <div key={field.id} style={containerStyle} className="mb-5">
        <label htmlFor={field.id} className="block text-md font-bold text-text-primary mb-2">
          {field.label}
          {field.required && <span className="text-error-main"> *</span>}
        </label>

        {field.description && (
          <p className="text-sm text-text-secondary mb-2">{field.description}</p>
        )}

        {fieldComponent}

        {error && <p className="text-error-main text-sm mt-1">{error}</p>}
      </div>
    );
  };

  // 최종 렌더링
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="p-4 border-b border-border-light">
          <h2 className="text-xl text-text-primary mb-2">{template.title}</h2>
          {template.description && (
            <p className="text-md text-text-secondary leading-6">{template.description}</p>
          )}
        </div>

        <div className="p-4">{template.fields.map((field) => renderField(field))}</div>

        <div className="flex justify-between p-4 border-t border-border-light">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 mr-2"
            >
              {template.cancelButtonText || "취소"}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isLoading} className="flex-2 relative">
            {isLoading ? "제출 중..." : template.submitButtonText || "제출하기"}
            {isLoading && (
              <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-primary-contrast">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="animate-spin"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            )}
          </Button>
        </div>

        {errors.length > 0 && (
          <div className="m-4 p-3 bg-error-light bg-opacity-20 rounded-md">
            <h3 className="text-md font-bold text-error-dark mb-2">입력 양식에 오류가 있습니다:</h3>
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-error-dark mb-1">
                • {error.message}
              </p>
            ))}
          </div>
        )}
      </form>
    </Card>
  );
};

export default DynamicForm;

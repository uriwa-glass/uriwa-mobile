import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import theme from "../styles/theme";
import Button from "./Button";
import { FormTemplate, FormField, FormFieldType, FormError, FormSubmission } from "../types/forms";

interface DynamicFormProps {
  template: FormTemplate;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormError[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<{
    [key: string]: boolean;
  }>({});
  const [fileUploads, setFileUploads] = useState<{
    [key: string]: { name: string; uri: string; type: string; size: number };
  }>({});

  // 초기 값 설정
  useEffect(() => {
    const defaultValues: Record<string, any> = {};
    template.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaultValues[field.id] = field.defaultValue;
      }
    });

    setFormValues({ ...defaultValues, ...initialValues });
  }, [template, initialValues]);

  // 필드 값 변경 처리
  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));

    // 에러 제거
    setErrors((prev) => prev.filter((error) => error.fieldId !== fieldId));
  };

  // 파일 업로드 처리
  const handleFileUpload = async (fieldId: string, pickImage = false) => {
    try {
      let result;

      if (pickImage) {
        // 이미지 선택
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          throw new Error("카메라 롤 접근 권한이 필요합니다.");
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        // 문서 선택
        result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileUploads((prev) => ({
          ...prev,
          [fieldId]: {
            name: file.fileName || "file",
            uri: file.uri,
            type: file.mimeType || "application/octet-stream",
            size: file.fileSize || 0,
          },
        }));

        // 파일 URI 저장
        handleChange(fieldId, file.uri);
      }
    } catch (error) {
      console.error("Error picking file:", error);
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: FormError[] = [];

    template.fields.forEach((field) => {
      // 필드가 표시되어 있는 경우에만 유효성 검사
      if (isFieldVisible(field)) {
        const value = formValues[field.id];
        const validation = field.validation;

        if (validation) {
          // 필수 입력 검사
          if (validation.required && (value === undefined || value === null || value === "")) {
            newErrors.push({
              fieldId: field.id,
              message: validation.customMessage || `${field.label}은(는) 필수 입력 항목입니다.`,
            });
          }

          // 문자열 길이 검사
          if (typeof value === "string") {
            if (validation.minLength && value.length < validation.minLength) {
              newErrors.push({
                fieldId: field.id,
                message:
                  validation.customMessage ||
                  `${field.label}은(는) 최소 ${validation.minLength}자 이상이어야 합니다.`,
              });
            }

            if (validation.maxLength && value.length > validation.maxLength) {
              newErrors.push({
                fieldId: field.id,
                message:
                  validation.customMessage ||
                  `${field.label}은(는) 최대 ${validation.maxLength}자 이하여야 합니다.`,
              });
            }

            // 정규식 패턴 검사
            if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
              newErrors.push({
                fieldId: field.id,
                message: validation.customMessage || `${field.label} 형식이 올바르지 않습니다.`,
              });
            }
          }

          // 숫자 범위 검사
          if (typeof value === "number") {
            if (validation.min !== undefined && value < validation.min) {
              newErrors.push({
                fieldId: field.id,
                message:
                  validation.customMessage ||
                  `${field.label}은(는) ${validation.min} 이상이어야 합니다.`,
              });
            }

            if (validation.max !== undefined && value > validation.max) {
              newErrors.push({
                fieldId: field.id,
                message:
                  validation.customMessage ||
                  `${field.label}은(는) ${validation.max} 이하여야 합니다.`,
              });
            }
          }
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // 필드 표시 여부 확인
  const isFieldVisible = (field: FormField) => {
    if (field.isVisible === false) return false;

    // 의존성 확인
    if (field.dependsOn) {
      const { fieldId, value } = field.dependsOn;
      const dependentValue = formValues[fieldId];

      // 배열 값 비교
      if (Array.isArray(value) && Array.isArray(dependentValue)) {
        return value.some((v) => dependentValue.includes(v));
      }

      // 불리언 값 비교
      if (typeof value === "boolean") {
        return dependentValue === value;
      }

      // 기본 값 비교
      return dependentValue === value;
    }

    return true;
  };

  // 폼 제출 처리
  const handleSubmit = () => {
    if (validateForm()) {
      // 파일 업로드 정보 포함
      const formData = { ...formValues };

      // 폼 데이터에 파일 정보 추가
      Object.entries(fileUploads).forEach(([fieldId, fileInfo]) => {
        formData[fieldId] = {
          uri: fileInfo.uri,
          name: fileInfo.name,
          type: fileInfo.type,
          size: fileInfo.size,
        };
      });

      onSubmit(formData);
    }
  };

  // 날짜 픽커 표시 토글
  const toggleDatePicker = (fieldId: string) => {
    setShowDatePicker((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // 날짜 선택 처리
  const handleDateChange = (fieldId: string, event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker((prev) => ({ ...prev, [fieldId]: false }));
    }

    if (selectedDate) {
      handleChange(fieldId, selectedDate.toISOString().split("T")[0]);
    }
  };

  // 필드 에러 메시지 가져오기
  const getFieldError = (fieldId: string) => {
    const error = errors.find((err) => err.fieldId === fieldId);
    return error ? error.message : null;
  };

  // 필드 렌더링
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const value = formValues[field.id];
    const error = getFieldError(field.id);

    let fieldComponent: React.ReactNode = null;

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "number":
        fieldComponent = (
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value ? String(value) : ""}
            onChangeText={(text) => handleChange(field.id, text)}
            placeholder={field.placeholder}
            keyboardType={
              field.type === "email"
                ? "email-address"
                : field.type === "tel"
                ? "phone-pad"
                : field.type === "number"
                ? "numeric"
                : "default"
            }
            placeholderTextColor={theme.colors.text.disabled}
          />
        );
        break;

      case "textarea":
        fieldComponent = (
          <TextInput
            style={[styles.textarea, error && styles.inputError]}
            value={value ? String(value) : ""}
            onChangeText={(text) => handleChange(field.id, text)}
            placeholder={field.placeholder}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.colors.text.disabled}
            textAlignVertical="top"
          />
        );
        break;

      case "select":
        fieldComponent = (
          <View style={[styles.select, error && styles.inputError]}>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => handleChange(field.id, itemValue)}
              style={styles.picker}
            >
              <Picker.Item
                label={field.placeholder || "선택하세요"}
                value=""
                color={theme.colors.text.disabled}
              />
              {field.options?.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>
        );
        break;

      case "radio":
        fieldComponent = (
          <View style={styles.radioGroup}>
            {field.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => handleChange(field.id, option.value)}
              >
                <View
                  style={[styles.radioButton, value === option.value && styles.radioButtonSelected]}
                >
                  {value === option.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
        break;

      case "checkbox":
        const checkboxValues = Array.isArray(value) ? value : value ? [value] : [];
        fieldComponent = (
          <View style={styles.checkboxGroup}>
            {field.options?.map((option) => {
              const isChecked = checkboxValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxOption}
                  onPress={() => {
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
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxSelected]}>
                    {isChecked && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
        break;

      case "date":
        fieldComponent = (
          <View>
            <TouchableOpacity
              style={[styles.dateInput, error && styles.inputError]}
              onPress={() => toggleDatePicker(field.id)}
            >
              <Text style={[styles.dateText, !value && { color: theme.colors.text.disabled }]}>
                {value ? value : field.placeholder || "날짜 선택"}
              </Text>
            </TouchableOpacity>
            {showDatePicker[field.id] && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => handleDateChange(field.id, event, date)}
              />
            )}
          </View>
        );
        break;

      case "file":
        fieldComponent = (
          <View style={styles.fileUploadContainer}>
            <View style={styles.fileButtons}>
              <Button
                title="문서 선택"
                variant="outline"
                onPress={() => handleFileUpload(field.id, false)}
                style={styles.fileButton}
              />
              <Button
                title="이미지 선택"
                variant="outline"
                onPress={() => handleFileUpload(field.id, true)}
                style={styles.fileButton}
              />
            </View>
            {fileUploads[field.id] && (
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileUploads[field.id].name}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setFileUploads((prev) => {
                      const newState = { ...prev };
                      delete newState[field.id];
                      return newState;
                    });
                    handleChange(field.id, "");
                  }}
                >
                  <Text style={styles.removeFile}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
        break;

      default:
        fieldComponent = <Text>지원되지 않는 필드 유형입니다.</Text>;
        break;
    }

    return (
      <View
        key={field.id}
        style={[
          styles.fieldContainer,
          field.style && {
            width: field.style.width ? Number(field.style.width) : undefined,
            marginBottom: field.style.marginBottom ? Number(field.style.marginBottom) : undefined,
          },
        ]}
      >
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.validation?.required && <Text style={styles.required}> *</Text>}
        </Text>
        {field.description && <Text style={styles.fieldDescription}>{field.description}</Text>}
        {fieldComponent}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{template.title}</Text>
        {template.description && <Text style={styles.formDescription}>{template.description}</Text>}
      </View>

      <View style={styles.formContent}>{template.fields.map((field) => renderField(field))}</View>

      <View style={styles.formActions}>
        {onCancel && (
          <Button
            title="취소"
            variant="outline"
            onPress={onCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          />
        )}
        <Button
          title={isLoading ? "제출 중..." : "제출하기"}
          variant="primary"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={isLoading}
        />
        {isLoading && (
          <ActivityIndicator style={styles.loadingIndicator} color={theme.colors.primary.main} />
        )}
      </View>

      {errors.length > 0 && (
        <View style={styles.errorSummary}>
          <Text style={styles.errorSummaryTitle}>입력 양식에 오류가 있습니다:</Text>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorSummaryText}>
              • {error.message}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  formHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  formContent: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: theme.colors.error.main,
  },
  fieldDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
  },
  textarea: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  select: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.light,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  radioGroup: {
    marginTop: 4,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary.main,
  },
  radioLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  checkboxGroup: {
    marginTop: 4,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  checkboxCheck: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.background.light,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  fileUploadContainer: {
    marginTop: 4,
  },
  fileButtons: {
    flexDirection: "row",
  },
  fileButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.sm,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  removeFile: {
    fontSize: 14,
    color: theme.colors.error.main,
    marginLeft: 10,
  },
  errorText: {
    color: theme.colors.error.main,
    fontSize: 14,
    marginTop: 4,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
  },
  loadingIndicator: {
    position: "absolute",
    right: 24,
    top: "50%",
  },
  errorSummary: {
    margin: 16,
    padding: 12,
    backgroundColor: theme.colors.error.light,
    borderRadius: theme.borderRadius.md,
  },
  errorSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.error.dark,
    marginBottom: 8,
  },
  errorSummaryText: {
    fontSize: 14,
    color: theme.colors.error.dark,
    marginBottom: 4,
  },
});

export default DynamicForm;

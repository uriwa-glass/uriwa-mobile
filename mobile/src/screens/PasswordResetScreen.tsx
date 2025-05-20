import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import supabase from "../config/supabase";
import { handleAPIError } from "../api";
import theme from "../config/theme"; // 테마 불러오기

/**
 * 비밀번호 재설정 화면
 */
const PasswordResetScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigation = useNavigation();

  // 비밀번호 재설정 이메일 발송
  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "uriwa://reset-password-callback",
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      const errorMsg = handleAPIError(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 화면으로 돌아가기
  const goToLogin = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>비밀번호 재설정</Text>

          {/* 에러 메시지 표시 */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {isSubmitted ? (
            <View style={styles.formCard}>
              <Text style={styles.successTitle}>이메일을 확인해주세요</Text>
              <Text style={styles.successText}>
                비밀번호 재설정 링크가 {email}로 전송되었습니다. 이메일을 확인하고 링크를 클릭하여
                비밀번호를 재설정해주세요.
              </Text>
              <TouchableOpacity style={styles.loginButton} onPress={goToLogin}>
                <Text style={styles.loginButtonText}>로그인으로 돌아가기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>비밀번호 재설정 요청</Text>
              <Text style={styles.instructionText}>
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <TextInput
                  style={styles.input}
                  placeholder="이메일 주소를 입력하세요"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handlePasswordReset}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>재설정 링크 발송</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backLink} onPress={goToLogin}>
                <Text style={styles.backLinkText}>로그인으로 돌아가기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.default,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: theme.colors.error.light,
    borderWidth: 1,
    borderColor: theme.colors.error.border,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.error.main,
    fontSize: theme.fontSize.sm,
  },
  formCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "500",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background.default,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingHorizontal: 16,
    fontSize: theme.fontSize.md,
  },
  resetButton: {
    backgroundColor: theme.colors.primary.main,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 16,
    alignSelf: "center",
  },
  backLinkText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    textDecorationLine: "underline",
  },
  successTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: theme.colors.primary.main,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
});

export default PasswordResetScreen;

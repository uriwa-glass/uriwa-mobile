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
 * 회원가입 화면
 */
const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  // 회원가입 처리
  const handleSignup = async () => {
    // 입력 검증
    if (!email || !password || !confirmPassword) {
      setErrorMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 이메일 확인 메시지 표시
      Alert.alert(
        "회원가입 완료",
        "가입하신 이메일로 확인 링크가 발송되었습니다. 이메일을 확인하여 계정을 활성화해주세요.",
        [
          {
            text: "확인",
            onPress: () => {
              // 로그인 화면으로 이동
              navigation.navigate("Login" as never);
            },
          },
        ]
      );
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
          <Text style={styles.title}>URIWA 회원가입</Text>

          {/* 에러 메시지 표시 */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* 회원가입 폼 */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>이메일로 회원가입</Text>

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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요 (6자 이상)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>회원가입</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.linkButton}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.termsText}>
            회원가입 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다.
          </Text>
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
  signupButton: {
    backgroundColor: theme.colors.primary.main,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    marginRight: 8,
  },
  linkButton: {
    color: theme.colors.primary.main,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
  termsText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.xs,
    textAlign: "center",
    marginTop: 8,
  },
});

export default SignupScreen;

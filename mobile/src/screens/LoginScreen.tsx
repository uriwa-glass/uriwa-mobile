import React, { useState, useEffect } from "react";
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
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path, Rect } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import supabase from "../config/supabase";
import authHelper from "../utils/authHelper";
import { handleAPIError } from "../api";
import theme from "../config/theme"; // 테마 불러오기
import Constants from "expo-constants";
import * as Linking from "expo-linking";

// Supabase OAuth Provider 타입 정의
type SupabaseOAuthProvider = "google" | "apple" | "facebook" | "github" | "twitter";

// OAuth 세션 생성을 위한 설정
WebBrowser.maybeCompleteAuthSession({
  skipRedirectCheck: true, // 리디렉션 URL 유효성 검사 건너뛰기
});

// SNS 로그인 아이콘 컴포넌트
const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
      fill="#FFC107"
    />
    <Path
      d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z"
      fill="#FF3D00"
    />
    <Path
      d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
      fill="#4CAF50"
    />
    <Path
      d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
      fill="#1976D2"
    />
  </Svg>
);

const KakaoIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3C6.477 3 2 6.477 2 11C2 14.991 5.57 18.128 10 18.859V22.893L11.833 21.246L13.666 22.893V18.859C18.429 18.129 22 14.99 22 11C22 6.477 17.523 3 12 3Z"
      fill="#FFE812"
    />
    <Path d="M14.599 8.157H13.744V11.978H14.599V8.157Z" fill="#3B1E1E" />
    <Path d="M10.256 8.157H9.401V11.978H10.256V8.157Z" fill="#3B1E1E" />
    <Path
      d="M16.569 11.235L15.348 8.156H14.433L15.654 11.235V11.978H16.569V11.235Z"
      fill="#3B1E1E"
    />
    <Path d="M7.431 11.235L8.652 8.156H9.567L8.346 11.235V11.978H7.431V11.235Z" fill="#3B1E1E" />
  </Svg>
);

const NaverIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect width="24" height="24" fill="#03C75A" />
    <Path
      d="M13.392 12.0214L10.0845 7.214H7V16.786H10.608V11.9786L13.9155 16.786H17V7.214H13.392V12.0214Z"
      fill="white"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.2053 4C14.0553 4 13.3053 5.124 11.9553 5.124C10.5803 5.124 9.35532 4 7.70532 4C6.02532 4 4.15532 5.304 3.05532 7.309C1.45532 10.211 1.75532 15.678 4.65532 19.909C5.65532 21.409 6.95532 23.144 8.75532 23.144C10.4053 23.144 10.9053 22 12.7053 22C14.5053 22 14.9553 23.144 16.6553 23.144C18.4553 23.144 19.7553 21.542 20.7553 20.042C21.4553 19.009 21.7053 18.477 22.2553 17.412C18.0553 15.75 17.5053 9.678 22.2553 8.549C21.0053 6.517 18.7053 4 16.2053 4Z"
      fill="black"
    />
    <Path
      d="M15.3945 2C15.6695 3.286 14.9445 4.581 14.1195 5.437C13.2945 6.292 11.9695 7 10.8945 7C10.6195 5.715 11.3445 4.419 12.1695 3.563C12.9945 2.707 14.3195 2 15.3945 2Z"
      fill="black"
    />
  </Svg>
);

/**
 * 로그인 화면
 * 웹 버전과 동일한 디자인으로 구현
 */
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  // 딥링크 핸들러 설정
  useEffect(() => {
    // 초기 URL 처리
    const getInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink({ url: initialURL });
      }
    };

    // 딥링크 핸들러
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log("딥링크 감지:", url);
      if (url.includes("login-callback")) {
        // 로그인 콜백 URL이 감지되면 사용자 정보 확인
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          if (userData?.user) {
            console.log("딥링크로 사용자 확인됨:", userData.user.email);
            // 세션 정보 가져오기
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              await authHelper.setAuthToken(sessionData.session.access_token);
              await authHelper.setUserData(userData.user);
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTab" as never }],
              });
            }
          }
        } catch (error) {
          console.error("딥링크 처리 오류:", error);
        }
      }
    };

    // 이벤트 리스너 등록
    const subscription = Linking.addEventListener("url", handleDeepLink);
    getInitialURL();

    // 클린업 함수
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  // 리디렉션 URL 설정 - 항상 앱 스킴 사용
  // 웹뷰에서 uriwa.netlify.app으로 리디렉션되는 문제 해결
  // 개발/프로덕션 환경 모두 앱 스킴을 사용해야 앱으로 돌아옴
  const redirectUri = "uriwa://login-callback";

  // 이메일/패스워드 로그인
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // 토큰 저장
        await authHelper.setAuthToken(data.session.access_token);

        // 사용자 정보 저장
        if (data.user) {
          await authHelper.setUserData(data.user);
        }

        // 홈 화면으로 이동
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTab" as never }],
        });
      }
    } catch (error: any) {
      const errorMsg = handleAPIError(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // SNS 로그인
  const handleSNSLogin = async (provider: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log(`Using redirect URL: ${redirectUri}`);

      // Google 로그인 시 Android Client ID 확인
      if (provider === "google" && Platform.OS === "android") {
        const googleAndroidClientId = Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID;
        if (!googleAndroidClientId) {
          throw new Error("Google Android Client ID가 설정되지 않았습니다.");
        }
        console.log("Using Google Android Client ID:", googleAndroidClientId);
      }

      // OAuth 제공자 설정
      let providerOptions: {
        provider: SupabaseOAuthProvider;
        options: {
          redirectTo: string;
          scopes?: string;
          skipBrowserRedirect?: boolean;
        };
      };

      // 제공자 유형에 따라 설정
      if (provider === "google") {
        // 로그와 함께 redirectUri 확인
        console.log("Google 로그인 redirectUri:", redirectUri);

        providerOptions = {
          provider: "google" as SupabaseOAuthProvider,
          options: {
            redirectTo: redirectUri,
            scopes: "email profile",
            skipBrowserRedirect: true,
          },
        };
      } else if (provider === "apple") {
        providerOptions = {
          provider: "apple" as SupabaseOAuthProvider,
          options: {
            redirectTo: redirectUri,
            scopes: "name email",
            skipBrowserRedirect: true,
          },
        };
      } else {
        // 카카오나 네이버 등 커스텀 제공자는 문자열로 처리
        providerOptions = {
          provider: provider as any,
          options: {
            redirectTo: redirectUri,
            skipBrowserRedirect: true,
          },
        };
      }

      // OAuth 인증 URL 가져오기
      const { data, error } = await supabase.auth.signInWithOAuth(providerOptions);

      if (error) {
        console.error("OAuth 로그인 오류:", error);
        throw error;
      }

      if (!data?.url) {
        throw new Error("인증 URL을 가져오지 못했습니다.");
      }

      console.log("Opening OAuth URL:", data.url);

      // 웹 브라우저로 OAuth 인증 페이지 열기 - 완전히 단순화
      const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

      console.log("Auth session result:", authResult);

      // 인증 성공 시
      if (authResult.type === "success") {
        // 현재 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (userData?.user) {
          // 세션 정보 가져오기
          const { data: sessionData } = await supabase.auth.getSession();

          if (sessionData?.session) {
            // 인증 토큰 및 사용자 정보 저장
            await authHelper.setAuthToken(sessionData.session.access_token);
            await authHelper.setUserData(userData.user);

            // 메인 화면으로 이동
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTab" as never }],
            });
            return;
          }
        }

        throw new Error("로그인은 완료되었으나 사용자 정보를 가져오지 못했습니다.");
      } else if (authResult.type === "cancel") {
        console.log("사용자가 인증을 취소했습니다.");
      } else {
        throw new Error(`인증 과정에서 오류가 발생했습니다: ${authResult.type}`);
      }
    } catch (error: any) {
      console.error("소셜 로그인 오류:", error);
      const errorMsg = handleAPIError(error);
      setErrorMessage(`${provider} 로그인에 실패했습니다: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 화면으로 이동
  const goToSignup = () => {
    navigation.navigate("Signup" as never);
  };

  // 비밀번호 찾기 화면으로 이동
  const goToPasswordReset = () => {
    navigation.navigate("PasswordReset" as never);
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
          <Text style={styles.title}>URIWA 로그인</Text>

          {/* 에러 메시지 표시 */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* 이메일 로그인 폼 */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>이메일로 로그인</Text>

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
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
              <Text style={styles.loginButtonText}>{isLoading ? "로그인 중..." : "로그인"}</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={goToPasswordReset}>
                <Text style={styles.linkText}>비밀번호 찾기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToSignup}>
                <Text style={styles.linkText}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SNS 로그인 */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>SNS 계정으로 로그인</Text>

            {/* 구글 로그인 - 안드로이드에서만 표시 */}
            {Platform.OS === "android" && (
              <TouchableOpacity
                style={styles.snsButton}
                onPress={() => handleSNSLogin("google")}
                disabled={isLoading}
              >
                <GoogleIcon />
                <Text style={styles.snsButtonText}>Google로 로그인</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.snsButton}
              onPress={() => handleSNSLogin("kakao")}
              disabled={isLoading}
            >
              <KakaoIcon />
              <Text style={styles.snsButtonText}>Kakao로 로그인</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.snsButton}
              onPress={() => handleSNSLogin("naver")}
              disabled={isLoading}
            >
              <NaverIcon />
              <Text style={styles.snsButtonText}>Naver로 로그인</Text>
            </TouchableOpacity>

            {/* 애플 로그인 - iOS에서만 표시 */}
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.snsButton}
                onPress={() => handleSNSLogin("apple")}
                disabled={isLoading}
              >
                <AppleIcon />
                <Text style={styles.snsButtonText}>Apple로 로그인</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.termsText}>
              로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다.
            </Text>
          </View>
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
  loginButton: {
    backgroundColor: theme.colors.primary.main,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  linkText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.sm,
    textDecorationLine: "underline",
  },
  snsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background.paper,
  },
  snsButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  termsText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.xs,
    textAlign: "center",
    marginTop: 16,
  },
});

export default LoginScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../shared/contexts/AuthContext";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithOAuth, signInWithKakao, signInWithNaver } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("오류", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        Alert.alert("로그인 실패", error.message);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("오류", "로그인 중 문제가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithOAuth("google");
    } catch (error) {
      Alert.alert("오류", "Google 로그인 중 문제가 발생했습니다.");
      console.error(error);
    }
  };

  const handleKakaoSignIn = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      Alert.alert("오류", "카카오 로그인 중 문제가 발생했습니다.");
      console.error(error);
    }
  };

  const handleNaverSignIn = async () => {
    try {
      await signInWithNaver();
    } catch (error) {
      Alert.alert("오류", "네이버 로그인 중 문제가 발생했습니다.");
      console.error(error);
    }
  };

  const navigateToSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>우리와</Text>
      <Text style={styles.subtitle}>로그인</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.socialLoginContainer}>
        <Text style={styles.socialText}>소셜 계정으로 로그인</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
            <Text>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleKakaoSignIn}>
            <Text>카카오</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleNaverSignIn}>
            <Text>네이버</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={navigateToSignUp}>
          <Text style={styles.signupText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: "center",
    color: "#666",
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialLoginContainer: {
    marginBottom: 30,
  },
  socialText: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "30%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    marginRight: 5,
  },
  signupText: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
});

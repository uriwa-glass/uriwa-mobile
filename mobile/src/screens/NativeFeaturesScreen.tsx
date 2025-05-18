import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  Image,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import nativeFeatures from "../utils/nativeFeatures";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

/**
 * 네이티브 기능 테스트 화면
 * 카메라, 위치, 파일 등 네이티브 기능을 테스트합니다.
 */
const NativeFeaturesScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<{
    camera: string;
    location: string;
    media: string;
  }>({
    camera: "확인 필요",
    location: "확인 필요",
    media: "확인 필요",
  });

  // 카메라 권한 요청
  const checkCameraPermission = async () => {
    try {
      const result = await nativeFeatures.requestCameraPermission();
      setPermissionStatus((prev) => ({
        ...prev,
        camera: result.status,
      }));
      Alert.alert("카메라 권한", `상태: ${result.status}`);
    } catch (error) {
      Alert.alert("권한 오류", "카메라 권한을 확인할 수 없습니다.");
    }
  };

  // 위치 권한 요청
  const checkLocationPermission = async () => {
    try {
      const result = await nativeFeatures.requestLocationPermission();
      setPermissionStatus((prev) => ({
        ...prev,
        location: result.status,
      }));
      Alert.alert("위치 권한", `상태: ${result.status}`);
    } catch (error) {
      Alert.alert("권한 오류", "위치 권한을 확인할 수 없습니다.");
    }
  };

  // 미디어 라이브러리 권한 요청
  const checkMediaLibraryPermission = async () => {
    try {
      const result = await nativeFeatures.requestMediaLibraryPermission();
      setPermissionStatus((prev) => ({
        ...prev,
        media: result.status,
      }));
      Alert.alert("미디어 라이브러리 권한", `상태: ${result.status}`);
    } catch (error) {
      Alert.alert("권한 오류", "미디어 라이브러리 권한을 확인할 수 없습니다.");
    }
  };

  // 카메라로 사진 촬영
  const handleTakePicture = async () => {
    try {
      const result = await nativeFeatures.takePicture();
      if (result.success && result.data) {
        setImageUri(result.data.uri);
      } else {
        Alert.alert("오류", result.error || "사진을 촬영할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "카메라 사용 중 문제가 발생했습니다.");
    }
  };

  // 이미지 선택
  const handlePickImage = async () => {
    try {
      const result = await nativeFeatures.pickImage();
      if (result.success && result.data) {
        setImageUri(result.data.uri);
      } else {
        Alert.alert("오류", result.error || "이미지를 선택할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "이미지 선택 중 문제가 발생했습니다.");
    }
  };

  // 현재 위치 가져오기
  const handleGetLocation = async () => {
    try {
      const result = await nativeFeatures.getCurrentLocation();
      if (result.success && result.data) {
        const { latitude, longitude } = result.data;
        setLocation(`위도: ${latitude}\n경도: ${longitude}`);
      } else {
        Alert.alert("오류", result.error || "위치를 가져올 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "위치 정보를 가져오는 중 문제가 발생했습니다.");
    }
  };

  // 파일 공유하기
  const handleShareImage = async () => {
    if (!imageUri) {
      Alert.alert("공유 오류", "공유할 이미지가 없습니다.");
      return;
    }

    try {
      const result = await nativeFeatures.shareFile(imageUri);
      if (!result.success) {
        Alert.alert("공유 오류", result.error || "이미지를 공유할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "이미지 공유 중 문제가 발생했습니다.");
    }
  };

  // 로컬 알림 보내기
  const handleSendNotification = async () => {
    try {
      const title = "테스트 알림";
      const body = "이것은 로컬 알림 테스트입니다.";

      // 알림 즉시 전송 (trigger null)
      const result = await nativeFeatures.scheduleLocalNotification(title, body, null);

      if (result.success) {
        Alert.alert("알림 전송 완료", "알림이 전송되었습니다.");
      } else {
        Alert.alert("알림 오류", result.error || "알림을 전송할 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "알림 전송 중 문제가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>네이티브 기능 테스트</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 권한 확인</Text>
          <View style={styles.permissionStatus}>
            <Text>카메라: {permissionStatus.camera}</Text>
            <Text>위치: {permissionStatus.location}</Text>
            <Text>미디어 라이브러리: {permissionStatus.media}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Button title="카메라 권한" onPress={checkCameraPermission} />
            <Button title="위치 권한" onPress={checkLocationPermission} />
            <Button title="미디어 권한" onPress={checkMediaLibraryPermission} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 이미지 기능</Text>
          <View style={styles.buttonRow}>
            <Button title="사진 촬영" onPress={handleTakePicture} />
            <Button title="이미지 선택" onPress={handlePickImage} />
          </View>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <Button title="이미지 공유" onPress={handleShareImage} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 위치 정보</Text>
          <Button title="현재 위치 가져오기" onPress={handleGetLocation} />
          {location && <Text style={styles.locationText}>{location}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 알림</Text>
          <Button title="테스트 알림 보내기" onPress={handleSendNotification} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  permissionStatus: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#e8f4f8",
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  imageContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    borderRadius: 8,
  },
  locationText: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e8f8e8",
    borderRadius: 5,
  },
});

export default NativeFeaturesScreen;

import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";
import { RefObject } from "react";

// 네이티브 기능 타입 정의
export type NativeFeatureType =
  | "CAMERA"
  | "LOCATION"
  | "FILE_SYSTEM"
  | "IMAGE_PICKER"
  | "NOTIFICATIONS"
  | "SHARING";

// 네이티브 기능 메시지 인터페이스
export interface NativeFeatureMessage {
  type: NativeFeatureType;
  action: string;
  payload?: any;
  callbackId?: string;
}

/**
 * 앱 권한 요청 상태 유형
 */
export type PermissionStatus = "granted" | "denied" | "undetermined" | "limited" | "blocked";

/**
 * 권한 요청 결과 인터페이스
 */
export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

/**
 * 네이티브 기능 상태 인터페이스
 */
export interface NativeFeaturesState {
  camera: PermissionStatus;
  location: PermissionStatus;
  mediaLibrary: PermissionStatus;
  notifications: PermissionStatus;
}

/**
 * 카메라 권한 요청
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain: status !== "denied",
  };
};

/**
 * 위치 권한 요청
 */
export const requestLocationPermission = async (): Promise<PermissionResult> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain: status !== "denied",
  };
};

/**
 * 미디어 라이브러리 접근 권한 요청
 */
export const requestMediaLibraryPermission = async (): Promise<PermissionResult> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain: status !== "denied",
  };
};

/**
 * 알림 권한 요청
 */
export const requestNotificationsPermission = async (): Promise<PermissionResult> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain: status !== "denied",
  };
};

/**
 * 현재 위치 정보 가져오기
 */
export const getCurrentLocation = async () => {
  try {
    const permissionResult = await requestLocationPermission();
    if (permissionResult.status !== "granted") {
      throw new Error("Location permission not granted");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      data: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        timestamp: location.timestamp,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 이미지 선택
 */
export const pickImage = async (options?: ImagePicker.ImagePickerOptions) => {
  try {
    const permissionResult = await requestMediaLibraryPermission();
    if (permissionResult.status !== "granted") {
      throw new Error("Media library permission not granted");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // 선택된 이미지 경로 반환
      const asset = result.assets[0];
      return {
        success: true,
        data: {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize || 0,
        },
      };
    }

    return {
      success: false,
      error: "Image selection canceled",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 카메라로 사진 촬영
 */
export const takePicture = async (options?: ImagePicker.ImagePickerOptions) => {
  try {
    const permissionResult = await requestCameraPermission();
    if (permissionResult.status !== "granted") {
      throw new Error("Camera permission not granted");
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // 촬영된 이미지 경로 반환
      const asset = result.assets[0];
      return {
        success: true,
        data: {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize || 0,
        },
      };
    }

    return {
      success: false,
      error: "Image capture canceled",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 파일 저장
 */
export const saveFile = async (fileUri: string, fileName: string) => {
  try {
    // 파일 저장 경로 생성
    const directory = `${FileSystem.documentDirectory}downloads/`;
    const dirInfo = await FileSystem.getInfoAsync(directory);

    // 디렉토리가 없으면 생성
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    const destUri = `${directory}${fileName}`;

    // 파일 복사
    await FileSystem.copyAsync({
      from: fileUri,
      to: destUri,
    });

    // 공유 가능 여부 확인
    const canShare = await Sharing.isAvailableAsync();

    return {
      success: true,
      data: {
        uri: destUri,
        canShare,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 파일 공유
 */
export const shareFile = async (fileUri: string) => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(fileUri);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 푸시 알림 설정
 */
export const setupPushNotifications = async () => {
  try {
    const permissionResult = await requestNotificationsPermission();
    if (permissionResult.status !== "granted") {
      throw new Error("Notification permission not granted");
    }

    // 알림 핸들러 설정
    Notifications.setNotificationHandler({
      handleNotification: async () =>
        ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        } as Notifications.NotificationBehavior),
    });

    // 푸시 토큰 가져오기
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "your-project-id", // Expo 프로젝트 ID 입력
    });

    return {
      success: true,
      data: {
        token: tokenData.data,
        type: tokenData.type,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * 로컬 알림 전송
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger?: Notifications.NotificationTriggerInput
) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null,
    });

    return {
      success: true,
      data: {
        notificationId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * WebView로 네이티브 기능 응답 전송
 */
export const sendResponseToWebView = (
  webViewRef: RefObject<WebView>,
  type: NativeFeatureType,
  action: string,
  response: any,
  callbackId?: string
) => {
  if (!webViewRef.current) return false;

  const message = {
    type,
    action,
    response,
    callbackId,
  };

  const script = `
    (function() {
      window.dispatchEvent(new CustomEvent('nativeResponse', {
        detail: ${JSON.stringify(message)}
      }));
      return true;
    })();
  `;

  webViewRef.current.injectJavaScript(script);
  return true;
};

/**
 * WebView와 함께 사용하기 위한 네이티브 기능 메시지 핸들러
 */
export const handleNativeFeatureMessage = async (
  message: NativeFeatureMessage,
  webViewRef: RefObject<WebView>
) => {
  const { type, action, payload, callbackId } = message;

  try {
    let response;

    switch (type) {
      case "LOCATION":
        if (action === "GET_CURRENT") {
          response = await getCurrentLocation();
        }
        break;

      case "CAMERA":
        if (action === "TAKE_PICTURE") {
          response = await takePicture(payload);
        }
        break;

      case "IMAGE_PICKER":
        if (action === "PICK_IMAGE") {
          response = await pickImage(payload);
        }
        break;

      case "FILE_SYSTEM":
        if (action === "SAVE_FILE") {
          const { uri, fileName } = payload;
          response = await saveFile(uri, fileName);
        } else if (action === "SHARE_FILE") {
          response = await shareFile(payload.uri);
        }
        break;

      case "NOTIFICATIONS":
        if (action === "SETUP") {
          response = await setupPushNotifications();
        } else if (action === "SCHEDULE") {
          const { title, body, trigger } = payload;
          response = await scheduleLocalNotification(title, body, trigger);
        }
        break;

      default:
        response = {
          success: false,
          error: `Unsupported feature type: ${type}`,
        };
        break;
    }

    // 응답 전송
    sendResponseToWebView(webViewRef, type, action, response, callbackId);
  } catch (error) {
    // 오류 처리
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    sendResponseToWebView(
      webViewRef,
      type,
      action,
      { success: false, error: errorMessage },
      callbackId
    );
  }
};

/**
 * WebView에 주입할 네이티브 기능 브릿지 JavaScript 코드
 */
export const getNativeBridgeScript = (): string => {
  return `
    (function() {
      // 중복 초기화 방지
      if (window.nativeBridgeInitialized) return true;
      
      // 네이티브 기능 브릿지 객체
      window.NativeBridge = {
        // 요청 콜백 저장소
        _callbacks: {},
        
        // 요청 ID 생성
        _createCallbackId: function() {
          return 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        },
        
        // 네이티브 기능 요청 전송
        _sendRequest: function(type, action, payload) {
          const callbackId = this._createCallbackId();
          
          return new Promise((resolve, reject) => {
            // 콜백 저장
            this._callbacks[callbackId] = { resolve, reject };
            
            // 메시지 전송
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: type,
              action: action,
              payload: payload,
              callbackId: callbackId
            }));
          });
        },
        
        // 카메라로 사진 촬영
        takePicture: function(options) {
          return this._sendRequest('CAMERA', 'TAKE_PICTURE', options);
        },
        
        // 이미지 선택
        pickImage: function(options) {
          return this._sendRequest('IMAGE_PICKER', 'PICK_IMAGE', options);
        },
        
        // 현재 위치 가져오기
        getCurrentLocation: function() {
          return this._sendRequest('LOCATION', 'GET_CURRENT');
        },
        
        // 파일 저장
        saveFile: function(uri, fileName) {
          return this._sendRequest('FILE_SYSTEM', 'SAVE_FILE', { uri, fileName });
        },
        
        // 파일 공유
        shareFile: function(uri) {
          return this._sendRequest('FILE_SYSTEM', 'SHARE_FILE', { uri });
        },
        
        // 푸시 알림 설정
        setupPushNotifications: function() {
          return this._sendRequest('NOTIFICATIONS', 'SETUP');
        },
        
        // 로컬 알림 스케줄링
        scheduleNotification: function(title, body, trigger) {
          return this._sendRequest('NOTIFICATIONS', 'SCHEDULE', { title, body, trigger });
        }
      };
      
      // 네이티브 응답 리스너
      window.addEventListener('nativeResponse', function(event) {
        const { type, action, response, callbackId } = event.detail;
        
        // 저장된 콜백 가져오기
        const callback = window.NativeBridge._callbacks[callbackId];
        if (callback) {
          // 결과에 따라 promise 해결 또는 거부
          if (response && response.success) {
            callback.resolve(response.data);
          } else {
            callback.reject(new Error(response.error || 'Unknown error'));
          }
          
          // 콜백 정리
          delete window.NativeBridge._callbacks[callbackId];
        }
      });
      
      // 초기화 플래그 설정
      window.nativeBridgeInitialized = true;
      
      // 네이티브 브릿지 준비 이벤트 발생
      window.dispatchEvent(new Event('nativeBridgeReady'));
      
      console.log('Native bridge initialized');
      return true;
    })();
  `;
};

export default {
  requestCameraPermission,
  requestLocationPermission,
  requestMediaLibraryPermission,
  requestNotificationsPermission,
  getCurrentLocation,
  pickImage,
  takePicture,
  saveFile,
  shareFile,
  setupPushNotifications,
  scheduleLocalNotification,
  sendResponseToWebView,
  handleNativeFeatureMessage,
  getNativeBridgeScript,
};

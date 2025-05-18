import Constants from "expo-constants";

/**
 * 환경 변수 설정
 * 각 환경(개발, 스테이징, 프로덕션)에 맞는 설정값을 제공합니다.
 */

// 현재 환경 - development, staging, production
const ENV = process.env.APP_ENV || "development";

// 기본 설정
const commonConfig = {
  // 앱 버전
  APP_VERSION: Constants.expoConfig?.version || "1.0.0",
};

// 환경별 설정
const envConfig = {
  development: {
    API_URL: "https://api-dev.uriwa.com/v1",
    // 로컬 개발 환경에서는 PC IP 주소 사용 (예: 192.168.0.x)
    // Expo DevTools에 표시되는 PC의 IP 주소를 사용하세요
    WEB_URL: "http://192.168.219.103:8082", // Android 에뮬레이터에서 호스트 접근용 특수 IP
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
  staging: {
    API_URL: "https://api-staging.uriwa.com/v1",
    WEB_URL: "https://staging.uriwa.com",
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
  production: {
    API_URL: "https://api.uriwa.com/v1",
    WEB_URL: "https://uriwa.com",
    FIREBASE_CONFIG: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
};

// 현재 환경에 맞는 설정 선택
const currentEnvConfig = envConfig[ENV as keyof typeof envConfig] || envConfig.development;

// 최종 설정 객체 생성
export default {
  ...commonConfig,
  ...currentEnvConfig,
  ENV,
};

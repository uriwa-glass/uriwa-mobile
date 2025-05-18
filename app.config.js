module.exports = {
  name: "우리와 Mobile",
  slug: "uriwa-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.uriwa.mobile",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.uriwa.mobile",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    // Supabase 환경 변수
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uspesxpwtedjzmffimyc.supabase.co",
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcGVzeHB3dGVkanptZmZpbXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzUyODUsImV4cCI6MjA2MzE1MTI4NX0.1H4wPP3CpFhJHbdb18gtqbOeG41zc0ZncG-QCqufPEI",

    // OAuth 관련 설정
    oauthRedirectUri: "com.uriwa.mobile://auth-callback",

    // 개발 환경 설정
    debugMode: process.env.DEBUG_MODE === "true",

    // 앱 빌드 환경
    eas: {
      projectId: "2f5cf7e1-92d4-4357-8b6c-f8c4c4e7b39e",
    },
  },
  plugins: [
    // OAuth 리디렉션을 위한 설정
    ["@react-native-google-signin/google-signin"],
    ["expo-apple-authentication"],
    ["expo-dev-client"],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "13.0",
        },
      },
    ],
  ],
};

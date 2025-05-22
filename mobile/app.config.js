import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local 파일 로드 (우선순위 더 높게)
config({ path: resolve(__dirname, "../.env.local") });

// .env.mobile 파일 로드 (모바일 기기용 IP 주소 설정)
config({ path: resolve(__dirname, "../.env.mobile") });

export default {
  name: "mobile",
  slug: "mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  scheme: "uriwa",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.uriwa.mobile",
    associatedDomains: ["applinks:uriwa.com", "applinks:www.uriwa.com"],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.uriwa.mobile",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "*.uriwa.com",
            pathPrefix: "/",
          },
          {
            scheme: "uriwa",
            pathPrefix: "/",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    APP_ENV: process.env.APP_ENV || "development",
    eas: {
      projectId: "2ffa82ce-33e4-4a4f-8b43-267e5243373a",
      owner: "emasion",
    },
    GOOGLE_ANDROID_CLIENT_ID:
      "112158369333-1b7ds3c1fanb3sse20icr1v32gco4i76.apps.googleusercontent.com",
  },
  plugins: ["expo-web-browser"],
  owner: "emasion",
  sdkVersion: "53.0.0",
};

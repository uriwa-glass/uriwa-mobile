import { NavigatorScreenParams } from "@react-navigation/native";

/**
 * 메인 탭 네비게이션 파라미터
 */
export type MainTabParamList = {
  Home: undefined;
  MyPage: undefined;
  Schedule: undefined;
  More: undefined;
  NativeFeatures: undefined;
};

/**
 * 루트 스택 네비게이션 파라미터
 */
export type RootStackParamList = {
  MainTab: NavigatorScreenParams<MainTabParamList>;
  Login: undefined;
  WebDetail: { url: string; title?: string };
  Settings: undefined;
  About: undefined;
  NotFound: undefined;
};

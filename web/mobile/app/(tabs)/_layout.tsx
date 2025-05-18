import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// 아이콘 컴포넌트 임시 구현
const IconSymbol = ({ size, name, color }: { size: number; name: string; color: string }) => {
  return null; // 실제 아이콘 구현 필요
};

// 탭 버튼 컴포넌트 임시 구현
const HapticTab = (props: any) => {
  return props.children;
};

// 탭 배경 컴포넌트 임시 구현
const TabBarBackground = () => {
  return null;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // iOS에서는 투명 배경 적용하여 블러 효과 보이기
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "수업",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: "갤러리",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="photo.on.rectangle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: "관리자",
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseApi } from "./supabaseApi";
import { LoginRequest, SignupRequest, Profile, Class, Reservation } from "./schema";

/**
 * React Query를 사용한 API 훅 모음
 * API 호출을 간편하게 사용할 수 있는 훅 함수들을 제공합니다.
 */

/**
 * Authentication Hooks
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => supabaseApi.auth.getCurrentUser(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => supabaseApi.auth.login(credentials),
    onSuccess: () => {
      // 로그인 성공 시 현재 사용자 정보 갱신
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (userData: SignupRequest) => supabaseApi.auth.signup(userData),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => supabaseApi.auth.logout(),
    onSuccess: () => {
      // 로그아웃 성공 시 현재 사용자 정보 초기화 및 캐시 초기화
      queryClient.clear();
    },
  });
};

/**
 * Profile Hooks
 */
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => supabaseApi.profiles.getProfile(userId),
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<Profile> & { user_id: string }) =>
      supabaseApi.profiles.updateProfile(profile),
    onSuccess: (data) => {
      // 프로필 업데이트 성공 시 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ["profile", data.user_id] });
    },
  });
};

/**
 * Classes Hooks
 */
export const useClasses = () => {
  return useQuery({
    queryKey: ["classes"],
    queryFn: () => supabaseApi.classes.getAllClasses(),
  });
};

export const useClassDetails = (classId: string) => {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: () => supabaseApi.classes.getClassById(classId),
    enabled: !!classId, // classId가 있을 때만 쿼리 실행
  });
};

export const useTodayClasses = () => {
  return useQuery({
    queryKey: ["classes", "today"],
    queryFn: () => supabaseApi.classes.getTodayClasses(),
  });
};

/**
 * Reservation Hooks
 */
export const useUserReservations = (userId: string) => {
  return useQuery({
    queryKey: ["reservations", userId],
    queryFn: () => supabaseApi.reservations.getUserReservations(userId),
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationData: Partial<Reservation>) =>
      supabaseApi.reservations.createReservation(reservationData),
    onSuccess: (_, variables) => {
      // 예약 생성 성공 시 관련 쿼리 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["reservations", variables.user_id] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reservationId,
      status,
      userId,
    }: {
      reservationId: string;
      status: Reservation["status"];
      userId: string;
    }) => supabaseApi.reservations.updateReservationStatus(reservationId, status),
    onSuccess: (_, variables) => {
      // 예약 상태 업데이트 성공 시 관련 쿼리 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["reservations", variables.userId] });
    },
  });
};

/**
 * Notification Hooks
 */
export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => supabaseApi.notifications.getUserNotifications(userId),
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId, userId }: { notificationId: string; userId: string }) =>
      supabaseApi.notifications.markNotificationAsRead(notificationId),
    onSuccess: (_, variables) => {
      // 알림 읽음 상태 변경 성공 시 관련 쿼리 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["notifications", variables.userId] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => supabaseApi.notifications.markAllNotificationsAsRead(userId),
    onSuccess: (_, userId) => {
      // 모든 알림 읽음 상태 변경 성공 시 관련 쿼리 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
};

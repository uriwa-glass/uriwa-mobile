import supabase from "../config/supabase";
import { User, Profile, Class, Reservation, Notification, Tables } from "./types";

/**
 * 사용자 관련 API 함수
 */
export const userService = {
  // 현재 사용자 가져오기
  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // 로그인
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  // 회원가입
  signUp: async (email: string, password: string, fullName: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  },

  // 로그아웃
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // 사용자 프로필 가져오기
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from(Tables.Profiles)
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  // 사용자 프로필 업데이트
  updateProfile: async (profile: Partial<Profile>) => {
    const { data, error } = await supabase
      .from(Tables.Profiles)
      .update(profile)
      .eq("user_id", profile.user_id!)
      .select();

    if (error) throw error;
    return data[0] as Profile;
  },
};

/**
 * 수업 관련 API 함수
 */
export const classService = {
  // 모든 수업 가져오기
  getAllClasses: async () => {
    const { data, error } = await supabase
      .from(Tables.Classes)
      .select("*")
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data as Class[];
  },

  // 특정 수업 상세 정보 가져오기
  getClassById: async (classId: string) => {
    const { data, error } = await supabase
      .from(Tables.Classes)
      .select("*")
      .eq("id", classId)
      .single();

    if (error) throw error;
    return data as Class;
  },

  // 오늘 수업 가져오기
  getTodayClasses: async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from(Tables.Classes)
      .select("*")
      .gte("start_time", `${today}T00:00:00`)
      .lte("start_time", `${today}T23:59:59`)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data as Class[];
  },
};

/**
 * 예약 관련 API 함수
 */
export const reservationService = {
  // 사용자의 모든 예약 가져오기
  getUserReservations: async (userId: string) => {
    const { data, error } = await supabase
      .from(Tables.Reservations)
      .select(
        `
        *,
        ${Tables.Classes}(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // 예약 생성하기
  createReservation: async (reservation: Partial<Reservation>) => {
    const { data, error } = await supabase.from(Tables.Reservations).insert(reservation).select();

    if (error) throw error;
    return data[0] as Reservation;
  },

  // 예약 상태 업데이트
  updateReservationStatus: async (reservationId: string, status: Reservation["status"]) => {
    const { data, error } = await supabase
      .from(Tables.Reservations)
      .update({ status })
      .eq("id", reservationId)
      .select();

    if (error) throw error;
    return data[0] as Reservation;
  },
};

/**
 * 알림 관련 API 함수
 */
export const notificationService = {
  // 사용자의 모든 알림 가져오기
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from(Tables.Notifications)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  // 알림 읽음 상태 변경
  markNotificationAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from(Tables.Notifications)
      .update({ is_read: true })
      .eq("id", notificationId)
      .select();

    if (error) throw error;
    return data[0] as Notification;
  },

  // 모든 알림 읽음 상태로 변경
  markAllNotificationsAsRead: async (userId: string) => {
    const { data, error } = await supabase
      .from(Tables.Notifications)
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .select();

    if (error) throw error;
    return data as Notification[];
  },
};

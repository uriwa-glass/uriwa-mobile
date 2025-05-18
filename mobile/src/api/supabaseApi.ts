import supabase from "../config/supabase";
import { z } from "zod";
import {
  userSchema,
  profileSchema,
  classSchema,
  reservationSchema,
  notificationSchema,
  loginRequestSchema,
  signupRequestSchema,
  User,
  Profile,
  Class,
  Reservation,
  Notification,
} from "./schema";

/**
 * API 오류 타입
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Supabase API 클라이언트
 * Zod를 사용하여 데이터 유효성 검사를 수행합니다.
 */
export const supabaseApi = {
  /**
   * 인증 관련 API
   */
  auth: {
    // 현재 사용자 정보 가져오기
    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new ApiError(error.message, 401);
      }

      return data.user;
    },

    // 이메일/비밀번호로 로그인
    login: async (credentials: z.infer<typeof loginRequestSchema>) => {
      // 입력 유효성 검사
      const validatedData = loginRequestSchema.parse(credentials);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        throw new ApiError(error.message, 401);
      }

      return data;
    },

    // 회원가입
    signup: async (userData: z.infer<typeof signupRequestSchema>) => {
      // 입력 유효성 검사
      const validatedData = signupRequestSchema.parse(userData);

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.full_name,
          },
        },
      });

      if (error) {
        throw new ApiError(error.message, 400);
      }

      return data;
    },

    // 로그아웃
    logout: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return true;
    },
  },

  /**
   * 사용자 프로필 관련 API
   */
  profiles: {
    // 사용자 프로필 가져오기
    getProfile: async (userId: string): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw new ApiError(error.message, 404);
      }

      // Zod를 사용한 응답 데이터 유효성 검사
      return profileSchema.parse(data);
    },

    // 프로필 업데이트
    updateProfile: async (profile: Partial<Profile> & { user_id: string }): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("user_id", profile.user_id)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, 400);
      }

      return profileSchema.parse(data);
    },
  },

  /**
   * 수업 관련 API
   */
  classes: {
    // 모든 수업 목록 가져오기
    getAllClasses: async (): Promise<Class[]> => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return z.array(classSchema).parse(data);
    },

    // 특정 수업 상세 정보 가져오기
    getClassById: async (classId: string): Promise<Class> => {
      const { data, error } = await supabase.from("classes").select("*").eq("id", classId).single();

      if (error) {
        throw new ApiError(error.message, 404);
      }

      return classSchema.parse(data);
    },

    // 오늘 수업 목록 가져오기
    getTodayClasses: async (): Promise<Class[]> => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .gte("start_time", `${today}T00:00:00`)
        .lte("start_time", `${today}T23:59:59`)
        .order("start_time", { ascending: true });

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return z.array(classSchema).parse(data);
    },
  },

  /**
   * 예약 관련 API
   */
  reservations: {
    // 사용자의 모든 예약 가져오기
    getUserReservations: async (userId: string) => {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          `
          *,
          classes(*)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return data;
    },

    // 예약 생성하기
    createReservation: async (reservationData: Partial<Reservation>): Promise<Reservation> => {
      const { data, error } = await supabase
        .from("reservations")
        .insert(reservationData)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, 400);
      }

      return reservationSchema.parse(data);
    },

    // 예약 상태 업데이트
    updateReservationStatus: async (
      reservationId: string,
      status: Reservation["status"]
    ): Promise<Reservation> => {
      const { data, error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", reservationId)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, 400);
      }

      return reservationSchema.parse(data);
    },
  },

  /**
   * 알림 관련 API
   */
  notifications: {
    // 사용자의 모든 알림 가져오기
    getUserNotifications: async (userId: string): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return z.array(notificationSchema).parse(data);
    },

    // 알림 읽음 상태 변경
    markNotificationAsRead: async (notificationId: string): Promise<Notification> => {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, 400);
      }

      return notificationSchema.parse(data);
    },

    // 모든 알림 읽음 상태로 변경
    markAllNotificationsAsRead: async (userId: string): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .select();

      if (error) {
        throw new ApiError(error.message, 500);
      }

      return z.array(notificationSchema).parse(data);
    },
  },
};

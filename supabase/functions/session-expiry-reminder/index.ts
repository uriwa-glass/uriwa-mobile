import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Session Expiry Reminder function started");

const REMINDER_DAYS_BEFORE_EXPIRY = [7, 3, 1]; // 만료 X일 전에 알림 (여러 번 보낼 수 있도록 배열로 관리)

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date();
    // Notification 타입 임포트 또는 직접 정의 필요
    // 예시: type NotificationInsert = { user_id: string; type: string; title: string; message: string; data: any; };
    // 실제로는 DB 스키마와 일치하는 타입을 사용해야 함 (notifications 테이블 구조 기반)
    interface NotificationInsert {
      user_id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>; // data 필드는 JSONB이므로 Record<string, any> 또는 구체적인 타입
    }
    const notificationsToInsert: NotificationInsert[] = [];

    for (const daysBefore of REMINDER_DAYS_BEFORE_EXPIRY) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);
      const targetDateString = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식

      // 1. 특정 만료일(targetDateString)에 해당하는 세션들 조회
      // (정확히 X일 후 만료되는 세션만 조회)
      const { data: expiringSessions, error: fetchError } = await supabaseClient
        .from("user_sessions")
        .select(
          `
          user_id,
          session_count,
          expiry_date,
          users:user_profiles (display_name)
        `
        )
        .gte("expiry_date", `${targetDateString}T00:00:00.000Z`)
        .lt("expiry_date", `${targetDateString}T23:59:59.999Z`);
      // TODO: 이미 해당 만료일로 알림을 보낸 사용자는 제외하는 로직 추가

      if (fetchError) {
        console.error(`Error fetching sessions expiring in ${daysBefore} days:`, fetchError);
        continue; // 다음 알림 일자로 계속 진행
      }

      if (!expiringSessions || expiringSessions.length === 0) {
        console.log(`No sessions expiring in ${daysBefore} days found.`);
        continue;
      }

      for (const session of expiringSessions) {
        notificationsToInsert.push({
          user_id: session.user_id,
          type: "session_expiry_reminder",
          title: "세션 만료 예정 알림",
          message: `안녕하세요, ${
            session.users?.display_name || "회원"
          }님. 보유하신 세션이 ${daysBefore}일 후 (${new Date(
            session.expiry_date
          ).toLocaleDateString("ko-KR")}) 만료될 예정입니다. 잊지 말고 사용하거나 갱신해 주세요.`,
          data: {
            remaining_days: daysBefore,
            expiry_date: session.expiry_date,
            session_count: session.session_count,
          },
        });
      }
    }

    if (notificationsToInsert.length === 0) {
      console.log("No session expiry notifications to insert.");
      return new Response(JSON.stringify({ message: "No users to notify for session expiry." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. notifications 테이블에 알림 기록
    const { error: insertError } = await supabaseClient
      .from("notifications")
      .insert(notificationsToInsert);

    if (insertError) {
      console.error("Error inserting session expiry notifications:", insertError);
      throw insertError;
    }

    console.log(`Inserted ${notificationsToInsert.length} session expiry notifications.`);

    return new Response(
      JSON.stringify({
        message: `Successfully sent ${notificationsToInsert.length} session expiry reminders.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Handler error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

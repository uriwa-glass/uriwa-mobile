import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Low Session Balance Checker function started");

const LOW_SESSION_THRESHOLD = 3; // 세션 부족 알림 임계값

serve(async (req) => {
  try {
    // Supabase 클라이언트 생성 (환경 변수에서 URL 및 서비스 키 가져오기)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. 세션 수가 임계값 이하이고, 만료되지 않았으며, 최근 알림이 없는 사용자 조회
    const { data: usersToNotify, error: fetchError } = await supabaseClient
      .from("user_sessions")
      .select(
        `
        user_id,
        session_count,
        expiry_date,
        users:user_profiles (display_name)
      `
      )
      .lte("session_count", LOW_SESSION_THRESHOLD)
      .gt("session_count", 0) // 0개인 경우는 제외 (별도 만료/소진 알림이 있을 수 있음)
      .gte("expiry_date", new Date().toISOString());
    // TODO: 이미 알림을 보낸 사용자는 제외하는 로직 추가 (예: notifications 테이블 확인)

    if (fetchError) {
      console.error("Error fetching users with low session balance:", fetchError);
      throw fetchError;
    }

    if (!usersToNotify || usersToNotify.length === 0) {
      console.log("No users with low session balance found.");
      return new Response(JSON.stringify({ message: "No users to notify." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const notificationsToInsert = usersToNotify.map((userSession) => ({
      user_id: userSession.user_id,
      type: "low_session_balance",
      title: "세션 잔여 횟수 알림",
      message: `안녕하세요, ${userSession.users?.display_name || "회원"}님. 보유하신 세션이 ${
        userSession.session_count
      }회 남았습니다. 곧 소진될 예정이니 추가 구매를 고려해 보세요.`,
      data: {
        remaining_sessions: userSession.session_count,
        expiry_date: userSession.expiry_date,
      },
    }));

    // 2. notifications 테이블에 알림 기록
    const { error: insertError } = await supabaseClient
      .from("notifications")
      .insert(notificationsToInsert);

    if (insertError) {
      console.error("Error inserting low session balance notifications:", insertError);
      throw insertError;
    }

    console.log(`Inserted ${notificationsToInsert.length} low session balance notifications.`);

    return new Response(
      JSON.stringify({ message: `Successfully notified ${notificationsToInsert.length} users.` }),
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

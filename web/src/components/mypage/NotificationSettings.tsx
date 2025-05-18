import React, { useEffect } from "react";
import { useUserStore } from "../../stores/userStore";

const NotificationSettings = () => {
  const { userProfile, currentUser, updateUserProfile } = useUserStore((state) => state);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [notifications, setNotifications] = React.useState({
    email_notifications: false,
    push_notifications: false,
    marketing_notifications: false,
    class_reminders: false,
    community_notifications: false,
  });

  useEffect(() => {
    if (userProfile) {
      setNotifications({
        email_notifications: userProfile.email_notifications ?? false,
        push_notifications: userProfile.push_notifications ?? false,
        marketing_notifications: userProfile.marketing_notifications ?? false,
        class_reminders: userProfile.class_reminders ?? false,
        community_notifications: userProfile.community_notifications ?? false,
      });
    }
  }, [userProfile]);

  const handleToggle = async (key: keyof typeof notifications) => {
    if (!currentUser || !userProfile) return;

    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(updatedNotifications);
    setIsLoading(true);

    try {
      await updateUserProfile(currentUser.id, updatedNotifications);
      setIsLoading(false);
    } catch (error) {
      // 에러 발생 시 원래 상태로 롤백
      setNotifications(notifications);
      setIsLoading(false);
      console.error("알림 설정 업데이트 실패:", error);
      alert("알림 설정을 업데이트하는 중 오류가 발생했습니다.");
    }
  };

  if (!userProfile) {
    return <p>프로필 정보를 불러오는 중입니다...</p>;
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">알림 설정</h2>
      <p className="text-gray-600 mb-6">원하는 알림 유형을 선택하면 자동으로 설정이 저장됩니다.</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">이메일 알림</h3>
            <p className="text-sm text-gray-500">
              중요한 업데이트 및 공지사항을 이메일로 받습니다.
            </p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              notifications.email_notifications ? "bg-pink-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={notifications.email_notifications}
            aria-labelledby="email-notifications-label"
            disabled={isLoading}
            onClick={() => handleToggle("email_notifications")}
          >
            <span className="sr-only">이메일 알림 사용</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notifications.email_notifications ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">푸시 알림</h3>
            <p className="text-sm text-gray-500">앱에서 실시간 알림을 받습니다.</p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              notifications.push_notifications ? "bg-pink-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={notifications.push_notifications}
            aria-labelledby="push-notifications-label"
            disabled={isLoading}
            onClick={() => handleToggle("push_notifications")}
          >
            <span className="sr-only">푸시 알림 사용</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notifications.push_notifications ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">마케팅 정보</h3>
            <p className="text-sm text-gray-500">신규 서비스 및 프로모션 정보를 받습니다.</p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              notifications.marketing_notifications ? "bg-pink-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={notifications.marketing_notifications}
            aria-labelledby="marketing-notifications-label"
            disabled={isLoading}
            onClick={() => handleToggle("marketing_notifications")}
          >
            <span className="sr-only">마케팅 정보 수신</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notifications.marketing_notifications ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">수업 리마인더</h3>
            <p className="text-sm text-gray-500">예정된 수업 시작 전에 알림을 받습니다.</p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              notifications.class_reminders ? "bg-pink-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={notifications.class_reminders}
            aria-labelledby="class-reminders-label"
            disabled={isLoading}
            onClick={() => handleToggle("class_reminders")}
          >
            <span className="sr-only">수업 리마인더 사용</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notifications.class_reminders ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="font-medium text-gray-900">커뮤니티 활동</h3>
            <p className="text-sm text-gray-500">댓글, 좋아요 등 커뮤니티 활동 알림을 받습니다.</p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              notifications.community_notifications ? "bg-pink-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={notifications.community_notifications}
            aria-labelledby="community-activity-label"
            disabled={isLoading}
            onClick={() => handleToggle("community_notifications")}
          >
            <span className="sr-only">커뮤니티 활동 알림 사용</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notifications.community_notifications ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </button>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-sm text-pink-600">설정 저장 중...</p>}
    </div>
  );
};

export default NotificationSettings;

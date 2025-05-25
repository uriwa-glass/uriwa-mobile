import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { UserProfile } from "../../types/models/user";
import LoadingSpinner from "../common/LoadingSpinner";

interface ProfileFormInputs extends Pick<UserProfile, "full_name" | "phone" | "address"> {
  avatar_file?: FileList;
}

const UserProfileEditForm = () => {
  const { user, profile, updateProfile, uploadAvatar, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProfileFormInputs>();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setValue("full_name", profile.full_name);
      setValue("phone", profile.phone || "");
      setValue("address", profile.address || "");
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile, setValue]);

  const avatarFile = watch("avatar_file");
  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 파일 타입 확인
      if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
        setUploadError("지원되는 이미지 형식이 아닙니다. (JPEG, PNG, GIF, WEBP 파일만 허용됩니다)");
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (profile?.avatar_url) {
      // 파일 선택 취소 시 기존 아바타로 복원
      setAvatarPreview(profile.avatar_url);
      setUploadError(null);
    }
  }, [avatarFile, profile?.avatar_url]);

  // 아바타 업로드 진행 상태를 시뮬레이션하는 함수 (실제로는 업로드 라이브러리에서 제공하는 진행률 이벤트를 사용)
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    return interval;
  };

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data: ProfileFormInputs) => {
    if (!user || !profile) return;

    let newAvatarUrl = profile.avatar_url;
    let progressInterval: NodeJS.Timeout | null = null;

    // 아바타 파일 업로드 처리
    if (data.avatar_file && data.avatar_file.length > 0 && uploadAvatar) {
      const file = data.avatar_file[0];

      // 파일 크기 및 타입 재검증
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
        alert("지원되는 이미지 형식이 아닙니다. (JPEG, PNG, GIF, WEBP 파일만 허용됩니다)");
        return;
      }

      setAvatarUploading(true);
      progressInterval = simulateProgress(); // 업로드 진행 상태 시각화 시작

      try {
        const uploadedUrl = await uploadAvatar(file);
        setUploadProgress(100); // 업로드 완료

        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        } else {
          console.warn("Avatar upload returned null URL");
          alert("이미지 업로드 중 문제가 발생했습니다. 다시 시도해주세요.");
          setAvatarUploading(false);
          if (progressInterval) clearInterval(progressInterval);
          return;
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("아바타 업로드 중 오류가 발생했습니다.");
        setAvatarUploading(false);
        if (progressInterval) clearInterval(progressInterval);
        return;
      }
    }

    const profileUpdateData: Partial<UserProfile> = {
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      avatar_url: newAvatarUrl || undefined,
    };

    try {
      await updateProfile(profileUpdateData);
      if (progressInterval) clearInterval(progressInterval); // 진행 상태 시각화 중지
      setAvatarUploading(false);
      alert("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (progressInterval) clearInterval(progressInterval);
      setAvatarUploading(false);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center p-6">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white shadow-xl rounded-lg p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">프로필 수정</h2>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full">
          <img
            src={avatarPreview || "https://via.placeholder.com/150"}
            alt="프로필 미리보기"
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-pink-300 shadow-md ${
              avatarUploading ? "opacity-50" : ""
            }`}
          />
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner color="pink" />
            </div>
          )}

          {/* 업로드 진행 상태 표시 */}
          {avatarUploading && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-2 rounded-b-full overflow-hidden">
              <div
                className="h-full bg-pink-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <label
            htmlFor="avatar_file"
            className={`cursor-pointer bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out ${
              isSubmitting || avatarUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {avatarUploading ? "업로드 중..." : "사진 변경"}
          </label>
          <input
            id="avatar_file"
            type="file"
            {...register("avatar_file")}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            disabled={isSubmitting || avatarUploading}
          />

          {uploadError && (
            <p className="text-xs text-red-500 text-center max-w-xs">{uploadError}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            최대 5MB, JPEG/PNG/GIF/WEBP 파일만 허용됩니다.
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          id="full_name"
          type="text"
          {...register("full_name", { required: "이름을 입력해주세요." })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.full_name && (
          <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          전화번호
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          주소
        </label>
        <input
          id="address"
          type="text"
          {...register("address")}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || avatarUploading || loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 transition duration-150 ease-in-out flex items-center space-x-2"
        >
          {(isSubmitting || loading) && <LoadingSpinner size="sm" color="white" />}
          <span>{isSubmitting || loading ? "저장 중..." : "프로필 저장"}</span>
        </button>
      </div>
    </form>
  );
};

export default UserProfileEditForm;

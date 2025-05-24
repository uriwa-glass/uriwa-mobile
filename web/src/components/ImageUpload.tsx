import React, { useState, useRef } from "react";
import { supabase } from "../api/supabaseClient";
import { FaUpload, FaTimes, FaImage, FaSpinner } from "react-icons/fa";
import IconWrapper from "./IconWrapper";

interface ImageUploadProps {
  bucketName: "class-thumbnails" | "exhibition-images" | "portfolio-images";
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  accept?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  bucketName,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8,
  accept = "image/*",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 리사이징 함수
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // 비율 계산
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(new Blob()); // 빈 Blob 반환
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // 파일 업로드 함수
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      // 이미지 리사이징
      const resizedBlob = await resizeImage(file);
      if (!resizedBlob) {
        throw new Error("이미지 리사이징에 실패했습니다.");
      }

      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, resizedBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // 공개 URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(data.path);

      onImageUploaded(publicUrl);
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  };

  // 이미지 제거 함수
  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // URL에서 파일 경로 추출
      const urlParts = currentImageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Supabase Storage에서 삭제
      const { error } = await supabase.storage.from(bucketName).remove([fileName]);

      if (error) {
        console.error("이미지 삭제 오류:", error);
      }

      onImageRemoved?.();
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 현재 이미지 표시 */}
      {currentImageUrl && (
        <div className="relative inline-block">
          <img
            src={currentImageUrl}
            alt="업로드된 이미지"
            className="w-32 h-24 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <IconWrapper icon={FaTimes} className="text-xs" />
          </button>
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? "border-[#FF7648] bg-orange-50" : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <IconWrapper icon={FaSpinner} className="text-3xl text-[#FF7648] animate-spin mb-2" />
            <p className="text-gray-600">업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <IconWrapper
              icon={currentImageUrl ? FaImage : FaUpload}
              className="text-3xl text-gray-400 mb-2"
            />
            <p className="text-gray-600 mb-1">
              {currentImageUrl ? "새 이미지로 교체" : "이미지를 드래그하거나 클릭하여 업로드"}
            </p>
            <p className="text-sm text-gray-500">
              최대 {maxWidth}x{maxHeight}px로 자동 리사이징됩니다
            </p>
          </div>
        )}
      </div>

      {/* 업로드 정보 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 지원 형식: JPEG, PNG, WebP, GIF</p>
        <p>• 최대 파일 크기: {bucketName === "class-thumbnails" ? "5MB" : "10MB"}</p>
        <p>• 이미지는 자동으로 최적화됩니다</p>
      </div>
    </div>
  );
};

export default ImageUpload;

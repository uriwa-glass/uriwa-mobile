import React, { useState, useEffect, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import Layout from "../../components/Layout";
import Button, { ButtonProps } from "../../components/Button";
import type { FormTemplate } from "../../types/form";

interface ConfirmDialogState {
  isOpen: boolean;
  type: "toggleStatus" | "delete" | null;
  templateId: string | null;
  title: string;
  message: string;
  currentStatus?: boolean;
}

const FormTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
    templateId: null,
    title: "",
    message: "",
  });

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login");
        return;
      }
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (!profileData || profileData.role !== "admin") {
        navigate("/");
        return;
      }
      const { data: templateData, error: templateError } = await supabase
        .from("form_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (templateError) throw templateError;
      setTemplates((templateData as FormTemplate[]) || []);
    } catch (err: any) {
      console.error("Error loading templates:", err);
      setError("템플릿을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [navigate]);

  const handleToggleStatus = (templateId: string, currentStatus: boolean) => {
    const templateTitle = templates.find((t) => t.id === templateId)?.title || "해당 템플릿";
    setConfirmDialog({
      isOpen: true,
      type: "toggleStatus",
      templateId,
      currentStatus,
      title: currentStatus ? "템플릿 비활성화" : "템플릿 활성화",
      message: `${templateTitle} 템플릿을 ${
        currentStatus
          ? "비활성화하시겠습니까? 사용자는 이 폼을 더 이상 볼 수 없습니다."
          : "활성화하시겠습니까?"
      }`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const templateTitle = templates.find((t) => t.id === templateId)?.title || "해당 템플릿";
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      templateId,
      title: "템플릿 삭제",
      message: `${templateTitle} 템플릿을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.type || !confirmDialog.templateId) return;
    try {
      setIsLoading(true);
      if (confirmDialog.type === "toggleStatus") {
        const newStatus = !confirmDialog.currentStatus;
        const { error: updateError } = await supabase
          .from("form_templates")
          .update({ is_active: newStatus, updated_at: new Date().toISOString() })
          .eq("id", confirmDialog.templateId);
        if (updateError) throw updateError;
        await loadTemplates();
      } else if (confirmDialog.type === "delete") {
        const { error: deleteError } = await supabase
          .from("form_templates")
          .delete()
          .eq("id", confirmDialog.templateId);
        if (deleteError) throw deleteError;
        await loadTemplates();
      }
    } catch (err: any) {
      console.error(`Error ${confirmDialog.type} template:`, err);
      setError(`작업 중 오류 발생: ${err.message}`);
    } finally {
      setIsLoading(false);
      setConfirmDialog({ isOpen: false, type: null, templateId: null, title: "", message: "" });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusClass = (isActive: boolean | undefined): string =>
    isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600";

  const getButtonVariantForToggle = (isActive: boolean | undefined): ButtonProps["variant"] =>
    isActive ? "warning" : "success";

  if (isLoading && !confirmDialog.isOpen) {
    return (
      <Layout title="폼 템플릿 관리">
        <div className="p-4 flex flex-col items-center justify-center text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
          <p className="text-md text-text-secondary">템플릿 목록을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error && !confirmDialog.isOpen) {
    return (
      <Layout title="오류">
        <div className="p-4 text-center py-16">
          <p className="text-md text-error-main mb-5">{error}</p>
          <Button
            variant="primary"
            onClick={() => {
              setError(null);
              loadTemplates();
            }}
          >
            다시 시도
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="폼 템플릿 관리">
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-border-light">
          <h1 className="text-2xl text-text-primary font-semibold mb-3 sm:mb-0">폼 템플릿 관리</h1>
          <Button variant="primary" onClick={() => navigate("/admin/form-create")}>
            새 템플릿 생성
          </Button>
        </div>

        {templates.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-background-paper rounded-lg shadow-md">
            <div className="text-6xl mb-6 text-gray-400">📄</div>
            <h3 className="text-xl text-text-primary mb-2 font-medium">
              생성된 템플릿이 없습니다.
            </h3>
            <p className="text-base text-text-secondary mb-6 max-w-md">
              새로운 폼 템플릿을 만들어 다양한 용도로 활용해보세요. (예: 고객 문의, 서비스 신청,
              이벤트 등록 등)
            </p>
            <Button variant="primary" size="large" onClick={() => navigate("/admin/form-create")}>
              첫 템플릿 생성하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-background-paper rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border border-border-lighter overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg text-text-primary mb-1.5 truncate font-semibold"
                        title={template.title}
                      >
                        {template.title}
                      </h3>
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${getStatusClass(
                          template.is_active
                        )}`}
                      >
                        {template.is_active ? "활성" : "비활성"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2 pt-1">
                      ID: {template.id.substring(0, 8)}
                    </span>
                  </div>
                  <p
                    className="text-sm text-text-secondary mb-4 leading-relaxed h-20 overflow-hidden line-clamp-4"
                    title={template.description || undefined}
                  >
                    {template.description || "제공된 설명이 없습니다."}
                  </p>
                  <div className="text-xs text-gray-500">
                    <span>필드: {template.fields?.length || 0}개</span>
                    <span className="mx-1.5">|</span>
                    <span>최종 수정: {formatDate(template.updated_at)}</span>
                  </div>
                </div>
                <div className="flex gap-px bg-border-lighter border-t border-border-lighter">
                  <Button
                    variant={getButtonVariantForToggle(template.is_active)}
                    size="small"
                    onClick={() => handleToggleStatus(template.id, template.is_active ?? false)}
                    className="flex-1 rounded-none rounded-bl-lg !border-0"
                  >
                    {template.is_active ? "비활성화" : "활성화"}
                  </Button>
                  <Link
                    to={`/admin/form-edit/${template.id}`}
                    className="flex-1 rounded-none !border-0 border-l border-r border-border-lighter text-center flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    편집
                  </Link>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="flex-1 rounded-none rounded-br-lg !border-0"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
          onClick={() => !isLoading && setConfirmDialog({ ...confirmDialog, isOpen: false })}
        >
          <div
            className="bg-background-paper rounded-lg p-6 w-full max-w-md mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl text-text-primary mb-4 font-semibold">{confirmDialog.title}</h3>
            <p className="text-base text-text-secondary mb-8 whitespace-pre-wrap leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDialog({
                    isOpen: false,
                    type: null,
                    templateId: null,
                    title: "",
                    message: "",
                  })
                }
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                variant={confirmDialog.type === "delete" ? "danger" : "primary"}
                onClick={confirmAction}
                disabled={isLoading}
                className="min-w-[80px]"
              >
                {isLoading && confirmDialog.isOpen ? (
                  <div className="flex items-center justify-center">
                    <div className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FormTemplates;

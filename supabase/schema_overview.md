# URIWA Mobile 데이터베이스 스키마

이 문서는 URIWA Mobile 애플리케이션의 데이터베이스 구조를 설명합니다.

## 핵심 테이블

### user_profiles

사용자 프로필 정보를 저장하는 테이블입니다.

- `id`: 프로필 고유 ID
- `user_id`: Auth 시스템의 사용자 ID (외래 키)
- `display_name`: 표시 이름
- `full_name`: 전체 이름
- `avatar_url`: 프로필 이미지 URL
- `membership_level`: 멤버십 레벨 (REGULAR, PREMIUM 등)
- `role`: 사용자 역할 (user, admin)
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### classes

수업 정보를 저장하는 테이블입니다.

- `id`: 수업 고유 ID
- `title`: 수업 제목
- `description`: 수업 설명
- `instructor_id`: 강사 ID (user_profiles의 user_id 참조)
- `max_participants`: 최대 참가자 수
- `price`: 가격
- `duration`: 수업 시간 (분 단위)
- `category`: 수업 카테고리
- `thumbnail_url`: 썸네일 이미지 URL
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### class_schedules

수업 일정 정보를 저장하는 테이블입니다.

- `id`: 일정 고유 ID
- `class_id`: 수업 ID (외래 키)
- `start_time`: 시작 시간
- `end_time`: 종료 시간
- `max_participants`: 최대 참가자 수
- `current_participants`: 현재 참가자 수
- `status`: 상태 (scheduled, cancelled, completed)
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### reservations

예약 정보를 저장하는 테이블입니다.

- `id`: 예약 고유 ID
- `user_id`: 사용자 ID (외래 키)
- `class_id`: 수업 ID (외래 키)
- `status`: 상태 (pending, confirmed, cancelled, completed)
- `payment_status`: 결제 상태 (unpaid, paid, refunded)
- `reserved_at`: 예약 시간
- `start_time`: 시작 시간
- `end_time`: 종료 시간
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

## 부가 테이블

### cancellations

예약 취소 내역을 저장하는 테이블입니다.

- `id`: 취소 고유 ID
- `reservation_id`: 예약 ID (외래 키)
- `user_id`: 사용자 ID (외래 키)
- `reason`: 취소 사유
- `refund_amount`: 환불 금액
- `refund_status`: 환불 상태 (pending, processed, rejected)
- `cancelled_at`: 취소 시간
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### inquiries

문의 내용을 저장하는 테이블입니다.

- `id`: 문의 고유 ID
- `user_id`: 사용자 ID (외래 키)
- `subject`: 제목
- `content`: 내용
- `status`: 상태 (pending, answered, closed)
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### inquiry_responses

문의에 대한 답변을 저장하는 테이블입니다.

- `id`: 답변 고유 ID
- `inquiry_id`: 문의 ID (외래 키)
- `responder_id`: 응답자 ID (외래 키)
- `content`: 답변 내용
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### form_templates

폼 템플릿 정보를 저장하는 테이블입니다.

- `id`: 템플릿 고유 ID
- `title`: 제목
- `description`: 설명
- `schema`: 폼 스키마 (JSON 형식)
- `created_by`: 생성자 ID (외래 키)
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

### form_responses

폼 응답 정보를 저장하는 테이블입니다.

- `id`: 응답 고유 ID
- `template_id`: 템플릿 ID (외래 키)
- `user_id`: 사용자 ID (외래 키)
- `responses`: 응답 내용 (JSON 형식)
- `created_at`: 생성 시간
- `updated_at`: 업데이트 시간

## RLS 정책

현재 개발 환경에서는 모든 테이블에 대해 `FOR ALL USING (true)` 정책이 적용되어 있습니다. 이는 모든 인증된 사용자가 모든 테이블에 접근할 수 있음을 의미합니다.

## 인덱스

성능 최적화를 위해 다음과 같은 인덱스가 생성되어 있습니다:

- `idx_reservations_user_id`: 예약 테이블의 user_id
- `idx_reservations_class_id`: 예약 테이블의 class_id
- `idx_inquiries_user_id`: 문의 테이블의 user_id
- `idx_class_schedules_class_id`: 수업 일정 테이블의 class_id
- `idx_form_responses_template_id`: 폼 응답 테이블의 template_id
- `idx_form_responses_user_id`: 폼 응답 테이블의 user_id

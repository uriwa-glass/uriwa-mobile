-- 수강 신청 테이블 생성
CREATE TABLE IF NOT EXISTS course_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    course_type VARCHAR(50) NOT NULL CHECK (course_type IN ('stained-glass', 'glass-kiln')),
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    motivation TEXT NOT NULL,
    experience TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_course_applications_user_id ON course_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_course_applications_course_id ON course_applications(course_id);
CREATE INDEX IF NOT EXISTS idx_course_applications_status ON course_applications(status);
CREATE INDEX IF NOT EXISTS idx_course_applications_created_at ON course_applications(created_at);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE course_applications ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 신청만 볼 수 있는 정책
CREATE POLICY "Users can view own applications" ON course_applications
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자가 자신의 신청을 생성할 수 있는 정책
CREATE POLICY "Users can create own applications" ON course_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 신청을 수정할 수 있는 정책 (관리자 필드는 제외)
CREATE POLICY "Users can update own applications" ON course_applications
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        status = 'pending'
    );

-- 관리자가 모든 신청을 볼 수 있는 정책
CREATE POLICY "Admins can view all applications" ON course_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자가 모든 신청을 수정할 수 있는 정책
CREATE POLICY "Admins can update all applications" ON course_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_course_applications_updated_at 
    BEFORE UPDATE ON course_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 신청 승인/거절 시 reviewed_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 approved 또는 rejected로 변경되고 reviewed_at이 NULL인 경우
    IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
        NEW.reviewed_at = TIMEZONE('utc'::text, NOW());
        NEW.reviewed_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_applications_reviewed_at 
    BEFORE UPDATE ON course_applications 
    FOR EACH ROW EXECUTE FUNCTION update_reviewed_at(); 
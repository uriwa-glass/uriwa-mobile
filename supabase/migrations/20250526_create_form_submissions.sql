-- form_submissions 테이블 생성
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_form_submissions_template_id ON form_submissions(template_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);

-- RLS 활성화
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 사용자는 자신의 제출된 폼만 볼 수 있음
CREATE POLICY "사용자는 자신의 폼 제출 내역만 조회 가능" 
ON form_submissions FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 폼만 제출할 수 있음
CREATE POLICY "사용자는 자신의 폼만 제출 가능" 
ON form_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 폼 제출 내역을 볼 수 있음
CREATE POLICY "관리자는 모든 폼 제출 내역 조회 가능" 
ON form_submissions FOR ALL 
USING (
    auth.uid() IN (
        SELECT user_id FROM user_profiles 
        WHERE role = 'admin'
    )
);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_submissions_updated_at 
    BEFORE UPDATE ON form_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 
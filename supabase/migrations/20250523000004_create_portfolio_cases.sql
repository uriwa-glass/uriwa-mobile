-- 포트폴리오 케이스 테이블 생성
CREATE TABLE IF NOT EXISTS portfolio_cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    client_name VARCHAR(255),
    project_date DATE,
    featured_image_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    project_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_portfolio_cases_status ON portfolio_cases(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_cases_category ON portfolio_cases(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_cases_display_order ON portfolio_cases(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_cases_is_featured ON portfolio_cases(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_cases_created_at ON portfolio_cases(created_at);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE portfolio_cases ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 포트폴리오 케이스를 볼 수 있는 정책 (공개 정보)
CREATE POLICY "Anyone can view active portfolio cases" ON portfolio_cases
    FOR SELECT USING (status = 'active');

-- 관리자만 포트폴리오 케이스를 추가할 수 있는 정책
CREATE POLICY "Admins can insert portfolio cases" ON portfolio_cases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자만 포트폴리오 케이스를 수정할 수 있는 정책
CREATE POLICY "Admins can update portfolio cases" ON portfolio_cases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자만 포트폴리오 케이스를 삭제할 수 있는 정책
CREATE POLICY "Admins can delete portfolio cases" ON portfolio_cases
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_portfolio_cases_updated_at 
    BEFORE UPDATE ON portfolio_cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

-- 샘플 데이터 삽입
INSERT INTO portfolio_cases (title, description, category, client_name, project_date, featured_image_url, image_urls, technologies, status, display_order, is_featured) VALUES
('현대적인 스테인드글라스 창문', '현대적인 감각으로 재해석한 스테인드글라스 창문 작업입니다. 기하학적 패턴과 따뜻한 색상을 조화시켜 공간에 특별한 분위기를 연출했습니다.', '인테리어', '카페 블루', '2024-03-15', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', ARRAY['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], ARRAY['스테인드글라스', '납 접합', '색유리'], 'active', 1, true),
('전통 한옥 스테인드글라스', '전통 한옥의 아름다움을 스테인드글라스로 표현한 작품입니다. 한국의 전통 문양과 색감을 현대적 기법으로 재현했습니다.', '전통', '한옥 게스트하우스', '2024-02-20', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800'], ARRAY['전통 스테인드글라스', '한국 전통 문양', '천연 안료'], 'active', 2, false),
('유리 조명 설치 작업', '특별한 공간을 위한 맞춤형 유리 조명 설치 프로젝트입니다. 빛과 유리의 조화로 환상적인 분위기를 연출했습니다.', '조명', '레스토랑 루체', '2024-01-10', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'], ARRAY['유리 가공', '조명 설계', 'LED 연동'], 'active', 3, false); 
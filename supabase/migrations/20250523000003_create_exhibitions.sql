-- 전시작품 테이블 생성
CREATE TABLE IF NOT EXISTS exhibitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    story TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    price INTEGER NOT NULL DEFAULT 0,
    dimensions VARCHAR(100) NOT NULL,
    medium VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    edition VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exhibitions_title ON exhibitions(title);
CREATE INDEX IF NOT EXISTS idx_exhibitions_artist ON exhibitions(artist);
CREATE INDEX IF NOT EXISTS idx_exhibitions_year ON exhibitions(year);
CREATE INDEX IF NOT EXISTS idx_exhibitions_price ON exhibitions(price);
CREATE INDEX IF NOT EXISTS idx_exhibitions_is_available ON exhibitions(is_available);
CREATE INDEX IF NOT EXISTS idx_exhibitions_created_at ON exhibitions(created_at);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 전시작품을 볼 수 있는 정책 (공개 정보)
CREATE POLICY "Anyone can view exhibitions" ON exhibitions
    FOR SELECT USING (true);

-- 관리자만 전시작품을 추가할 수 있는 정책
CREATE POLICY "Admins can insert exhibitions" ON exhibitions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자만 전시작품을 수정할 수 있는 정책
CREATE POLICY "Admins can update exhibitions" ON exhibitions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자만 전시작품을 삭제할 수 있는 정책
CREATE POLICY "Admins can delete exhibitions" ON exhibitions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_exhibitions_updated_at 
    BEFORE UPDATE ON exhibitions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
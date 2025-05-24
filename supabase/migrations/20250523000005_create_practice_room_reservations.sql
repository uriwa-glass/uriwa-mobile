-- 연습실 예약 테이블 생성
CREATE TABLE IF NOT EXISTS practice_room_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 2,
    total_price INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_practice_room_reservations_user_id ON practice_room_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_room_reservations_date ON practice_room_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_practice_room_reservations_room_id ON practice_room_reservations(room_id);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE practice_room_reservations ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 예약만 볼 수 있는 정책
CREATE POLICY "Users can view own reservations" ON practice_room_reservations
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자가 자신의 예약을 생성할 수 있는 정책
CREATE POLICY "Users can create own reservations" ON practice_room_reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 예약을 수정할 수 있는 정책
CREATE POLICY "Users can update own reservations" ON practice_room_reservations
    FOR UPDATE USING (auth.uid() = user_id);

-- 관리자가 모든 예약을 볼 수 있는 정책
CREATE POLICY "Admins can view all reservations" ON practice_room_reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- 관리자가 모든 예약을 수정할 수 있는 정책
CREATE POLICY "Admins can update all reservations" ON practice_room_reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practice_room_reservations_updated_at 
    BEFORE UPDATE ON practice_room_reservations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
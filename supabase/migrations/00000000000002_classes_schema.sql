-- 클래스 및 예약 관련 테이블 스키마

-- classes 테이블 생성
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  duration INTEGER NOT NULL, -- 분 단위
  max_participants INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_classes
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- class_schedules 테이블 생성
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_class_schedules
BEFORE UPDATE ON public.class_schedules
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- class_reservations 테이블 생성
CREATE TABLE IF NOT EXISTS public.class_reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.class_schedules(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending', 'attended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 같은 유저가 같은 수업 시간에 중복 예약을 하지 않도록 제약 조건 추가
  CONSTRAINT unique_user_schedule UNIQUE (user_id, schedule_id)
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_class_reservations
BEFORE UPDATE ON public.class_reservations
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- 예약 생성/취소 시 class_schedules의 current_participants를 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION public.update_class_participants() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
    UPDATE public.class_schedules
    SET current_participants = current_participants + 1
    WHERE id = NEW.schedule_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled') THEN
    UPDATE public.class_schedules
    SET current_participants = current_participants - 1
    WHERE id = NEW.schedule_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN
    UPDATE public.class_schedules
    SET current_participants = current_participants + 1
    WHERE id = NEW.schedule_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 예약 생성/수정 시 트리거 적용
CREATE TRIGGER after_reservation_change
  AFTER INSERT OR UPDATE ON public.class_reservations
  FOR EACH ROW EXECUTE PROCEDURE public.update_class_participants(); 
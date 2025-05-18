-- 갤러리 관련 테이블 스키마

-- gallery_categories 테이블 생성
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_gallery_categories
BEFORE UPDATE ON public.gallery_categories
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- gallery_items 테이블 생성
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES public.gallery_categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_gallery_items
BEFORE UPDATE ON public.gallery_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- testimonials 테이블 생성
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_testimonials
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp(); 
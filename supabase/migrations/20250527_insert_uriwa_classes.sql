-- URiWa 유리공예 수업 데이터 추가

-- 스테인드글라스 과정
INSERT INTO classes (
  id,
  title,
  description,
  category,
  max_participants,
  price,
  duration,
  thumbnail_url,
  created_at,
  updated_at
) VALUES 
-- 스테인드글라스 초급과정
(
  uuid_generate_v4(),
  '스테인드글라스 초급과정',
  '스테인드글라스의 기초를 배우는 과정입니다. 유리 자르기, 납땜, 조립 등 기본 기술을 익힙니다. 초보자도 쉽게 따라할 수 있도록 체계적으로 구성된 커리큘럼으로 진행됩니다.',
  '스테인드글라스',
  8,
  450000,
  480, -- 8시간
  '/images/stained-glass-beginner.jpg',
  NOW(),
  NOW()
),
-- 스테인드글라스 중급과정
(
  uuid_generate_v4(),
  '스테인드글라스 중급과정',
  '초급과정을 수료한 학습자를 위한 심화 과정입니다. 복잡한 패턴과 색상 조합, 고급 기법을 익혀 더욱 정교한 작품을 만들 수 있습니다.',
  '스테인드글라스',
  6,
  580000,
  600, -- 10시간
  '/images/stained-glass-intermediate.jpg',
  NOW(),
  NOW()
),
-- 스테인드글라스 고급과정
(
  uuid_generate_v4(),
  '스테인드글라스 고급과정',
  '전문가 수준의 스테인드글라스 제작 기술을 습득하는 과정입니다. 창업을 준비하는 분들에게 적합하며, 독창적인 디자인과 고급 기법을 마스터할 수 있습니다.',
  '스테인드글라스',
  4,
  750000,
  720, -- 12시간
  '/images/stained-glass-advanced.jpg',
  NOW(),
  NOW()
),
-- 스테인드글라스 선택과정
(
  uuid_generate_v4(),
  '스테인드글라스 선택과정',
  '특정 주제나 기법에 집중하는 맞춤형 과정입니다. 개인의 관심사와 목표에 맞춰 선택할 수 있는 다양한 세부 과정이 준비되어 있습니다.',
  '스테인드글라스',
  6,
  320000,
  360, -- 6시간
  '/images/stained-glass-selective.jpg',
  NOW(),
  NOW()
),
-- 유리가마 8주 과정
(
  uuid_generate_v4(),
  '유리가마 8주 과정',
  '유리 가마를 이용한 퓨징(Fusing) 기법을 체계적으로 학습하는 8주 집중 과정입니다. 유리의 용융과 성형, 온도 조절 등 전문 기술을 익혀 독창적인 유리 작품을 제작할 수 있습니다.',
  '유리가마',
  5,
  1200000,
  960, -- 16시간 (8주 과정)
  '/images/glass-kiln-course.jpg',
  NOW(),
  NOW()
),
-- 기초 유리공예 체험
(
  uuid_generate_v4(),
  '기초 유리공예 체험',
  '유리공예를 처음 접하는 분들을 위한 1일 체험 과정입니다. 간단한 유리 장식품을 만들어보며 유리공예의 매력을 느껴보세요.',
  '체험과정',
  10,
  85000,
  180, -- 3시간
  '/images/glass-craft-experience.jpg',
  NOW(),
  NOW()
),
-- 창업 마스터 과정
(
  uuid_generate_v4(),
  '유리공예 창업 마스터 과정',
  '유리공예 분야에서 창업을 준비하는 분들을 위한 종합 과정입니다. 기술뿐만 아니라 사업 운영, 마케팅, 고객 관리 등 창업에 필요한 전반적인 지식을 습득할 수 있습니다.',
  '창업과정',
  4,
  1800000,
  1440, -- 24시간 (종합 과정)
  '/images/entrepreneurship-master.jpg',
  NOW(),
  NOW()
),
-- 키즈 유리공예 클래스
(
  uuid_generate_v4(),
  '키즈 유리공예 클래스',
  '어린이들을 위한 안전하고 재미있는 유리공예 체험입니다. 부모님과 함께 참여할 수 있으며, 안전한 재료와 도구를 사용하여 진행됩니다.',
  '키즈클래스',
  8,
  65000,
  120, -- 2시간
  '/images/kids-glass-craft.jpg',
  NOW(),
  NOW()
),
-- 커플/가족 특별반
(
  uuid_generate_v4(),
  '커플/가족 유리공예 특별반',
  '커플이나 가족이 함께 참여할 수 있는 특별 프로그램입니다. 소중한 사람과 함께 만드는 특별한 추억과 작품을 완성해보세요.',
  '특별과정',
  6,
  150000,
  180, -- 3시간
  '/images/couple-family-class.jpg',
  NOW(),
  NOW()
),
-- 전문가 워크샵
(
  uuid_generate_v4(),
  '전문가 초청 워크샵',
  '국내외 유명 유리공예 작가를 초청하여 진행하는 특별 워크샵입니다. 최신 기법과 트렌드를 배울 수 있는 귀중한 기회입니다.',
  '워크샵',
  12,
  280000,
  300, -- 5시간
  '/images/expert-workshop.jpg',
  NOW(),
  NOW()
);

-- 수업 일정 샘플 데이터 추가 (향후 2개월간)
INSERT INTO class_schedules (
  id,
  class_id,
  start_time,
  end_time,
  max_participants,
  current_participants,
  status,
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  c.id,
  -- 매주 토요일 오후 2시부터 시작하는 일정 생성
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 8) + INTERVAL '6 days' + TIME '14:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 8) + INTERVAL '6 days' + TIME '14:00' + INTERVAL '1 minute' * c.duration)::timestamptz,
  c.max_participants,
  0,
  'scheduled',
  NOW(),
  NOW()
FROM classes c
WHERE c.category IN ('스테인드글라스', '유리가마', '체험과정')
AND c.title NOT LIKE '%워크샵%'; -- 워크샵은 별도 일정

-- 평일 저녁 일정 추가 (화요일, 목요일)
INSERT INTO class_schedules (
  id,
  class_id,
  start_time,
  end_time,
  max_participants,
  current_participants,
  status,
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  c.id,
  -- 매주 화요일 오후 7시
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 6) + INTERVAL '1 day' + TIME '19:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 6) + INTERVAL '1 day' + TIME '19:00' + INTERVAL '1 minute' * c.duration)::timestamptz,
  c.max_participants,
  0,
  'scheduled',
  NOW(),
  NOW()
FROM classes c
WHERE c.category = '스테인드글라스'
AND c.title LIKE '%초급%' OR c.title LIKE '%중급%';

-- 매주 목요일 오후 7시
INSERT INTO class_schedules (
  id,
  class_id,
  start_time,
  end_time,
  max_participants,
  current_participants,
  status,
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  c.id,
  -- 매주 목요일 오후 7시
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 6) + INTERVAL '3 day' + TIME '19:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 6) + INTERVAL '3 day' + TIME '19:00' + INTERVAL '1 minute' * c.duration)::timestamptz,
  c.max_participants,
  0,
  'scheduled',
  NOW(),
  NOW()
FROM classes c
WHERE c.category = '유리가마' OR c.category = '창업과정';

-- 주말 특별 프로그램 일정
INSERT INTO class_schedules (
  id,
  class_id,
  start_time,
  end_time,
  max_participants,
  current_participants,
  status,
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  c.id,
  -- 매주 일요일 오전 10시 (키즈/가족 클래스)
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 4) + INTERVAL '7 days' + TIME '10:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 week' * generate_series(1, 4) + INTERVAL '7 days' + TIME '10:00' + INTERVAL '1 minute' * c.duration)::timestamptz,
  c.max_participants,
  0,
  'scheduled',
  NOW(),
  NOW()
FROM classes c
WHERE c.category IN ('키즈클래스', '특별과정');

-- 특별 워크샵 일정 (월 1회)
INSERT INTO class_schedules (
  id,
  class_id,
  start_time,
  end_time,
  max_participants,
  current_participants,
  status,
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  c.id,
  -- 매월 마지막 토요일 오전 10시
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 2) + INTERVAL '1 month' - INTERVAL '1 day' - INTERVAL '1 day' * EXTRACT(dow FROM DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day') + INTERVAL '6 days' + TIME '10:00')::timestamptz,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' * generate_series(0, 2) + INTERVAL '1 month' - INTERVAL '1 day' - INTERVAL '1 day' * EXTRACT(dow FROM DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day') + INTERVAL '6 days' + TIME '10:00' + INTERVAL '1 minute' * c.duration)::timestamptz,
  c.max_participants,
  0,
  'scheduled',
  NOW(),
  NOW()
FROM classes c
WHERE c.category = '워크샵'; 
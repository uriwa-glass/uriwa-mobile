-- 클래스 테이블에 상세 정보 필드 추가
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS completion_works TEXT, -- 완성 작품
ADD COLUMN IF NOT EXISTS course_focus TEXT, -- 수강 포커스  
ADD COLUMN IF NOT EXISTS learning_objectives TEXT, -- 수업목표
ADD COLUMN IF NOT EXISTS post_completion_path TEXT, -- 이수 후 방향
ADD COLUMN IF NOT EXISTS detailed_curriculum JSONB; -- 상세 커리큘럼 (JSON 형태)

-- 기존 스테인드글라스 초급과정 정보 업데이트
UPDATE classes
SET 
  completion_works = '거울 3작품 - 칼, 그라인더 기본 자재
썬캐쳐 2작품 - 테이프이해, 인두기 기본
액자 1작품 - 판작업 납땜
케임 2작품 - 종이 거틀, 기초 조립, 납땜',
  course_focus = '기본 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기본 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  learning_objectives = '실전 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기능 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  post_completion_path = '브랜드방향 설정, 브랜드명, 디자인스타일,
SNS 업로드 서식 초안 준비, 판매 상품 구상, SNS 관리 코칭
이수 후 스토어팀 소품 판매 가능',
  detailed_curriculum = '{
    "헤택": [
      "URiWa 전체 헤택",
      "수강 당일 오전 9시 ~ 오후 7시 (오후 6시 30분부터 차리 정리)",
      "월 5만원 사용료로 별도의 작업실 구비 없이 판매용, 연습용 소품을 제작할 수 있습니다."
    ],
    "중급 수강생 개별 클래스 진행": [
      "원데이클래스, 취미 클래스(4회, 8회)를 구성하여 운영할 수 있습니다.",
      "클래스 운영 방식을 지도해 드립니다.",
      "간단한 공유 도안이 제공됩니다.",
      "장비, 창소 대여료 : 수업 수강생 1인 - 2만원, 4시간 기준"
    ],
    "중급 수강생 직접 보조 프로그램 지도": [
      "일러스트, 포토샵 맞춤 수업 (노트북 준비)"
    ],
    "공방 운영에 필요한 전반 공유": [
      "한 번에, 제로, 도구 공유구매가 가능합니다.",
      "배우는 학생이 아닌 정식 선생님, 작가로 대우합니다.",
      "배우는 학생이 아닌 정식 선생님, 작가로 대우합니다."
    ]
  }'::jsonb
WHERE category = '스테인드글라스' AND title LIKE '%초급과정%';

-- 중급과정 정보도 업데이트
UPDATE classes
SET 
  completion_works = '거울 3작품 - 칼, 그라인더 기본 자재
썬캐쳐 2작품 - 테이프이해, 인두기 기본
액자 1작품 - 판작업 납땜
케임 2작품 - 종이 거틀, 기초 조립, 납땜',
  course_focus = '실전 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기능 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  learning_objectives = '실전 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기능 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  post_completion_path = '브랜드방향 설정, 브랜드명, 디자인스타일,
SNS 업로드 서식 초안 준비, 판매 상품 구상, SNS 관리 코칭
이수 후 스토어팀 소품 판매 가능'
WHERE category = '스테인드글라스' AND title LIKE '%중급과정%';

-- 고급과정 정보도 업데이트  
UPDATE classes
SET 
  completion_works = '거울 3작품 - 칼, 그라인더 기본 자재
썬캐쳐 2작품 - 테이프이해, 인두기 기본
액자 1작품 - 판작업 납땜
케임 2작품 - 종이 거틀, 기초 조립, 납땜',
  course_focus = '실전 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기능 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  learning_objectives = '실전 기능 - 기초 이론 / 장비 세팅 / 기본자재 다지기 / 작업 디테일 집중
디자인 기능 - 유리를 이해한 디자인 / 목적에 맞는 디자인',
  post_completion_path = '브랜드방향 설정, 브랜드명, 디자인스타일,
SNS 업로드 서식 초안 준비, 판매 상품 구상, SNS 관리 코칭
이수 후 스토어팀 소품 판매 가능'
WHERE category = '스테인드글라스' AND title LIKE '%고급과정%'; 
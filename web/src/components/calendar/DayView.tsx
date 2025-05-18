import React from "react";
import { format, addHours, isSameDay, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { DayViewProps, ClassSchedule, AvailabilityStatus } from "../../types/calendar";

// 시간 설정
const START_HOUR = 8; // 오전 8시부터
const END_HOUR = 21; // 오후 9시까지
const HOURS_DISPLAY = END_HOUR - START_HOUR + 1;

// 일간 뷰 컴포넌트
const DayView: React.FC<DayViewProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onChangeDate,
  classSchedules,
  onSelectClass,
}) => {
  // 현재 시간
  const now = new Date();

  // 현재 날짜가 선택된 날짜와 같은지 확인
  const isTodaySelected = isToday(currentDate);

  // 현재 시간의 위치 계산 (%)
  const calculateCurrentTimePosition = (): number | null => {
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 표시 시간 범위 내에 있는지 확인
    if (hours < START_HOUR || hours > END_HOUR) {
      return null;
    }

    // 시작 시간을 기준으로 상대적 위치 계산 (0-100%)
    return (hours - START_HOUR + minutes / 60) * (100 / HOURS_DISPLAY);
  };

  // 시간별 셀이 현재 시간인지 확인
  const isCurrentHour = (hour: number): boolean => {
    return isTodaySelected && now.getHours() === hour;
  };

  // 수업 시간으로부터 그리드 위치 계산
  const calculateEventPosition = (dateStr: string): number => {
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 시작 시간이 표시 범위 밖인 경우
    if (hours < START_HOUR) return 0;
    if (hours > END_HOUR) return 100;

    // 시작 시간을 기준으로 상대적 위치 계산 (0-100%)
    return (hours - START_HOUR + minutes / 60) * (100 / HOURS_DISPLAY);
  };

  // 수업 지속 시간으로부터 그리드 높이 계산
  const calculateEventHeight = (dateStr: string, durationMinutes: number): number => {
    const date = new Date(dateStr);
    const startHour = date.getHours();
    const startMinute = date.getMinutes();

    // 종료 시간 계산
    const endTimeMinutes = startHour * 60 + startMinute + durationMinutes;
    const endHour = Math.floor(endTimeMinutes / 60);

    // 표시 범위를 벗어나는 경우 제한
    if (startHour < START_HOUR && endHour <= START_HOUR) {
      return 0; // 표시 범위 이전에 종료
    }
    if (startHour >= END_HOUR) {
      return 0; // 표시 범위 이후에 시작
    }

    // 표시 범위 내에서의 높이 계산 (0-100%)
    let effectiveDuration = durationMinutes;

    // 시작 시간이 표시 범위 이전인 경우 조정
    if (startHour < START_HOUR) {
      const minutesBeforeStart = (START_HOUR - startHour) * 60 - startMinute;
      effectiveDuration -= minutesBeforeStart;
    }

    // 종료 시간이 표시 범위 이후인 경우 조정
    if (endHour > END_HOUR) {
      const minutesAfterEnd = (endHour - END_HOUR) * 60;
      effectiveDuration -= minutesAfterEnd;
    }

    return (effectiveDuration / 60) * (100 / HOURS_DISPLAY);
  };

  // 가용성 상태 계산
  const getAvailabilityStatus = (schedule: ClassSchedule): AvailabilityStatus => {
    const { remaining_seats, capacity } = schedule;

    if (remaining_seats <= 0) {
      return "full";
    } else if (remaining_seats < capacity * 0.2) {
      return "low";
    } else {
      return "available";
    }
  };

  // 선택된 날짜의 수업 목록
  const daySchedules = classSchedules.filter((schedule) =>
    isSameDay(new Date(schedule.date), currentDate)
  );

  // 수업 클릭 핸들러
  const handleEventClick = (schedule: ClassSchedule): void => {
    if (onSelectClass) {
      onSelectClass(schedule);
    }
  };

  // 이전/다음 날짜 이동 핸들러
  const handlePrevDay = (): void => {
    if (onPrevDay) {
      onPrevDay();
    }
  };

  const handleNextDay = (): void => {
    if (onNextDay) {
      onNextDay();
    }
  };

  // 가용성 상태에 따른 클래스 결정
  const getAvailabilityClasses = (status: AvailabilityStatus): { bg: string; border: string } => {
    switch (status) {
      case "full":
        return { bg: "bg-error-light", border: "border-l-error-main" };
      case "low":
        return { bg: "bg-warning-light", border: "border-l-warning-main" };
      case "available":
        return { bg: "bg-success-light", border: "border-l-success-main" };
      default:
        return { bg: "bg-primary-light", border: "border-l-primary-main" };
    }
  };

  // 현재 시간 위치
  const currentTimePosition = isTodaySelected ? calculateCurrentTimePosition() : null;

  return (
    <div className="mb-4">
      {/* 일간 뷰 헤더 */}
      <div className="flex items-center justify-center py-4 mb-4">
        <button
          className="p-2 mr-4 text-text-secondary hover:text-primary-main focus:outline-none"
          onClick={handlePrevDay}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2
          className={`text-lg font-bold m-0 text-center ${
            isTodaySelected ? "text-primary-main" : "text-text-primary"
          }`}
        >
          {format(currentDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
        </h2>

        <button
          className="p-2 ml-4 text-text-secondary hover:text-primary-main focus:outline-none"
          onClick={handleNextDay}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 시간 그리드 */}
      <div className="grid grid-cols-[60px_1fr] border-t border-l border-border-light">
        {/* 시간 레이블 및 수업 셀 생성 */}
        {daySchedules.length === 0 ? (
          <div className="py-5 text-center text-text-secondary col-span-2 border-r border-b border-border-light">
            등록된 수업이 없습니다.
          </div>
        ) : (
          <>
            {Array.from({ length: HOURS_DISPLAY }).map((_, index) => {
              const hour = START_HOUR + index;

              return (
                <React.Fragment key={`hour-${hour}`}>
                  {/* 시간 레이블 */}
                  <div className="h-[60px] border-r border-b border-border-light relative">
                    <div className="text-sm text-text-secondary text-center pt-1">{hour}:00</div>
                  </div>

                  {/* 이벤트 셀 */}
                  <div
                    className={`h-[60px] border-r border-b border-border-light relative ${
                      isCurrentHour(hour) ? "bg-background-light" : "bg-background-paper"
                    }`}
                  >
                    {/* 현재 시간 표시선 */}
                    {isTodaySelected && isCurrentHour(hour) && currentTimePosition !== null && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-primary-main z-10"
                        style={{ top: `${currentTimePosition % (100 / HOURS_DISPLAY)}%` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-primary-main rounded-full"></div>
                      </div>
                    )}

                    {/* 해당 시간대의 수업들 표시 */}
                    {daySchedules.map((schedule, index) => {
                      const eventHour = new Date(schedule.date).getHours();

                      // 현재 시간 슬롯에 속하는 이벤트만 표시
                      if (eventHour >= hour && eventHour < hour + 1) {
                        const top = calculateEventPosition(schedule.date) % (100 / HOURS_DISPLAY);
                        const height = calculateEventHeight(schedule.date, schedule.duration);

                        if (height <= 0) return null;

                        const availability = getAvailabilityStatus(schedule);
                        const { bg, border } = getAvailabilityClasses(availability);

                        return (
                          <div
                            key={`event-${schedule.id}`}
                            className={`absolute left-2 right-2 rounded-sm p-2 overflow-hidden cursor-pointer hover:brightness-95 z-[${
                              index + 1
                            }] ${bg} ${border} border-l-4`}
                            style={{
                              top: `${top}%`,
                              height: `${height}%`,
                            }}
                            onClick={() => handleEventClick(schedule)}
                          >
                            <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-sm">
                              {schedule.classInfo?.title || "수업"}
                            </div>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                              {format(new Date(schedule.date), "HH:mm")} -
                              {format(
                                new Date(
                                  new Date(schedule.date).getTime() + schedule.duration * 60000
                                ),
                                "HH:mm"
                              )}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5">
                              잔여: {schedule.remaining_seats}/{schedule.capacity}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default DayView;

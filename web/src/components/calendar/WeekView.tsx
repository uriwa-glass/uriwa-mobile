import React from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { WeekViewProps, ClassSchedule, AvailabilityStatus } from "../../types/calendar";

// 시간 설정
const START_HOUR = 8; // 오전 8시부터
const END_HOUR = 21; // 오후 9시까지
const HOURS_DISPLAY = END_HOUR - START_HOUR + 1;

// 주간 뷰 컴포넌트
const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  classSchedules,
  onSelectClass,
}) => {
  // 현재 주의 시작일과 종료일 계산
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // 요일 배열
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  // 수업 시간으로부터 그리드 위치 계산
  const calculateEventPosition = (dateStr: string): number => {
    const date = new Date(dateStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 시작 시간을 기준으로 상대적 위치 계산 (0-100%)
    const top = (hours - START_HOUR + minutes / 60) * (100 / HOURS_DISPLAY);

    return top;
  };

  // 수업 지속 시간으로부터 그리드 높이 계산
  const calculateEventHeight = (durationMinutes: number): number => {
    // 전체 표시 시간에 대한 비율로 높이 계산 (0-100%)
    return (durationMinutes / 60) * (100 / HOURS_DISPLAY);
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

  // 각 요일의 수업 목록 가져오기
  const getDaySchedules = (day: Date): ClassSchedule[] => {
    return classSchedules.filter((schedule) => isSameDay(new Date(schedule.date), day));
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (day: Date): void => {
    if (onSelectDate) {
      onSelectDate(day);
    }
  };

  // 수업 클릭 핸들러
  const handleEventClick = (schedule: ClassSchedule): void => {
    if (onSelectClass) {
      onSelectClass(schedule);
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

  return (
    <div className="mb-4">
      {/* 주간 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center py-2">
            <div className="text-sm font-bold text-text-secondary">{weekdays[day.getDay()]}</div>
            <div
              className={`
                text-lg w-9 h-9 mx-auto mt-1 flex items-center justify-center rounded-full cursor-pointer
                ${isToday(day) ? "font-bold text-primary-main bg-primary-light" : ""}
                ${
                  isSameDay(day, selectedDate) && !isToday(day)
                    ? "text-primary-dark bg-background-light"
                    : "text-text-primary"
                }
                hover:bg-background-light ${
                  isSameDay(day, selectedDate) ? "hover:bg-primary-light" : ""
                }
              `}
              onClick={() => handleDateClick(day)}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* 시간 그리드 */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-t border-l border-border-light">
        {/* 시간 레이블 */}
        {Array.from({ length: HOURS_DISPLAY }).map((_, index) => (
          <div
            key={`time-${index}`}
            className="relative border-r border-b border-border-light"
            style={{ gridColumn: "1" }}
          >
            <div className="text-xs text-text-secondary text-center pt-1">
              {START_HOUR + index}:00
            </div>
          </div>
        ))}

        {/* 요일별 시간 셀 */}
        {weekDays.map((day, dayIndex) =>
          Array.from({ length: HOURS_DISPLAY }).map((_, hourIndex) => (
            <div
              key={`cell-${dayIndex}-${hourIndex}`}
              className={`relative border-r border-b border-border-light ${
                isSameDay(day, selectedDate) ? "bg-background-light" : "bg-background-paper"
              }`}
              style={{ gridColumn: dayIndex + 2 }}
            >
              {/* 해당 날짜에 등록된 수업들 표시 */}
              {getDaySchedules(day).map((schedule, scheduleIndex) => {
                const eventTop = calculateEventPosition(schedule.date);
                const eventHeight = calculateEventHeight(schedule.duration);

                // 현재 시간 범위에 속하는지 확인
                const hourStart = START_HOUR + hourIndex;
                const hourEnd = hourStart + 1;
                const eventHour = new Date(schedule.date).getHours();
                const eventEndHour = eventHour + Math.ceil(schedule.duration / 60);

                // 현재 시간대에 해당하는 이벤트만 렌더링
                if (eventHour < hourStart || eventHour >= hourEnd) {
                  return null;
                }

                // 가용성 상태 및 클래스 결정
                const status = getAvailabilityStatus(schedule);
                const { bg, border } = getAvailabilityClasses(status);

                return (
                  <div
                    key={`event-${dayIndex}-${hourIndex}-${scheduleIndex}`}
                    className={`absolute left-0.5 right-0.5 rounded-sm py-0.5 px-1 cursor-pointer hover:brightness-95 ${bg} ${border} border-l-3`}
                    style={{
                      top: `${eventTop}%`,
                      height: `${eventHeight}%`,
                      zIndex: scheduleIndex + 1,
                    }}
                    onClick={() => handleEventClick(schedule)}
                  >
                    <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-xs">
                      {schedule.classInfo?.title || "수업"}
                    </div>
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis text-[10px]">
                      {format(new Date(schedule.date), "HH:mm")} (
                      {Math.round((schedule.duration / 60) * 10) / 10}시간)
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeekView;

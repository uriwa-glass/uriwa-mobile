import React, { useState, useEffect } from "react";
import {
  format,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  getSchedulesAvailability,
  getAvailabilityStatus,
  clearAvailabilityCache,
} from "../../api/availabilityService";
import WeekView from "./WeekView";
import DayView from "./DayView";
import { ClassCalendarProps, ClassSchedule, AvailabilityStatus } from "../../types/calendar";
import Card from "../Card";

type View = "month" | "week" | "day";

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  schedules: ClassSchedule[];
  hasAvailableClasses: boolean;
  availability: AvailabilityStatus;
}

// 요일 표시 배열
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// ClassCalendar 컴포넌트
const ClassCalendar: React.FC<ClassCalendarProps> = ({
  classSchedules = [],
  onSelectClass,
  initialDate = new Date(),
  initialView = "month",
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentView, setCurrentView] = useState<View>(initialView as View);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDayDetails, setShowDayDetails] = useState<boolean>(false);

  // 현재 선택된 날짜에 등록된 수업 목록
  const selectedDaySchedules = classSchedules.filter((schedule) =>
    isSameDay(new Date(schedule.date), selectedDate)
  );

  // 현재 달의 모든 날짜
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

  // 월 이동 처리
  const handleMonthChange = (increment: number): void => {
    setCurrentDate(addMonths(currentDate, increment));
  };

  // 날짜 클릭 처리
  const handleDayClick = (day: Date): void => {
    setSelectedDate(day);
    setShowDayDetails(true);

    if (currentView === "month") {
      setCurrentView("day");
    }
  };

  // 날짜 정보 계산
  const getDayInfo = (day: Date): DayInfo => {
    const daySchedules = classSchedules.filter((schedule) =>
      isSameDay(new Date(schedule.date), day)
    );

    let availabilityStatus: AvailabilityStatus = "available";
    let hasAvailableClasses = false;

    // 가용성 상태 계산
    if (daySchedules.length > 0) {
      const availableClasses = daySchedules.filter(
        (schedule) => schedule.remaining_seats > 0 && !schedule.is_cancelled
      );

      hasAvailableClasses = availableClasses.length > 0;

      const lowClasses = daySchedules.filter(
        (schedule) =>
          schedule.remaining_seats > 0 &&
          schedule.remaining_seats < schedule.capacity * 0.2 &&
          !schedule.is_cancelled
      );

      if (availableClasses.length === 0) {
        availabilityStatus = "full";
      } else if (lowClasses.length > 0) {
        availabilityStatus = "low";
      }
    }

    return {
      date: day,
      isCurrentMonth: day.getMonth() === currentDate.getMonth(),
      isToday: isToday(day),
      isSelected: isSameDay(day, selectedDate),
      schedules: daySchedules,
      hasAvailableClasses,
      availability: availabilityStatus,
    };
  };

  // 예약 버튼 클릭 처리
  const handleReserve = (classSchedule: ClassSchedule): void => {
    if (onSelectClass) {
      onSelectClass(classSchedule);
    }
  };

  // 가용성 텍스트 표시
  const getAvailabilityText = (schedule: ClassSchedule): string => {
    const status = getAvailabilityStatus({
      is_cancelled: schedule.is_cancelled,
      remaining_seats: schedule.remaining_seats,
      capacity: schedule.capacity,
    });

    if (schedule.is_cancelled) return "취소됨";
    if (status === "FULL") return "예약 마감";
    return `잔여 ${schedule.remaining_seats}석 / ${schedule.capacity}석`;
  };

  // 가용성 상태에 따른 클래스
  const getAvailabilityClasses = (
    status: AvailabilityStatus
  ): {
    bg: string;
    border: string;
    text: string;
  } => {
    switch (status) {
      case "full":
        return {
          bg: "bg-error-light",
          border: "border-l-error-main",
          text: "text-error-main",
        };
      case "low":
        return {
          bg: "bg-warning-light",
          border: "border-l-warning-main",
          text: "text-warning-main",
        };
      case "available":
        return {
          bg: "bg-success-light",
          border: "border-l-success-main",
          text: "text-success-main",
        };
      default:
        return {
          bg: "bg-neutral-light",
          border: "border-l-neutral-main",
          text: "text-neutral-main",
        };
    }
  };

  // 월 뷰 렌더링
  const renderMonthView = () => (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center py-2 text-sm font-bold text-text-secondary">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* 월의 첫날이 시작하기 전 빈 셀 채우기 */}
        {Array.from({ length: firstDay.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="aspect-square bg-background-light" />
        ))}

        {/* 달력 날짜들 */}
        {daysInMonth.map((day) => {
          const dayInfo = getDayInfo(day);

          return (
            <div
              key={day.toString()}
              className={`
                aspect-square flex flex-col ${
                  dayInfo.isCurrentMonth ? "cursor-pointer" : "cursor-default"
                }
                justify-${dayInfo.schedules.length > 0 ? "start" : "center"} items-center p-1
                ${
                  !dayInfo.isCurrentMonth
                    ? "bg-background-light"
                    : dayInfo.isSelected
                    ? "bg-primary-light"
                    : dayInfo.isToday
                    ? "bg-pastel-blue"
                    : "bg-background-light"
                }
                rounded-sm
                ${
                  dayInfo.isCurrentMonth && !dayInfo.isSelected
                    ? "hover:bg-background-default"
                    : dayInfo.isSelected
                    ? "hover:bg-primary-light"
                    : "hover:bg-background-light"
                }
              `}
              onClick={() => dayInfo.isCurrentMonth && handleDayClick(day)}
            >
              {/* 날짜 번호 */}
              <span
                className={`
                  text-sm ${dayInfo.isToday ? "font-bold" : "font-normal"}
                  ${
                    !dayInfo.isCurrentMonth
                      ? "text-text-disabled"
                      : dayInfo.isSelected
                      ? "text-primary-dark"
                      : "text-text-primary"
                  }
                  ${dayInfo.schedules.length > 0 ? "mb-1" : ""}
                `}
              >
                {format(day, "d")}
              </span>

              {/* 수업 표시 */}
              {dayInfo.schedules.length > 0 && (
                <>
                  {/* 이벤트 인디케이터 */}
                  <div
                    className={`
                      w-1.5 h-1.5 rounded-full mt-0.5
                      ${
                        dayInfo.availability === "full"
                          ? "bg-error-main"
                          : dayInfo.availability === "low"
                          ? "bg-warning-main"
                          : dayInfo.availability === "available"
                          ? "bg-success-main"
                          : "bg-neutral-main"
                      }
                    `}
                  />

                  {/* 수업 개수 */}
                  <span className="text-xs text-text-secondary mt-0.5">
                    {dayInfo.schedules.length}개
                  </span>
                </>
              )}
            </div>
          );
        })}

        {/* 월의 마지막날 이후 빈 셀 채우기 */}
        {Array.from({ length: 6 - lastDay.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="aspect-square bg-background-light" />
        ))}
      </div>

      {/* 선택한 날짜의 상세 정보 */}
      {showDayDetails && (
        <div className="mt-4 border-t border-border-light pt-4">
          <h3 className="text-md text-text-primary m-0 mb-3">
            {format(selectedDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
          </h3>

          {selectedDaySchedules.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedDaySchedules.map((schedule) => {
                const status = getAvailabilityStatus({
                  is_cancelled: schedule.is_cancelled,
                  remaining_seats: schedule.remaining_seats,
                  capacity: schedule.capacity,
                }) as AvailabilityStatus;

                const { border, bg, text } = getAvailabilityClasses(
                  status.toLowerCase() as AvailabilityStatus
                );

                return (
                  <div
                    key={schedule.id}
                    className={`flex p-3 bg-background-light rounded-sm ${border} border-l-4`}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-text-primary mb-1">
                        {format(new Date(schedule.date), "HH:mm")}
                      </div>
                      <div className="text-md text-text-primary mb-1">
                        {schedule.classInfo?.title || "수업 정보 없음"}
                      </div>
                      <div className={`text-xs ${text}`}>{getAvailabilityText(schedule)}</div>
                    </div>

                    <button
                      onClick={() => handleReserve(schedule)}
                      disabled={schedule.is_cancelled || schedule.remaining_seats <= 0}
                      className={`
                        self-center border-0 bg-primary-main text-primary-contrast text-sm 
                        py-1 px-2 rounded-sm
                        ${
                          schedule.is_cancelled || schedule.remaining_seats <= 0
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-primary-dark cursor-pointer"
                        }
                      `}
                    >
                      {schedule.is_cancelled ? "취소됨" : "예약"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-text-secondary py-5">
              이 날짜에 예정된 수업이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className="p-4 mb-5">
      {/* 캘린더 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg text-text-primary m-0">
          {format(currentDate, "yyyy년 M월", { locale: ko })}
        </h2>

        <div className="flex">
          <button
            className="bg-transparent border-0 cursor-pointer text-lg text-primary-main flex items-center p-2"
            onClick={() => handleMonthChange(-1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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

          <button
            className="bg-transparent border-0 cursor-pointer text-lg text-primary-main flex items-center p-2"
            onClick={() => handleMonthChange(1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 뷰 전환 버튼 */}
      <div className="flex justify-center mb-4 rounded-sm overflow-hidden bg-background-light">
        <button
          className={`${
            currentView === "month"
              ? "bg-primary-main text-primary-contrast"
              : "bg-transparent text-text-secondary"
          } border-0 py-2 px-4 flex-1 cursor-pointer text-sm transition-all duration-300 hover:bg-${
            currentView === "month" ? "primary-main" : "background-default"
          }`}
          onClick={() => setCurrentView("month")}
        >
          월간
        </button>

        <button
          className={`${
            currentView === "week"
              ? "bg-primary-main text-primary-contrast"
              : "bg-transparent text-text-secondary"
          } border-0 py-2 px-4 flex-1 cursor-pointer text-sm transition-all duration-300 hover:bg-${
            currentView === "week" ? "primary-main" : "background-default"
          }`}
          onClick={() => setCurrentView("week")}
        >
          주간
        </button>

        <button
          className={`${
            currentView === "day"
              ? "bg-primary-main text-primary-contrast"
              : "bg-transparent text-text-secondary"
          } border-0 py-2 px-4 flex-1 cursor-pointer text-sm transition-all duration-300 hover:bg-${
            currentView === "day" ? "primary-main" : "background-default"
          }`}
          onClick={() => setCurrentView("day")}
        >
          일간
        </button>
      </div>

      {/* 선택된 뷰에 따른 컴포넌트 렌더링 */}
      {currentView === "month" && renderMonthView()}

      {currentView === "week" && (
        <WeekView
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={handleDayClick}
          classSchedules={classSchedules}
          onSelectClass={onSelectClass}
        />
      )}

      {currentView === "day" && (
        <DayView
          currentDate={selectedDate}
          onPrevDay={() => setSelectedDate(addMonths(selectedDate, -1))}
          onNextDay={() => setSelectedDate(addMonths(selectedDate, 1))}
          onChangeDate={setSelectedDate}
          classSchedules={classSchedules}
          onSelectClass={onSelectClass}
        />
      )}
    </Card>
  );
};

export default ClassCalendar;

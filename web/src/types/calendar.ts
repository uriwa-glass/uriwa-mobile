export interface ClassSchedule {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  classInfo?: ClassInfo;
}

export interface ClassInfo {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  instructor_id?: string;
  image_url?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  className?: string;
  color?: string;
  availability?: "available" | "low" | "full";
  data?: ClassSchedule;
}

export interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  classSchedules: ClassSchedule[];
  onSelectClass?: (schedule: ClassSchedule) => void;
}

export interface DayViewProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onChangeDate: (date: Date) => void;
  classSchedules: ClassSchedule[];
  onSelectClass?: (schedule: ClassSchedule) => void;
}

export interface ClassCalendarProps {
  classSchedules: ClassSchedule[];
  onSelectClass?: (schedule: ClassSchedule) => void;
  initialDate?: Date;
  initialView?: "day" | "week";
}

export type AvailabilityStatus = "available" | "low" | "full";

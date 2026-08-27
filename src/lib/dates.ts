import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  isSameMonth,
  parseISO,
  isValid,
} from "date-fns";

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseWeekParam(week: string | undefined): Date {
  if (week) {
    const parsed = parseISO(week);
    if (isValid(parsed)) return startOfWeek(parsed, { weekStartsOn: 1 });
  }
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

export type WeekDay = {
  date: Date;
  iso: string;
  label: string; // 월, 화 ...
  isToday: boolean;
  isPast: boolean;
};

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function buildWeekDays(monday: Date, includeWeekend: boolean): WeekDay[] {
  const todayIso = toISODate(new Date());
  const count = includeWeekend ? 7 : 5;
  return Array.from({ length: count }, (_, i) => {
    const date = addDays(monday, i);
    const iso = toISODate(date);
    return {
      date,
      iso,
      label: WEEKDAY_LABELS[i],
      isToday: iso === todayIso,
      isPast: iso < todayIso,
    };
  });
}

export function formatMonthDay(date: Date): string {
  return format(date, "M/d");
}

export function formatWeekRangeLabel(monday: Date, days: WeekDay[]): string {
  const last = days[days.length - 1]?.date ?? monday;
  return `${format(monday, "yyyy년 M월 d일")} ~ ${format(last, "M월 d일")}`;
}

export function parseMonthParam(month: string | undefined): Date {
  if (month) {
    const parsed = parseISO(`${month}-01`);
    if (isValid(parsed)) return startOfMonth(parsed);
  }
  return startOfMonth(new Date());
}

export function toMonthParam(date: Date): string {
  return format(date, "yyyy-MM");
}

export function formatMonthLabel(monthStart: Date): string {
  return format(monthStart, "yyyy년 M월");
}

export type CalendarDay = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

export function buildMonthGrid(monthStart: Date): CalendarDay[] {
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const todayIso = toISODate(new Date());
  const days: CalendarDay[] = [];
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const iso = toISODate(cursor);
    days.push({
      date: cursor,
      iso,
      isCurrentMonth: isSameMonth(cursor, monthStart),
      isToday: iso === todayIso,
      isPast: iso < todayIso,
    });
  }
  return days;
}

export { addMonths };

// "YYYY-MM-DD" 형식이면서 실제로 존재하는 날짜인지 확인합니다(예: 2026-02-30은 거부).
export function isValidISODate(value: string | undefined): value is string {
  if (!value) return false;
  const parsed = parseISO(value);
  return isValid(parsed) && toISODate(parsed) === value;
}

// 학년도: 3월 1일 ~ 익년 2월 말일 (1년 단위로 초기화)
export function getSchoolYearRange(reference: Date = new Date()): {
  label: string;
  start: string; // ISO date
  end: string; // ISO date
} {
  const year = reference.getFullYear();
  const month = reference.getMonth() + 1; // 1-12
  const startYear = month >= 3 ? year : year - 1;
  return {
    label: `${startYear}학년도`,
    start: `${startYear}-03-01`,
    end: toISODate(endOfMonth(new Date(startYear + 1, 1, 1))),
  };
}

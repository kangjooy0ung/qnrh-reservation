import { addDays, format, startOfWeek, parseISO, isValid } from "date-fns";

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

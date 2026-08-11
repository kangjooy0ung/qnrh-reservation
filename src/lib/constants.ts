export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

// getDay(): 0=일 1=월 ... 6=토 → 위 배열 인덱스로 변환
export function jsDayToLabelIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const FACILITY_CATEGORIES = [
  "강당",
  "체육시설",
  "특별실",
  "사무공간",
  "기타",
] as const;

export const ADMIN_COOKIE_NAME = "admin_session";
export const TEACHER_COOKIE_NAME = "teacher_session";

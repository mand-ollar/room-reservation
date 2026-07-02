import type { ReservationPublicResponse } from "@/api/types";

export const HOURS_PER_DAY = 24;
export const MINUTES_PER_DAY = HOURS_PER_DAY * 60;

export const formatHourLabel = (hour: number, locale: string): string => {
  const labelDate: Date = new Date();
  labelDate.setHours(hour, 0, 0, 0);

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
    hour: "numeric",
  }).format(labelDate);
};

export const formatTimezoneOffset = (): string => {
  const parts: Intl.DateTimeFormatPart[] = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());

  const offsetPart: Intl.DateTimeFormatPart | undefined = parts.find(
    (part: Intl.DateTimeFormatPart) => part.type === "timeZoneName",
  );

  if (offsetPart?.value) {
    return offsetPart.value;
  }

  const offsetMinutes: number = -new Date().getTimezoneOffset();
  const sign: string = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes: number = Math.abs(offsetMinutes);
  const hours: number = Math.floor(absoluteMinutes / 60);
  const minutes: number = absoluteMinutes % 60;

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }

  return `GMT${sign}${hours}:${String(minutes).padStart(2, "0")}`;
};

export type CalendarEventSegment = {
  key: string;
  reservation: ReservationPublicResponse;
  dayIndex: number;
  topPercent: number;
  heightPercent: number;
  isOwn: boolean;
};

export function getWeekStart(date: Date): Date {
  const weekStart: Date = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_value: unknown, index: number) => {
    const day: Date = new Date(weekStart);
    day.setDate(day.getDate() + index);
    return day;
  });
}

export function addWeeks(date: Date, weeks: number): Date {
  const next: Date = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function reservationOverlapsWeek(
  startAt: string,
  endAt: string,
  weekStart: Date,
): boolean {
  const weekEnd: Date = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const start: Date = new Date(startAt);
  const end: Date = new Date(endAt);

  return start < weekEnd && end > weekStart;
}

export function getEventSegmentsForWeek(
  reservation: ReservationPublicResponse,
  weekDays: Date[],
  isOwn: boolean,
  segmentKeyPrefix: string,
): CalendarEventSegment[] {
  const reservationStart: Date = new Date(reservation.start_at);
  const reservationEnd: Date = new Date(reservation.end_at);
  const segments: CalendarEventSegment[] = [];

  weekDays.forEach((day: Date, dayIndex: number) => {
    const dayStart: Date = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd: Date = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    if (reservationStart >= dayEnd || reservationEnd <= dayStart) {
      return;
    }

    const segmentStart: Date =
      reservationStart > dayStart ? reservationStart : dayStart;
    const segmentEnd: Date =
      reservationEnd < dayEnd ? reservationEnd : dayEnd;

    const startMinutes: number =
      segmentStart.getHours() * 60 + segmentStart.getMinutes();
    const endMinutes: number =
      segmentEnd.getTime() === dayEnd.getTime()
        ? MINUTES_PER_DAY
        : segmentEnd.getHours() * 60 + segmentEnd.getMinutes();
    const durationMinutes: number = endMinutes - startMinutes;

    if (durationMinutes <= 0) {
      return;
    }

    segments.push({
      key: `${segmentKeyPrefix}-${dayIndex}-${segmentStart.toISOString()}`,
      reservation,
      dayIndex,
      topPercent: (startMinutes / MINUTES_PER_DAY) * 100,
      heightPercent: (durationMinutes / MINUTES_PER_DAY) * 100,
      isOwn,
    });
  });

  return segments;
}

export function formatWeekRange(weekStart: Date, locale: string): string {
  const weekEnd: Date = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const languageTag: string = locale === "en" ? "en-US" : "ko-KR";
  const monthDayFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    languageTag,
    { month: "long", day: "numeric" },
  );
  const yearFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    languageTag,
    { year: "numeric" },
  );

  const startLabel: string = monthDayFormatter.format(weekStart);
  const endLabel: string = monthDayFormatter.format(weekEnd);
  const yearLabel: string = yearFormatter.format(weekEnd);

  return `${startLabel} – ${endLabel}, ${yearLabel}`;
}

export function formatTimeRange(
  startAt: string,
  endAt: string,
  locale: string,
): string {
  const languageTag: string = locale === "en" ? "en-US" : "ko-KR";
  const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(languageTag, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(new Date(startAt))} – ${formatter.format(new Date(endAt))}`;
}

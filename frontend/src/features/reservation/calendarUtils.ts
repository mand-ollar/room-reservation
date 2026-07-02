import type { ReservationPublicResponse, ReservationStatus } from "@/api/types";

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

export function isCalendarVisibleStatus(status: ReservationStatus): boolean {
  return status === "PENDING" || status === "APPROVED";
}

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

export function getDominantMonthInWeek(weekDays: Date[]): Date {
  const counts: Map<string, { year: number; month: number; count: number }> =
    new Map();

  weekDays.forEach((day: Date) => {
    const year: number = day.getFullYear();
    const month: number = day.getMonth();
    const key: string = `${year}-${month}`;
    const existing = counts.get(key);

    if (existing) {
      existing.count += 1;
      return;
    }

    counts.set(key, { year, month, count: 1 });
  });

  let dominant: { year: number; month: number; count: number } = {
    year: weekDays[0]?.getFullYear() ?? 0,
    month: weekDays[0]?.getMonth() ?? 0,
    count: 0,
  };

  counts.forEach((entry) => {
    if (entry.count > dominant.count) {
      dominant = entry;
    }
  });

  return new Date(dominant.year, dominant.month, 1);
}

export function formatMonthYear(date: Date, locale: string): string {
  const languageTag: string = locale === "en" ? "en-US" : "ko-KR";

  return new Intl.DateTimeFormat(languageTag, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function normalizeCalendarDate(date: Date): Date {
  const normalized: Date = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
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

export const SLOT_SNAP_MINUTES = 30;
export const DEFAULT_EVENT_DURATION_MINUTES = 60;

export type SlotTimeRange = {
  startAt: Date;
  endAt: Date;
};

export type CalendarDraftPreview = {
  startAt: Date;
  endAt: Date;
  userName: string | null;
  excludeReservation?: ReservationPublicResponse | null;
};

export function isSamePublicReservation(
  left: ReservationPublicResponse,
  right: ReservationPublicResponse,
): boolean {
  return (
    left.start_at === right.start_at &&
    left.end_at === right.end_at &&
    left.user_name === right.user_name
  );
}

export function getSlotTimeFromClick(
  day: Date,
  columnElement: HTMLElement,
  clientY: number,
): SlotTimeRange {
  const rect: DOMRect = columnElement.getBoundingClientRect();
  const relativeY: number = clientY - rect.top;
  const percent: number = Math.max(0, Math.min(1, relativeY / rect.height));
  const rawMinutes: number = percent * MINUTES_PER_DAY;
  const snappedMinutes: number =
    Math.floor(rawMinutes / SLOT_SNAP_MINUTES) * SLOT_SNAP_MINUTES;
  const maxStartMinutes: number =
    MINUTES_PER_DAY - DEFAULT_EVENT_DURATION_MINUTES;
  const startMinutes: number = Math.min(snappedMinutes, maxStartMinutes);

  const startAt: Date = new Date(day);
  startAt.setHours(0, 0, 0, 0);
  startAt.setMinutes(startMinutes);

  const endAt: Date = new Date(startAt);
  endAt.setMinutes(endAt.getMinutes() + DEFAULT_EVENT_DURATION_MINUTES);

  return { startAt, endAt };
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDateLocalValue(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDateLocalValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const date: Date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function fromDatetimeLocalValue(value: string): Date {
  return new Date(value);
}

export function toIsoString(date: Date): string {
  return date.toISOString();
}

export function formatEventDetailDateTime(
  startAt: string,
  endAt: string,
  locale: string,
): string {
  const start: Date = new Date(startAt);
  const end: Date = new Date(endAt);
  const languageTag: string = locale === "en" ? "en-US" : "ko-KR";

  const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    languageTag,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );
  const timeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    languageTag,
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );

  const datePart: string = dateFormatter.format(start);
  const timePart: string = `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;

  return `${datePart} · ${timePart}`;
}

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";

import type { ReservationPublicResponse, ReservationStatus } from "@/api/types";
import { useAppLocale } from "@/lib/locale";

import {
  addWeeks,
  formatHourLabel,
  formatMonthYear,
  formatTimezoneOffset,
  formatTimeRange,
  fromDateLocalValue,
  getDominantMonthInWeek,
  getEventSegmentsForWeek,
  getSlotTimeFromClick,
  getWeekDays,
  getWeekStart,
  HOURS_PER_DAY,
  isCalendarVisibleStatus,
  isSameDay,
  MINUTES_PER_DAY,
  normalizeCalendarDate,
  reservationOverlapsWeek,
  toDateLocalValue,
  toIsoString,
  isSamePublicReservation,
  type CalendarDraftPreview,
  type CalendarEventSegment,
  type SlotTimeRange,
} from "./calendarUtils";
import { useSpaceReservations } from "./useSpaceReservations";

type WeekCalendarProps = {
  spaceId: string | null;
  currentUserName: string | null;
  draftPreview?: CalendarDraftPreview | null;
  externalReservations?: {
    reservations: ReservationPublicResponse[];
    isLoading: boolean;
    errorKey: "loadReservations" | null;
  };
  highlightAllAsOwn?: boolean;
  onSlotSelect?: (range: SlotTimeRange) => void;
  onEventSelect?: (reservation: ReservationPublicResponse) => void;
};

const DEFAULT_SCROLL_HOUR = 8;
const TAP_MOVE_THRESHOLD_PX = 10;
const MOBILE_DAY_VIEW_QUERY = "(max-width: 768px)";

type PointerPosition = {
  x: number;
  y: number;
};

const statusClassName: Record<ReservationStatus, string> = {
  PENDING: "week-calendar__event--pending",
  APPROVED: "week-calendar__event--approved",
  REJECTED: "week-calendar__event--rejected",
  CANCELLED: "week-calendar__event--cancelled",
};

export function WeekCalendar({
  spaceId,
  currentUserName,
  draftPreview,
  externalReservations,
  highlightAllAsOwn = false,
  onSlotSelect,
  onEventSelect,
}: WeekCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale: string = useAppLocale();
  const internalReservations = useSpaceReservations(
    externalReservations ? null : spaceId,
  );
  const reservations: ReservationPublicResponse[] =
    externalReservations?.reservations ?? internalReservations.reservations;
  const isLoading: boolean =
    externalReservations?.isLoading ?? internalReservations.isLoading;
  const errorKey: "loadReservations" | null =
    externalReservations?.errorKey ?? internalReservations.errorKey;
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitiallyRef = useRef<boolean>(false);
  const pointerStartRef = useRef<PointerPosition | null>(null);

  const [focusDate, setFocusDate] = useState<Date>(() => normalizeCalendarDate(new Date()));
  const [now, setNow] = useState<Date>(() => new Date());
  const [isDayView, setIsDayView] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_DAY_VIEW_QUERY).matches
      : false,
  );

  const weekStart: Date = useMemo(() => getWeekStart(focusDate), [focusDate]);
  const weekDays: Date[] = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today: Date = useMemo(() => normalizeCalendarDate(new Date()), []);

  const displayDays: Date[] = useMemo(
    () => (isDayView ? [focusDate] : weekDays),
    [isDayView, focusDate, weekDays],
  );

  const filterWeekStart: Date = useMemo(() => weekStart, [weekStart]);

  const headerLabel: string = useMemo(() => {
    const dominantMonth: Date = getDominantMonthInWeek(displayDays);
    return formatMonthYear(dominantMonth, i18n.language);
  }, [displayDays, i18n.language]);

  const datePickerValue: string = useMemo(
    () => toDateLocalValue(focusDate),
    [focusDate],
  );

  const timezoneLabel: string = useMemo(() => formatTimezoneOffset(), []);

  const dayHeaderFormatter: Intl.DateTimeFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "ko-KR", {
        weekday: "short",
      }),
    [i18n.language],
  );

  const visibleReservations: ReservationPublicResponse[] = useMemo(
    () => {
      const filtered: ReservationPublicResponse[] = reservations.filter(
        (reservation: ReservationPublicResponse) =>
          isCalendarVisibleStatus(reservation.status) &&
          reservationOverlapsWeek(
            reservation.start_at,
            reservation.end_at,
            filterWeekStart,
          ),
      );

      if (!draftPreview?.excludeReservation) {
        return filtered;
      }

      return filtered.filter(
        (reservation: ReservationPublicResponse) =>
          !isSamePublicReservation(reservation, draftPreview.excludeReservation!),
      );
    },
    [reservations, filterWeekStart, draftPreview],
  );

  const draftSegments: CalendarEventSegment[] = useMemo(() => {
    if (!draftPreview) {
      return [];
    }

    const overlapsWeek: boolean = reservationOverlapsWeek(
      toIsoString(draftPreview.startAt),
      toIsoString(draftPreview.endAt),
      filterWeekStart,
    );

    if (!overlapsWeek) {
      return [];
    }

    const draftReservation: ReservationPublicResponse = {
      status: "PENDING",
      start_at: toIsoString(draftPreview.startAt),
      end_at: toIsoString(draftPreview.endAt),
      user_name: draftPreview.userName ?? "",
    };

    return getEventSegmentsForWeek(
      draftReservation,
      displayDays,
      true,
      "draft",
    );
  }, [draftPreview, displayDays, filterWeekStart]);

  const eventSegments: CalendarEventSegment[] = useMemo(() => {
    return visibleReservations.flatMap(
      (reservation: ReservationPublicResponse, index: number) => {
        const isOwn: boolean =
          highlightAllAsOwn ||
          (currentUserName !== null && reservation.user_name === currentUserName);

        return getEventSegmentsForWeek(
          reservation,
          displayDays,
          isOwn,
          String(index),
        );
      },
    );
  }, [visibleReservations, displayDays, currentUserName, highlightAllAsOwn]);

  const todayIndex: number = useMemo(
    () => displayDays.findIndex((day: Date) => isSameDay(day, today)),
    [displayDays, today],
  );

  const nowLinePercent: number | null = useMemo(() => {
    if (todayIndex < 0) {
      return null;
    }

    const minutes: number = now.getHours() * 60 + now.getMinutes();
    return (minutes / MINUTES_PER_DAY) * 100;
  }, [now, todayIndex]);

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia(MOBILE_DAY_VIEW_QUERY);
    const handleChange = (): void => {
      setIsDayView(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (hasScrolledInitiallyRef.current) {
      return;
    }

    const container: HTMLDivElement | null = scrollRef.current;
    if (!container) {
      return;
    }

    const calendarRoot: Element | null = container.closest(".week-calendar");
    const styles: CSSStyleDeclaration = getComputedStyle(
      calendarRoot ?? container,
    );
    const hourHeight: number = Number.parseFloat(
      styles.getPropertyValue("--calendar-hour-height"),
    );
    const resolvedHourHeight: number = Number.isFinite(hourHeight)
      ? hourHeight
      : 48;

    container.scrollTop = DEFAULT_SCROLL_HOUR * resolvedHourHeight;
    hasScrolledInitiallyRef.current = true;
  }, []);

  const goToPreviousWeek = (): void => {
    setFocusDate((current: Date) => addWeeks(current, -1));
  };

  const goToNextWeek = (): void => {
    setFocusDate((current: Date) => addWeeks(current, 1));
  };

  const goToToday = (): void => {
    setFocusDate(normalizeCalendarDate(new Date()));
  };

  const handleDatePick = (event: ChangeEvent<HTMLInputElement>): void => {
    const value: string = event.target.value;
    if (!value) {
      return;
    }

    const picked: Date = fromDateLocalValue(value);
    setFocusDate(normalizeCalendarDate(picked));
  };

  const showInitialLoad: boolean =
    spaceId !== null && isLoading && reservations.length === 0;

  const isInteractive: boolean =
    spaceId !== null &&
    (onSlotSelect !== undefined || onEventSelect !== undefined);

  const handleColumnPointerDown = (
    event: PointerEvent<HTMLElement>,
  ): void => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleColumnPointerUp = (
    event: PointerEvent<HTMLDivElement>,
    day: Date,
  ): void => {
    if (!onSlotSelect) {
      return;
    }

    const start: PointerPosition | null = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start) {
      return;
    }

    const dx: number = event.clientX - start.x;
    const dy: number = event.clientY - start.y;
    if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD_PX) {
      return;
    }

    if ((event.target as HTMLElement).closest(".week-calendar__event")) {
      return;
    }

    const range: SlotTimeRange = getSlotTimeFromClick(
      day,
      event.currentTarget,
      event.clientY,
    );
    onSlotSelect(range);
  };

  const handleEventPointerUp = (
    event: PointerEvent<HTMLButtonElement>,
    reservation: ReservationPublicResponse,
  ): void => {
    const start: PointerPosition | null = pointerStartRef.current;
    pointerStartRef.current = null;

    if (start) {
      const dx: number = event.clientX - start.x;
      const dy: number = event.clientY - start.y;
      if (Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD_PX) {
        return;
      }
    }

    event.stopPropagation();
    onEventSelect?.(reservation);

    if (event.pointerType === "touch") {
      event.currentTarget.blur();
    }
  };

  return (
    <div className={`week-calendar${isDayView ? " week-calendar--day-view" : ""}`}>
      <header className="week-calendar__toolbar">
        <div className="week-calendar__nav">
          <button
            type="button"
            className="week-calendar__today-button"
            onClick={goToToday}
          >
            {t("reservation.schedule.today")}
          </button>
          {!isDayView ? (
            <>
              <button
                type="button"
                className="week-calendar__nav-button"
                onClick={goToPreviousWeek}
                aria-label={t("reservation.schedule.prevWeek")}
              >
                ‹
              </button>
              <button
                type="button"
                className="week-calendar__nav-button"
                onClick={goToNextWeek}
                aria-label={t("reservation.schedule.nextWeek")}
              >
                ›
              </button>
            </>
          ) : null}
          <label className="week-calendar__date-picker">
            <CalendarIcon />
            <input
              type="date"
              className="week-calendar__date-input"
              value={datePickerValue}
              onChange={handleDatePick}
              aria-label={t("reservation.schedule.jumpToDate")}
            />
          </label>
        </div>
        <p className="week-calendar__range">{headerLabel}</p>
      </header>

      {errorKey ? (
        <p className="week-calendar__inline-error" role="alert">
          {t("reservation.schedule.errors.loadReservations")}
        </p>
      ) : null}

      <div className="week-calendar__frame">
        <div className="week-calendar__day-headers">
          <div className="week-calendar__gutter-spacer">
            <span className="week-calendar__timezone">{timezoneLabel}</span>
          </div>

          {displayDays.map((day: Date) => {
            const isToday: boolean = isSameDay(day, today);
            const dayNumber: string = String(day.getDate());

            return (
              <div
                key={day.toISOString()}
                className={`week-calendar__day-header${isToday ? " week-calendar__day-header--today" : ""}`}
              >
                <span className="week-calendar__day-name">
                  {dayHeaderFormatter.format(day)}
                </span>
                <span className="week-calendar__day-date">{dayNumber}</span>
              </div>
            );
          })}
        </div>

        <div ref={scrollRef} className="week-calendar__scroll">
          <div className="week-calendar__grid-body">
            <div className="week-calendar__grid-lines" aria-hidden="true" />

            <div className="week-calendar__time-gutter" aria-hidden="true">
              {Array.from({ length: HOURS_PER_DAY }, (_value: unknown, hour: number) => (
                <span
                  key={hour}
                  className="week-calendar__time-label"
                  style={{ top: `${(hour / HOURS_PER_DAY) * 100}%` }}
                >
                  {hour === 0 ? "" : formatHourLabel(hour, i18n.language)}
                </span>
              ))}
            </div>

            <div
              className={`week-calendar__day-columns${showInitialLoad ? " week-calendar__day-columns--loading" : ""}${isInteractive ? " week-calendar__day-columns--interactive" : ""}`}
            >
              {displayDays.map((day: Date, dayIndex: number) => {
                const isToday: boolean = isSameDay(day, today);
                const daySegments: CalendarEventSegment[] = eventSegments.filter(
                  (segment: CalendarEventSegment) => segment.dayIndex === dayIndex,
                );
                const dayDraftSegments: CalendarEventSegment[] = draftSegments.filter(
                  (segment: CalendarEventSegment) => segment.dayIndex === dayIndex,
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={`week-calendar__day-column${isToday ? " week-calendar__day-column--today" : ""}`}
                    onPointerDown={handleColumnPointerDown}
                    onPointerUp={(event: PointerEvent<HTMLDivElement>) => {
                      handleColumnPointerUp(event, day);
                    }}
                  >
                    {isToday && nowLinePercent !== null ? (
                      <div
                        className="week-calendar__now-line"
                        style={{ top: `${nowLinePercent}%` }}
                      />
                    ) : null}

                    {daySegments.map((segment: CalendarEventSegment) => {
                      const status: ReservationStatus = segment.reservation.status;
                      const statusClass: string = statusClassName[status];
                      const ownClass: string = segment.isOwn
                        ? " week-calendar__event--own"
                        : "";
                      const statusLabel: string = t(
                        `reservation.status.${status}`,
                      );

                      return (
                        <button
                          key={segment.key}
                          type="button"
                          className={`week-calendar__event ${statusClass}${ownClass}`}
                          style={{
                            top: `${segment.topPercent}%`,
                            height: `${segment.heightPercent}%`,
                          }}
                          title={`${segment.reservation.user_name} · ${statusLabel} · ${formatTimeRange(segment.reservation.start_at, segment.reservation.end_at, locale)}`}
                          onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            handleColumnPointerDown(event);
                          }}
                          onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            handleEventPointerUp(event, segment.reservation);
                          }}
                        >
                          <span className="week-calendar__event-name">
                            {segment.reservation.user_name}
                          </span>
                          <span className="week-calendar__event-status">
                            {statusLabel}
                          </span>
                          <span className="week-calendar__event-time">
                            {formatTimeRange(
                              segment.reservation.start_at,
                              segment.reservation.end_at,
                              locale,
                            )}
                          </span>
                        </button>
                      );
                    })}

                    {dayDraftSegments.map((segment: CalendarEventSegment) => (
                      <div
                        key={segment.key}
                        className="week-calendar__event week-calendar__event--draft"
                        style={{
                          top: `${segment.topPercent}%`,
                          height: `${segment.heightPercent}%`,
                        }}
                        aria-hidden="true"
                      >
                        <span className="week-calendar__event-name">
                          {segment.reservation.user_name ||
                            t("reservation.event.draftLabel")}
                        </span>
                        <span className="week-calendar__event-status">
                          {t("reservation.status.PENDING")}
                        </span>
                        <span className="week-calendar__event-time">
                          {formatTimeRange(
                            segment.reservation.start_at,
                            segment.reservation.end_at,
                            locale,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="week-calendar__date-picker-icon"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

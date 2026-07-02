import {
  useEffect,
  useRef,
  useState,
  type FormEventHandler,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  cancelReservation,
  createReservation,
  updateReservation,
} from "@/api/reservations";
import { ApiError } from "@/api/client";
import type { ReservationPublicResponse, ReservationStatus } from "@/api/types";
import { paths } from "@/lib/brand";
import { useAppLocale } from "@/lib/locale";
import { getStoredAdminTokens } from "@/lib/auth/adminStorage";
import { getStoredTokens } from "@/lib/auth/storage";

import {
  formatEventDetailDateTime,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
  toIsoString,
  type SlotTimeRange,
} from "./calendarUtils";

export type EventDialogMode = "create" | "view" | "edit";

export type EventDialogState =
  | {
      mode: "create";
      startAt: Date;
      endAt: Date;
    }
  | {
      mode: "view" | "edit";
      reservation: ReservationPublicResponse;
      reservationId: string | null;
      isOwn: boolean;
      memo: string | null;
    };

type EventDialogProps = {
  spaceId: string;
  state: EventDialogState | null;
  isLoggedIn: boolean;
  isAdminMode?: boolean;
  onClose: () => void;
  onMutated: () => void;
  onDraftChange?: (draft: SlotTimeRange | null) => void;
};

type EventErrorKey =
  | "required"
  | "invalidRange"
  | "conflict"
  | "forbidden"
  | "generic";

const isEditableStatus = (status: ReservationStatus): boolean =>
  status === "PENDING" || status === "APPROVED";

const blurIfTouch = (event: PointerEvent<HTMLButtonElement>): void => {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    event.currentTarget.blur();
  }
};

const statusColorClass: Record<ReservationStatus, string> = {
  PENDING: "event-dialog__color--pending",
  APPROVED: "event-dialog__color--approved",
  REJECTED: "event-dialog__color--rejected",
  CANCELLED: "event-dialog__color--cancelled",
};

export function EventDialog({
  spaceId,
  state,
  isLoggedIn,
  isAdminMode = false,
  onClose,
  onMutated,
  onDraftChange,
}: EventDialogProps) {
  const { t } = useTranslation();
  const locale: string = useAppLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [startValue, setStartValue] = useState<string>("");
  const [endValue, setEndValue] = useState<string>("");
  const [memoValue, setMemoValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<EventErrorKey | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const isOpen: boolean = state !== null;
  const isCreateMode: boolean = state?.mode === "create";

  const reservation: ReservationPublicResponse | null =
    state !== null && state.mode !== "create" ? state.reservation : null;

  const reservationId: string | null =
    state !== null && state.mode !== "create" ? state.reservationId : null;

  const isOwn: boolean =
    state !== null && state.mode !== "create" ? state.isOwn : false;

  const reservationMemo: string | null =
    state !== null && state.mode !== "create" ? state.memo : null;

  const canMutate: boolean = isAdminMode
    ? reservation !== null &&
      isEditableStatus(reservation.status) &&
      reservationId !== null
    : isLoggedIn &&
      isOwn &&
      reservation !== null &&
      isEditableStatus(reservation.status) &&
      reservationId !== null;

  const showForm: boolean = isCreateMode || (isEditing && canMutate);

  const getAccessToken = (): string | null => {
    if (isAdminMode) {
      return getStoredAdminTokens()?.accessToken ?? null;
    }

    return getStoredTokens()?.accessToken ?? null;
  };

  useEffect(() => {
    const dialog: HTMLDialogElement | null = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    setIsEditing(false);
    setErrorKey(null);
    setIsSubmitting(false);

    if (!state) {
      return;
    }

    if (state.mode === "create") {
      setStartValue(toDatetimeLocalValue(state.startAt));
      setEndValue(toDatetimeLocalValue(state.endAt));
      setMemoValue("");
      return;
    }

    setStartValue(toDatetimeLocalValue(new Date(state.reservation.start_at)));
    setEndValue(toDatetimeLocalValue(new Date(state.reservation.end_at)));
    setMemoValue(state.memo ?? "");
  }, [state]);

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }

    if (!showForm || !startValue || !endValue) {
      onDraftChange(null);
      return;
    }

    const startAt: Date = fromDatetimeLocalValue(startValue);
    const endAt: Date = fromDatetimeLocalValue(endValue);

    if (startAt >= endAt) {
      onDraftChange(null);
      return;
    }

    onDraftChange({ startAt, endAt });
  }, [showForm, startValue, endValue, onDraftChange]);

  useEffect(() => {
    if (!isOpen) {
      onDraftChange?.(null);
    }
  }, [isOpen, onDraftChange]);

  const handleClose = (): void => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    event.preventDefault();
    handleClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === dialogRef.current) {
      handleClose();
    }
  };

  const resolveErrorKey = (error: unknown): EventErrorKey => {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return "conflict";
      }
      if (error.status === 403) {
        return "forbidden";
      }
      if (error.status === 400) {
        return "invalidRange";
      }
    }
    return "generic";
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setErrorKey(null);

    if (!showForm) {
      return;
    }

    const accessToken: string | null = getAccessToken();
    if (!accessToken) {
      return;
    }

    if (!startValue || !endValue) {
      setErrorKey("required");
      return;
    }

    const startAt: Date = fromDatetimeLocalValue(startValue);
    const endAt: Date = fromDatetimeLocalValue(endValue);

    if (startAt >= endAt) {
      setErrorKey("invalidRange");
      return;
    }

    setIsSubmitting(true);

    const trimmedMemo: string = memoValue.trim();
    const body = {
      start_at: toIsoString(startAt),
      end_at: toIsoString(endAt),
      memo: trimmedMemo.length > 0 ? trimmedMemo : null,
    };

    const request = isCreateMode
      ? createReservation(accessToken, {
          space_id: spaceId,
          ...body,
        })
      : reservationId
        ? updateReservation(accessToken, reservationId, body)
        : Promise.reject(new Error("Missing reservation id"));

    void request
      .then(() => {
        onMutated();
        onClose();
      })
      .catch((error: unknown) => {
        setErrorKey(resolveErrorKey(error));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDelete = (): void => {
    const accessToken: string | null = getAccessToken();
    if (!accessToken || !reservationId || !canMutate) {
      return;
    }

    setErrorKey(null);
    setIsSubmitting(true);

    void cancelReservation(accessToken, reservationId)
      .then(() => {
        onMutated();
        onClose();
      })
      .catch((error: unknown) => {
        setErrorKey(resolveErrorKey(error));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const formTitle: string = isCreateMode
    ? t("reservation.event.newTitle")
    : reservation?.user_name ?? "";

  const formStatus: ReservationStatus = reservation?.status ?? "PENDING";

  const isCompactLayout: boolean = !isLoggedIn && !isAdminMode;
  const panelClassName: string = [
    "event-dialog__panel",
    "event-dialog__panel--detail",
    isCompactLayout ? "event-dialog__panel--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <dialog
      ref={dialogRef}
      className="event-dialog"
      onCancel={handleDialogCancel}
      onClick={handleBackdropClick}
    >
      {state && showForm ? (
        <form className={panelClassName} onSubmit={handleSubmit}>
          <header className="event-dialog__toolbar">
            {!isCompactLayout ? (
              <div className="event-dialog__toolbar-actions">
                {(isCreateMode ? isLoggedIn : canMutate) ? (
                  <button
                    className="event-dialog__submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("reservation.event.saving")
                      : isCreateMode
                        ? t("reservation.event.create")
                        : t("reservation.event.update")}
                  </button>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              className="event-dialog__icon-button"
              onClick={handleClose}
              onPointerUp={blurIfTouch}
              disabled={isSubmitting}
              aria-label={t("reservation.event.close")}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="event-dialog__detail-title">
            <span
              className={`event-dialog__color ${statusColorClass[formStatus]}`}
              aria-hidden="true"
            />
            <h2 className="event-dialog__detail-name">{formTitle}</h2>
          </div>

          {isCreateMode && !isLoggedIn ? (
            <p className="event-dialog__login-prompt">
              {t("reservation.event.loginRequired")}{" "}
              <Link className="text-link" to={paths.login}>
                {t("home.entry.login")}
              </Link>
            </p>
          ) : null}

          <div className="event-dialog__detail-rows">
            <div className="event-dialog__detail-row">
              <ClockIcon />
              <input
                id="event-start"
                className="event-dialog__input"
                type="datetime-local"
                value={startValue}
                onChange={(event) => {
                  setStartValue(event.target.value);
                }}
                disabled={isSubmitting || (isCreateMode && !isLoggedIn)}
                aria-label={t("reservation.event.startLabel")}
                required
              />
            </div>

            <div className="event-dialog__detail-row">
              <ClockIcon />
              <input
                id="event-end"
                className="event-dialog__input"
                type="datetime-local"
                value={endValue}
                onChange={(event) => {
                  setEndValue(event.target.value);
                }}
                disabled={isSubmitting || (isCreateMode && !isLoggedIn)}
                aria-label={t("reservation.event.endLabel")}
                required
              />
            </div>

            <div className="event-dialog__detail-row event-dialog__detail-row--top">
              <MemoIcon />
              <textarea
                id="event-memo"
                className="event-dialog__input event-dialog__input--memo"
                value={memoValue}
                onChange={(event) => {
                  setMemoValue(event.target.value);
                }}
                placeholder={t("reservation.event.memoPlaceholder")}
                disabled={isSubmitting || (isCreateMode && !isLoggedIn)}
                aria-label={t("reservation.event.memoLabel")}
                rows={3}
              />
            </div>
          </div>

          {errorKey ? (
            <p className="event-dialog__error" role="alert">
              {t(`reservation.event.errors.${errorKey}`)}
            </p>
          ) : null}
        </form>
      ) : null}

      {state && reservation && !showForm ? (
        <div className={panelClassName}>
          <header className="event-dialog__toolbar">
            {!isCompactLayout ? (
              <div className="event-dialog__toolbar-actions">
                {canMutate ? (
                  <>
                    <button
                      type="button"
                      className="event-dialog__icon-button"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      onPointerUp={blurIfTouch}
                      disabled={isSubmitting}
                      aria-label={t("reservation.event.editTitle")}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="event-dialog__icon-button event-dialog__icon-button--danger"
                      onClick={handleDelete}
                      onPointerUp={blurIfTouch}
                      disabled={isSubmitting}
                      aria-label={t("reservation.event.delete")}
                    >
                      <DeleteIcon />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              className="event-dialog__icon-button"
              onClick={handleClose}
              onPointerUp={blurIfTouch}
              disabled={isSubmitting}
              aria-label={t("reservation.event.close")}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="event-dialog__detail-title">
            <span
              className={`event-dialog__color ${statusColorClass[reservation.status]}`}
              aria-hidden="true"
            />
            <h2 className="event-dialog__detail-name">{reservation.user_name}</h2>
          </div>

          <div className="event-dialog__detail-rows">
            <div className="event-dialog__detail-row">
              <ClockIcon />
              <span className="event-dialog__detail-text">
                {formatEventDetailDateTime(
                  reservation.start_at,
                  reservation.end_at,
                  locale,
                )}
              </span>
            </div>

            <div className="event-dialog__detail-row">
              <StatusIcon />
              <span className="event-dialog__detail-text">
                {t(`reservation.status.${reservation.status}`)}
              </span>
            </div>

            {reservationMemo ? (
              <div className="event-dialog__detail-row">
                <MemoIcon />
                <span className="event-dialog__detail-text event-dialog__detail-text--memo">
                  {reservationMemo}
                </span>
              </div>
            ) : null}
          </div>

          {errorKey ? (
            <p className="event-dialog__error" role="alert">
              {t(`reservation.event.errors.${errorKey}`)}
            </p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="event-dialog__icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="event-dialog__icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="event-dialog__icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="event-dialog__detail-icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
      />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="event-dialog__detail-icon"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MemoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="event-dialog__detail-icon"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

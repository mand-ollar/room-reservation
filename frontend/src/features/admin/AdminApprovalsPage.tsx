import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  approveReservation,
  rejectReservation,
} from "@/api/reservations";
import { ApiError } from "@/api/client";
import type { ReservationStatus } from "@/api/types";
import { formatEventDetailDateTime } from "@/features/reservation/calendarUtils";
import { invalidateAdminSpaceReservations } from "@/features/reservation/useAdminSpaceReservations";
import { getStoredAdminTokens } from "@/lib/auth/adminStorage";
import { paths } from "@/lib/brand";
import { useAppLocale } from "@/lib/locale";

import {
  useApprovalList,
  type ApprovalListMode,
  type ApprovalRow,
} from "./usePendingApprovals";

type ApprovalAction = "approve" | "reject";

type ApprovalActionErrorKey = "conflict" | "generic" | null;

type ActingState = {
  reservationId: string;
  action: ApprovalAction;
} | null;

const statusClassName: Record<ReservationStatus, string> = {
  PENDING: "admin-table__status--pending",
  APPROVED: "admin-table__status--approved",
  REJECTED: "admin-table__status--rejected",
  CANCELLED: "admin-table__status--cancelled",
};

function formatTimestamp(iso: string, locale: string): string {
  const languageTag: string = locale === "en" ? "en-US" : "ko-KR";
  return new Intl.DateTimeFormat(languageTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AdminApprovalsPage() {
  const { t } = useTranslation();
  const locale = useAppLocale();
  const [activeTab, setActiveTab] = useState<ApprovalListMode>("pending");
  const {
    rows,
    isLoading,
    errorKey,
    refetch,
  } = useApprovalList(activeTab);
  const [acting, setActing] = useState<ActingState>(null);
  const [actionErrorKey, setActionErrorKey] =
    useState<ApprovalActionErrorKey>(null);

  const handleAction = (
    row: ApprovalRow,
    action: ApprovalAction,
  ): void => {
    const tokens = getStoredAdminTokens();
    if (!tokens) {
      setActionErrorKey("generic");
      return;
    }

    setActing({ reservationId: row.id, action });
    setActionErrorKey(null);

    const request =
      action === "approve"
        ? approveReservation(tokens.accessToken, row.id)
        : rejectReservation(tokens.accessToken, row.id);

    void request
      .then(() => {
        invalidateAdminSpaceReservations(row.spaceId);
        refetch();
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 409) {
          setActionErrorKey("conflict");
          invalidateAdminSpaceReservations(row.spaceId);
          refetch();
          return;
        }
        setActionErrorKey("generic");
      })
      .finally(() => {
        setActing(null);
      });
  };

  const isRowActing = (reservationId: string): boolean =>
    acting?.reservationId === reservationId;

  const emptyMessageKey: string =
    activeTab === "pending"
      ? "admin.approvals.empty"
      : "admin.approvals.historyEmpty";

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <h1 className="page-title">{t("admin.approvals.title")}</h1>
        <p className="admin-page__description">
          {t(
            activeTab === "pending"
              ? "admin.approvals.description"
              : "admin.approvals.historyDescription",
          )}
        </p>
      </header>

      <div
        className="admin-tabs"
        role="tablist"
        aria-label={t("admin.approvals.tabsLabel")}
      >
        <button
          type="button"
          role="tab"
          id="admin-approvals-tab-pending"
          className="admin-tabs__tab"
          aria-selected={activeTab === "pending"}
          aria-controls="admin-approvals-panel"
          onClick={() => {
            setActiveTab("pending");
          }}
        >
          {t("admin.approvals.tabs.pending")}
        </button>
        <button
          type="button"
          role="tab"
          id="admin-approvals-tab-history"
          className="admin-tabs__tab"
          aria-selected={activeTab === "history"}
          aria-controls="admin-approvals-panel"
          onClick={() => {
            setActiveTab("history");
          }}
        >
          {t("admin.approvals.tabs.history")}
        </button>
      </div>

      {errorKey ? (
        <p className="admin-page__alert admin-page__alert--error" role="alert">
          {t(`admin.approvals.errors.${errorKey}`)}
        </p>
      ) : null}

      {actionErrorKey ? (
        <p className="admin-page__alert admin-page__alert--error" role="alert">
          {t(`admin.approvals.errors.${actionErrorKey}`)}
        </p>
      ) : null}

      <div
        id="admin-approvals-panel"
        role="tabpanel"
        aria-labelledby={
          activeTab === "pending"
            ? "admin-approvals-tab-pending"
            : "admin-approvals-tab-history"
        }
        className="admin-table-card"
      >
        {isLoading ? (
          <p className="admin-table-card__status">{t("admin.approvals.loading")}</p>
        ) : rows.length === 0 ? (
          <p className="admin-table-card__status">{t(emptyMessageKey)}</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">{t("admin.approvals.columns.applicant")}</th>
                  <th scope="col">{t("admin.approvals.columns.location")}</th>
                  <th scope="col">{t("admin.approvals.columns.schedule")}</th>
                  <th scope="col">{t("admin.approvals.columns.memo")}</th>
                  <th scope="col">{t("admin.approvals.columns.requestedAt")}</th>
                  {activeTab === "history" ? (
                    <>
                      <th scope="col">{t("admin.approvals.columns.status")}</th>
                      <th scope="col">
                        {t("admin.approvals.columns.processedAt")}
                      </th>
                    </>
                  ) : (
                    <th scope="col">{t("admin.approvals.columns.actions")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: ApprovalRow) => {
                  const rowIsActing: boolean = isRowActing(row.id);
                  const approveIsBusy: boolean =
                    rowIsActing && acting?.action === "approve";
                  const rejectIsBusy: boolean =
                    rowIsActing && acting?.action === "reject";

                  return (
                    <tr key={row.id}>
                      <td data-label={t("admin.approvals.columns.applicant")}>
                        {row.userName}
                      </td>
                      <td data-label={t("admin.approvals.columns.location")}>
                        {row.locationLabel}
                      </td>
                      <td data-label={t("admin.approvals.columns.schedule")}>
                        {formatEventDetailDateTime(
                          row.startAt,
                          row.endAt,
                          locale,
                        )}
                      </td>
                      <td
                        className="admin-table__memo"
                        data-label={t("admin.approvals.columns.memo")}
                      >
                        {row.memo?.trim() ? row.memo : "—"}
                      </td>
                      <td data-label={t("admin.approvals.columns.requestedAt")}>
                        {formatTimestamp(row.createdAt, locale)}
                      </td>
                      {activeTab === "history" ? (
                        <>
                          <td data-label={t("admin.approvals.columns.status")}>
                            <span
                              className={`admin-table__status ${statusClassName[row.status]}`}
                            >
                              {t(`reservation.status.${row.status}`)}
                            </span>
                          </td>
                          <td
                            data-label={t("admin.approvals.columns.processedAt")}
                          >
                            {formatTimestamp(row.updatedAt, locale)}
                          </td>
                        </>
                      ) : (
                        <td data-label={t("admin.approvals.columns.actions")}>
                          <div className="admin-table__actions">
                            <button
                              type="button"
                              className="admin-table__action admin-table__action--approve"
                              disabled={rowIsActing}
                              onClick={() => {
                                handleAction(row, "approve");
                              }}
                            >
                              {approveIsBusy
                                ? t("admin.approvals.working")
                                : t("admin.approvals.approve")}
                            </button>
                            <button
                              type="button"
                              className="admin-table__action admin-table__action--reject"
                              disabled={rowIsActing}
                              onClick={() => {
                                handleAction(row, "reject");
                              }}
                            >
                              {rejectIsBusy
                                ? t("admin.approvals.working")
                                : t("admin.approvals.reject")}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link className="text-link" to={paths.home}>
        {t("admin.backToMenu")}
      </Link>
    </section>
  );
}

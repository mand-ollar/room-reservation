import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { EntryCard } from "@/components/EntryCard";
import {
  APP_BRAND_TITLE_PRIMARY,
  APP_BRAND_TITLE_SECONDARY,
  paths,
} from "@/lib/brand";

type AdminHomeLocationState = {
  passwordChanged?: boolean;
};

export function AdminHomePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const locationState: AdminHomeLocationState | null =
    (location.state as AdminHomeLocationState | null) ?? null;
  const showPasswordChangedNotice: boolean =
    locationState?.passwordChanged === true;

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="admin-brand-title">
        <h1 id="admin-brand-title" className="home-hero__title">
          <span className="home-hero__title-line">{APP_BRAND_TITLE_PRIMARY}</span>
          <span className="home-hero__title-line home-hero__title-line--secondary">
            {APP_BRAND_TITLE_SECONDARY}
          </span>
        </h1>
        <p className="home-hero__subtitle">{t("app.subtitle")}</p>
        {showPasswordChangedNotice ? (
          <p className="home-hero__notice" role="status">
            {t("admin.password.changedNotice")}
          </p>
        ) : null}

        <nav className="home-actions" aria-label={t("admin.actionsLabel")}>
          <EntryCard
            to={paths.adminReservations}
            label={t("admin.entry.reservations")}
            variant="reservations"
          />
          <EntryCard
            to={paths.adminPassword}
            label={t("admin.entry.password")}
            variant="password"
          />
          <EntryCard
            to={paths.adminApprovals}
            label={t("admin.entry.approvals")}
            variant="approvals"
          />
        </nav>
      </section>
    </div>
  );
}

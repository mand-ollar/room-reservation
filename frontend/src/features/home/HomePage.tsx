import { useTranslation } from "react-i18next";

import { AdminHomePage } from "@/features/admin/AdminHomePage";
import { EntryCard } from "@/components/EntryCard";
import { useAdminAuth } from "@/lib/auth/useAdminAuth";
import { useAuth } from "@/lib/auth/useAuth";
import {
  APP_BRAND_TITLE_PRIMARY,
  APP_BRAND_TITLE_SECONDARY,
  paths,
} from "@/lib/brand";

export function HomePage() {
  const { t } = useTranslation();
  const { user, isInitializing } = useAuth();
  const { isAdmin, isInitializing: isAdminInitializing } = useAdminAuth();

  if (!isAdminInitializing && isAdmin) {
    return <AdminHomePage />;
  }

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-brand-title">
        <h1 id="home-brand-title" className="home-hero__title">
          <span className="home-hero__title-line">{APP_BRAND_TITLE_PRIMARY}</span>
          <span className="home-hero__title-line home-hero__title-line--secondary">
            {APP_BRAND_TITLE_SECONDARY}
          </span>
        </h1>
        <p className="home-hero__subtitle">{t("app.subtitle")}</p>
        {!isInitializing && user ? (
          <p className="home-hero__welcome">
            {t("home.welcome", { name: user.name })}
          </p>
        ) : null}

        <nav className="home-actions" aria-label={t("home.actionsLabel")}>
          <EntryCard
            to={paths.browse}
            label={t("home.entry.reservation")}
            variant="browse"
          />
          {!isInitializing && !user ? (
            <EntryCard
              to={paths.login}
              label={t("home.entry.login")}
              variant="user"
            />
          ) : null}
          {!isInitializing && !user ? (
            <EntryCard
              to={paths.admin}
              label={t("home.entry.admin")}
              variant="admin"
            />
          ) : null}
        </nav>
      </section>
    </div>
  );
}

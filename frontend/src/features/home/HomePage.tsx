import { useTranslation } from "react-i18next";

import { EntryCard } from "@/components/EntryCard";
import {
  APP_BRAND_TITLE_PRIMARY,
  APP_BRAND_TITLE_SECONDARY,
  paths,
} from "@/lib/brand";

export function HomePage() {
  const { t } = useTranslation();

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

        <nav className="home-actions" aria-label={t("home.actionsLabel")}>
          <EntryCard
            to={paths.browse}
            label={t("home.entry.public")}
            variant="browse"
          />
          <EntryCard
            to={paths.login}
            label={t("home.entry.user")}
            variant="user"
          />
          <EntryCard
            to={paths.admin}
            label={t("home.entry.admin")}
            variant="admin"
          />
        </nav>
      </section>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { paths } from "@/lib/brand";

export function UserLoginPage() {
  const { t } = useTranslation();

  return (
    <section className="placeholder-page">
      <h1 className="page-title">{t("home.entry.user")}</h1>
      <p className="page-subtitle">{t("placeholder.comingSoon")}</p>
      <Link className="text-link" to={paths.home}>
        {t("common.backHome")}
      </Link>
    </section>
  );
}
